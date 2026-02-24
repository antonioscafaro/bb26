import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface rounded-t-3xl shadow-xl flex flex-col max-h-[90vh]"
          >
              {/* Handle Bar */}
              <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-outline-variant rounded-full" />
              </div>
              
              {/* Header */}
              {title && (
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                  <h3 className="text-lg font-semibold text-on-surface">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              
              {/* Content */}
              <div className="overflow-y-auto">
                {children}
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};