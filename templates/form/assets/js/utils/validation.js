/**
 * Validation et prévisualisation
 */

import { CONFIG, getElement, getElements } from '../core/config.js';
import { getCurrentTemplate, getVariablesConfig } from '../core/state.js';
import { showPreviewModal } from '../components/modal.js';

/**
 * Vérifier si tous les champs requis sont remplis
 */
export function checkRequiredFields() {
  const previewBtn = getElement(CONFIG.SELECTORS.previewBtn);
  const templateSelect = getElement(CONFIG.SELECTORS.templateSelect);

  if (!previewBtn || !templateSelect) return;

  // Vérifier si un template est sélectionné
  if (!templateSelect.value) {
    previewBtn.disabled = true;
    return;
  }

  // Vérifier tous les champs required (sauf destinataires qui n'est plus obligatoire)
  const dynamicFields = getElement(CONFIG.SELECTORS.dynamicFields);
  if (!dynamicFields) return;

  const requiredFields = dynamicFields.querySelectorAll('[required]');
  let allFilled = true;

  requiredFields.forEach(field => {
    if (!field.value || field.value.trim() === '') {
      allFilled = false;
    }
  });

  previewBtn.disabled = !allFilled;
}

/**
 * Collecter les données du formulaire
 * @returns {Object} Données du formulaire
 */
export function collectFormData() {
  const templateSelect = getElement(CONFIG.SELECTORS.templateSelect);
  const destinataires = getElement(CONFIG.SELECTORS.destinatairesHidden);
  const dynamicFields = getElement(CONFIG.SELECTORS.dynamicFields);
  
  const data = {
    templateType: templateSelect?.value || '',
    emailDestinataire: destinataires?.value || ''
  };
  
  if (dynamicFields) {
    const allInputs = dynamicFields.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
      data[input.id] = input.value || '';
    });
  }
  
  return data;
}

/**
 * Générer le HTML de prévisualisation
 * @param {Object} data - Données du formulaire
 * @returns {string} HTML de prévisualisation
 */
