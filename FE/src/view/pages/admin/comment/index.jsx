import { useEffect, useState } from "react";
import axios from "axios";
import HeaderAdmin from "../layout/header";
import "./comment.css";
import constant from "../../../../Constants";

const Comment = () => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        axios.get(`${constant.DOMAIN_API}/admin/comment/list`)
            .then(res => {
                setComments(res.data.data);
            })
            .catch(err => {
                console.error("Lỗi khi lấy danh sách bình luận:", err);
            });
    }, []);

    return (
        <>
            <HeaderAdmin />
            <div className="comment-container">
                <div className="comment-wrapper">
                    <div className="comment-box">
                        <h2 className="comment-title">DANH SÁCH BÌNH LUẬN</h2>
                        <div className="table-responsive">
                            <table className="comment-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên Người Dùng</th>
                                        <th>Sản Phẩm</th>
                                        <th>Bình Luận</th>
                                        <th>Sao</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comments.map((comment) => (
                                        <tr key={comment.id}>
                                            <td>{comment.id}</td>
                                            <td>{comment.user?.name || 'Ẩn danh'}</td>
                                            <td>{comment.orderDetail?.variant?.product?.name || comment.orderDetail?.variant?.sku || 'Không rõ'}</td>
                                            <td>{comment.comment_text}</td>
                                            <td>{comment.rating} ⭐</td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Comment;
