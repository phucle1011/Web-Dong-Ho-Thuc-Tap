import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./DealsSlider.css";

const deals = [
    {
        id: 1,
        title: "Giảm 20% cho đơn hàng đầu tiên!",
        desc: "Nhập mã FIRST20 để được giảm ngay 20% khi đặt hàng lần đầu.",
        img: require('../../../../assets/img/z1.jpg'),
    },
    {
        id: 2,
        title: "Flash Sale Cuối Tuần!",
        desc: "Giảm đến 50% cho các sản phẩm HOT nhất, chỉ từ thứ 6 đến chủ nhật!",
        img: require('../../../../assets/img/z2.jpg'),
    },
    {
        id: 3,
        title: "Mua 2 Tặng 1",
        desc: "Mua bất kỳ 2 sản phẩm nào, tặng ngay 1 sản phẩm cùng loại!",
        img: require('../../../../assets/img/z3.png'),
    },
    {
        id: 4,
        title: "Freeship Đơn Hàng Từ 500K!",
        desc: "Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ trở lên.",
        img: require('../../../../assets/img/z4.jpg'),
    },
];

const DealsSlider = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: false
    };

    return (
        <section className="deals-container">
            <h2>Ưu Đãi & Khuyến Mãi</h2>
            <Slider {...settings} className="deals">
                {deals.map((deal) => (
                    <div key={deal.id} className="deal-slide">
                        <img src={deal.img} alt={deal.title} />
                        <div className="deal-content">
                            <h3>{deal.title}</h3>
                            <p>{deal.desc}</p>
                        </div>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default DealsSlider;