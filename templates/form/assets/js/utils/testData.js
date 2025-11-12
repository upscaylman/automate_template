/**
 * Données de test pour remplir le formulaire
 */

import { CONFIG, getElement } from '../core/config.js';
import { getVariablesConfig } from '../core/state.js';
import { generateFields } from '../components/fields.js';
import { addEmail } from '../components/emailChips.js';
import { clearEmails } from '../core/state.js';

/**
 * Données de test
 */
const TEST_DATA = {
  entreprise: ['ACME Corp', 'TechCo Industries', 'Solutions SARL', 'Métallurgie SA'],
  codeDocument: ['ACME Corp', 'TechCo', 'Industries SA', 'Solutions SARL'],
  civiliteDestinataire: ['Monsieur', 'Madame'],
  statutDestinataire: ['Président', 'Directeur', 'Responsable RH', 'Chef de service'],
  batiment: ['Bâtiment A', 'Bâtiment B', 'Tour Nord', 'Annexe'],
  adresse: ['123 Rue de la Paix', '45 Avenue des Champs', '78 Boulevard Saint-Michel', '12 Place de la République'],
  cpVille: ['75001 Paris', '69002 Lyon', '13001 Marseille', '44000 Nantes'],
  numeroCourrier: () => '2025-' + String(Math.floor(Math.random() * 100) + 1).padStart(3, '0'),
  civiliteRemplace: ['Monsieur', 'Madame'],
  nomRemplace: ['Durand', 'Petit', 'Robert', 'Moreau'],
  civiliteDelegue: ['Monsieur', 'Madame'],
  nomDelegue: ['Lefebvre', 'Girard', 'Rousseau', 'Leroy'],
  emailDelegue: ['lefebvre@example.com', 'girard@example.com', 'rousseau@example.com'],
  signatureExp: ['FO METAUX', 'Force Ouvrière', 'Syndicat FO'],
  emails: ['epheandrill@gmail.com', 'bouvier.jul@gmail.com']
};

/**
 * Obtenir une valeur aléatoire depuis un tableau ou une fonction
 * @param {Array|Function} source - Source de données
 * @returns {*}
 */
function getRandomValue(source) {
  if (typeof source === 'function') {
    return source();
  }
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * Remplir le formulaire avec des données de test
 */
export function fillTestData() {
  const templateSelect = getElement(CONFIG.SELECTORS.templateSelect);
  const variablesConfig = getVariablesConfig();
  
  // Sélectionner un template aléatoire si pas déjà sélectionné
  if (templateSelect && !templateSelect.value && variablesConfig) {
    const templates = Object.keys(variablesConfig.templates);
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    templateSelect.value = randomTemplate;
    
    // Déclencher l'événement change pour générer les champs
    const event = new Event('change', { bubbles: true });
    templateSelect.dispatchEvent(event);
    
    // Attendre que les champs soient générés
    setTimeout(() => {
      fillFieldsWithTestData();
    }, 100);
  } else {
    fillFieldsWithTestData();
  }
}

/**
 * Remplir les champs avec des données de test
 */
function fillFieldsWithTestData() {
  // Remplir tous les champs dynamiques
  Object.keys(TEST_DATA).forEach(key => {
    if (key === 'emails') return; // Géré séparément
    
    const field = getElement(`#${key}`);
    if (field) {
      field.value = getRandomValue(TEST_DATA[key]);
    }
  });
  
  // Remplir les emails avec chips
  clearEmails();
  const emailContainer = getElement(CONFIG.SELECTORS.emailContainer);
  if (emailContainer) {
    // Supprimer tous les chips existants
    const existingChips = emailContainer.querySelectorAll('.email-chip');
    existingChips.forEach(chip => chip.remove());
  }
  
  TEST_DATA.emails.forEach(email => addEmail(email));
}

/**
 * Initialiser le bouton de remplissage avec données de test
 */
export function initTestDataButton() {
  const fillTestDataBtn = getElement(CONFIG.SELECTORS.fillTestDataBtn);
  
  if (fillTestDataBtn) {
    fillTestDataBtn.addEventListener('click', fillTestData);
  }
}

