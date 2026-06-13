import BackButton from '../common/BackButton';
import { ADMIN_NAV } from './adminNav';

export default function AdminLayout({ activeTab, onTabChange, children }) {
  return (
    <div className="max-w-content mx-auto px-4 py-6">
      <BackButton fallback="/" className="mb-4" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Admin Panel</h1>
        <p className="text-sm text-subtle mt-1">Pusat kendali platform ReBook</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <nav className="surface-card p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {ADMIN_NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activeTab === key
                    ? 'bg-primary text-white'
                    : 'text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
