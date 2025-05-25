import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CustomerReviews.css";

const reviews = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        rating: 5,
        review: "Sản phẩm chất lượng, giao hàng nhanh. Mình rất hài lòng!",
        img: require('../../../../assets/img/aothun.webp'),
    },
    {
        id: 2,
        name: "Trần Thị B",
        rating: 4,
        review: "Màu sắc đẹp, đúng mô tả. Mình sẽ ủng hộ lần sau!",
        img: require('../../../../assets/img/aothun.webp'),
    },
    {
        id: 3,
        name: "Lê Hoàng C",
        rating: 5,
        review: "Mua lần thứ 2 rồi, rất đáng tiền! Chất vải đẹp.",
        img: require('../../../../assets/img/aothun.webp'),
    },
    {
        id: 4,
        name: "Phạm Minh D",
        rating: 4,
        review: "Tư vấn nhiệt tình, sản phẩm đúng hình. Giao nhanh!",
        img: require('../../../../assets/img/aothun.webp'),
    },
];

const CustomerReviews = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: false,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <section className="reviews-container">
            <h2>Đánh Giá Khách Hàng</h2>
            <Slider {...settings} className="reviews">
                {reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <img src={review.img} alt={review.name} className="customer-img" />
                        <h3>{review.name}</h3>
                        <div className="stars">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                        <p>{review.review}</p>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default CustomerReviews;