import axios from 'axios';

/**
 * URL de votre serveur Backend.
 * En développement : http://localhost:4242
 * En production : https://api.quarksydigital.com
 */

// 🟦 Configuration pour le développement LOCAL
// On pointe vers le port 4242 de votre propre ordinateur
const API_BASE_URL = 'http://localhost:4242/api'; 

export const downloadInvoicePdf = async (orderId: string): Promise<Blob> => {
  try {
    // Cette ligne va appeler : http://localhost:4242/api/invoices/VOTRE_ID
    const response = await axios.get(`${API_BASE_URL}/invoices/${orderId}`, {
      responseType: 'blob', // Indispensable pour que le navigateur comprenne que c'est un fichier
    });

    return response.data;
  } catch (error) {
    console.error("Erreur locale : Vérifiez que votre serveur node est bien lancé sur le port 4242");
    throw error;
  }
};