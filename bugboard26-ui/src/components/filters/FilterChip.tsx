import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * @typedef {Object} FilterChipProps
 * @property {string} label - Il testo da mostrare sulla chip (es. "Priorità: Alta").
 * @property {() => void} onRemove - Callback da eseguire quando si clicca sulla "X".
 */

/**
 * Una "Chip" che rappresenta un filtro attivo, con un pulsante per la rimozione.
 * @param {FilterChipProps} props
 */
export const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void; }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex items-center gap-1 h-8 pl-3 pr-1.5 bg-primary-container text-on-primary-container rounded-m3-sm text-sm font-medium"
    >
      <span>{label}</span>
      <button 
        onClick={onRemove} 
        className="rounded-full hover:bg-black/10 p-0.5"
        aria-label={`Rimuovi filtro ${label}`}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};