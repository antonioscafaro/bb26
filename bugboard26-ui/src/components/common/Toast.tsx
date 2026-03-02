import { toast } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastContent } from './ToastContent';

export const Toast = {
  success: (message: string) => {
    toast.custom(
      (t) => (
        <ToastContent
          id={t.id}
          message={message}
          icon={<CheckCircle2 size={20} />}
          iconColorClass="text-green-600 dark:text-green-400"
        />
      ),
      { duration: 3500 }
    );
  },

  error: (message: string) => {
    toast.custom(
      (t) => (
        <ToastContent
          id={t.id}
          message={message}
          icon={<AlertCircle size={20} />}
          iconColorClass="text-error"
        />
      ),
      { duration: 5000 }
    );
  },

  info: (message: string) => {
    toast.custom(
      (t) => (
        <ToastContent
          id={t.id}
          message={message}
          icon={<Info size={20} />}
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
      ),
      { duration: 4000 }
    );
  }
};