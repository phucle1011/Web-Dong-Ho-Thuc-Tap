import { Outlet } from "react-router-dom";
import Header from "../../components/Client/Header/Header";
import Footer from "../../components/Client/Footer/Footer";

const ClientLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default ClientLayout;