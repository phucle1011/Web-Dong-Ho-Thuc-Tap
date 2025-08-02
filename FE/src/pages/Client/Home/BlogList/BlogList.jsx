import { Link } from "react-router-dom";
import "./blogList.css";

const blogPosts = [
  {
    id: 1,
    title: "Cách chọn đồng hồ theo dáng tay",
    desc: "Bí quyết chọn đồng hồ phù hợp với cổ tay, giúp bạn thêm cuốn hút và đẳng cấp.",
    img: require('../../../../assets/img/k1.jpg'),
  },
  {
    id: 2,
    title: "Màu đồng hồ hợp mệnh 2025",
    desc: "Chọn màu sắc đồng hồ theo phong thủy để thu hút tài lộc và may mắn.",
    img: require('../../../../assets/img/k2.webp'),
  },
  {
    id: 3,
    title: "Top 5 xu hướng đồng hồ 2025",
    desc: "Khám phá những mẫu đồng hồ đang làm mưa làm gió trong giới thời trang.",
    img: require('../../../../assets/img/k3.png'),
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