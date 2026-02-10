import { motion } from 'framer-motion';

export const ActionButton = ({ onClick, icon, "aria-label": ariaLabel, className, disabled }: {
    onClick: (e: React.MouseEvent) => void,
    icon: React.ReactNode,
    "aria-label": string,
    className?: string,
    disabled?: boolean
}) => (
    <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${className}`}
    >
        {icon}
    </motion.button>
);