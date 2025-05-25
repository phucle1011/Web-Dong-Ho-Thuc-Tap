import React, { Component } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./FashionTipsSlider.css";

class FashionTipsSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [
        {
          id: 1,
          title: "5 Cách Phối Đồ Với Áo Blazer Để Trông Sành Điệu Hơn",
          image: require("../../../../assets/img/5cachphoido.webp"),
          link: "#",
        },
        {
          id: 2,
          title: "Mặc Gì Cho Ngày Hẹn Hò? Gợi Ý Outfit Đẹp Mê",
          image: require("../../../../assets/img/macgichongayhenho.webp"),
          link: "#",
        },
        {
          id: 3,
          title: "Mix & Match: Cách Phối Đồ Với Giày Sneaker",
          image: require("../../../../assets/img/cachphoidovoisneaker.webp"),
          link: "#",
        },
        {
          id: 4,
          title: "Bí Quyết Chọn Màu Sắc Trang Phục Hợp Tone Da",
          image: require("../../../../assets/img/mausactrangphucphuhopvoimauda.webp"),
          link: "#",
        },
        {
          id: 5,
          title: "Xu Hướng Thời Trang 2025 – Những Items Không Thể Bỏ Lỡ",
          image: require("../../../../assets/img/xuhuong2025.webp"),
          link: "#",
        },
      ],
    };
  }

  render() {
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 2,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 2 } },
        { breakpoint: 600, settings: { slidesToShow: 1 } },
      ],
    };

    return (
      <div className="fashion-slider-container">
        <h2 className="fashion-slider-title">Mẹo Phối Đồ & Xu Hướng Thời Trang</h2>
        <Slider {...settings}>
          {this.state.articles.map(function (article) {
            return (
              <div key={article.id} className="fashion-slider-item">
                <Link to={article.link} className="fashion-slider-link">
                  <img src={article.image} alt={article.title} className="fashion-slider-image" />
                  <h4 className="fashion-slider-text">{article.title}</h4>
                </Link>
              </div>
            );
          })}
        </Slider>
      </div>
    );
  }
}

export default FashionTipsSlider;
