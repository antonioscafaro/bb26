import React from 'react';

// JSDoc per le props
/**
 * @typedef {Object} InputProps - Props per il componente Input.
 * @extends {React.InputHTMLAttributes<HTMLInputElement>}
 * @property {React.ReactNode} [icon] - Icona opzionale da mostrare all'interno del campo.
 */

/**
 * Un componente Input riutilizzabile e stilizzato.
 * @param {InputProps} props - Le props del componente.
 */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }>(
  ({ icon, className, ...props }, ref) => {
    const baseClasses = "w-full border border-outline bg-surface rounded-m3-m focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface placeholder-on-surface-variant py-3";
    const paddingClass = icon ? 'pl-10 pr-4' : 'px-4';

    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${paddingClass} ${className || ''}`}
          {...props}
        />
      </div>
    );
  }
);