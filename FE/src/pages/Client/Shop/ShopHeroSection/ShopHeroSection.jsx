import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ShopHeroSection.css";

const banners = [
  { id: 1, title: "Thời Trang Xu Hướng 2025", desc: "Khám phá bộ sưu tập mới nhất tại Poly Fashion Shop", img: require("../../../../assets/img/xuhuong.webp") },
  { id: 2, title: "Bộ Sưu Tập Hè", desc: "Phong cách năng động cho mùa hè rực rỡ", img: require("../../../../assets/img/muahe.webp") },
  { id: 3, title: "Thời Trang Công Sở", desc: "Lịch lãm, chuyên nghiệp, phù hợp môi trường làm việc", img: require("../../../../assets/img/congso.webp") }
];

function ShopHeroSection() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false
  };

  return (
    <section className="banner-container">
      <Slider {...settings} className="shop-banner-slider">
        {banners.map(function (banner) {
          return (
            <div key={banner.id} className="banner-slide">
              <div className="banner" style={{ backgroundImage: `url(${banner.img})` }}>
                <div className="banner-content">
                  <h1>{banner.title}</h1>
                  <p>{banner.desc}</p>
                  <Link to="/shop" className="btn-shop">Mua Ngay</Link>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </section>
  );
}

export default ShopHeroSection;