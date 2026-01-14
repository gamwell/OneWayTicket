import { Resend } from 'resend';

export default async function handler(req, res) {
  // 1. Configuration des en-têtes CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Gestion du mode TEST (Navigateur / GET)
  if (req.method === 'GET') {
    return res.status(200).json({
      status: "✅ L'API est en ligne",
      message: "Si vous voyez ce message, c'est que le fichier est bien déployé sur Vercel.",
      votre_methode: req.method,
      conseil: "Utilisez maintenant une requête POST pour envoyer un email."
    });
  }

  // 3. Gestion de la pré-vérification CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 4. Blocage des méthodes autres que POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  // 5. Vérification de la clé API
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ Erreur : RESEND_API_KEY manquante');
    return res.status(500).json({ error: 'Clé API manquante sur Vercel.' });
  }

  const resend = new Resend(apiKey);

  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({ error: 'Email et prénom requis.' });
    }

    console.log(`📧 Tentative d'envoi à : ${email}`);

    const { data, error } = await resend.emails.send({
      from: 'OneWayTicket <contact@quarksydigital.com>',
      to: [email],
      subject: 'Confirmation d\'inscription',
      html: `<strong>Bienvenue ${firstName} !</strong><p>Ton inscription est validée.</p>`,
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('🔥 Erreur Serveur:', err);
    return res.status(500).json({ error: err.message });
  }
}