import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface MultiEmailInputProps {
  label: string;
  value: string; // Emails séparés par des virgules
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  predefinedEmails?: Array<{ name: string; email: string }>;
}

export const MultiEmailInput: React.FC<MultiEmailInputProps> = ({
  label,
  value,
  onChange,
  required,
  error,
  placeholder = 'Saisissez ou sélectionnez des emails...',
  predefinedEmails = []
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialiser les emails depuis la valeur
  useEffect(() => {
    if (value) {
      const emailList = value.split(',').map(e => e.trim()).filter(e => e);
      setEmails(emailList);
    } else {
      setEmails([]);
    }
  }, [value]);

  // Calculer la position du dropdown
  useEffect(() => {
    if (showDropdown && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 9999,
      });
    }
  }, [showDropdown]);

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Ne pas fermer si on clique dans le container ou dans le dropdown portal
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Vérifier si le clic est dans le dropdown portal
        const dropdownElement = document.querySelector('[data-dropdown-portal]');
        if (!dropdownElement || !dropdownElement.contains(target)) {
          setShowDropdown(false);
        }
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && trimmedEmail.includes('@') && !emails.includes(trimmedEmail)) {
      const newEmails = [...emails, trimmedEmail];
      setEmails(newEmails);
      onChange(newEmails.join(', '));
      return true;
    }
    return false;
  };

  const removeEmail = (emailToRemove: string) => {
    const newEmails = emails.filter(e => e !== emailToRemove);
    setEmails(newEmails);
    onChange(newEmails.join(', '));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Détecter virgule, point-virgule ou espace pour ajouter l'email
    if (val.includes(',') || val.includes(';') || val.includes(' ')) {
      const parts = val.split(/[,;\s]+/);
      parts.forEach(part => {
        if (part.trim()) {
          addEmail(part);
        }
      });
      setInputValue('');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmail(inputValue);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      removeEmail(emails[emails.length - 1]);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectPredefinedEmail = (email: string) => {
    addEmail(email);
    inputRef.current?.focus();
  };

  const selectAll = () => {
    predefinedEmails.forEach(({ email }) => {
      if (!emails.includes(email)) {
        addEmail(email);
      }
    });
  };

  const filteredPredefined = predefinedEmails.filter(
    ({ email }) => !emails.includes(email)
  );

  return (
    <div className="relative group w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
        {label}
        {required && <span style={{ color: 'rgb(196, 35, 45)' }}> *</span>}
      </label>

      <div
        className={`
          w-full bg-[#fdfbff] dark:bg-[rgb(37,37,37)] border-2 text-base rounded-2xl
          outline-none transition-all duration-200
          flex items-center gap-2 cursor-text overflow-x-auto overflow-y-hidden
          h-[52px] px-4
          ${error
            ? 'border-red-500 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10'
            : 'border-[#e7e0ec] dark:border-[rgb(75,85,99)] focus-within:border-[#a84383] focus-within:ring-4 focus-within:ring-[#a84383]/10'
          }
        `}
        onClick={() => inputRef.current?.focus()}
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Chips des emails sélectionnés */}
        <div className="flex items-center gap-1.5 flex-nowrap">
          {emails.map((email, index) => (
            <div
              key={index}
              className="
                flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                bg-[#E8DEF8] dark:bg-[#4a1a36]
                text-[#21005D] dark:text-[#e062b1]
                transition-colors whitespace-nowrap flex-shrink-0
              "
            >
              <span className="material-icons" style={{ fontSize: '14px' }}>email</span>
              <span className="max-w-[100px] overflow-hidden text-ellipsis">{email}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmail(email);
                }}
                className="flex items-center justify-center hover:text-red-500 transition-colors"
              >
                <span className="material-icons" style={{ fontSize: '14px' }}>close</span>
              </button>
            </div>
          ))}
        </div>

        {/* Input pour saisir un nouvel email */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder={emails.length === 0 ? placeholder : ''}
          className="
            flex-1 min-w-[150px] outline-none bg-transparent
            text-[#1c1b1f] dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
          "
        />

        {/* Bouton dropdown */}
        {predefinedEmails.length > 0 && (
          <button
            type="button"
            onClick={toggleDropdown}
            className="
              flex items-center justify-center w-8 h-8 rounded-full
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors
            "
          >
            <span className="material-icons text-gray-600 dark:text-gray-400">
              {showDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1 mt-1 ml-1 text-sm text-red-600 animate-[fadeIn_0.2s]" role="alert">
          <span className="material-icons text-sm">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Dropdown avec les emails prédéfinis */}
      {showDropdown && predefinedEmails.length > 0 && createPortal(
        <div
          data-dropdown-portal
          style={dropdownStyle}
          className="
            bg-white dark:bg-[rgb(47,47,47)]
            border-2 border-[#a84383] dark:border-[#e062b1]
            rounded-2xl shadow-xl max-h-80 overflow-y-auto
          "
        >
          <div className="p-2">
            {/* Bouton "Tout sélectionner" */}
            {filteredPredefined.length > 0 && (
              <button
                type="button"
                onClick={selectAll}
                className="
                  w-full text-left px-3 py-2 rounded-xl mb-2
                  bg-[#a84383] dark:bg-[#e062b1]
                  text-white font-medium
                  hover:bg-[#8d3a6e] dark:hover:bg-[#c54d9a]
                  transition-colors flex items-center gap-2
                "
              >
                <span className="material-icons text-sm">done_all</span>
                Tout sélectionner
              </button>
            )}

            {/* Liste des emails prédéfinis */}
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 font-medium">
              Sélectionnez un ou plusieurs destinataires :
            </div>
            {filteredPredefined.length > 0 ? (
              filteredPredefined.map(({ name, email }, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectPredefinedEmail(email)}
                  className="
                    w-full text-left px-3 py-2 rounded-xl
                    hover:bg-[#ffecf8] dark:hover:bg-[#4a1a36]/50
                    transition-colors flex items-start gap-2
                  "
                >
                  <span className="material-icons text-[#a84383] dark:text-[#e062b1] text-sm mt-0.5">
                    person
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{email}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Tous les destinataires ont été sélectionnés
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

