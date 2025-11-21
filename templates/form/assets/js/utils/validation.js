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

  const templateType = templateSelect?.value || '';

  const data = {
    templateType: templateType,
    emailEnvoi: destinataires?.value || ''
  };

  // Ajouter le nom du template pour le nom de fichier
  const variablesConfig = getVariablesConfig();
  if (variablesConfig && variablesConfig.templates && variablesConfig.templates[templateType]) {
    const templateConfig = variablesConfig.templates[templateType];
    data.templateName = templateConfig.nom || templateType;
  } else {
    data.templateName = templateType;
  }

  if (dynamicFields) {
    const allInputs = dynamicFields.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
      data[input.id] = input.value || '';
    });
  }

  // Ajouter le message personnalisé s'il existe (depuis l'attribut data)
  const customMessage = document.body.getAttribute('data-custom-email-message');
  if (customMessage) {
    data.customEmailMessage = customMessage;
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
              <span class="font-semibold text-purple-900">Destinataires email:</span>
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
export async function generateLocalPreview() {
  const templateSelect = getElement(CONFIG.SELECTORS.templateSelect);
  const msg = getElement(CONFIG.SELECTORS.message);
  const previewContent = getElement(CONFIG.SELECTORS.previewContent);
  const previewModal = getElement(CONFIG.SELECTORS.previewModal);

  if (!templateSelect?.value) {
    const { showWarningToast } = await import('./toast.js');
    showWarningToast(CONFIG.MESSAGES.ERROR_SELECT_TEMPLATE);
    return;
  }

  // Afficher le modal avec un loader
  if (previewContent) {
    previewContent.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <span class="material-icons text-6xl text-blue-500 animate-spin mb-4">sync</span>
        <p class="text-lg text-gray-600">Génération du document en cours...</p>
        <p class="text-sm text-gray-500 mt-2">Veuillez patienter</p>
      </div>
    `;
  }

  if (previewModal) {
    previewModal.classList.remove('hidden');
  }

  try {
    // Collecter les données et générer le document
    const data = collectFormData();
    console.log('Génération du document pour prévisualisation...');

    // Importer dynamiquement les fonctions nécessaires
    const { generateWordDocument, generatePdfDocument, base64ToBlob, convertWordToPdf } = await import('../core/api.js');
    const { setGeneratedWord } = await import('../core/state.js');

    let pdfBase64 = null;
    let wordBase64 = null;

    // Essayer d'abord de générer un PDF directement depuis le serveur
    try {
      console.log('Tentative de génération PDF directe depuis le serveur...');
      const pdfResult = await generatePdfDocument(data);
      pdfBase64 = pdfResult.data;
      console.log('PDF généré directement depuis le serveur');
    } catch (pdfError) {
      console.log('Le serveur ne génère pas de PDF directement, conversion Word->PDF...', pdfError);
      
      // Si le serveur ne génère pas de PDF, générer un Word et le convertir
      const result = await generateWordDocument(data);
      wordBase64 = result.data;
      
      // Stocker pour téléchargement ultérieur
      setGeneratedWord(wordBase64);
      
      // Essayer de convertir Word en PDF
      try {
        pdfBase64 = await convertWordToPdf(wordBase64);
        console.log('Word converti en PDF avec succès');
      } catch (convertError) {
        console.error('Erreur conversion Word->PDF:', convertError);
        // Si la conversion échoue, on continue avec le fallback HTML (pas de return)
        // Le code continuera et utilisera le fallback HTML plus bas
        pdfBase64 = null;
      }
    }

    // Si on a un PDF, l'afficher avec PDF.js
    if (pdfBase64 && previewContent && window.pdfjsLib) {
      try {
        // Convertir base64 en Uint8Array pour PDF.js
        const pdfBlob = base64ToBlob(pdfBase64, 'application/pdf');
        const arrayBuffer = await pdfBlob.arrayBuffer();
        
        // Calculer la taille du fichier
        const fileSizeKB = (pdfBlob.size / 1024).toFixed(2);
        
        // Obtenir les informations du document
        const variablesConfig = getVariablesConfig();
        const templateConfig = variablesConfig?.templates[data.templateType];
        const typeDocumentLabel = templateConfig ? templateConfig.nom : 'Document';

        // Charger le PDF avec PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        // Afficher un toast de succès
        const { showSuccessToast } = await import('./toast.js');
        const toastMessage = `<div><div style="font-weight: 600; margin-bottom: 4px;">Document PDF généré avec succès !</div><div style="font-size: 13px; opacity: 0.8;">${typeDocumentLabel} • ${fileSizeKB} KB</div></div>`;
        showSuccessToast(toastMessage, { icon: 'check_circle', duration: 5000, html: true });

        // Créer le conteneur pour le PDF
        previewContent.innerHTML = `
          <div class="w-full h-full flex flex-col">
            <!-- Contrôles de navigation PDF -->
            <div class="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg">
              <div class="flex items-center gap-2">
                <button id="pdfPrevPage" class="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                  <span class="material-icons text-sm">chevron_left</span>
                  <span class="text-sm">Précédent</span>
                </button>
                <span class="text-sm text-gray-700">
                  Page <span id="pdfPageNum">1</span> sur <span id="pdfPageCount">${pdf.numPages}</span>
                </span>
                <button id="pdfNextPage" class="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                  <span class="text-sm">Suivant</span>
                  <span class="material-icons text-sm">chevron_right</span>
                </button>
              </div>
              <div class="flex items-center gap-2">
                <button id="pdfZoomOut" class="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  <span class="material-icons text-sm">zoom_out</span>
                </button>
                <span class="text-sm text-gray-700" id="pdfZoomLevel">100%</span>
                <button id="pdfZoomIn" class="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  <span class="material-icons text-sm">zoom_in</span>
                </button>
              </div>
            </div>

            <!-- Zone d'affichage PDF -->
            <div class="bg-gray-200 rounded-xl p-4 overflow-auto flex-1" style="max-height: 600px;">
              <div class="flex justify-center">
                <canvas id="pdfCanvas" class="shadow-lg bg-white"></canvas>
              </div>
            </div>

            <div class="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <span class="material-icons text-base">picture_as_pdf</span>
              <p>Prévisualisation PDF • Utilisez les boutons en bas pour télécharger ou envoyer</p>
            </div>
          </div>
        `;

        // Variables pour la navigation
        let currentPage = 1;
        let scale = 1.5;
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        const pageNumSpan = document.getElementById('pdfPageNum');
        const pageCountSpan = document.getElementById('pdfPageCount');
        const zoomLevelSpan = document.getElementById('pdfZoomLevel');
        const prevBtn = document.getElementById('pdfPrevPage');
        const nextBtn = document.getElementById('pdfNextPage');
        const zoomInBtn = document.getElementById('pdfZoomIn');
        const zoomOutBtn = document.getElementById('pdfZoomOut');

        // Fonction pour rendre une page
        async function renderPage(pageNum) {
          try {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: scale });
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
              canvasContext: ctx,
              viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Mettre à jour l'affichage de la page
            pageNumSpan.textContent = pageNum;
            pageCountSpan.textContent = pdf.numPages;
            zoomLevelSpan.textContent = Math.round(scale * 100) + '%';
            
            // Mettre à jour les boutons
            prevBtn.disabled = pageNum <= 1;
            nextBtn.disabled = pageNum >= pdf.numPages;
          } catch (error) {
            console.error('Erreur rendu page PDF:', error);
          }
        }

        // Navigation
        prevBtn.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
          }
        });

        nextBtn.addEventListener('click', () => {
          if (currentPage < pdf.numPages) {
            currentPage++;
            renderPage(currentPage);
          }
        });

        // Zoom
        zoomInBtn.addEventListener('click', () => {
          scale = Math.min(scale + 0.25, 3);
          renderPage(currentPage);
        });

        zoomOutBtn.addEventListener('click', () => {
          scale = Math.max(scale - 0.25, 0.5);
          renderPage(currentPage);
        });

        // Rendre la première page
        await renderPage(1);

      } catch (pdfError) {
        console.error('Erreur affichage PDF:', pdfError);
        if (previewContent) {
          previewContent.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
              <span class="material-icons text-6xl text-red-500 mb-4">error</span>
              <p class="text-lg text-red-600 font-semibold">Erreur lors de l'affichage du PDF</p>
              <p class="text-sm text-gray-600 mt-2">${pdfError.message}</p>
              <p class="text-sm text-gray-500 mt-4">Vous pouvez télécharger le document avec les boutons en bas.</p>
            </div>
          `;
        }
      }
    } else if (!window.pdfjsLib) {
      // PDF.js n'est pas chargé
      if (previewContent) {
        previewContent.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12">
            <span class="material-icons text-6xl text-orange-500 mb-4">warning</span>
            <p class="text-lg text-gray-700 font-semibold">PDF.js non chargé</p>
            <p class="text-sm text-gray-600 mt-2">La bibliothèque PDF.js n'est pas disponible.</p>
            <p class="text-sm text-gray-500 mt-4">Veuillez vérifier la connexion internet ou recharger la page.</p>
          </div>
        `;
      }
    }

    // Fallback: Si PDF.js n'est pas disponible et qu'on a un Word, utiliser l'ancienne méthode HTML
    if (!pdfBase64 && previewContent && window.mammoth && wordBase64) {
      const blob = base64ToBlob(wordBase64);
      const arrayBuffer = await blob.arrayBuffer();

      // Options de conversion pour un meilleur rendu avec en-têtes et pieds de page
      const options = {
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true,
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Title'] => h1.title:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em"
        ]
      };

      // Extraire le contenu principal + en-têtes/pieds de page
      Promise.all([
        mammoth.convertToHtml({ arrayBuffer: arrayBuffer }, options),
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
      ]).then(async ([htmlResult, textResult]) => {
          const htmlContent = htmlResult.value;

          // Vérifier s'il y a des messages d'avertissement
          if (htmlResult.messages.length > 0) {
            console.log('Messages Mammoth:', htmlResult.messages);
          }

          // Afficher un toast de succès
          const { showSuccessToast } = await import('./toast.js');
          const variablesConfig = getVariablesConfig();
          const templateConfig = variablesConfig?.templates[data.templateType];
          const typeDocumentLabel = templateConfig ? templateConfig.nom : 'Document';
          const fileSizeKB = (blob.size / 1024).toFixed(2);
          const toastMessage = `<div><div style="font-weight: 600; margin-bottom: 4px;">Document généré avec succès !</div><div style="font-size: 13px; opacity: 0.8;">${typeDocumentLabel} • ${fileSizeKB} KB</div></div>`;
          showSuccessToast(toastMessage, { icon: 'check_circle', duration: 5000, html: true });

          previewContent.innerHTML = `
            <div class="w-full h-full flex flex-col">
              <!-- Prévisualisation du document avec style Word -->
              <div class="bg-gray-200 rounded-xl p-4 overflow-auto" style="max-height: 600px;">
                <!-- Page A4 simulée -->
                <div class="word-document-preview bg-white shadow-2xl mx-auto" style="
                  width: 21cm;
                  min-height: 29.7cm;
                  box-sizing: border-box;
                  font-family: 'Calibri', 'Arial', sans-serif;
                  font-size: 11pt;
                  line-height: 1.5;
                  color: #000000;
                  display: flex;
                  flex-direction: column;
                ">
                  <!-- En-tête avec logo -->
                  <div style="padding: 1.27cm 2.54cm 0.5cm 2.54cm;">
                    <img src="./assets/img/logo_entete.png" alt="En-tête FO METAUX" style="width: 25%; height: auto; display: block;">
                  </div>

                  <!-- Contenu principal -->
                  <div style="flex: 1; padding: 0 2.54cm;">
                    ${htmlContent}
                  </div>

                  <!-- Pied de page -->
                  <div style="padding: 0.5cm 2.54cm 1.27cm 2.54cm; margin-top: auto;">
                    <img src="./assets/img/logo_piedpage.png" alt="Pied de page FO METAUX" style="width: 100%; height: auto; display: block;">
                  </div>
                </div>
              </div>

              <div class="mt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <span class="material-icons text-base">lightbulb</span>
                <p>Prévisualisation au format A4 • Utilisez les boutons en bas pour télécharger ou envoyer</p>
              </div>
            </div>
          `;

          // Ajouter des styles CSS pour le contenu Word
          const style = document.createElement('style');
          style.textContent = `
            .word-document-preview h1 {
              font-size: 16pt;
              font-weight: bold;
              margin: 12pt 0 6pt 0;
              color: #000000;
            }
            .word-document-preview h2 {
              font-size: 14pt;
              font-weight: bold;
              margin: 10pt 0 5pt 0;
              color: #000000;
            }
            .word-document-preview h3 {
              font-size: 12pt;
              font-weight: bold;
              margin: 8pt 0 4pt 0;
              color: #000000;
            }
            .word-document-preview p {
              margin: 0 0 10pt 0;
              text-align: justify;
            }
            .word-document-preview strong {
              font-weight: bold;
            }
            .word-document-preview em {
              font-style: italic;
            }
            .word-document-preview ul, .word-document-preview ol {
              margin: 0 0 10pt 0;
              padding-left: 40px;
            }
            .word-document-preview li {
              margin-bottom: 5pt;
            }
            .word-document-preview table {
              border-collapse: collapse;
              width: 100%;
              margin: 10pt 0;
            }
            .word-document-preview td, .word-document-preview th {
              border: 1px solid #000000;
              padding: 5pt;
            }
            .word-document-preview th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
          `;
          previewContent.appendChild(style);
        })
        .catch(err => {
          console.error('Erreur Mammoth:', err);
          previewContent.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
              <span class="material-icons text-6xl text-orange-500 mb-4">warning</span>
              <p class="text-lg text-gray-700 font-semibold">Prévisualisation non disponible</p>
              <p class="text-sm text-gray-600 mt-2">Le document a été généré mais la prévisualisation a échoué.</p>
              <p class="text-sm text-gray-500 mt-4">Vous pouvez télécharger le document avec les boutons en bas.</p>
            </div>
          `;
        });
    }

    console.log('Document généré et prêt pour prévisualisation');

  } catch (error) {
    console.error('Erreur lors de la génération:', error);

    if (previewContent) {
      previewContent.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
          <span class="material-icons text-6xl text-red-500 mb-4">error</span>
          <p class="text-lg text-red-600 font-semibold">Erreur lors de la génération</p>
          <p class="text-sm text-gray-600 mt-2">${error.message}</p>
          <button onclick="this.closest('#previewModal').classList.add('hidden')" class="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
            Fermer
          </button>
        </div>
      `;
    }
  }
}

