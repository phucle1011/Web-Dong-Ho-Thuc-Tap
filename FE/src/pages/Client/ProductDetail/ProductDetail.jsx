import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Constants from "../../../Constants";
import "./ProductDetail.css";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [reviews] = useState([
        { id: 1, user: "Nguyễn Văn A", comment: "Sản phẩm rất tốt!", rating: 5 },
        { id: 2, user: "Trần Thị B", comment: "Giao hàng nhanh.", rating: 4 },
        { id: 3, user: "Lê Văn C", comment: "Chất lượng tốt.", rating: 5 },
    ]);

    useEffect(() => {
        axios.get(`${Constants.DOMAIN_API}/product/${id}`)
            .then(function (res) {
                setProduct(res.data.data);
            })
            .catch(function (err) {
                console.error("❌ Lỗi tải sản phẩm:", err);
            });

        axios.get(`${Constants.DOMAIN_API}/variant/${id}`)
            .then(function (res) {
                const list = Array.isArray(res.data.data) ? res.data.data : [];
                setVariants(list);

                const sizeList = [...new Set(list.map(function (v) {
                    return v.size?.size_label;
                }))];

                const colorList = [...new Set(list.map(function (v) {
                    return v.color?.color_code;
                }))];

                setSizes(sizeList);
                setColors(colorList);
            })
            .catch(function (err) {
                console.error("❌ Lỗi tải biến thể:", err);
            });
    }, [id]);

    useEffect(() => {
        const match = variants.find(function (v) {
            return v.size?.size_label === selectedSize && v.color?.color_code === selectedColor;
        });
        setSelectedVariant(match || null);
    }, [selectedSize, selectedColor, variants]);

    function handleAddToCart() {
        if (!selectedVariant) {
            alert("❗ Vui lòng chọn kích thước và màu sắc!");
            return;
        }

        axios.post(`${Constants.DOMAIN_API}/cart/add`, {
            variant_id: selectedVariant.id,
            quantity: quantity
        })
            .then(function () {
                alert("✅ Đã thêm vào giỏ hàng!");
            })
            .catch(function (err) {
                console.error("❌ Lỗi thêm giỏ hàng:", err);
                alert("Không thể thêm vào giỏ hàng.");
            });
    }

    if (!product) {
        return <p>Đang tải sản phẩm...</p>;
    }

    const price = parseFloat(product.price) || 0;
    const salePrice = parseFloat(product.sale_price);
    const showSale = !isNaN(salePrice) && salePrice > 0 && salePrice < price;
    const noVariants = variants.length === 0;

    return (
        <main className="product-detail-container">
            <div className="product-detail-info">
                <div className="product-detail-image">
                    <img src={product.image} alt={product.name} />
                </div>

                <div className="product-detail-details">
                    <h2 className="product-detail-name">{product.name}</h2>
                    <p className="product-detail-price">

                        {showSale ? (
                            <>
                                Giá gốc: <span className="product-detail-original-price">{price.toLocaleString()}đ</span>
                                <span className="product-detail-sale-text"> Giảm còn </span>
                                <span className="product-detail-discounted-price">{salePrice.toLocaleString()}đ</span>
                            </>
                        ) : (
                            <>
                                <span className="product-detail-discounted-price">Giá: {price.toLocaleString()}đ</span>
                            </>
                        )}
                    </p>
                    <p className="product-detail-description">{product.description}</p>

                    {!noVariants ? (
                        <>
                            <div className="product-detail-options">
                                <label>Kích thước:</label>
                                <div className="product-detail-size-options">
                                    {sizes.map(function (size) {
                                        return (
                                            <label key={size} className="product-detail-size-label">
                                                <input
                                                    type="radio"
                                                    name="size"
                                                    value={size}
                                                    checked={selectedSize === size}
                                                    onChange={function () {
                                                        setSelectedSize(size);
                                                    }}
                                                /> {size}
                                            </label>
                                        );
                                    })}
                                </div>

                                <label>Màu sắc:</label>
                                <div className="product-detail-color-options">
                                    {colors.map(function (color, index) {
                                        return (
                                            <span
                                                key={index}
                                                className={
                                                    "product-detail-color-box " +
                                                    (selectedColor === color ? "selected" : "")
                                                }
                                                style={{ backgroundColor: color }}
                                                onClick={function () {
                                                    setSelectedColor(color);
                                                }}
                                            ></span>
                                        );
                                    })}
                                </div>

                                <label>Số lượng:</label>
                                <div className="product-detail-quantity-selector">
                                    <button onClick={function () {
                                        setQuantity(quantity > 1 ? quantity - 1 : 1);
                                    }}>-</button>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={quantity}
                                        readOnly
                                    />
                                    <button onClick={function () {
                                        setQuantity(quantity + 1);
                                    }}>+</button>
                                </div>
                            </div>

                            <div className="product-detail-action-buttons">
                                <button
                                    className="product-detail-btn-add-to-cart"
                                    onClick={handleAddToCart}
                                >
                                    Thêm vào giỏ hàng
                                </button>
                                <button className="product-detail-btn-buy-now">Mua ngay</button>
                            </div>

                            {selectedVariant ? (
                                <p className="product-detail-stock-info">
                                    Còn lại: {selectedVariant.stock} sản phẩm
                                </p>
                            ) : null}
                        </>
                    ) : (
                        <div className="product-detail-no-variant">
                            <p className="text-danger fw-bold">Sản phẩm này chưa mở bán.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="product-detail-extra">
                <div className="product-detail-description-block">
                    <h4>Chi Tiết Sản Phẩm</h4>
                    <p>Chất liệu: Cotton 100%</p>
                    <p>Xuất xứ: Việt Nam</p>
                    <p>
                        Hướng dẫn bảo quản: Giặt tay hoặc giặt máy nhiệt độ thấp, không dùng
                        chất tẩy mạnh.
                    </p>
                </div>

                <div className="product-detail-reviews">
                    <h4>Đánh Giá & Nhận Xét</h4>
                    <p>⭐ 4.5 / 5 (Dựa trên {reviews.length} đánh giá)</p>
                    <ul className="product-detail-review-list">
                        {reviews.map(function (review) {
                            return (
                                <li key={review.id} className="product-detail-review-item">
                                    <strong>{review.user}</strong> ({'⭐'.repeat(review.rating)})<br />
                                    {review.comment}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </main>
    );
};

export default ProductDetail;
