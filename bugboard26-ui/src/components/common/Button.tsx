import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

type ButtonVariant = 'filled' | 'outlined' | 'text' | 'destructive';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Button = ({ variant = 'filled', children, onClick, disabled = false, type = 'button', className, ...props }: ButtonProps) => {
  const baseClasses = "h-10 px-6 rounded-m3-xl font-medium text-sm flex items-center justify-center transition-all duration-200";

  const variantClasses: Record<ButtonVariant, string> = {
    filled: `bg-primary text-on-primary hover:shadow-md disabled:bg-on-surface/20 disabled:text-on-surface/40`,
    outlined: `border border-outline text-primary hover:bg-primary/10 disabled:border-on-surface/20 disabled:text-on-surface/40`,
    text: `text-primary hover:bg-primary/10 disabled:text-on-surface/40`,
    destructive: `bg-error text-on-error hover:shadow-md disabled:bg-on-surface/20 disabled:text-on-surface/40`,
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};