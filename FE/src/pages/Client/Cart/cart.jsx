import React, { useState, useEffect } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import { FaTrashAlt } from "react-icons/fa";
import FormDelete from "../../../components/formDelete";
import { toast, ToastContainer } from "react-toastify";
import "./cart.css";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState("");
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        const userId = user ? JSON.parse(user).id : null;
        if (userId) {
            fetchCart(userId);
        }
    }, []);

    const fetchCart = async (userId) => {
        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/carts`, {
                params: { userId },
            });
            setCartItems(res.data.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.variant?.price || 0);
            const quantity = item.quantity;
            return total + price * quantity;
        }, 0);
    };

    const handleSelect = (variantId) => {
        setSelectedItems((prev) =>
            prev.includes(variantId)
                ? prev.filter((id) => id !== variantId)
                : [...prev, variantId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map((item) => item.product_variant_id));
        }
    };

    const handleQuantityChange = async (productVariantId, newQuantity) => {
        const user = localStorage.getItem("user");
        const userId = user ? JSON.parse(user).id : null;
        if (!userId) {
            toast.error("Vui lòng đăng nhập để thực hiện hành động này");
            return;
        }
        if (newQuantity < 1) return;

        try {
            await axios.put(
                `${Constants.DOMAIN_API}/update-to-carts/${userId}/${productVariantId}`,
                { quantity: newQuantity }
            );
            toast.success("Cập nhật số lượng thành công");
            fetchCart(userId);
        } catch (error) {
            toast.error("Cập nhật số lượng thất bại");
        }
    };

    const handleConfirmDelete = (productVariantId) => {
        const item = cartItems.find((c) => c.product_variant_id === productVariantId);
        const sku = item?.variant?.sku || "sản phẩm";
        setDeleteItemId(productVariantId);
        setDeleteMessage(`Bạn có chắc chắn muốn xóa sản phẩm ${sku} này khỏi giỏ hàng?`);
        setShowConfirm(true);
    };

    const handleDelete = async ({ id }) => {
        const user = localStorage.getItem("user");
        const userId = user ? JSON.parse(user).id : null;
        if (!userId) {
            toast.error("Vui lòng đăng nhập để thực hiện hành động này");
            return;
        }

        try {
            await axios.delete(`${Constants.DOMAIN_API}/delete-to-carts/${userId}/${id}`);
            setCartItems((prev) =>
                prev.filter((item) => item.product_variant_id !== id)
            );
            toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
            fetchCart(userId);
        } catch (error) {
            const message = error.response?.data?.message || "";
            if (message === "Không tìm thấy sản phẩm trong giỏ hàng để xóa") {
                toast.warning("Sản phẩm không tồn tại trong giỏ hàng");
            } else {
                toast.error("Xóa sản phẩm thất bại");
            }
        } finally {
            setShowConfirm(false);
            setDeleteItemId(null);
            setDeleteMessage("");
        }
    };

    const handleClearCart = async () => {
        const user = localStorage.getItem("user");
        const userId = user ? JSON.parse(user).id : null;
        if (!userId) {
            toast.error("Vui lòng đăng nhập để thực hiện hành động này");
            return;
        }

        try {
            await axios.delete(`${Constants.DOMAIN_API}/clear-cart/${userId}`);
            setCartItems([]);
            toast.success("Đã xóa toàn bộ giỏ hàng");
            fetchCart(userId);
        } catch (error) {
            toast.error("Không thể xóa toàn bộ giỏ hàng");
        } finally {
            setShowConfirmClear(false);
        }
    };

    const QuantityInput = ({ quantity, onChange }) => {
        const handleDecrease = () => {
            if (quantity > 1) onChange(quantity - 1);
        };
        const handleIncrease = () => {
            onChange(quantity + 1);
        };

        return (
            <div className="inline-flex items-center border rounded-md overflow-hidden w-[80px] h-7">
                <button
                    onClick={handleDecrease}
                    className="w-6 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                    type="button"
                >
                    -
                </button>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1) onChange(val);
                    }}
                    className="w-[30px] text-center outline-none border-l border-r h-full [appearance:textfield]"
                />
                <button
                    onClick={handleIncrease}
                    className="w-6 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                    type="button"
                >
                    +
                </button>
            </div>
        );
    };

    return (
        <main className="container mt-6">
            <div className="cart-container">
                <div className="cart-main">
                    <h2 className="cart-title">Giỏ hàng của bạn</h2>

                    <div className="flex justify-end items-center mb-4 pr-2">
                        <button
                            onClick={() => setShowConfirmClear(true)}
                            className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-200"
                            title="Xóa toàn bộ giỏ hàng"
                        >
                            <FaTrashAlt size={18} />
                        </button>
                    </div>

                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={
                                            selectedItems.length === cartItems.length &&
                                            cartItems.length > 0
                                        }
                                    />
                                </th>
                                <th>Hình ảnh & Tên</th>
                                <th>Thuộc tính</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Tổng</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-500">
                                        Giỏ hàng trống.
                                    </td>
                                </tr>
                            ) : (
                                cartItems.map((item) => {
                                    const variant = item.variant;
                                    const image = variant?.images?.[0]?.image_url || "";
                                    const attributes = variant?.attributeValues || [];
                                    const price = parseFloat(variant.price);
                                    const quantity = item.quantity;
                                    const stock = variant.stock;
                                    const total = price * quantity;

                                    return (
                                        <tr key={item.id} className="cart-item">
                                            <td className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(
                                                        item.product_variant_id
                                                    )}
                                                    onChange={() =>
                                                        handleSelect(item.product_variant_id)
                                                    }
                                                />
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={image}
                                                        alt=""
                                                        className="cart-item-image flex-shrink-0"
                                                    />
                                                    <span>{variant.sku}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {attributes.map((attr) => (
                                                    <div key={attr.id}>
                                                        {attr.attribute.name}: {attr.value}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="text-center">
                                                {price.toLocaleString("vi-VN")}đ
                                            </td>
                                            <td className="text-center">
                                                {stock === 0 ? (
                                                    <span className="text-red-500">
                                                        Hết hàng
                                                    </span>
                                                ) : (
                                                    <QuantityInput
                                                        quantity={quantity}
                                                        onChange={(newQuantity) =>
                                                            handleQuantityChange(
                                                                item.product_variant_id,
                                                                newQuantity
                                                            )
                                                        }
                                                    />
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {total.toLocaleString("vi-VN")}đ
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() =>
                                                        handleConfirmDelete(
                                                            item.product_variant_id
                                                        )
                                                    }
                                                    className="cart-item-remove-button"
                                                >
                                                    <FaTrashAlt size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    <div className="cart-total mt-6 p-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold">
                            Tổng tiền:{" "}
                            <span className="text-red-500">
                                {calculateTotal().toLocaleString("vi-VN")}đ
                            </span>
                        </h3>
                    </div>
                </div>
            </div>

            <FormDelete
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => handleDelete({ id: deleteItemId })}
                message={deleteMessage}
                Id={deleteItemId}
            />
            <FormDelete
                isOpen={showConfirmClear}
                onClose={() => setShowConfirmClear(false)}
                onConfirm={handleClearCart}
                message="Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?"
            />

            <ToastContainer />
        </main>
    );
};

export default Cart;