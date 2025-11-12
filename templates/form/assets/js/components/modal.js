/**
 * Gestion des modaux
 */

import { CONFIG, getElement } from '../core/config.js';

/**
 * Afficher le modal de prévisualisation
 * @param {string} htmlContent - Contenu HTML à afficher
 * @param {string} subtitle - Sous-titre du modal
 */
export function showPreviewModal(htmlContent, subtitle = '') {
  const previewModal = getElement(CONFIG.SELECTORS.previewModal);
  const previewContent = getElement(CONFIG.SELECTORS.previewContent);
  const previewSubtitle = document.getElementById('previewSubtitle');
  
  if (previewContent) {
    previewContent.innerHTML = htmlContent;
  }
  
  if (previewSubtitle && subtitle) {
    previewSubtitle.textContent = subtitle;
  }
  
  if (previewModal) {
    previewModal.classList.remove('hidden');
  }
}

/**
 * Masquer le modal de prévisualisation
 */
export function hidePreviewModal() {
  const previewModal = getElement(CONFIG.SELECTORS.previewModal);
  if (previewModal) {
    previewModal.classList.add('hidden');
  }
}

/**
 * Afficher le modal de visualisation Word
 * @param {string} wordUrl - URL du document Word
 */
export function showWordViewerModal(wordUrl) {
  const wordViewerModal = getElement(CONFIG.SELECTORS.wordViewerModal);
  const wordViewerFrame = getElement(CONFIG.SELECTORS.wordViewerFrame);
  const wordViewerLoading = getElement(CONFIG.SELECTORS.wordViewerLoading);
  
  if (wordViewerModal) {
    wordViewerModal.classList.remove('hidden');
  }
  
  if (wordViewerFrame && wordViewerLoading) {
    wordViewerFrame.style.display = 'none';
    wordViewerLoading.style.display = 'flex';
    
    // Charger le document dans l'iframe
    wordViewerFrame.src = wordUrl;
    
    // Masquer le loading quand l'iframe est chargée
    wordViewerFrame.onload = () => {
      wordViewerLoading.style.display = 'none';
      wordViewerFrame.style.display = 'block';
      
      const subtitle = document.getElementById('wordViewerSubtitle');
      if (subtitle) {
        subtitle.textContent = 'Document généré avec succès';
      }
    };
  }
}

/**
 * Masquer le modal de visualisation Word
 */
export function hideWordViewerModal() {
  const wordViewerModal = getElement(CONFIG.SELECTORS.wordViewerModal);
  const wordViewerFrame = getElement(CONFIG.SELECTORS.wordViewerFrame);
  
  if (wordViewerModal) {
    wordViewerModal.classList.add('hidden');
  }
  
  if (wordViewerFrame) {
    wordViewerFrame.src = '';
  }
}

/**
 * Initialiser les événements des modaux
 */
export function initModals() {
  // Boutons de fermeture du modal de prévisualisation
  const closeModal = getElement(CONFIG.SELECTORS.closeModal);
  const closeModalBtn = getElement(CONFIG.SELECTORS.closeModalBtn);
  
  if (closeModal) {
    closeModal.addEventListener('click', hidePreviewModal);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hidePreviewModal);
  }
  
  // Boutons de fermeture du modal Word
  const closeWordViewer = getElement(CONFIG.SELECTORS.closeWordViewer);
  const closeWordViewerBtn = getElement(CONFIG.SELECTORS.closeWordViewerBtn);
  
  if (closeWordViewer) {
    closeWordViewer.addEventListener('click', hideWordViewerModal);
  }
  
  if (closeWordViewerBtn) {
    closeWordViewerBtn.addEventListener('click', hideWordViewerModal);
  }
  
  // Fermer les modaux en cliquant en dehors
  const previewModal = getElement(CONFIG.SELECTORS.previewModal);
  if (previewModal) {
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) {
        hidePreviewModal();
      }
    });
  }
  
  const wordViewerModal = getElement(CONFIG.SELECTORS.wordViewerModal);
  if (wordViewerModal) {
    wordViewerModal.addEventListener('click', (e) => {
      if (e.target === wordViewerModal) {
        hideWordViewerModal();
      }
    });
  }
}

