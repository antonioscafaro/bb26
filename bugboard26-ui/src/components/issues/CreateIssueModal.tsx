import { useState, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { X } from 'lucide-react';

import type { User, IssuePriority, IssueType, Label } from '../../types';
import { useIssues } from '../../context/IssueContext.shared';
import { useProjects } from '../../context/ProjectContext.shared';
import { priorityConfig, typeConfig } from '../../config/uiConstants';
import { Toast } from '../common/Toast';

import { TagInput } from '../common/TagInput';
import { Button } from '../common/Button';
import { Icons } from '../common/Icons';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  layoutId?: string;
  isBottomSheet?: boolean;
}

// --- Componenti Interni ---
const FormField = ({ children, label, htmlFor, required = false }: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  label: string;
  htmlFor: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-on-surface-variant mb-1 ml-2">
      {label} {required && <span className="text-error">*</span>}
    </label>
    {children}
  </div>
);

/**
 * Modal for creating new issues with form validation and file upload
 * Supports both desktop modal and mobile bottom sheet layouts
 */
export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  layoutId,
  isBottomSheet = false
}) => {
  const { createIssue } = useIssues();
  const { selectedProjectId } = useProjects();
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modalTransition: Transition = { type: "spring", stiffness: 400, damping: 40, mass: 1 };

  // --- Handlers ---
  const handleFileButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      Toast.success("File selezionato: " + e.target.files[0].name);
    }
  };

  const handleCreateIssue = async (e: FormEvent) => {
    e.preventDefault();

    if (isSubmitting || !selectedProjectId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const type = formData.get('type') as IssueType;
    const priority = formData.get('priority') as IssuePriority;

    // Validation
    if (!title) {
      Toast.error('Il titolo è obbligatorio');
      return;
    }

    if (!type) {
      Toast.error('Il tipo è obbligatorio');
      return;
    }

    setIsSubmitting(true);

    try {
      const issueData = {
        title,
        description: description || '',
        status: 'todo' as const,
        priority: (priority || 'low') as IssuePriority,
        type,
        reporter: currentUser,
        labels: labels,
        projectId: selectedProjectId,
      };

      await createIssue(issueData, selectedFile || undefined);
      Toast.success(`Issue "${title}" creata con successo!`);

      // Reset form
      setLabels([]);
      (e.target as HTMLFormElement).reset();
      onClose();

    } catch (error) {
      console.error("Error creating issue:", error);
      Toast.error('Errore durante la creazione della issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setLabels([]);
      onClose();
    }
  };

  if (isBottomSheet) {
    return (
      <div className="p-6">
        <form onSubmit={handleCreateIssue} className="space-y-6">
          <FormField label="Titolo" htmlFor="title-mobile" required>
            <Input
              type="text"
              id="title-mobile"
              name="title"
              placeholder="Es: Errore nel salvataggio del profilo"
              required
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Descrizione" htmlFor="description-mobile">
            <textarea
              id="description-mobile"
              name="description"
              rows={4}
              placeholder="Descrivi il problema nel dettaglio..."
              className="w-full border border-outline bg-surface rounded-m3-m focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface placeholder-on-surface-variant p-4 resize-none"
              disabled={isSubmitting}
            />
          </FormField>

          <div className="space-y-4">
            <FormField label="Tipo" htmlFor="type-mobile">
              <Select id="type-mobile" name="type" defaultValue="" disabled={isSubmitting}>
                <option value="" disabled>Seleziona tipo *</option>
                {Object.entries(typeConfig).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Priorità" htmlFor="priority-mobile">
              <Select id="priority-mobile" name="priority" defaultValue="low" disabled={isSubmitting}>
                {Object.entries(priorityConfig).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Etichette" htmlFor="labels-mobile">
            <TagInput
              tags={labels}
              setTags={setLabels}
              placeholder="Aggiungi e premi Invio..."
            />
          </FormField>

          <FormField label="Allega Immagine" htmlFor="file-upload-mobile">
            <div className="mt-2 flex justify-center rounded-m3-l border-2 border-dashed border-outline-variant px-6 py-10">
              <div className="text-center">
                <Icons.Upload className="mx-auto" />
                <div className="mt-4 flex justify-center text-sm leading-6 text-on-surface-variant">
                  <p className="pl-1">
                    {selectedFile ? `File: ${selectedFile.name}` : 'Trascina qui il tuo file o'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFileButtonClick}
                  className="font-semibold text-primary hover:underline disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {selectedFile ? 'Cambia file' : 'scegli un file'}
                </button>
                <p className="text-xs leading-5 text-on-surface-variant/80">PNG, JPG, GIF fino a 10MB</p>
              </div>
              <input ref={fileInputRef} id="file-upload-mobile" name="file-upload" type="file" className="sr-only" disabled={isSubmitting} onChange={handleFileChange} accept="image/*" />
            </div>
          </FormField>


          <div className="flex gap-3 pt-4">
            <Button
              variant="text"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button
              variant="filled"
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creazione...' : 'Crea Issue'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="create_issue_modal_wrapper" className="fixed inset-0 z-50 flex items-end justify-end p-0 sm:p-8">
          <motion.div
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            layoutId={layoutId}
            transition={modalTransition}
            className="relative bg-surface shadow-2xl flex flex-col overflow-hidden w-full h-dvh sm:h-full sm:max-w-2xl sm:max-h-[90vh] sm:rounded-m3-xl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex flex-col h-full"
            >

              {/* Header */}
              <div className="p-6 flex justify-between items-center flex-shrink-0">
                <h2 className="text-2xl font-medium text-on-surface">Crea una Nuova Issue</h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-on-surface-variant hover:bg-surface-variant rounded-full p-2 disabled:opacity-50"
                  aria-label="Chiudi modale"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form id="create-issue-form" onSubmit={handleCreateIssue} className="flex-grow overflow-y-auto px-6 space-y-4">
                <FormField icon={<Icons.Title />} label="Titolo" htmlFor="title" required>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Es: Errore nel salvataggio del profilo"
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField icon={<Icons.Description />} label="Descrizione" htmlFor="description">
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="Descrivi il problema nel dettaglio..."
                    className="w-full border border-outline bg-surface rounded-m3-m focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface placeholder-on-surface-variant p-4"
                    disabled={isSubmitting}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField icon={<Icons.Type />} label="Tipo" htmlFor="type">
                    <Select id="type" name="type" defaultValue="" disabled={isSubmitting}>
                      <option value="" disabled>Seleziona tipo *</option>
                      {Object.entries(typeConfig).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </Select>
                  </FormField>
                  <FormField icon={<Icons.Priority />} label="Priorità" htmlFor="priority">
                    <Select id="priority" name="priority" defaultValue="low" disabled={isSubmitting}>
                      {Object.entries(priorityConfig).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1 ml-2">Etichette</label>
                  <TagInput
                    tags={labels}
                    setTags={setLabels}
                    placeholder="Aggiungi e premi Invio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1 ml-2">Allega Immagine</label>
                  <div className="mt-2 flex justify-center rounded-m3-l border-2 border-dashed border-outline-variant px-6 py-10">
                    <div className="text-center">
                      <Icons.Upload className="mx-auto" />
                      <div className="mt-4 flex justify-center text-sm leading-6 text-on-surface-variant">
                        <p className="pl-1">
                          {selectedFile ? `File: ${selectedFile.name}` : 'Trascina qui il tuo file o'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleFileButtonClick}
                        className="font-semibold text-primary hover:underline disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        {selectedFile ? 'Cambia file' : 'scegli un file'}
                      </button>
                      <p className="text-xs leading-5 text-on-surface-variant/80">PNG, JPG, GIF fino a 10MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      disabled={isSubmitting}
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
              </form>

              {/* Actions */}
              <div className="p-6 flex justify-end space-x-3 flex-shrink-0">
                <Button variant="text" onClick={handleClose} disabled={isSubmitting}>
                  Annulla
                </Button>
                <Button variant="filled" type="submit" form="create-issue-form" disabled={isSubmitting}>
                  {isSubmitting ? 'Creazione...' : 'Crea Issue'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};