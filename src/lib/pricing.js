// src/utils/pricing.js

/**
 * Calcule le prix final en fonction du type de profil
 * @param {number} price - Le prix de base
 * @param {string} profileType - Le type de client (ex: 'etudiant', 'retraite')
 * @returns {number} - Le prix après réduction
 */
export const applyDiscount = (price, profileType) => {
  if (profileType === 'etudiant') return price * 0.8; // -20%
  if (profileType === 'retraite') return price * 0.9; // -10%
  if (profileType === 'demandeur_emploi') return price * 0.75; // Exemple -25%
  return price;
};