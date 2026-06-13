import { useAuthStore } from '../../store/useAuthStore';

export default function ImpersonationBanner() {
  const impersonating = useAuthStore((s) => s.impersonating);
  const endImpersonation = useAuthStore((s) => s.endImpersonation);
  const user = useAuthStore((s) => s.user);

  if (!impersonating) return null;

  return (
    <div className="bg-amber-500 text-white text-sm px-4 py-2 flex flex-wrap items-center justify-center gap-3">
      <span>
        Mode impersonate: <strong>{user?.fullName}</strong> ({user?.email})
      </span>
      <button
        type="button"
        onClick={endImpersonation}
        className="underline font-semibold hover:opacity-90"
      >
        Kembali ke Admin
      </button>
    </div>
  );
}
