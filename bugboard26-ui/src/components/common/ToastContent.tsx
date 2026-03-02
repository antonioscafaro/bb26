import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

export const ToastContent = ({ message, icon, iconColorClass, id }: {
    id: string;
    message: string;
    icon: React.ReactNode;
    iconColorClass: string;
}) => (
    <div
        className="w-96 max-w-[90vw] bg-surface-variant text-on-surface-variant shadow-lg rounded-m3-m pointer-events-auto flex"
    >
        <div className="flex items-center gap-3 p-4 w-full">
            <div className={`flex-shrink-0 ${iconColorClass}`}>
                {icon}
            </div>
            <p className="text-sm font-medium flex-grow">
                {message}
            </p>
        </div>
        <button
            onClick={() => toast.dismiss(id)}
            className="ml-auto p-3 text-on-surface-variant/70 hover:text-on-surface-variant flex-shrink-0"
            aria-label="Chiudi notifica"
        >
            <X size={18} />
        </button>
    </div>
);
