import { motion, type Variants } from 'framer-motion';

const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

/**
 * Una card per visualizzare una singola metrica chiave (es. un numero o un valore).
 */
export const MetricCard = ({ title, value, unit, subtitle }: { title: string, value: string | number, unit?: string, subtitle?: string }) => (
    <motion.div variants={itemVariants} className="bg-surface rounded-m3-l p-6 shadow-sm h-full">
        <h3 className="text-on-surface-variant text-base">{title}</h3>
        {subtitle && <p className="text-xs text-on-surface-variant/70 mt-0.5">{subtitle}</p>}
        <p className="text-4xl font-bold text-on-surface mt-2">
            {value}
            {unit && <span className="text-xl font-medium text-on-surface-variant ml-1">{unit}</span>}
        </p>
    </motion.div>
);