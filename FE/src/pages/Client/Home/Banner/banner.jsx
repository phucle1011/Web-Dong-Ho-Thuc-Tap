import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./banner.css";

const banners = [
    { id: 1, title: "Thời Trang Xu Hướng 2025", desc: "Khám phá bộ sưu tập mới nhất tại Poly Fashion Shop", img: require('../../../../assets/img/xuhuong.webp') },
    { id: 2, title: "Bộ Sưu Tập Hè", desc: "Phong cách năng động cho mùa hè rực rỡ", img: require('../../../../assets/img/muahe.webp') },
    { id: 3, title: "Thời Trang Công Sở", desc: "Lịch lãm, chuyên nghiệp, phù hợp môi trường làm việc", img: require('../../../../assets/img/congso.webp') },
    { id: 4, title: "Streetwear Cá Tính", desc: "Khám phá phong cách đường phố cực chất", img: require('../../../../assets/img/catinh.webp') },
    { id: 5, title: "Sale Cuối Năm", desc: "Giảm giá cực sốc lên đến 50%", img: require('../../../../assets/img/sale.webp') },
];

const BannerSlider = () => {
    const settings = {
        dots: true,         // Hiển thị dấu chấm điều hướng
        infinite: true,     // Chạy vô hạn
        speed: 500,         // Tốc độ chuyển đổi (ms)
        slidesToShow: 1,    // Hiển thị 1 banner mỗi lần
        slidesToScroll: 1,  // Chuyển từng banner
        autoplay: true,     // Tự động chạy
        autoplaySpeed: 5000, // Thời gian chuyển ảnh (5s)
        arrows: false
    };

    return (
        <section className="home-banner-container">
            <Slider {...settings} className="home-banner-slider">
                {banners.map(function (banner) {
                    return (
                        <div key={banner.id} className="home-banner-slide">
                            <div className="home-banner" style={{ backgroundImage: `url(${banner.img})` }}>
                                <div className="home-content">
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
};

export default BannerSlider;