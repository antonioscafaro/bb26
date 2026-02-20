import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }: ConfirmationModalProps) => {
  if (typeof document === 'undefined') {
    return null;
  }
  
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Sfondo Overlay */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
          />

          {/* Contenitore Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-surface shadow-2xl w-full max-w-sm rounded-m3-xl flex flex-col"
          >
            <div className="p-6">
              <h2 className="text-xl font-medium text-on-surface">{title}</h2>
              <div className="mt-4 text-sm text-on-surface-variant">
                {children}
              </div>
            </div>
            
            <div className="px-6 py-4 flex justify-end gap-2">
              <Button variant="text" onClick={onClose}>Annulla</Button>
              <Button variant="filled" onClick={onConfirm}>Conferma</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};