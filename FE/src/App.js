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
import OrderTab from './pages/Client/Order/order';
import CheakoutPage from "./pages/Client/CheakoutPage";
import ClientProductDetail from "./pages/Client/ProductDetail/ProductDetail";
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
import ProductList from "./view/pages/admin/product/getAll";
import ProductAdd from "./view/pages/admin/product/addProduct";
import AddVariant from "./view/pages/admin/product/addVariant";
import ProductDetail from "./view/pages/admin/product/detail";
import EditVariant from "./view/pages/admin/product/editVariant";
import Comment from './view/pages/admin/comment/index';
import HeaderAdmin from "./view/pages/admin/layout/header";
import Attribute from "./view/pages/admin/product/attribute/getAll";
import AttributeEdit from "./view/pages/admin/product/attribute/detail";
import AttributeCreate from "./view/pages/admin/product/attribute/create";
import UserManage from "./view/pages/admin/user/index";

function AdminLayout() {
  return (
    <div>
      <HeaderAdmin />

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
          <Route path="product/:id" element={<ClientProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<CheakoutPage />} />
          <Route path="orders" element={<OrderTab />} />
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
          <Route path="comments">
            <Route path="getAll" element={<Comment />} />
            {/* <Route path="detail/:id" element={<OrderDetail />} /> */}
          </Route>
          <Route path="users">
            <Route path="getAll" element={<UserManage />} />
            
          </Route>
          <Route path="categories">
            <Route path="getAll" element={<CategoryGetAll />} />
            <Route path="create" element={<CategoryCreate />} />
            <Route path="edit/:id" element={<CategoryEdit />} />
          </Route>
          <Route path="products">
            <Route path="getAll" element={<ProductList />} />
            <Route path="create" element={<ProductAdd />} />
            <Route path="addVariant/:productId" element={<AddVariant />} />
            <Route path="detail/:id" element={<ProductDetail />} />
            <Route path="editVariant/:id" element={<EditVariant />} />
          </Route>
          <Route path="attribute">
            <Route path="getAll" element={<Attribute />} />
            <Route path="edit/:id" element={<AttributeEdit />} />
            <Route path="create" element={<AttributeCreate />} />

          </Route>
        </Route>

        <Route path="*" element={<h2>Trang không tồn tại</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
