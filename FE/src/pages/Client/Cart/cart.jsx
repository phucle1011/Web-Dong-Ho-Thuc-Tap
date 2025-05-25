import React, { useState } from "react";
import "./cart.css";
import { Link } from "react-router-dom";

function Cart() {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Áo thun",
            price: 100000,
            quantity: 2,
            image: require('../../../assets/img/aothun.webp'),
            color: "Đỏ",
            size: "M",
        },
        {
            id: 2,
            name: "Quần jeans",
            price: 250000,
            quantity: 1,
            image: require('../../../assets/img/nu.webp'),
            color: "Xanh",
            size: "L",
        },
    ]);

    const [selectedItems, setSelectedItems] = useState([]);

    const updateCartItem = (itemId, updatedData) => {
        setCartItems(cartItems.map((item) =>
            item.id === itemId ? { ...item, ...updatedData } : item
        ));
    };

    const handleRemove = (itemId) => {
        setCartItems(cartItems.filter((item) => item.id !== itemId));
        setSelectedItems(selectedItems.filter((id) => id !== itemId));
    };

    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.id))
            .reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleSelectItem = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter((id) => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map((item) => item.id));
        }
    };

    return (
        <main className="container">
            <div className="cart-container">
                <div className="cart-main">
                    <h2 className="cart-title">Giỏ hàng của bạn</h2>
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === cartItems.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Giá</th>
                                <th>Màu</th>
                                <th>Size</th>
                                <th>Số lượng</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.id} className="cart-item">
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => handleSelectItem(item.id)}
                                        />
                                    </td>
                                    <td>
                                        <img src={item.image} alt="" className="cart-item-image" />
                                    </td>
                                    <td className="cart-item-name">{item.name}</td>
                                    <td className="cart-item-price">đ{item.price} </td>
                                    <td>
                                        <select
                                            value={item.color}
                                            onChange={(e) => updateCartItem(item.id, { color: e.target.value })}
                                            className="cart-item-color-select"
                                        >
                                            <option value="Đỏ">Đỏ</option>
                                            <option value="Xanh">Xanh</option>
                                            <option value="Vàng">Vàng</option>
                                            <option value="Đen">Đen</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={item.size}
                                            onChange={(e) => updateCartItem(item.id, { size: e.target.value })}
                                            className="cart-item-size-select"
                                        >
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateCartItem(item.id, { quantity: Math.max(1, parseInt(e.target.value)) })}
                                            min="1"
                                            className="cart-item-quantity-input"
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => handleRemove(item.id)} className="cart-item-remove-button">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="cart-sidebar">
                    <h2>Tóm tắt đơn hàng</h2>
                    <p>Tổng ({selectedItems.length} mục): {calculateTotal().toLocaleString()} đ</p>
                    <div className="discount-section">
                        <input type="text" placeholder="Nhập mã giảm giá" className="discount-input" />
                        <button className="apply-discount-button">Áp dụng</button>
                    </div>
                    <button className="cart-checkout-button" disabled={!selectedItems.length} >
                        <Link to="/payment" className="text-decoration-none text-white">Thanh toán</Link>
                    </button>
                </div>
            </div>

        </main>
    );
}

export default Cart;