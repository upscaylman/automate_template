/**
 * Fonctions utilitaires diverses
 */

/**
 * Formater une date en français
 * @param {Date} date - Date à formater
 * @returns {string}
 */
export function formatDateFR(date = new Date()) {
  return date.toLocaleDateString('fr-FR');
}

/**
 * Formater une date complète en français
 * @param {Date} date - Date à formater
 * @returns {string}
 */
export function formatDateCompleteFR(date = new Date()) {
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Échapper les caractères HTML
 * @param {string} text - Texte à échapper
 * @returns {string}
 */
export function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Débounce une fonction
 * @param {Function} func - Fonction à débouncer
 * @param {number} wait - Temps d'attente en ms
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Afficher un message
 * @param {HTMLElement} element - Élément où afficher le message
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message ('success', 'error', 'info')
 */
export function showMessage(element, message, type = 'info') {
  if (!element) return;
  
  element.textContent = message;
  
  const colors = {
    success: '#4CAF50',
    error: '#dc2626',
    info: '#49454F'
  };
  
  element.style.color = colors[type] || colors.info;
}

/**
 * Générer un nom de fichier unique
 * @param {string} prefix - Préfixe du nom de fichier
 * @param {string} extension - Extension du fichier
 * @returns {string}
 */
export function generateFilename(prefix = 'Document', extension = 'docx') {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Copier du texte dans le presse-papiers
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    return false;
  }
}

