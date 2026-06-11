export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-[#6BA832] text-white flex-col justify-center items-center p-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/20" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/20" />
      </div>
      <div className="relative z-10 text-center max-w-md">
        <img src="/images/logo-navbar.svg" alt="ReBook" className="h-14 mx-auto mb-6 brightness-0 invert" />
        <h2 className="text-3xl font-bold mb-3">Buku Lama, Ilmu Baru</h2>
        <p className="text-white/90 text-lg leading-relaxed">
          Marketplace buku bekas terkurasi terpercaya. Hemat hingga 60% untuk buku berkualitas.
        </p>
      </div>
    </div>
  );
}
