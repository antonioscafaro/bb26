import { motion, type Variants } from 'framer-motion';
import React from 'react';

const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

/**
 * Un contenitore stilizzato per i grafici, con un titolo e animazioni.
 */
export const ChartContainer = ({ title, children, className }: {
    title: string,
    children: React.ReactNode,
    className?: string
}) => (
    <motion.div variants={itemVariants} className={`bg-surface rounded-m3-l p-6 shadow-sm ${className}`}>
        <h2 className="text-lg font-medium mb-4 text-on-surface">{title}</h2>
        {children}
    </motion.div>
);