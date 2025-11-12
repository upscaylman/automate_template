/**
 * Point d'entrée principal de l'application
 * Initialise tous les modules et gère les événements globaux
 */

import { CONFIG, getElement } from './core/config.js';
import { setVariablesConfig } from './core/state.js';
import { loadVariablesConfig } from './core/api.js';
import { generateFields } from './components/fields.js';
import { initEmailChips } from './components/emailChips.js';
import { initModals } from './components/modal.js';
import { initTabs } from './components/tabs.js';
import { initPreviewButtons } from './components/preview.js';
import { checkRequiredFields, generateLocalPreview } from './utils/validation.js';
import { initTestDataButton } from './utils/testData.js';
import { showMessage } from './utils/helpers.js';

/**
 * Initialiser l'application
 */
async function initApp() {
  console.log('🚀 Initialisation de l\'application...');
  
  try {
    // Charger la configuration des variables
    const config = await loadVariablesConfig();
    setVariablesConfig(config);
    
    // Remplir le sélecteur de templates
    populateTemplateSelector(config);
    
    // Initialiser les composants
    initEmailChips();
    initModals();
    initTabs();
    initPreviewButtons();
    initTestDataButton();
    
    // Initialiser les événements
    initTemplateSelector();
    initPreviewButton();
    
    console.log('✅ Application initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    const msg = getElement(CONFIG.SELECTORS.message);
    if (msg) {
      showMessage(msg, `${CONFIG.MESSAGES.ERROR_LOAD_CONFIG}: ${error.message}`, 'error');
    }
  }
}

/**
 * Remplir le sélecteur de templates
 * @param {Object} config - Configuration chargée
 */
function populateTemplateSelector(config) {
  const templateSelect = getElement(CONFIG.SELECTORS.templateSelect);
  if (!templateSelect) return;
  
  templateSelect.innerHTML = '<option value="">📄 Choisir un type de document...</option>';
  
  Object.keys(config.templates).forEach(key => {
    const template = config.templates[key];
    const option = document.createElement('option');
    option.value = key;
    option.textContent = template.nom;
    templateSelect.appendChild(option);
  });
}

/**
 * Initialiser le sélecteur de template
 */
function initTemplateSelector() {
  const templateSelect = getElement(CONFIG.SELECTORS.templateSelect);
  if (!templateSelect) return;
  
  templateSelect.addEventListener('change', (e) => {
    const templateKey = e.target.value;

    if (templateKey) {
      // Afficher les sections
      const tabsContainer = document.getElementById('tabsContainer');
      const destinatairesSection = document.getElementById('destinatairesSection');
      const previewBtnContainer = document.getElementById('previewBtnContainer');

      if (tabsContainer) tabsContainer.style.display = 'flex';
      if (destinatairesSection) destinatairesSection.style.display = 'block';
      if (previewBtnContainer) previewBtnContainer.style.display = 'flex';

      // Générer les champs dynamiques
      generateFields(templateKey);

      // Ajouter des listeners sur tous les champs pour vérifier la validation
      setTimeout(() => {
        addFieldListeners();
        checkRequiredFields();
      }, 100);
    } else {
      // Masquer les sections
      const tabsContainer = document.getElementById('tabsContainer');
      const destinatairesSection = document.getElementById('destinatairesSection');
      const previewBtnContainer = document.getElementById('previewBtnContainer');

      if (tabsContainer) tabsContainer.style.display = 'none';
      if (destinatairesSection) destinatairesSection.style.display = 'none';
      if (previewBtnContainer) previewBtnContainer.style.display = 'none';

      // Vider les conteneurs de champs
      const coordonneesFields = getElement(CONFIG.SELECTORS.coordonneesFields);
      const contenuFields = getElement(CONFIG.SELECTORS.contenuFields);
      const expediteurFields = getElement(CONFIG.SELECTORS.expediteurFields);

      if (coordonneesFields) coordonneesFields.innerHTML = '';
      if (contenuFields) contenuFields.innerHTML = '';
      if (expediteurFields) expediteurFields.innerHTML = '';

      const previewBtn = getElement(CONFIG.SELECTORS.previewBtn);
      if (previewBtn) previewBtn.disabled = true;
    }
  });
}

/**
 * Ajouter des listeners sur tous les champs pour la validation
 */
function addFieldListeners() {
  const dynamicFields = getElement(CONFIG.SELECTORS.dynamicFields);
  if (!dynamicFields) return;
  
  const allInputs = dynamicFields.querySelectorAll('input, select, textarea');
  allInputs.forEach(input => {
    input.addEventListener('input', checkRequiredFields);
    input.addEventListener('change', checkRequiredFields);
  });
  
  // Ajouter listener sur le champ destinataires aussi
  const destinataires = getElement(CONFIG.SELECTORS.destinatairesHidden);
  if (destinataires) {
    destinataires.addEventListener('input', checkRequiredFields);
    destinataires.addEventListener('change', checkRequiredFields);
  }
}

/**
 * Initialiser le bouton de prévisualisation
 */
function initPreviewButton() {
  const previewBtn = getElement(CONFIG.SELECTORS.previewBtn);
  if (!previewBtn) return;
  
  previewBtn.addEventListener('click', generateLocalPreview);
}

/**
 * Démarrer l'application quand le DOM est prêt
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

