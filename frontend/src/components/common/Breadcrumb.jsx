import { Link } from 'react-router-dom';
import { truncateLabel } from '../../utils/breadcrumbs';

export default function Breadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const label = truncateLabel(item.label);
          const showLink = Boolean(item.to) && !isLast;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <span className="text-subtle select-none" aria-hidden="true">
                  &gt;
                </span>
              )}
              {showLink ? (
                <Link
                  to={item.to}
                  className="text-primary hover:underline truncate max-w-[10rem] sm:max-w-[14rem]"
                >
                  {label}
                </Link>
              ) : (
                <span
                  className={`truncate max-w-[12rem] sm:max-w-[18rem] ${
                    isLast ? 'text-heading font-medium' : 'text-muted'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
