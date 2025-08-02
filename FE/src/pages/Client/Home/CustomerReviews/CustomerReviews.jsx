// src/components/CustomerReviews.jsx
import { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CustomerReviews.css";
import defaultImg from "../../../../assets/img/aothun.webp";

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);

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

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get("http://localhost:5000/admin/comment/list");
                const data = response.data?.data || [];

                const mapped = data.map((review) => ({
                    id: review.id,
                    name: review.user?.name || "Ẩn danh",
                    rating: review.rating,
                    review: review.comment_text,
                    img: review.user?.avatar
                        ? `/uploads/${review.user.avatar}`
                        : defaultImg,
                }));

                setReviews(mapped);
            } catch (err) {
                console.error("❌ Lỗi lấy bình luận:", err);
            }
        };

        fetchReviews();
    }, []);

    return (
        <section className="reviews-container">
            <h2>Đánh Giá Khách Hàng</h2>
            {reviews.length > 0 ? (
                <Slider {...settings} className="reviews">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">

                            <h3>{review.name}</h3>
                            <div className="stars">
                                {"★".repeat(review.rating)}
                                {"☆".repeat(5 - review.rating)}
                            </div>
                            <p>{review.review}</p>
                        </div>
                    ))}
                </Slider>
            ) : (
                <p className="text-center mt-4">Chưa có đánh giá nào.</p>
            )}
        </section>
    );
};

export default CustomerReviews;
