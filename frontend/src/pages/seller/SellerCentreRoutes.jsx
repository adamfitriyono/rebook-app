import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import SellerCentreLayout from '../../components/seller/SellerCentreLayout';
import SellerOverview from './SellerOverview';
import SellerOrders from './SellerOrders';
import SellerOrderDetail from './SellerOrderDetail';
import SellerStats from './SellerStats';
import MyListings from '../MyListings';
import SellBook from '../SellBook';

function SellerCentreRoutes() {
  return (
    <ProtectedRoute roles={['seller']}>
      <Routes>
        <Route element={<SellerCentreLayout />}>
          <Route index element={<SellerOverview />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="orders/:orderId" element={<SellerOrderDetail />} />
          <Route path="listings" element={<MyListings embedded />} />
          <Route path="sell" element={<SellBook embedded />} />
          <Route path="stats" element={<SellerStats />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}

export default SellerCentreRoutes;
