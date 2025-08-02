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
    title: "Khám Phá Bộ Sưu Tập Đồng Hồ Thụy Sĩ Cao Cấp",
    image: require("../../../../assets/img/r1.jpg"),
    link: "#",
  },
  {
    id: 2,
    title: "Top 5 Mẫu Đồng Hồ Nam Bán Chạy Nhất 2025",
    image: require("../../../../assets/img/r2.jpg"),
    link: "#",
  },
  {
    id: 3,
    title: "Đồng Hồ Nữ Thanh Lịch Cho Mọi Phong Cách",
    image: require("../../../../assets/img/r3.jpg"),
    link: "#",
  },
  {
    id: 4,
    title: "Bí Quyết Chọn Đồng Hồ Hợp Với Cổ Tay",
    image: require("../../../../assets/img/r4.jpg"),
    link: "#",
  },
  {
    id: 5,
    title: "Đồng Hồ Thông Minh – Xu Hướng Mới Của Giới Trẻ",
    image: require("../../../../assets/img/r5.jpg"),
    link: "#",
  },
  {
    id: 6,
    title: "Ưu Đãi Cực Sốc Khi Mua Đồng Hồ Chính Hãng",
    image: require("../../../../assets/img/r6.jpg"),
    link: "#",
  },
]

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
        <h2 className="fashion-slider-title">Mẹo Chọn Đồng Hồ </h2>
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
