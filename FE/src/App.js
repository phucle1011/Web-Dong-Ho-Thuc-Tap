import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientLayout from "./layouts/Client/ClientLayout";
import Home from "./pages/Client/Home/Home";
import "./assets/styles/global.css"
import Shop from "./pages/Client/Shop/Shop";
import ContactPage from "./pages/Client/Contact/Contact";
import ProfilePage from "./pages/Client/Profile/Profile";
import Login from "./pages/Client/Login/login";
import Register from "./pages/Client/Register/register";
import Cart from "./pages/Client/Cart/cart";
import ProductDetail from "./pages/Client/ProductDetail/ProductDetail";
import { Outlet } from "react-router";
import Payment from "./pages/Client/Payment/Payment"
import ShippingAddressManager from "./pages/Client/ShippingAddress.Manager/ShippingAddressManager"

// --- [ADMIN] --- //
import Dashboard from "./view/pages/admin/home/home";
import OrderGetAll from "./view/pages/admin/oder/getAll";
import OrderDetail from "./view/pages/admin/oder/detail";
import CategoryGetAll from './view/pages/admin/category/getAll';
import CategoryCreate from './view/pages/admin/category/create';
import CategoryEdit from './view/pages/admin/category/edit';

function AdminLayout() {
  return (
    <div>

      <Outlet />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="payment" element={<Payment />} />
          <Route path="shipping-address-manager" element={<ShippingAddressManager />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders">
            <Route path="getAll" element={<OrderGetAll />} />
            <Route path="detail/:id" element={<OrderDetail />} />
          </Route>
          <Route path="categories">
            <Route path="getAll" element={<CategoryGetAll />} />
            <Route path="create" element={<CategoryCreate />} />
            <Route path="edit/:id" element={<CategoryEdit />} />
          </Route>
        </Route>

        <Route path="*" element={<h2>Trang không tồn tại</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
