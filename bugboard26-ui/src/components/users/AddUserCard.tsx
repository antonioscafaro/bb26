import { motion, type Variants } from 'framer-motion';
import { Icons } from '../common/Icons';

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } }
};

export const AddUserCard = ({ onClick }: { onClick: () => void }) => (
    <motion.div
        layout
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ y: -5, borderColor: 'var(--primary)' }}
        onClick={onClick}
        className="border-2 border-dashed border-outline-variant rounded-m3-l min-h-[92px] flex flex-col items-center justify-center text-center p-4 cursor-pointer"
    >
        <Icons.Plus className="h-8 w-8 text-on-surface-variant" />
        <p className="text-sm font-medium text-on-surface-variant mt-1">Aggiungi utente</p>
    </motion.div>
);