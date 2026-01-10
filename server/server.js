// 1. CONFIGURATION INITIALE
const path = require('path');
// Force la lecture du .env situé dans le même dossier que server.js
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4242;

// Vérification de sécurité des variables d'environnement
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERREUR FATALE : SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY est manquant dans le .env");
  console.log("Vérifiez que votre fichier .env est bien dans : " + __dirname);
  process.exit(1);
}

// 2. CONNEXION SUPABASE
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
console.log("✅ Client Supabase initialisé avec succès");

// 3. MIDDLEWARES
app.use(cors({ 
  origin: 'http://localhost:5173',
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 4. CONFIGURATION EMAIL
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.spacemail.com',
  port: 465,
  secure: true,
  auth: { 
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS 
  }
});

// 5. ROUTE : CRÉATION SESSION STRIPE
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, email, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Panier vide" });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.title },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    const orderId = `OWT-${Math.random().toString(36).substr(2, 7).toUpperCase()}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      success_url: `http://localhost:5173/success?orderId=${orderId}`,
      cancel_url: 'http://localhost:5173/cart',
      metadata: { userId, orderId }
    });

    // --- SAUVEGARDE DANS SUPABASE ---
    const { error } = await supabase
      .from('orders')
      .insert([
        { 
          order_id: orderId, 
          user_id: userId, 
          email: email, 
          total: items.reduce((a, b) => a + b.price, 0),
          items: items 
        }
      ]);

    if (error) {
      console.error("Erreur insertion Supabase:", error);
      throw error;
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error("Erreur serveur Stripe:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. ROUTE : GÉNÉRATION FACTURE PDF
app.get('/api/invoices/:orderId', async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', req.params.orderId)
      .single();

    if (error || !order) return res.status(404).send("Commande introuvable");

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${order.order_id}.pdf`);
    doc.pipe(res);

    // Design Header
    doc.rect(0, 0, 600, 100).fill('#0F0F23');
    doc.fillColor('#00E5FF').fontSize(24).text('ONE WAY TICKET', 50, 40);
    
    doc.fillColor('#000').fontSize(14).text(`Facture #${order.order_id}`, 50, 130);
    doc.fontSize(10).text(`Client: ${order.email}`, 50, 150);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, 50, 165);

    doc.moveTo(50, 190).lineTo(550, 190).stroke();

    let y = 220;
    order.items.forEach(item => {
      doc.fillColor('#000').fontSize(11).text(`${item.title}`, 50, y);
      doc.text(`${item.price.toFixed(2)} €`, 500, y, { align: 'right' });
      y += 25;
    });

    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
    doc.fontSize(14).font('Helvetica-Bold').text(`TOTAL: ${order.total.toFixed(2)} €`, 50, y + 30, { align: 'right', width: 500 });

    doc.end();
  } catch (e) {
    console.error("Erreur PDF:", e);
    res.status(500).send("Erreur lors de la génération de la facture PDF");
  }
});

app.listen(PORT, () => console.log(`🚀 Serveur OneWayTicket actif sur le port ${PORT}`));