require('dotenv').config(); // Charge les variables d'environnement
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors()); // Autorise les requêtes externes
app.use(express.json()); // Permet de lire le JSON envoyé par le frontend

// Route de test pour voir si le serveur tourne
app.get('/', (req, res) => {
  res.send('Serveur OneWayTicket est en ligne ! 🚀');
});

// --- ROUTE DE PAIEMENT ---
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { event } = req.body;

    // Nettoyage du prix (ex: "45€" -> 4500 centimes)
    // On enlève le symbole € et on multiplie par 100 car Stripe compte en centimes
    const priceAmount = parseInt(event.price.replace('€', '').replace(' ', '')) * 100;

    // Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: event.title,
              description: `${event.date} à ${event.location}`,
              images: [event.image], // Stripe affichera l'image de l'événement
            },
            unit_amount: priceAmount, // Prix en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Redirections après paiement (change le port si besoin)
      success_url: 'http://localhost:5173/success', 
      cancel_url: 'http://localhost:5173/cart',
    });

    // On renvoie l'URL de paiement au frontend
    res.json({ url: session.url });

  } catch (error) {
    console.error("Erreur Stripe:", error);
    res.status(500).json({ error: error.message });
  }
});

// Démarrage du serveur sur le port 4242 (ou 3000)
const PORT = 4242;
app.listen(PORT, () => console.log(`Serveur backend écoutant sur le port ${PORT} 📡`));