import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { useIsMobile } from '../../hooks/useIsMobile';
import { BottomSheet } from './BottomSheet';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
  description: string;
  destructiveAction?: boolean;
}

export const PasswordConfirmModal: React.FC<PasswordConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  destructiveAction = false
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('La password è obbligatoria');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Password non valida');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };
  
  const formContent = (
      <form onSubmit={handleSubmit} className="p-6">
        <p className="text-on-surface-variant mb-6">
          {description}
        </p>

        {/* Password Field */}
        <div className="relative">
          <Input
            ref={inputRef}
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            className={`${
              error ? 'border-error bg-red-50 dark:bg-red-900/20' : ''
            }`}
            placeholder="Inserisci la tua password admin"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-on-surface-variant hover:text-on-surface" />
            ) : (
              <Eye className="h-5 w-5 text-on-surface-variant hover:text-on-surface" />
            )}
          </button>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-error"
          >
            {error}
          </motion.p>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="text"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            variant={destructiveAction ? "destructive" : "filled"}
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                <span>Verifica...</span>
              </div>
            ) : (
              'Conferma'
            )}
          </Button>
        </div>
      </form>
  );

  if (isMobile) {
    return (
        <BottomSheet isOpen={isOpen} onClose={handleClose} title={title}>
            {formContent}
        </BottomSheet>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-surface rounded-m3-xl shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b border-outline-variant rounded-t-m3-xl`}>
              <div className="flex items-center space-x-3">
                {destructiveAction ? (
                  <AlertTriangle className="h-6 w-6 text-error" />
                ) : (
                  <Lock className="h-6 w-6 text-primary" />
                )}
                <h3 className={`text-lg font-semibold ${destructiveAction ? 'text-error' : 'text-on-surface'}`}>
                  {title}
                </h3>
              </div>
            </div>
            {formContent}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};