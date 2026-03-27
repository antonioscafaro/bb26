import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './Input';
import type { Label } from '../../types';

const PRESET_COLORS = [
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#CCCCCC', // gray (default)
];

/**
 * Determines if a color is "light" enough that dark text should be used.
 */
const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
};

/**
 * @typedef {Object} TagInputProps
 * @property {Label[]} tags - L'array di etichette attualmente selezionate.
 * @property {(tags: Label[]) => void} setTags - La funzione per aggiornare l'array di etichette.
 * @property {string} [placeholder="Aggiungi etichette..."] - Il testo segnaposto.
 */
export const TagInput = ({ tags, setTags, placeholder = "Aggiungi etichette..." }: {
    tags: Label[];
    setTags: (tags: Label[]) => void;
    placeholder?: string;
}) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedColor, setSelectedColor] = useState('#CCCCCC');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault();
            const newTagName = inputValue.trim();
            if (!tags.some(t => t.nome === newTagName)) {
                setTags([...tags, { nome: newTagName, colore: selectedColor }]);
            }
            setInputValue('');
            setSelectedColor('#CCCCCC');
            setShowColorPicker(false);
        }
    };

    const removeTag = (tagName: string) => {
        setTags(tags.filter(tag => tag.nome !== tagName));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem]">
                <AnimatePresence>
                    {tags.map(tag => {
                        const light = isLightColor(tag.colore || '#CCCCCC');
                        return (
                            <motion.div
                                key={tag.nome}
                                layout="position"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="text-sm font-medium h-8 px-3 rounded-m3-sm flex items-center gap-2 origin-left"
                                style={{
                                    backgroundColor: tag.colore || '#CCCCCC',
                                    color: light ? '#1a1a1a' : '#ffffff',
                                    border: `1px solid ${light ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'}`,
                                }}
                            >
                                {tag.nome}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag.nome)}
                                    style={{ color: light ? '#1a1a1a' : '#ffffff', opacity: 0.7 }}
                                    className="hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
                {/* Color Swatch Toggle */}
                <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-10 h-10 rounded-m3-m border-2 border-outline flex-shrink-0 transition-shadow hover:shadow-md focus:ring-2 focus:ring-primary"
                    style={{ backgroundColor: selectedColor }}
                    title="Scegli colore"
                    aria-label="Scegli colore etichetta"
                />
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="py-2"
                />
            </div>

            {/* Color Picker Popover */}
            <AnimatePresence>
                {showColorPicker && (
                    <motion.div
                        ref={colorPickerRef}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 p-3 bg-surface-variant rounded-m3-m border border-outline shadow-lg"
                    >
                        <p className="text-xs text-on-surface-variant mb-2 font-medium">Colore etichetta</p>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => {
                                        setSelectedColor(color);
                                        setShowColorPicker(false);
                                    }}
                                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-outline/30'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Colore ${color}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};