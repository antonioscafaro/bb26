// src/components/common/Select.tsx
import React from 'react';

/**
 * @typedef {Object} SelectProps - Props per il componente Select.
 * @extends {React.SelectHTMLAttributes<HTMLSelectElement>}
 * @property {React.ReactNode} [icon] - Icona opzionale da mostrare all'interno del campo.
 */

/**
 * Un componente Select riutilizzabile e stilizzato.
 * @param {SelectProps} props - Le props del componente.
 */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: React.ReactNode }>(
  ({ icon, className, children, ...props }, ref) => {
    const baseClasses = "w-full border border-outline bg-surface rounded-m3-m focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface py-3 appearance-none";
    const paddingClass = icon ? 'pl-10 pr-4' : 'px-4';

    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={`${baseClasses} ${paddingClass} ${className || ''}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    );
  }
);