/**
 * Gestion de la génération des champs dynamiques
 */

import { CONFIG } from '../core/config.js';
import { getVariablesConfig, setCurrentTemplate } from '../core/state.js';
import { getElement } from '../core/config.js';

/**
 * Créer un champ HTML depuis la configuration
 * @param {string} key - Clé du champ
 * @param {Object} config - Configuration du champ
 * @returns {HTMLElement|null}
 */
export function createField(key, config) {
  const fieldContainer = document.createElement('div');
  fieldContainer.className = 'w-full';
  
  const label = document.createElement('label');
  label.htmlFor = key;
  label.className = 'block text-xs font-medium text-gray-700 mb-1.5';
  label.textContent = config.label;
  fieldContainer.appendChild(label);
  
  if (config.type === 'select') {
    const select = createSelectField(key, config);
    fieldContainer.appendChild(select);
    return fieldContainer;
  } else if (config.type === 'textarea') {
    const textarea = createTextareaField(key, config);
    fieldContainer.appendChild(textarea);
    return fieldContainer;
  } else {
    const input = createInputField(key, config);
    fieldContainer.appendChild(input);
    return fieldContainer;
  }
}

/**
 * Créer un champ select
 * @param {string} key - Clé du champ
 * @param {Object} config - Configuration du champ
 * @returns {HTMLSelectElement}
 */
function createSelectField(key, config) {
  const select = document.createElement('select');
  select.id = key;
  select.className = 'md3-input md3-select w-full p-2.5 text-sm bg-white';
  select.required = config.required || false;
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Choisir...';
  select.appendChild(defaultOption);
  
  config.options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
  
  return select;
}

/**
 * Créer un champ textarea
 * @param {string} key - Clé du champ
 * @param {Object} config - Configuration du champ
 * @returns {HTMLTextAreaElement}
 */
function createTextareaField(key, config) {
  const textarea = document.createElement('textarea');
  textarea.id = key;
  textarea.placeholder = config.placeholder || config.label;
  textarea.rows = config.rows || 3;
  textarea.className = 'md3-input w-full p-2.5 text-sm resize-none';
  textarea.required = config.required || false;
  return textarea;
}

/**
 * Créer un champ input
 * @param {string} key - Clé du champ
 * @param {Object} config - Configuration du champ
 * @returns {HTMLInputElement}
 */
function createInputField(key, config) {
  const input = document.createElement('input');
  input.id = key;
  input.type = config.type === 'email' ? 'email' : 'text';
  input.placeholder = config.placeholder || config.label;
  input.className = 'md3-input w-full p-2.5 text-sm';
  input.required = config.required || false;
  if (config.default) input.value = config.default;
  return input;
}

/**
 * Générer les champs dynamiquement selon le template sélectionné
 * @param {string} templateKey - Clé du template
 */
export function generateFields(templateKey) {
  const variablesConfig = getVariablesConfig();
  if (!variablesConfig) return;
  
  setCurrentTemplate(templateKey);
  const template = variablesConfig.templates[templateKey];
  if (!template) return;
  
  // Vider les conteneurs de champs
  const coordonneesFields = getElement(CONFIG.SELECTORS.coordonneesFields);
  const contenuFields = getElement(CONFIG.SELECTORS.contenuFields);
  const expediteurFields = getElement(CONFIG.SELECTORS.expediteurFields);
  
  if (coordonneesFields) coordonneesFields.innerHTML = '';
  if (contenuFields) contenuFields.innerHTML = '';
  if (expediteurFields) expediteurFields.innerHTML = '';
  
  // Générer les champs de coordonnées
  CONFIG.FIELD_ORDER.coordonnees.forEach(key => {
    const variable = variablesConfig.variables_communes[key];
    if (variable && variable.type !== 'auto') {
      const field = createField(key, variable);
      if (field && coordonneesFields) coordonneesFields.appendChild(field);
    }
  });
  
  // Générer les champs spécifiques au template
  if (template.variables_specifiques) {
    Object.keys(template.variables_specifiques).forEach(key => {
      const variable = template.variables_specifiques[key];
      const field = createField(key, variable);
      if (field && contenuFields) contenuFields.appendChild(field);
    });
  }
  
  // Générer les champs d'expéditeur
  CONFIG.FIELD_ORDER.expediteur.forEach(key => {
    const variable = variablesConfig.variables_communes[key];
    if (variable && variable.type !== 'auto') {
      const field = createField(key, variable);
      if (field && expediteurFields) expediteurFields.appendChild(field);
    }
  });
}

