import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Trends.css";

const trends = [
    {
        id: 1,
        title: "Minimalist Chic",
        desc: "Phong cách tối giản với gam màu trung tính, thiết kế sang trọng.",
        img: require('../../../../assets/img/MinimalistChic.webp'),
    },
    {
        id: 2,
        title: "Y2K Revival",
        desc: "Quay lại thập niên 2000 với croptop, quần cạp trễ và kính bản to.",
        img: require('../../../../assets/img/Y2KRevival.webp'),
    },
    {
        id: 3,
        title: "Athleisure",
        desc: "Phong cách thể thao pha chút thời thượng, thoải mái và sành điệu.",
        img: require('../../../../assets/img/Athleisure.webp'),
    },
    {
        id: 4,
        title: "Bohemian Spirit",
        desc: "Họa tiết hoa văn, váy maxi bay bổng, tua rua, phong cách tự do.",
        img: require('../../../../assets/img/BohemianSpirit.webp'),
    },
    {
        id: 5,
        title: "Futuristic Techwear",
        desc: "Công nghệ kết hợp thời trang, chất liệu phản quang và độc đáo.",
        img: require('../../../../assets/img/FuturisticTechwear.webp'),
    },
    {
        id: 6,
        title: "Streetwear Oversized",
        desc: "Quần áo rộng rãi, hoodie, quần cargo, phong cách cực cool.",
        img: require('../../../../assets/img/StreetwearOversized.webp'),
    }
];

const Trends = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } }
        ],
        arrows: false
    };

    return (
        <section className="trends-section">
            <h2>🔥 Xu Hướng Thời Trang 2025 🔥</h2>
            <Slider {...settings} className="trends">
                {trends.map((trend) => (
                    <div key={trend.id} className="trend-card">
                        <img src={trend.img} alt={trend.title} />
                        <div className="trend-info">
                            <h3>{trend.title}</h3>
                            <p>{trend.desc}</p>
                            <Link to="/collections" className="btn-explore">Khám Phá</Link>
                        </div>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default Trends;
