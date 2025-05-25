import ShopHeroSection from "./ShopHeroSection/ShopHeroSection";
import ProductSidebar from "./ProductSidebar/ProductSidebar";
import FeaturedProducts from "./FeaturedProducts/FeaturedProducts";
import DealsSlider from "../Home/DealsSlider/DealsSlider";
import CustomerReviews from "../Home/CustomerReviews/CustomerReviews";
import FashionTipsSlider from "./FashionTipsSlider/FashionTipsSlider";

const Shop = () => {

    return (
        <>
            <ShopHeroSection />
            <main className="container">
                <ProductSidebar />

                <FeaturedProducts />

                <DealsSlider />

                <CustomerReviews />

                <FashionTipsSlider />
            </main>
        </>
    );
};

export default Shop;