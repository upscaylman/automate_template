/**
 * Gestion de la prévisualisation et génération de documents
 */

import { CONFIG, getElement } from '../core/config.js';
import { setGeneratedWord, getGeneratedWord, setFormData } from '../core/state.js';
import { generateWordDocument, sendEmailWithWord, base64ToBlob, downloadBlob } from '../core/api.js';
import { collectFormData } from '../utils/validation.js';
import { showMessage, generateFilename } from '../utils/helpers.js';

/**
 * Ouvrir le modal de prévisualisation
 */
export function openPreviewModal() {
  const previewBtn = getElement(CONFIG.SELECTORS.previewBtn);
  if (previewBtn) {
    previewBtn.click();
  }
}

/**
 * Télécharger le document Word
 */
export async function downloadWord() {
  const btn = getElement(CONFIG.SELECTORS.downloadWordBtn);
  const msg = getElement(CONFIG.SELECTORS.message);
  
  if (!btn) return;
  
  const originalHTML = btn.innerHTML;
  
  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons animate-spin">sync</span> Génération...';
    
    // Collecter les données du formulaire
    const data = collectFormData();
    setFormData(data);
    
    console.log('📤 Génération du Word via formulaire-doc:', data);
    
    // Appeler le webhook pour générer le Word
    const result = await generateWordDocument(data);
    
    // Stocker le base64 pour l'envoi ultérieur
    setGeneratedWord(result.data);
    
    // Convertir base64 en blob pour le téléchargement
    const blob = base64ToBlob(result.data);
    console.log('✅ Word converti en blob:', blob.size, 'octets');
    
    // Télécharger le Word avec le nom du template
    const templateName = data.templateName || data.templateType || 'Document';
    const cleanName = templateName.replace(/\s+/g, '_'); // Remplacer espaces par underscores
    const filename = generateFilename(cleanName, 'docx');
    downloadBlob(blob, filename);
    
    if (msg) {
      showMessage(msg, CONFIG.MESSAGES.SUCCESS_DOWNLOAD, 'success');
    } else {
      alert(CONFIG.MESSAGES.SUCCESS_DOWNLOAD);
    }
    
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  } catch (error) {
    console.error('Erreur:', error);
    
    if (msg) {
      showMessage(msg, `${CONFIG.MESSAGES.ERROR_GENERATION} : ${error.message}`, 'error');
    } else {
      alert(`${CONFIG.MESSAGES.ERROR_GENERATION} : ${error.message}`);
    }
    
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

/**
 * Envoyer l'email avec le document Word
 */
export async function sendEmail() {
  const btn = getElement(CONFIG.SELECTORS.sendEmailBtn);
  const msg = getElement(CONFIG.SELECTORS.message);

  if (!btn) return;

  const originalHTML = btn.innerHTML;

  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons animate-spin">sync</span> Envoi...';

    // Vérifier si le Word a été généré
    let wordBase64 = getGeneratedWord();

    // Si pas de Word généré, le générer d'abord
    if (!wordBase64) {
      console.log('📄 Génération du Word avant envoi...');
      const data = collectFormData();
      setFormData(data);

      const result = await generateWordDocument(data);
      wordBase64 = result.data;
      setGeneratedWord(wordBase64);
    }

    // Récupérer les données du formulaire
    const data = collectFormData();

    // Récupérer le message personnalisé s'il existe
    const customMessage = document.body.getAttribute('data-custom-email-message');

    // Envoyer l'email avec le Word
    console.log('📧 Envoi de l\'email avec le Word en pièce jointe');
    await sendEmailWithWord(data, wordBase64, customMessage);

    // Nettoyer le message personnalisé après envoi
    if (customMessage) {
      document.body.removeAttribute('data-custom-email-message');
    }

    if (msg) {
      showMessage(msg, CONFIG.MESSAGES.SUCCESS_EMAIL_SENT, 'success');
    } else {
      alert(CONFIG.MESSAGES.SUCCESS_EMAIL_SENT);
    }

    btn.disabled = false;
    btn.innerHTML = originalHTML;

    // Fermer le modal après un court délai
    setTimeout(() => {
      const previewModal = getElement(CONFIG.SELECTORS.previewModal);
      if (previewModal) {
        previewModal.classList.add('hidden');
      }
    }, 1500);
  } catch (error) {
    console.error('Erreur:', error);

    if (msg) {
      showMessage(msg, `${CONFIG.MESSAGES.ERROR_SEND_EMAIL} : ${error.message}`, 'error');
    } else {
      alert(`${CONFIG.MESSAGES.ERROR_SEND_EMAIL} : ${error.message}`);
    }

    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

/**
 * Initialiser les boutons de prévisualisation et génération
 */
export function initPreviewButtons() {
  const downloadWordBtn = getElement(CONFIG.SELECTORS.downloadWordBtn);
  const sendEmailBtn = getElement(CONFIG.SELECTORS.sendEmailBtn);

  if (downloadWordBtn) {
    downloadWordBtn.addEventListener('click', downloadWord);
  }

  if (sendEmailBtn) {
    // Le bouton "Partager" ouvre maintenant le modal de partage
    sendEmailBtn.addEventListener('click', () => {
      // Fermer le modal de prévisualisation
      const previewModal = getElement(CONFIG.SELECTORS.previewModal);
      if (previewModal) {
        previewModal.classList.add('hidden');
      }

      // Ouvrir le modal de partage
      const shareModal = document.getElementById('shareModal');
      if (shareModal) {
        shareModal.classList.remove('hidden');
      }
    });
  }
}

