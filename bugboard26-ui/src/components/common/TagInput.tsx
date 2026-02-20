import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './Input';

/**
 * @typedef {Object} TagInputProps
 * @property {string[]} tags - L'array di etichette (stringhe) attualmente selezionate.
 * @property {(tags: string[]) => void} setTags - La funzione di callback per aggiornare l'array di etichette.
 * @property {string} [placeholder="Aggiungi etichette..."] - Il testo segnaposto per il campo di input.
 */
export const TagInput = ({ tags, setTags, placeholder = "Aggiungi etichette..." }: {
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder?: string;
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem]">
                <AnimatePresence>
                    {tags.map(tag => (
                        <motion.div
                            key={tag}
                            layout="position"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="bg-secondary-container text-on-secondary-container text-sm font-medium h-8 px-3 rounded-m3-sm flex items-center gap-2 border border-outline origin-left"
                        >
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="text-on-secondary-container">
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="py-2"
            />
        </div>
    );
};