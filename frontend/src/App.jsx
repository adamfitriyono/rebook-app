import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ImpersonationBanner from './components/admin/ImpersonationBanner';
import ToastContainer from './components/common/Toast';
import CustomerServicePopup from './components/common/CustomerServicePopup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Loading from './components/common/Loading';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import BuyerProtection from './pages/BuyerProtection';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SellerStore from './pages/SellerStore';
import NotFound from './pages/NotFound';
import { useAuthStore, useCartStore } from './store/useAuthStore';
import { useWishlistStore } from './store/useWishlistStore';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Messages = lazy(() => import('./pages/Messages'));
const SellerCentreRoutes = lazy(() => import('./pages/seller/SellerCentreRoutes'));
const EditListing = lazy(() => import('./pages/EditListing'));

function LazyPage({ children }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

function AppContent() {
  const init = useAuthStore((s) => s.init);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlistIds = useWishlistStore((s) => s.fetchIds);

  useEffect(() => {
    init().then(() => {
      fetchCart();
      fetchWishlistIds();
    });
  }, [init, fetchCart, fetchWishlistIds]);

  return (
    <div className="min-h-screen flex flex-col bg-light dark:bg-gray-950">
      <ImpersonationBanner />
      <Navbar />
      <ToastContainer />
      <CustomerServicePopup />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/perlindungan-pembeli" element={<BuyerProtection />} />
          <Route path="/toko/:sellerId" element={<SellerStore />} />
          <Route path="/messages" element={<LazyPage><ProtectedRoute><Messages /></ProtectedRoute></LazyPage>} />
          <Route path="/messages/:conversationId" element={<LazyPage><ProtectedRoute><Messages /></ProtectedRoute></LazyPage>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-confirmation/group/:checkoutGroupId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/seller/*" element={<LazyPage><SellerCentreRoutes /></LazyPage>} />
          <Route path="/my-listings" element={<Navigate to="/seller/listings" replace />} />
          <Route path="/sell" element={<Navigate to="/seller/sell" replace />} />
          <Route path="/seller-dashboard" element={<Navigate to="/seller" replace />} />
          <Route path="/edit-listing/:id" element={<LazyPage><ProtectedRoute roles={['seller']}><EditListing /></ProtectedRoute></LazyPage>} />
          <Route path="/admin" element={<LazyPage><ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute></LazyPage>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
