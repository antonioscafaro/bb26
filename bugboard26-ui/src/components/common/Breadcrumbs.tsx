import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * @typedef {Object} Breadcrumb
 * @property {string} label - Il testo da visualizzare.
 * @property {string} [path] - L'URL a cui linka. Se omesso, è l'elemento corrente (non cliccabile).
 */

/**
 * Visualizza un percorso di navigazione a "briciole di pane".
 * @param {{ crumbs: Breadcrumb[] }} props - Le props del componente.
 */
export const Breadcrumbs = ({ crumbs }: { crumbs: { label: string; path?: string }[] }) => {
  return (
    <nav className="flex items-center text-xl font-medium text-on-surface-variant" aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-5 w-5 mx-1" />}
          {crumb.path ? (
            <Link to={crumb.path} className="transition-colors hover:text-primary">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-semibold text-on-surface">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};