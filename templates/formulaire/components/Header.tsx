import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface HeaderProps {
  onPreview: () => void;
  onDownload: () => void;
  onShare: () => void;
  hasData: boolean;
  sidebarWidth?: number;
}

export const Header: React.FC<HeaderProps> = ({ onPreview, onDownload, onShare, hasData, sidebarWidth = 280 }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    // Récupérer le thème sauvegardé ou utiliser 'system' par défaut
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isThemeDropdownOpen && !target.closest('.theme-dropdown-container')) {
        setIsThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeDropdownOpen]);

  // Appliquer le thème au chargement et aux changements
  useEffect(() => {
    const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
      if (selectedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (selectedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System: détecter la préférence système
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsThemeDropdownOpen(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'system':
        return 'computer';
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm transition-all duration-300"
      style={{
        left: isDesktop ? `${sidebarWidth}px` : '0px',
      }}
      role="banner"
    >
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center gap-4 group cursor-pointer">
          <div
            className="w-12 h-12 bg-[#aa4584] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
            role="img"
            aria-label="Logo DocEase"
          >
             <span className="material-icons text-white text-2xl" aria-hidden="true">description</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-[#aa4584] dark:text-[#e062b1]">DocEase</h1>
            <span className="text-xs font-medium text-[#2f2f2f] dark:text-gray-400 uppercase tracking-widest hidden sm:block">by FO Métaux</span>
          </div>
        </div>

        {/* Action Buttons */}
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Actions principales">
          <Button
            variant="primary"
            icon="visibility"
            label="Prévisualiser"
            onClick={onPreview}
            disabled={!hasData}
            className="hidden sm:inline-flex"
            aria-label="Prévisualiser le document"
          />
          <button
             onClick={onPreview}
             disabled={!hasData}
             className="hidden w-10 h-10 items-center justify-center rounded-full bg-[#aa4584] text-white disabled:opacity-50 transition-all hover:scale-105"
             aria-label="Prévisualiser le document"
             title="Prévisualiser"
          >
             <span className="material-icons" aria-hidden="true">visibility</span>
          </button>

          <Button
            variant="secondary"
            icon="download"
            label="Télécharger"
            onClick={onDownload}
            disabled={!hasData}
            className="hidden md:inline-flex"
            aria-label="Télécharger le document PDF"
          />
           <button
             onClick={onDownload}
             disabled={!hasData}
             className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[#dd60b0] text-white disabled:opacity-50 transition-all hover:scale-105"
             aria-label="Télécharger le document PDF"
             title="Télécharger PDF"
          >
             <span className="material-icons" aria-hidden="true">download</span>
          </button>

          <Button
            variant="outlined"
            icon="share"
            label="Partager"
            onClick={onShare}
            disabled={!hasData}
            className="hidden sm:inline-flex"
            aria-label="Partager le document par email"
          />
           <button
             onClick={onShare}
             disabled={!hasData}
             className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2f2f2f] text-[#aa4584] dark:text-[#e062b1] disabled:opacity-50 transition-all hover:scale-105"
             aria-label="Partager le document par email"
             title="Partager"
          >
             <span className="material-icons" aria-hidden="true">share</span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

          {/* Theme Dropdown */}
          <div className="relative theme-dropdown-container">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
              title={`Thème: ${theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}`}
              aria-label="Changer le thème"
            >
              <span className="material-icons">{getThemeIcon()}</span>
            </button>

            {/* Dropdown Menu */}
            {isThemeDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
                style={{
                  backgroundColor: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                    ? 'rgb(47 47 47 / var(--tw-bg-opacity, 1))'
                    : undefined
                }}
              >
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-200">Clair</span>
                  {theme === 'light' && (
                    <svg className="w-4 h-4 text-[#aa4584] ml-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-200">Sombre</span>
                  {theme === 'dark' && (
                    <svg className="w-4 h-4 text-[#aa4584] ml-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('system')}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-200">Système</span>
                  {theme === 'system' && (
                    <svg className="w-4 h-4 text-[#aa4584] ml-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
