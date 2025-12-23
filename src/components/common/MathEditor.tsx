'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EditableMathField, addStyles } from 'react-mathquill';

// Ajouter les styles CSS de MathQuill
if (typeof window !== 'undefined') {
  addStyles();
}

export interface MathEditorProps {
  value?: string;
  onChange?: (latex: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  showToolbar?: boolean;
  label?: string;
}

interface MathSymbol {
  symbol: string;
  latex: string;
  category: string;
}

const mathSymbols: MathSymbol[] = [
  // Opérations de base
  { symbol: '+', latex: '+', category: 'basic' },
  { symbol: '−', latex: '-', category: 'basic' },
  { symbol: '×', latex: '\\times', category: 'basic' },
  { symbol: '÷', latex: '\\div', category: 'basic' },
  { symbol: '=', latex: '=', category: 'basic' },
  { symbol: '≠', latex: '\\neq', category: 'basic' },
  { symbol: '±', latex: '\\pm', category: 'basic' },
  { symbol: '␣', latex: '\\ ', category: 'basic' }, // Espace
  { symbol: '⏎', latex: '\\\\', category: 'basic' }, // Retour à la ligne
  
  // Fractions et exposants
  { symbol: 'x²', latex: '^{2}', category: 'power' },
  { symbol: 'xⁿ', latex: '^{n}', category: 'power' },
  { symbol: '½', latex: '\\frac{1}{2}', category: 'fraction' },
  { symbol: 'x/y', latex: '\\frac{x}{y}', category: 'fraction' },
  { symbol: '√x', latex: '\\sqrt{x}', category: 'radical' },
  { symbol: 'ⁿ√x', latex: '\\sqrt[n]{x}', category: 'radical' },
  
  // Comparaisons
  { symbol: '<', latex: '<', category: 'comparison' },
  { symbol: '>', latex: '>', category: 'comparison' },
  { symbol: '≤', latex: '\\leq', category: 'comparison' },
  { symbol: '≥', latex: '\\geq', category: 'comparison' },
  
  // Calcul intégral et différentiel
  { symbol: '∫', latex: '\\int', category: 'calculus' },
  { symbol: '∫ᵃᵇ', latex: '\\int_a^b', category: 'calculus' },
  { symbol: '∑', latex: '\\sum', category: 'calculus' },
  { symbol: '∏', latex: '\\prod', category: 'calculus' },
  { symbol: 'lim', latex: '\\lim_{x \\to a}', category: 'calculus' },
  { symbol: 'd/dx', latex: '\\frac{d}{dx}', category: 'calculus' },
  { symbol: '∂/∂x', latex: '\\frac{\\partial}{\\partial x}', category: 'calculus' },
  
  // Fonctions trigonométriques
  { symbol: 'sin', latex: '\\sin', category: 'trig' },
  { symbol: 'cos', latex: '\\cos', category: 'trig' },
  { symbol: 'tan', latex: '\\tan', category: 'trig' },
  { symbol: 'ln', latex: '\\ln', category: 'log' },
  { symbol: 'log', latex: '\\log', category: 'log' },
  
  // Lettres grecques courantes
  { symbol: 'α', latex: '\\alpha', category: 'greek' },
  { symbol: 'β', latex: '\\beta', category: 'greek' },
  { symbol: 'γ', latex: '\\gamma', category: 'greek' },
  { symbol: 'δ', latex: '\\delta', category: 'greek' },
  { symbol: 'π', latex: '\\pi', category: 'greek' },
  { symbol: 'θ', latex: '\\theta', category: 'greek' },
  { symbol: 'λ', latex: '\\lambda', category: 'greek' },
  { symbol: 'μ', latex: '\\mu', category: 'greek' },
  { symbol: 'σ', latex: '\\sigma', category: 'greek' },
  { symbol: 'φ', latex: '\\phi', category: 'greek' },
  
  // Ensembles et logique
  { symbol: '∈', latex: '\\in', category: 'sets' },
  { symbol: '∉', latex: '\\notin', category: 'sets' },
  { symbol: '⊂', latex: '\\subset', category: 'sets' },
  { symbol: '⊆', latex: '\\subseteq', category: 'sets' },
  { symbol: '∪', latex: '\\cup', category: 'sets' },
  { symbol: '∩', latex: '\\cap', category: 'sets' },
  { symbol: '∅', latex: '\\emptyset', category: 'sets' },
  { symbol: '∞', latex: '\\infty', category: 'sets' },
];

const categoryLabels = {
  basic: 'Opérations',
  power: 'Puissances',
  fraction: 'Fractions',
  radical: 'Racines',
  comparison: 'Comparaisons',
  calculus: 'Analyse',
  trig: 'Trigonométrie',
  log: 'Logarithmes',
  greek: 'Grec',
  sets: 'Ensembles'
};

export const MathEditor: React.FC<MathEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Tapez votre expression mathématique...',
  readOnly = false,
  className = '',
  showToolbar = true,
  label
}) => {
  const [latex, setLatex] = useState(value);
  const [activeCategory, setActiveCategory] = useState<string>('basic');
  const mathFieldRef = useRef<any>(null);

  useEffect(() => {
    setLatex(value);
  }, [value]);

  const handleLatexChange = (mathField: any) => {
    try {
      const newLatex = mathField.latex();
      setLatex(newLatex);
      onChange?.(newLatex);
    } catch (error) {
      console.warn('Erreur lors du changement LaTeX:', error);
    }
  };

  const insertSymbol = (latexCode: string) => {
    try {
      if (mathFieldRef.current) {
        // Ajouter un espace avant le symbole si nécessaire
        const currentLatex = mathFieldRef.current.latex();
        if (currentLatex && !currentLatex.endsWith(' ') && !currentLatex.endsWith('{')) {
          mathFieldRef.current.write(' ');
        }
        mathFieldRef.current.write(latexCode);
        mathFieldRef.current.focus();
      }
    } catch (error) {
      console.warn('Erreur lors de l\'insertion du symbole:', error);
    }
  };

  const clearField = () => {
    try {
      if (mathFieldRef.current) {
        mathFieldRef.current.latex('');
        setLatex('');
        onChange?.('');
        mathFieldRef.current.focus();
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage du champ:', error);
    }
  };

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;
  const filteredSymbols = mathSymbols.filter(s => s.category === activeCategory);

  return (
    <div className={`math-editor ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Toolbar des symboles */}
      {showToolbar && !readOnly && (
        <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-3">
          {/* Onglets des catégories */}
          <div className="flex flex-wrap gap-2 mb-3 border-b border-gray-200 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveCategory(category);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
          
          {/* Symboles de la catégorie active */}
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 mb-3">
            {filteredSymbols.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  insertSymbol(item.latex);
                }}
                className="p-2 text-lg bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors min-h-[40px] flex items-center justify-center"
                title={`Insérer ${item.latex}`}
              >
                {item.symbol}
              </button>
            ))}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearField();
              }}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Effacer
            </button>
            <span className="text-xs text-gray-500 mt-1">
              Cliquez sur les symboles ci-dessus pour les insérer
            </span>
          </div>
        </div>
      )}
      
      {/* Champ d'édition MathQuill */}
      <div className={`border border-gray-300 ${showToolbar && !readOnly ? 'rounded-b-lg' : 'rounded-lg'} bg-white`}>
        <div className="p-4">
          {readOnly ? (
            <div className="math-field-static min-h-[60px] flex items-center">
              {latex ? (
                <EditableMathField
                  latex={latex}
                  config={{
                    readOnly: true,
                    staticMath: true
                  }}
                />
              ) : (
                <span className="text-gray-400 italic">{placeholder}</span>
              )}
            </div>
          ) : (
            <EditableMathField
              latex={latex}
              onChange={handleLatexChange}
              mathquillDidMount={(mathField) => {
                mathFieldRef.current = mathField;
                
                // Gestion personnalisée des touches
                mathField.__controller.container.addEventListener('keydown', (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    mathField.write('\\\\'); // Double backslash pour retour à la ligne
                  } else if (e.key === ' ' && !e.shiftKey) {
                    e.preventDefault();
                    mathField.write('\\ '); // Espace LaTeX
                  }
                });
              }}
              config={{
                spaceBehavesLikeTab: false,
                leftRightIntoCmdGoes: 'up',
                restrictMismatchedBrackets: true,
                sumStartsWithNEquals: true,
                supSubsRequireOperand: true,
                charsThatBreakOutOfSupSub: '+-=<>',
                autoSubscriptNumerals: true,
                autoCommands: 'pi theta sqrt sum prod alpha beta gamma delta epsilon lambda mu sigma phi omega',
                autoOperatorNames: 'sin cos tan ln log lim'
              }}
            />
          )}
        </div>
      </div>
      
      {/* Aperçu du LaTeX */}
      {!readOnly && (
        <div className="mt-2 text-xs text-gray-500">
          LaTeX: <code className="bg-gray-100 px-2 py-1 rounded">{latex || 'vide'}</code>
        </div>
      )}
    </div>
  );
};

export default MathEditor;