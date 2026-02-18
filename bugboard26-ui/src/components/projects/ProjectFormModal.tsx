import React, { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { X } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { Project } from '../../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectFormData) => Promise<void>;
  project?: Project;
  isBottomSheet?: boolean;
  layoutId?: string;
}

interface ProjectFormData {
  name: string;
  description: string;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  isBottomSheet = false,
  layoutId,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({ name: '', description: '' });
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!project;
  const modalTransition: Transition = { type: "spring", stiffness: 400, damping: 40, mass: 1 };

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
      });
    } else if (!isOpen) {
      setFormData({ name: '', description: '' });
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Il nome è obbligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // Parent component will show toast
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-on-surface-variant mb-1">Nome Progetto *</label>
        <Input
          id="project-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'border-error' : ''}
          placeholder="Nome del progetto"
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-on-surface-variant mb-1">Descrizione</label>
        <textarea
          id="project-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full border border-outline bg-surface rounded-m3-m focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface placeholder-on-surface-variant p-3"
          placeholder="Descrivi brevemente il progetto"
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="text" type="button" onClick={onClose} disabled={isLoading}>Annulla</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvataggio...' : 'Salva'}</Button>
      </div>
    </form>
  );

  if (isBottomSheet) {
    return formContent;
  }

  const modalVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="create_project_modal_wrapper" className={`fixed inset-0 z-50 flex ${isEditing ? 'items-center justify-center' : 'items-end justify-end'} p-8`}>
          <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            layoutId={layoutId}
            variants={!layoutId ? modalVariants : undefined}
            initial={!layoutId ? "initial" : undefined}
            animate={!layoutId ? "animate" : undefined}
            exit={!layoutId ? "exit" : undefined}
            transition={layoutId ? modalTransition : { duration: 0.2 }}
            className="relative bg-surface shadow-2xl flex flex-col overflow-hidden w-full max-w-lg rounded-m3-xl"
          >
            <div className="p-6 flex justify-between items-center border-b border-outline-variant">
              <h2 className="text-xl font-medium text-on-surface">{isEditing ? 'Modifica Progetto' : 'Nuovo Progetto'}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant" aria-label="Chiudi modale">
                <X size={24} className="text-on-surface-variant" />
              </button>
            </div>
            {formContent}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};