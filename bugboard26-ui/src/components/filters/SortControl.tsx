import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../common/Icons';
import type { Sorting } from '../../types/filters';

const sortOptions: { value: Sorting['by']; label: string }[] = [
  { value: 'createdAt', label: 'Data Creazione' },
  { value: 'priority', label: 'Priorità' },
  { value: 'title', label: 'Titolo' },
];

/**
 * @typedef {Object} SortControlProps
 * @property {Sorting} sorting - L'oggetto di ordinamento corrente.
 * @property {(s: Sorting) => void} setSorting - Callback per aggiornare lo stato dell'ordinamento.
 */

/**
 * Un componente moderno per selezionare il criterio e la direzione dell'ordinamento.
 * @param {SortControlProps} props
 */
export const SortControl = ({ sorting, setSorting }: { sorting: Sorting; setSorting: (s: Sorting) => void; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel = sortOptions.find(opt => opt.value === sorting.by)?.label || 'Ordina per';

  const toggleDirection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSorting({ ...sorting, direction: sorting.direction === 'asc' ? 'desc' : 'asc' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center h-10 border border-outline rounded-m3-xl overflow-hidden text-sm font-medium text-on-surface-variant">
        <button onClick={() => setIsOpen(!isOpen)} className="px-4 h-full hover:bg-surface-variant transition-colors flex items-center gap-2">
          <span>Ordina per:</span>
          <span className="font-semibold text-on-surface">{currentLabel}</span>
        </button>
        <button
          onClick={toggleDirection}
          className="w-10 h-full flex items-center justify-center border-l border-outline hover:bg-surface-variant transition-colors"
          aria-label="Inverti ordine"
        >
          {sorting.direction === 'asc' ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full right-0 mt-2 w-48 bg-surface rounded-m3-m shadow-lg border border-outline-variant z-10 overflow-hidden"
          >
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setSorting({ ...sorting, by: option.value });
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-surface-variant text-on-surface"
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};