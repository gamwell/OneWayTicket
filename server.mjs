// server.js (ou server.mjs)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

// 1. Charger les variables d'environnement (.env)
dotenv.config();

// 2. Initialiser Stripe avec la clé privée
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("ERREUR FATALE : La clé STRIPE_SECRET_KEY est introuvable dans le fichier .env");
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
// IMPORTANT : On utilise le port 4242 car c'est celui configuré dans votre Frontend
const PORT = 4242; 

// 3. Middleware
app.use(cors()); // INDISPENSABLE : Autorise le Frontend (port 5173) à parler au Backend
app.use(express.json());

// Route de test (pour vérifier que le serveur tourne)
app.get('/', (req, res) => {
  res.send('Serveur de paiement OneWayTicket en ligne ! 🚀');
});

// ==========================================
// ✅ LA ROUTE MANQUANTE : CRÉATION DE SESSION STRIPE
// ==========================================
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, email, userId } = req.body;

    console.log("🛒 Reçu panier de :", email);

    // Transformation du panier React en format Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.title,
          images: item.image_url ? [item.image_url] : [],
        },
        // Stripe veut des centimes (45€ = 4500)
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity || 1,
    }));

    // Création de la session sur les serveurs de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      // URLs de redirection vers votre Frontend
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cart',
      metadata: {
        userId: userId, // On garde l'ID pour savoir qui a payé
      },
    });

    console.log("✅ Session Stripe créée :", session.url);
    res.json({ url: session.url });

  } catch (error) {
    console.error("❌ Erreur Stripe :", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Stripe lancé sur http://localhost:${PORT}`);
});