import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 
import "./brandLogos.css"; 

const brandLogos = [
    { id: 1, img: require('../../../../assets/img/nike.png'), alt: "Nike" },
    { id: 2, img: require('../../../../assets/img/logo-adidas.jpg'), alt: "Adidas" },
    { id: 3, img: require('../../../../assets/img/gucci-logo.jpg'), alt: "Gucci" },
    { id: 4, img: require('../../../../assets/img/Louis-Vuitton-logo.png'), alt: "Louis Vuitton" },
    { id: 5, img: require('../../../../assets/img/chanel-logo.png'), alt: "Chanel" },
    { id: 6, img: require('../../../../assets/img/zara-logo.png'), alt: "Zara" },
];

const BrandLogos = () => {
    const settings = {
        dots: false,            // Không hiển thị chấm điều hướng
        infinite: true,         // Chạy vô hạn
        speed: 500,             // Tốc độ chuyển đổi (ms)
        slidesToShow: 4,        // Hiển thị 4 logo cùng lúc
        slidesToScroll: 1,      // Chuyển từng logo
        autoplay: true,         // Tự động chạy
        autoplaySpeed: 3000,    // Chuyển ảnh mỗi 3s
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } }, 
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } }
        ],
        arrows: false
    };

    return (
        <section className="brand-container">
            <h2>Thương Hiệu / Đối Tác</h2>
            <Slider {...settings} className="brand">
                {brandLogos.map((brand) => (
                    <div key={brand.id} className="brand-logo">
                        <img src={brand.img} alt={brand.alt} />
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default BrandLogos;