import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Trends.css";

const trends = [
  {
    id: 1,
    title: "Đồng Hồ Tối Giản",
    desc: "Thiết kế tinh tế, màu sắc trung tính – lựa chọn hoàn hảo cho sự thanh lịch.",
    img: require('../../../../assets/img/x1.jpeg'),
  },
  {
    id: 2,
    title: "Phong Cách Retro",
    desc: "Mang hơi thở cổ điển với thiết kế lấy cảm hứng từ thập niên 2000.",
    img: require('../../../../assets/img/x2.jpg'),
  },
  {
    id: 3,
    title: "Đồng Hồ Thể Thao",
    desc: "Đậm chất năng động, bền bỉ – lý tưởng cho người yêu vận động.",
    img: require('../../../../assets/img/x3.jpg'),
  },
  {
    id: 4,
    title: "Phong Cách Boho",
    desc: "Tự do, phóng khoáng với đồng hồ họa tiết độc đáo và dây đeo nổi bật.",
    img: require('../../../../assets/img/x4.jpg'),
  },
  {
    id: 5,
    title: "Công Nghệ Thời Thượng",
    desc: "Smartwatch hiện đại tích hợp tính năng vượt trội cho cuộc sống thông minh.",
    img: require('../../../../assets/img/x5.webp'),
  },
  {
    id: 6,
    title: "Phong Cách Đường Phố",
    desc: "Đồng hồ kiểu dáng phá cách, mạnh mẽ – khẳng định cá tính riêng.",
    img: require('../../../../assets/img/x6.png'),
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
