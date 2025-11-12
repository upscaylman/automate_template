/**
 * Gestion de l'état global de l'application
 * Centralise toutes les données de l'application
 */

export const state = {
  // Configuration chargée depuis variables.json
  variablesConfig: null,
  
  // Template actuellement sélectionné
  currentTemplate: null,
  
  // Liste des emails
  emails: [],
  
  // Document Word généré (base64)
  generatedWordBase64: null,
  
  // Données du formulaire
  currentFormData: null,
  
  // Onglet actif
  activeTab: 'coordonnees',
  
  // Étapes complétées
  completedSteps: {
    coordonnees: false,
    contenu: false,
    expediteur: false
  }
};

/**
 * Mettre à jour la configuration des variables
 * @param {Object} config - Configuration chargée
 */
export function setVariablesConfig(config) {
  state.variablesConfig = config;
}

/**
 * Obtenir la configuration des variables
 * @returns {Object|null}
 */
export function getVariablesConfig() {
  return state.variablesConfig;
}

/**
 * Définir le template actuel
 * @param {string} templateKey - Clé du template
 */
export function setCurrentTemplate(templateKey) {
  state.currentTemplate = templateKey;
}

/**
 * Obtenir le template actuel
 * @returns {string|null}
 */
export function getCurrentTemplate() {
  return state.currentTemplate;
}

/**
 * Ajouter un email à la liste
 * @param {string} email - Email à ajouter
 * @returns {boolean} - True si ajouté, false sinon
 */
export function addEmail(email) {
  email = email.trim();
  if (email && email.includes('@') && !state.emails.includes(email)) {
    state.emails.push(email);
    return true;
  }
  return false;
}

/**
 * Retirer un email de la liste
 * @param {string} email - Email à retirer
 * @returns {boolean} - True si retiré, false sinon
 */
export function removeEmail(email) {
  const index = state.emails.indexOf(email);
  if (index > -1) {
    state.emails.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Obtenir la liste des emails
 * @returns {Array<string>}
 */
export function getEmails() {
  return state.emails;
}

/**
 * Réinitialiser la liste des emails
 */
export function clearEmails() {
  state.emails = [];
}

/**
 * Définir le document Word généré
 * @param {string} base64 - Document en base64
 */
export function setGeneratedWord(base64) {
  state.generatedWordBase64 = base64;
}

/**
 * Obtenir le document Word généré
 * @returns {string|null}
 */
export function getGeneratedWord() {
  return state.generatedWordBase64;
}

/**
 * Définir les données du formulaire
 * @param {Object} data - Données du formulaire
 */
export function setFormData(data) {
  state.currentFormData = data;
}

/**
 * Obtenir les données du formulaire
 * @returns {Object|null}
 */
export function getFormData() {
  return state.currentFormData;
}

/**
 * Définir l'onglet actif
 * @param {string} tabId - ID de l'onglet
 */
export function setActiveTab(tabId) {
  state.activeTab = tabId;
}

/**
 * Obtenir l'onglet actif
 * @returns {string}
 */
export function getActiveTab() {
  return state.activeTab;
}

/**
 * Marquer une étape comme complétée
 * @param {string} stepId - ID de l'étape
 * @param {boolean} completed - État de complétion
 */
export function setStepCompleted(stepId, completed) {
  if (state.completedSteps.hasOwnProperty(stepId)) {
    state.completedSteps[stepId] = completed;
  }
}

/**
 * Vérifier si une étape est complétée
 * @param {string} stepId - ID de l'étape
 * @returns {boolean}
 */
export function isStepCompleted(stepId) {
  return state.completedSteps[stepId] || false;
}

