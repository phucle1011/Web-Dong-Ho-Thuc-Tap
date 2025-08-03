import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ShopHeroSection.css";

const banners = [
  {
    id: 1,
    title: "Đồng Hồ Thời Trang Cao Cấp",
    desc: "Khám phá bộ sưu tập đồng hồ sang trọng tại QKA Watch Store",
    img: require("../../../../assets/img/w1.jpg")
  },
  {
    id: 2,
    title: "Đồng Hồ Hè 2025",
    desc: "Thiết kế trẻ trung, bền bỉ – phù hợp cho mọi hoạt động",
    img: require("../../../../assets/img/w2.jpg")
  },
  {
    id: 3,
    title: "Đồng Hồ Doanh Nhân",
    desc: "Tôn lên phong cách lịch lãm và đẳng cấp trong công việc",
    img: require("../../../../assets/img/w3.jpg")
  }
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