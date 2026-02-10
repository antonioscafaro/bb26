import { Link, useLocation } from 'react-router-dom';
import React from 'react';

type NavLinkProps = {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick: () => void;
};

/**
 * Un link di navigazione per la sidebar che si evidenzia quando
 * la rotta corrente corrisponde alla sua destinazione.
 */
export const NavLink = ({ to, icon, children, onClick }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 h-14 px-4 text-sm font-medium rounded-m3-xl transition-colors ${
        isActive
          ? 'bg-primary-container text-on-primary-container'
          : 'text-on-surface-variant hover:bg-surface-variant'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};