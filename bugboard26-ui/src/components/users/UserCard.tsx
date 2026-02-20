import type { User } from '../../types';
import { motion, type Variants } from 'framer-motion';
import { Icons } from '../common/Icons';
import { ActionButton } from '../common/ActionButton';
import { USER_ROLE } from '../../constants';

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } }
};

export const UserCard = ({ user, onEdit, onRemove }: {
    user: User;
    onEdit: () => void;
    onRemove: () => void;
}) => (
    <motion.div
        layout
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ y: -5 }}
        className="bg-surface rounded-m3-l shadow-sm overflow-hidden flex items-center justify-between p-4 cursor-pointer"
    >
        <div className="flex items-center flex-grow min-w-0" onClick={onEdit}>
            <img className="h-12 w-12 rounded-full flex-shrink-0" src={user.avatarUrl} alt={user.name} />
            <div className="ml-4 min-w-0">
                <div className="text-lg font-medium text-on-surface truncate">{user.name}</div>
                <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${user.role === USER_ROLE.ADMIN ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                    {user.role}
                </span>
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
            <ActionButton onClick={onEdit} icon={<Icons.Edit />} aria-label="Modifica utente" className="text-on-surface-variant hover:bg-primary/10 hover:text-primary" />
            <ActionButton onClick={onRemove} icon={<Icons.Trash />} aria-label="Rimuovi utente" className="text-on-surface-variant hover:bg-error/10 hover:text-error" />
        </div>
    </motion.div>
);