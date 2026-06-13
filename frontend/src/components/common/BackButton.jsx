import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({
  to,
  label = 'Kembali',
  fallback = '/',
  className = '',
  showLabel = true,
  onClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const styles = `inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition ${className}`;

  if (to) {
    return (
      <Link to={to} className={styles} aria-label={label}>
        <ArrowLeft size={18} className="shrink-0" strokeWidth={2} />
        {showLabel && <span>{label}</span>}
      </Link>
    );
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    // key "default" = entry pertama (link eksternal / tab baru / refresh) → pakai fallback
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={styles} aria-label={label}>
      <ArrowLeft size={18} className="shrink-0" strokeWidth={2} />
      {showLabel && <span>{label}</span>}
    </button>
  );
}
