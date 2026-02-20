import { motion, type Variants } from 'framer-motion';
import { Icons } from './Icons';
import React from 'react';

type EmptyStateProps = {
    icon?: React.ReactNode;
    title: string;
    subtitle: string;
    children?: React.ReactNode; // Per eventuali pulsanti o azioni
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } }
};

/**
 * Un componente generico per visualizzare uno stato vuoto.
 * @param {EmptyStateProps} props - Le props del componente.
 */
export const EmptyState = ({ icon = <Icons.Ghost />, title, subtitle, children }: EmptyStateProps) => (
    <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center text-center p-12 bg-surface-variant/40 rounded-m3-xl border-2 border-dashed border-outline-variant mt-6"
    >
        {icon}
        <p className="text-lg text-on-surface-variant font-medium mt-4">{title}</p>
        <p className="text-sm text-on-surface-variant/80">{subtitle}</p>
        {children && <div className="mt-4">{children}</div>}
    </motion.div>
);