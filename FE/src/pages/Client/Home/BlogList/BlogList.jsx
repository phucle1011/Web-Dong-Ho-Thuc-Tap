import { Link } from "react-router-dom";
import "./blogList.css";

const blogPosts = [
    {
        id: 1,
        title: "Cách phối đồ theo dáng người",
        desc: "Mẹo chọn trang phục giúp tôn dáng, che khuyết điểm hiệu quả.",
        img: require('../../../../assets/img/phoi-do-dang-nguoi.webp'),
    },
    {
        id: 2,
        title: "Màu sắc hợp mệnh 2025",
        desc: "Chọn trang phục theo phong thủy để mang lại may mắn.",
        img: require('../../../../assets/img/mau-sac-hop-menh.webp'),
    },
    {
        id: 3,
        title: "5 Xu hướng thời trang nổi bật",
        desc: "Những phong cách đang lên ngôi, không thể bỏ lỡ!",
        img: require('../../../../assets/img/xu-huong-thoi-trang.webp'),
    },
];

const BlogList = () => {
    return (
        <section className="blog-container">
            <h2>Tin Tức & Blog</h2>
            <div className="blog-grid">
                {blogPosts.map((post) => (
                    <div key={post.id} className="blog-card">
                        <img src={post.img} alt={post.title} />
                        <div className="blog-content">
                            <h3>{post.title}</h3>
                            <p>{post.desc}</p>
                            <Link to={`/blog/${post.id}`} className="btn-read-more">Xem thêm</Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BlogList;