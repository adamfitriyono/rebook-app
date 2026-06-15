import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import Breadcrumb from '../components/common/Breadcrumb';
import { homeTrail, CRUMBS } from '../utils/breadcrumbs';
import { getMyDisputes } from '../services/disputes';
import { formatDate } from '../utils/formatters';
import { DISPUTE_STATUS_LABELS } from '../utils/constants';

export default function MyDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDisputes()
      .then(({ data }) => setDisputes(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <Breadcrumb items={homeTrail(CRUMBS.orders, CRUMBS.disputes)} />
      <h1 className="text-2xl font-bold text-heading mb-6">Pengaduan Saya</h1>

      {disputes.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="Belum Ada Pengaduan"
          description="Jika ada masalah dengan pesanan, ajukan pengaduan dari halaman detail pesanan."
          cta="Riwayat Pesanan"
          to="/orders"
        />
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="surface-card p-5">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <p className="font-semibold text-heading">{d.subject}</p>
                  <p className="text-sm text-subtle mt-0.5">
                    Pesanan{' '}
                    <Link to={`/orders/${d.orderId}`} className="text-primary hover:underline">
                      #{d.orderId}
                    </Link>
                    {' · '}
                    {formatDate(d.createdAt)}
                  </p>
                </div>
                <StatusBadge
                  status={d.status}
                  labels={DISPUTE_STATUS_LABELS}
                />
              </div>
              <p className="text-sm text-muted whitespace-pre-wrap">{d.description}</p>
              {d.adminNotes && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Catatan Admin</p>
                  <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap">{d.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
