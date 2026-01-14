import { config } from 'dotenv';
config({ path: '.env.local' });

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'contact@quarksydigital.com',
      to: 'clgvernant@gmail',
      subject: 'Test Resend',
      html: '<h1>Ça marche !</h1><p>Votre configuration Resend est correcte.</p>'
    });

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('✅ Email envoyé avec succès !');
    console.log('ID:', data?.id);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testResend();