export function generatePreviewHTML(data) {
  const variablesConfig = getVariablesConfig();
  const templateConfig = variablesConfig?.templates[data.templateType];
  const typeDocumentLabel = templateConfig ? templateConfig.nom : 'Document';

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');

  // Fonction pour obtenir le label d'un champ
  const getFieldLabel = (key) => {
    // Chercher dans les variables communes
    if (variablesConfig?.variables_communes[key]) {
      return variablesConfig.variables_communes[key].label;
    }
    // Chercher dans les variables spécifiques du template
    if (templateConfig?.variables_specifiques[key]) {
      return templateConfig.variables_specifiques[key].label;
    }
    // Retourner la clé si pas de label trouvé
    return key;
  };

  // Clés à exclure de la section "Contenu de la demande"
  const excludedKeys = ['templateType', 'emailDestinataire', 'entreprise', 'codeDocument', 'civiliteDestinataire', 'nomDestinataire', 'statutDestinataire', 'batiment', 'adresse', 'cpVille', 'signatureExp'];

  // Générer les lignes pour la section "Contenu de la demande"
  const contenuLines = Object.keys(data)
    .filter(key => !excludedKeys.includes(key) && data[key])
    .map(key => {
      const label = getFieldLabel(key);
      return `<div><span class="font-semibold text-green-900">${label}:</span> <strong class="text-green-700">${data[key]}</strong></div>`;
    })
    .join('');

  return `
    <div class="bg-white rounded-lg">
      <!-- En-tête du document -->
      <div class="text-center mb-6 pb-4 border-b-2 border-[#0072ff]">
        <div class="text-sm text-[#49454F] mb-2">Paris, le <strong class="text-[#0072ff]">${dateStr}</strong></div>
        <div class="text-xl font-bold text-[#0072ff]">${typeDocumentLabel}</div>
      </div>

      <!-- Grille 3 colonnes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Colonne 1: Coordonnées (Bleu) -->
        <div class="md3-card elevation-1 p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <h3 class="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <span class="material-icons">location_on</span> Coordonnées
          </h3>
          <div class="space-y-2 text-sm">
            ${data.entreprise ? `<div><span class="font-semibold text-blue-900">${getFieldLabel('entreprise')}:</span> <strong class="text-blue-700">${data.entreprise}</strong></div>` : ''}
            ${data.codeDocument ? `<div><span class="font-semibold text-blue-900">${getFieldLabel('codeDocument')}:</span> <strong class="text-blue-700">${data.codeDocument}</strong></div>` : ''}
            ${data.civiliteDestinataire ? `<div><span class="font-semibold text-blue-900">${getFieldLabel('civiliteDestinataire')}:</span> <strong class="text-blue-700">${data.civiliteDestinataire}</strong></div>` : ''}
            ${data.nomDestinataire ? `<div><span class="font-semibold text-blue-900">${getFieldLabel('nomDestinataire')}:</span> <strong class="text-blue-700">${data.nomDestinataire}</strong></div>` : ''}
            ${data.statutDestinataire ? `<div><span class="font-semibold text-blue-900">${getFieldLabel('statutDestinataire')}:</span> ${data.statutDestinataire}</div>` : ''}
            ${data.batiment ? `<div><span class="font-semibold text-blue-900">${getFieldLabel('batiment')}:</span> ${data.batiment}</div>` : ''}
            ${data.adresse ? `<div><span class="font-semibold text-blue-900">${getFieldLabel('adresse')}:</span> ${data.adresse}</div>` : ''}
            ${data.cpVille ? `<div><span class="font-semibold text-blue-900">${getFieldLabel('cpVille')}:</span> ${data.cpVille}</div>` : ''}
          </div>
        </div>

        <!-- Colonne 2: Informations spécifiques (Vert) -->
        <div class="md3-card elevation-1 p-5 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
          <h3 class="text-base font-semibold text-green-900 mb-4 flex items-center gap-2">
            <span class="material-icons">edit_document</span> Contenu de la demande
          </h3>
          <div class="space-y-2 text-sm">
            ${contenuLines || '<div class="text-gray-500 text-xs">Aucune donnée spécifique</div>'}
          </div>
        </div>

        <!-- Colonne 3: Signataire (Violet) -->
        <div class="md3-card elevation-1 p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <h3 class="text-base font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <span class="material-icons">person</span> Signataire
          </h3>
          <div class="space-y-2 text-sm">
            ${data.signatureExp ? `<div><span class="font-semibold text-purple-900">${getFieldLabel('signatureExp')}:</span> <strong class="text-purple-700">${data.signatureExp}</strong></div>` : ''}
            <div class="mt-4">
              <span class="font-semibold text-purple-900">Destinataires:</span>
              <div class="mt-2 space-y-1">
                ${data.emailDestinataire ? data.emailDestinataire.split(',').map(email =>
                  `<div class="flex items-center gap-2 text-purple-700"><span class="material-icons text-sm">email</span> ${email.trim()}</div>`
                ).join('') : '<div class="text-gray-500 text-xs">Aucun destinataire</div>'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Note informative -->
      <div class="mt-6 bg-[#E8DEF8] border-l-4 border-[#0072ff] p-4 rounded">
        <p class="text-sm text-[#21005D]">
          <span class="material-icons text-base align-middle mr-1">info</span>
          <strong>Les données en couleur seront insérées dans le template Word</strong>
        </p>
      </div>
    </div>
  `;
}

/**
 * Générer et afficher la prévisualisation
 */
export function generateLocalPreview() {
  const templateSelect = getElement(CONFIG.SELECTORS.templateSelect);
  const msg = getElement(CONFIG.SELECTORS.message);
  
  if (!templateSelect?.value) {
    if (msg) {
      msg.textContent = CONFIG.MESSAGES.ERROR_SELECT_TEMPLATE;
      msg.style.color = '#dc2626';
    }
    return;
  }
  
  const data = collectFormData();
  const previewHTML = generatePreviewHTML(data);
  
  const variablesConfig = getVariablesConfig();
  const templateConfig = variablesConfig?.templates[data.templateType];
  const typeDocumentLabel = templateConfig ? templateConfig.nom : 'Document';
  const dateStr = new Date().toLocaleDateString('fr-FR');
  
  showPreviewModal(previewHTML, `Type: ${typeDocumentLabel} • Date: ${dateStr}`);
}

