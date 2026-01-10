require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();
const PORT = 4242;

app.use(cors());
app.use(express.json());

// --- CONFIGURATION EMAIL (SpaceMail / Pro) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.spacemail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // ✅ LE CORRECTIF EST ICI (Indispensable pour SpaceMail) :
  tls: {
    rejectUnauthorized: false
  }
});

// Route de test
app.get('/', (req, res) => {
  res.send('Serveur OneWayTicket en ligne ! 🚀');
});

// --- ROUTE PAIEMENT STRIPE ---
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, email, userId } = req.body;

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.title,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cart',
      metadata: { userId: userId },
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("Erreur Stripe:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- ✅ ROUTE ENVOI DE FACTURE ---
app.post('/send-invoice', async (req, res) => {
  const { email, items, total, date } = req.body;

  try {
    const itemsList = items.map(item => `<li><strong>${item.title}</strong> - ${item.price}€</li>`).join('');

    const mailOptions = {
      from: `"OneWayTicket Support" <${process.env.SMTP_USER}>`, 
      to: email, 
      subject: 'Confirmation de commande - OneWayTicket ✅',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #06b6d4; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Merci pour votre achat !</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Bonjour,</p>
            <p>Nous avons bien reçu votre commande effectuée le ${new Date(date).toLocaleDateString()}.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #06b6d4;">Récapitulatif :</h3>
              <ul style="padding-left: 20px;">
                ${itemsList}
              </ul>
              <p style="font-size: 18px; font-weight: bold; text-align: right; margin-bottom: 0;">Total payé : ${total} €</p>
            </div>
            
            <p>Vous pouvez retrouver et télécharger vos billets directement dans votre espace client :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/my-tickets" style="background-color: #06b6d4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;">Accéder à mes billets</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              OneWayTicket - <a href="mailto:contact@quarksydigital.com" style="color: #06b6d4;">contact@quarksydigital.com</a><br>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Facture envoyée à : ${email}`);
    res.json({ success: true, message: "Email envoyé !" });

  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email :", error);
    res.status(500).json({ error: "Impossible d'envoyer l'email" });
  }
});

app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));