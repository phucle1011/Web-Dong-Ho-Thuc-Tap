import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import axios from "axios";
import Constants from "../../../../Constants";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./FeaturedProducts.css";

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getFeaturedProducts();
    }, []);

    const getFeaturedProducts = async () => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/product/list`);
            const data = res.data.data || [];
            const featured = data.filter(function (product) {
                return product.featured === "featured";
            });
            setProducts(featured);
        } catch (e) {
            console.error("Lỗi khi tải sản phẩm nổi bật:", e);
        }
    };

    const renderProduct = function (product) {
        const hasSale = parseFloat(product.sale_price) > 0;
        return (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="price">
                    {hasSale ? (
                        <>
                            {parseInt(product.sale_price).toLocaleString()}đ
                            <span className="old-price"> {parseInt(product.price).toLocaleString()}đ</span>
                        </>
                    ) : (
                        <>{parseInt(product.price).toLocaleString()}đ</>
                    )}
                </p>
            </Link>
        );
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true,
        swipe: true
    };

    return (
        <section className="featured-products">
            {/* <h2>Sản Phẩm Nổi Bật</h2>
            {products.length > 0 ? (
                <Slider {...settings} className="featured-products">
                    {products.map(renderProduct)}
                </Slider>
            ) : (
                <p>Không có sản phẩm nổi bật.</p>
            )} */}
        </section>
    );
};

export default FeaturedProducts;
