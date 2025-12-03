import React, { useState, useEffect, memo } from 'react';
import { StepType, FormField, FormData } from '../types';
import { FORM_FIELDS } from '../constants';
import { Input } from './Input';
import { AITextarea } from './AITextarea';
import { AddressInput } from './AddressInput';

interface FormStepProps {
  step: StepType;
  data: FormData;
  onChange: (key: string, value: string) => void;
  isCustomizing?: boolean;
  customFields?: FormField[];
  onFieldsReorder?: (newFields: FormField[]) => void;
  invalidFields?: Set<string>;
  removedFields?: { field: FormField; originalIndex: number }[];
  onRemovedFieldsChange?: (removedFields: { field: FormField; originalIndex: number }[]) => void;
}

const FormStepComponent: React.FC<FormStepProps> = ({
  step,
  data,
  onChange,
  isCustomizing = false,
  customFields,
  onFieldsReorder,
  invalidFields,
  removedFields: externalRemovedFields = [],
  onRemovedFieldsChange
}) => {
  // Utiliser l'ordre personnalisé si disponible, sinon l'ordre par défaut
  const [fields, setFields] = useState<FormField[]>(customFields || FORM_FIELDS[step]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Mettre à jour les champs quand step ou customFields changent
  useEffect(() => {
    const newFields = customFields || FORM_FIELDS[step];
    setFields(newFields);
  }, [step, customFields]);

  // SECTION: LOGIQUE SUPPRESSION & RESTAURATION
  const removeField = (index: number) => {
    const newFields = [...fields];
    // On retire le champ de la liste principale
    const [removed] = newFields.splice(index, 1);
    setFields(newFields);
    // On l'ajoute à la liste des champs supprimés avec son index d'origine
    const newRemovedFields = [...externalRemovedFields, { field: removed, originalIndex: index }];

    if (onRemovedFieldsChange) {
      onRemovedFieldsChange(newRemovedFields);
    }

    if (onFieldsReorder) {
      onFieldsReorder(newFields);
    }
  };

  const restoreField = (removedItem: { field: FormField; originalIndex: number }) => {
    const newFields = [...fields];
    // Calculer la position d'insertion : soit l'index d'origine, soit à la fin si l'index dépasse
    const insertIndex = Math.min(removedItem.originalIndex, newFields.length);
    // Insérer le champ à sa position d'origine
    newFields.splice(insertIndex, 0, removedItem.field);
    setFields(newFields);
    // On le retire de la liste des champs supprimés
    const newRemovedFields = externalRemovedFields.filter(item => item.field.id !== removedItem.field.id);

    if (onRemovedFieldsChange) {
      onRemovedFieldsChange(newRemovedFields);
    }

    if (onFieldsReorder) {
      onFieldsReorder(newFields);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    console.log('🎯 Drag start - index:', index);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';

    // Appliquer l'opacité directement
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('🎯 Drag end');

    // Restaurer l'opacité
    e.currentTarget.style.opacity = '1';

    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newFields = [...fields];
      const [draggedField] = newFields.splice(draggedIndex, 1);
      newFields.splice(dragOverIndex, 0, draggedField);

      setFields(newFields);
      if (onFieldsReorder) {
        onFieldsReorder(newFields);
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Déplacement manuel des champs avec les flèches
  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];

      setFields(newFields);
      if (onFieldsReorder) {
        onFieldsReorder(newFields);
      }
    }
  };

  // Colors for each section icon based on HTML
  const getIconColor = (s: StepType) => {
    switch(s) {
      case 'coordonnees': return 'bg-[#2f2f2f]';
      case 'contenu': return 'bg-[#181a1c]';
      case 'expediteur': return 'bg-[#181a1c]';
    }
  };

  const getStepIcon = (s: StepType) => {
    switch(s) {
      case 'coordonnees': return 'person';
      case 'contenu': return 'article';
      case 'expediteur': return 'send';
    }
  };

  const getStepTitle = (s: StepType) => {
    switch(s) {
        case 'coordonnees': return 'Coordonnées';
        case 'contenu': return 'Contenu';
        case 'expediteur': return 'Signataire';
    }
  }

  return (
    <div className={`
      bg-white rounded-[2rem] shadow-xl p-6 md:p-8 animate-[fadeIn_0.4s_ease-out] transition-all duration-300
      ${isCustomizing ? 'ring-4 ring-[#3b5265]/20 scale-[1.01]' : ''}
    `}>
      {/* Header Card */}
      <div className="flex items-center gap-4 p-4 -mx-2 -mt-2 mb-8 bg-gradient-to-r from-[#ffecf8] to-white rounded-2xl border border-[#ffeefb]">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg ${getIconColor(step)}`}>
          <span className="material-icons text-2xl text-[#e062b1]">{getStepIcon(step)}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{getStepTitle(step)}</h3>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {isCustomizing ? 'Mode personnalisation : Glissez-déposez les champs' : 'Veuillez remplir les champs ci-dessous'}
          </p>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            draggable={isCustomizing}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              relative transition-all duration-300 transform-gpu
              ${field.width === 'full' ? 'md:col-span-2' : ''}

              ${isCustomizing ? 'cursor-grab active:cursor-grabbing p-4 border-2 border-dashed border-[#3b5265]/30 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-lg hover:border-[#3b5265] hover:z-10' : ''}

              ${draggedIndex === index ? 'opacity-50' : ''}
            `}
          >
            {/* Pilule flottante avec drag handle et flèches (mode personnalisation uniquement) */}
            {isCustomizing && (
              <div className="absolute -top-3 right-4 flex gap-1 z-20">
                {/* Reordering Controls Pill */}
                <div className="flex gap-1 bg-white dark:bg-[#2f2f2f] shadow-sm border border-gray-200 dark:border-gray-600 rounded-full p-1">
                  {/* Drag Handle (Points) */}
                  <div className="w-8 h-8 flex items-center justify-center text-[#3b5265] dark:text-gray-300 bg-[#eef2f6] dark:bg-[#1a1a1a] rounded-full cursor-grab active:cursor-grabbing">
                    <span className="material-icons text-lg">drag_indicator</span>
                  </div>

                  {/* Arrows (Flèches) */}
                  <div className="flex items-center border-l border-gray-200 dark:border-gray-600 pl-1 ml-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }}
                      disabled={index === 0}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 text-[#3b5265] dark:text-gray-300 transition-colors"
                      title="Déplacer vers le haut"
                    >
                      <span className="material-icons text-sm">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }}
                      disabled={index === fields.length - 1}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 text-[#3b5265] dark:text-gray-300 transition-colors"
                      title="Déplacer vers le bas"
                    >
                      <span className="material-icons text-sm">arrow_downward</span>
                    </button>
                  </div>
                </div>

                {/* Delete Button (Corbeille) */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeField(index); }}
                  className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#2f2f2f] shadow-sm border border-red-100 dark:border-red-900 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:scale-110 transition-all"
                  title="Supprimer le champ"
                >
                  <span className="material-icons text-[20px]">delete_outline</span>
                </button>
              </div>
            )}

            {/* Utiliser AITextarea pour le champ texteIa */}
            {field.id === 'texteIa' ? (
              <AITextarea
                label={field.label}
                value={data[field.id] || ''}
                onChange={(value) => onChange(field.id, value)}
                objetValue={data['objet'] || ''}
                placeholder={field.placeholder}
                required={field.required}
                rows={field.rows}
              />
            ) : field.id === 'adresse' ? (
              <AddressInput
                label={field.label}
                value={data[field.id] || ''}
                onChange={(value) => onChange(field.id, value)}
                onAddressSelect={(address, postalCode, city) => {
                  onChange('adresse', address);
                  onChange('cpVille', `${postalCode} ${city}`);
                }}
                icon={field.icon}
                required={field.required}
                placeholder={field.placeholder}
                error={invalidFields?.has(field.id) && field.required ? `${field.label} est requis` : undefined}
                resetKey={step}
              />
            ) : (
              <Input
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                options={field.options}
                icon={field.icon}
                required={field.required}
                rows={field.rows}
                value={data[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                fieldId={field.id}
                error={invalidFields?.has(field.id) && field.required ? `${field.label} est requis` : undefined}
              />
            )}
          </div>
        ))}
      </div>

      {/* SECTION: ZONE DE RESTAURATION DES CHAMPS SUPPRIMÉS */}
      {isCustomizing && externalRemovedFields.length > 0 && (
        <div className="mt-12 pt-6 border-t-2 border-dashed border-[#e062b1]/30 animate-[fadeInUp_0.3s_ease-out] bg-[#ffecf8]/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-icons text-[#a84383] text-2xl">restore_from_trash</span>
            <h4 className="text-lg font-bold text-gray-900">Champs disponibles</h4>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{externalRemovedFields.length}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Cliquez pour ajouter un champ</p>
          <div className="flex flex-wrap gap-3">
            {externalRemovedFields.map((removedItem) => (
              <button
                key={removedItem.field.id}
                onClick={() => restoreField(removedItem)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#e062b1]/30 rounded-full hover:bg-[#ffecf8] hover:border-[#a84383] hover:shadow-md transition-all duration-200 group"
                title={`Ajouter ${removedItem.field.label}`}
              >
                <span className="material-icons text-lg text-[#a84383] group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-sm font-medium text-gray-700">{removedItem.field.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Mémoriser le composant pour éviter les re-renders inutiles
export const FormStep = memo(FormStepComponent);
