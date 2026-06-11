import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, cta, to }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Icon size={32} className="text-primary" />
        </div>
      )}
      <h2 className="text-xl font-bold text-heading mb-2">{title}</h2>
      {description && <p className="text-muted text-sm max-w-sm mb-6">{description}</p>}
      {cta && to && (
        <Link to={to} className="btn-primary">
          {cta}
        </Link>
      )}
    </div>
  );
}
