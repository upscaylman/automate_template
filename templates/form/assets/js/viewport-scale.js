/**
 * Viewport-based automatic scaling
 * Adapte automatiquement la taille du contenu en fonction de la taille du viewport
 * Désactivé sur mobile et tablette (< 1024px)
 * Optimisé pour les écrans 13,3" et 14" (évite un scale trop petit)
 */

(function () {
  // Seuil minimum pour activer le scaling (desktop uniquement)
  const MIN_DESKTOP_WIDTH = 1024;

  // Vérifier immédiatement si on est sur mobile/tablette - si oui, ne rien faire
  if (window.innerWidth < MIN_DESKTOP_WIDTH) {
    return; // Sortir immédiatement, le code ne s'exécute pas sur mobile/tablette
  }

  // Dimensions de référence (design optimal)
  const REFERENCE_WIDTH = 1920;
  const REFERENCE_HEIGHT = 1080;

  // Scale minimum pour éviter que le contenu soit trop petit sur les écrans moyens
  // Permet d'avoir un contenu lisible sur les écrans 13,3" et 14"
  const MIN_SCALE = 0.75;

  // Scale maximum (ne jamais agrandir au-delà de 100%)
  const MAX_SCALE = 1.0;

  // Tolérance pour considérer qu'on est à la résolution de référence (pas de scaling)
  const TOLERANCE = 50;

  function calculateOptimalScale() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Si on est proche de la résolution de référence (1920x1080), pas de scaling
    if (
      Math.abs(viewportWidth - REFERENCE_WIDTH) < TOLERANCE &&
      Math.abs(viewportHeight - REFERENCE_HEIGHT) < TOLERANCE
    ) {
      return 1; // Pas de scaling, affichage natif à 100%
    }

    // Calculer le ratio de scale pour width et height
    const scaleX = viewportWidth / REFERENCE_WIDTH;
    const scaleY = viewportHeight / REFERENCE_HEIGHT;

    // Prendre le minimum pour que tout rentre à l'écran
    let scale = Math.min(scaleX, scaleY, MAX_SCALE);

    // Appliquer le scale minimum pour éviter que le contenu soit trop petit
    // Cela garantit une bonne lisibilité sur les écrans 13,3" et 14"
    scale = Math.max(scale, MIN_SCALE);

    return scale;
  }

  function applyViewportScale() {
    // Double vérification au cas où (sécurité supplémentaire)
    if (window.innerWidth < MIN_DESKTOP_WIDTH) {
      return; // Ne rien faire sur mobile/tablette
    }

    const scale = calculateOptimalScale();
    document.documentElement.style.setProperty("--base-scale", scale);

    // Ajuster la taille du body pour éviter le scroll (seulement sur desktop avec scaling)
    if (scale < 1) {
      const scaledWidth = window.innerWidth / scale;
      const scaledHeight = window.innerHeight / scale;
      document.body.style.width = scaledWidth + "px";
      document.body.style.height = scaledHeight + "px";
    } else {
      // Réinitialiser si pas de scaling nécessaire
      document.body.style.width = "";
      document.body.style.height = "";
    }
  }

  // Appliquer au chargement
  applyViewportScale();

  // Recalculer lors du redimensionnement de la fenêtre
  let resizeTimeout;
  window.addEventListener("resize", function () {
    // Ne pas exécuter sur mobile/tablette
    if (window.innerWidth < MIN_DESKTOP_WIDTH) {
      return;
    }
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(applyViewportScale, 100);
  });
})();
