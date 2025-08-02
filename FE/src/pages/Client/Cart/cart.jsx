import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "../../../Constants";
import { FaTrashAlt } from "react-icons/fa";
import FormDelete from "../../../components/formDelete";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Cart = ({ cart = true }) => {
    const [cartItems, setCartItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState("");
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [originalTotalPrice, setOriginalTotalPrice] = useState(0);

    useEffect(() => {
        const selectedTotal = calculateSelectedTotal();
        setTotalPrice(selectedTotal);
        setOriginalTotalPrice(selectedTotal);
    }, [selectedItems, cartItems]);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        try {
            const res = await axios.get(`${Constants.DOMAIN_API}/carts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "user": user.id,
                },
            });
            setCartItems(res.data.data);
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.variant?.promotion?.discounted_price || item.variant?.price || 0);
            const quantity = parseInt(item.quantity || 0);
            return total + price * quantity;
        }, 0);
    };

    const calculateSelectedTotal = () => {
        return cartItems.reduce((total, item) => {
            if (selectedItems.includes(item.product_variant_id)) {
                const price = parseFloat(item.variant?.promotion?.discounted_price || item.variant?.price || 0);
                const quantity = parseInt(item.quantity || 0);
                return total + price * quantity;
            }
            return total;
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

    const handleConfirmDelete = (productVariantId) => {
        const item = cartItems.find((c) => c.product_variant_id === productVariantId);
        const sku = item?.variant?.sku || "sản phẩm";
        setDeleteItemId(productVariantId);
        setDeleteMessage(`Bạn có chắc chắn muốn xóa sản phẩm ${sku} này khỏi giỏ hàng?`);
        setShowConfirm(true);
    };

    const handleDelete = async (id) => {
        const user = JSON.parse(localStorage.getItem("user"));
        try {
            await axios.delete(`${Constants.DOMAIN_API}/delete-to-carts/${id}`, {
                headers: { user: user.id },
            });
            setCartItems((prev) => prev.filter((item) => item.product_variant_id !== id));
            toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
        } catch (error) {
            // xử lý lỗi
        } finally {
            setShowConfirm(false);
            setDeleteItemId(null);
            setDeleteMessage("");
        }
    };

    const handleClearCart = async () => {
        const user = JSON.parse(localStorage.getItem("user"));

        try {
            await axios.delete(`${Constants.DOMAIN_API}/clear-cart/`, {
                headers: {
                    "user": user.id,
                },
            });

            setCartItems([]);
            toast.success("Đã xóa toàn bộ giỏ hàng");
            await fetchCart();
        } catch (error) {
            toast.error("Không thể xóa toàn bộ giỏ hàng");
        } finally {
            setShowConfirmClear(false);
        }
    };

    const handleQuantityChange = async (productVariantId, newQuantity) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (newQuantity < 1) return;

        try {
            await axios.put(
                `${Constants.DOMAIN_API}/update-to-carts/${productVariantId}`,
                { quantity: newQuantity },
                {
                    headers: {
                        "user": user.id,
                    }
                }
            );
            await fetchCart();
        } catch (error) {
            toast.error("Cập nhật số lượng thất bại");
        }
    };

    const QuantityInput = ({ quantity, onChange, stock }) => {
        const handleDecrease = () => {
            if (quantity > 1) onChange(quantity - 1);
        };
        const handleIncrease = () => {
            if (quantity < stock) onChange(quantity + 1);
            else toast.info("Không thể tăng thêm vì đã đạt số lượng tối đa trong kho");
        };

        return (
            <div className="flex items-center w-[120px] h-[30px] border rounded overflow-hidden">
                <button
                    type="button"
                    onClick={handleDecrease}
                    className="items-center justify-center border-r border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 mb-2"
                >
                    –
                </button>

                <input
                    type="number"
                    min="1"
                    max={stock}
                    value={quantity}
                    readOnly
                    className="flex-1 text-center h-full"
                />

                <button
                    type="button"
                    onClick={handleIncrease}
                    className="items-center justify-center border-l border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 mb-2"
                >
                    +
                </button>
            </div>
        );
    };

    const renderCartContent = () => (
        <div className="w-full">
            <div className="d-flex justify-content-end mb-3 pe-5">
                <button
                    onClick={() => setShowConfirmClear(true)}
                    className="btn d-flex align-items-center justify-content-center p-0"
                    style={{
                        width: '36px', height: '36px', backgroundColor: '#dc3545',
                        border: '1px solid #dc3545', color: 'white', transition: 'opacity 0.2s ease'
                    }}
                    title="Xóa toàn bộ giỏ hàng"
                    onMouseOver={e => {
                        e.currentTarget.style.opacity = '0.85';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.opacity = '1';
                    }}
                >
                    <FaTrashAlt style={{ width: '18px', height: '18px' }} />
                </button>
            </div>

            <div className="max-h-96 overflow-y-auto w-full">
                <table className="w-full table-fixed text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="sticky top-0 bg-[#F6F6F6] z-10">
                        <tr className="text-[13px] font-medium text-black uppercase">
                            <th className="py-4 text-center w-[50px]">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                />
                            </th>
                            <th className="py-4 pl-10 w-[320px]">Sản phẩm</th>
                            <th className="py-4 text-center w-[180px]">Thuộc tính</th>
                            <th className="py-4 text-center w-[120px]">Giá tiền</th>
                            <th className="py-4 text-center w-[140px]">Số lượng</th>
                            <th className="py-4 text-center w-[140px]">Tổng tiền</th>
                            <th className="py-4 text-right w-[80px]"></th>
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
                                const attributes = variant.attributeValues || [];
                                const originalPrice = parseFloat(variant.price || 0);
                                const price = parseFloat(variant.promotion?.discounted_price || variant.price || 0);
                                const discountPercent = parseFloat(variant.promotion?.discount_percent || 0);
                                const quantity = item.quantity;
                                const stock = variant.stock;
                                const total = price * quantity;
                                const name = variant.product.name;

                                return (
                                    <tr
                                        key={item.id}
                                        className={`bg-white border-b hover:bg-gray-50 ${stock === 0 ? "opacity-50" : ""}`}
                                    >
                                        <td className="text-center">
                                            {stock === 0 ? (
                                                <span title="Sản phẩm hết hàng, không thể chọn" className="cursor-help text-red-500">
                                                    Hết hàng
                                                </span>
                                            ) : (
                                                <input
                                                    type="checkbox"
                                                    disabled={stock === 0}
                                                    checked={selectedItems.includes(item.product_variant_id)}
                                                    onChange={() => stock !== 0 && handleSelect(item.product_variant_id)}
                                                />
                                            )}
                                        </td>
                                        <td className="pl-10 py-4">
                                            <div className="flex space-x-6 items-center">
                                                <div className="w-[80px] h-[80px] overflow-hidden border border-[#EDEDED] flex justify-center items-center">
                                                    <img
                                                        src={image}
                                                        alt="product"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-[15px] text-qblack">{name} ({variant.sku})</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2 w-[180px] align-top">
                                            <div className="flex flex-col gap-1">
                                                {attributes.map((attr) => {
                                                    const attrName = attr.attribute?.name;
                                                    const attrValue = attr.value;
                                                    const isColor = attrName.toLowerCase() === "color";

                                                    return (
                                                        <div
                                                            key={attr.id}
                                                            className="flex items-start gap-2 text-sm leading-snug break-words"
                                                        >
                                                            <span className="whitespace-nowrap font-semibold text-black">
                                                                {attrName}:
                                                            </span>
                                                            {isColor ? (
                                                                <span
                                                                    className="inline-block w-4 h-4 rounded-full border border-gray-300 mt-1"
                                                                    style={{ backgroundColor: attrValue }}
                                                                    title={attrValue}
                                                                ></span>
                                                            ) : (
                                                                <span className="text-gray-700 break-words">{attrValue}</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="text-center py-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`font-semibold ${discountPercent > 0 ? "text-red-500" : "text-black"}`}>
                                                    {Number(price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                                </span>
                                                {discountPercent > 0 && price < originalPrice && (
                                                    <span className="text-black-400 line-through text-xs">
                                                        {Number(originalPrice).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-center align-middle">
                                            {stock === 0 ? (
                                                <span className="text-sm text-red-500">Hết hàng</span>
                                            ) : (
                                                <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-2">
                                                    <QuantityInput
                                                        quantity={quantity}
                                                        stock={stock}
                                                        onChange={(newQuantity) =>
                                                            handleQuantityChange(item.product_variant_id, newQuantity)
                                                        }
                                                    />
                                                    <span className="text-sm text-success bg-success bg-opacity-10 px-2 py-1 rounded">
                                                        Còn lại: {stock}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-center py-4">
                                            {Number(total).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                        </td>
                                        <td className="text-end py-4">
                                            <div className="d-flex justify-content-end pe-4">
                                                <button
                                                    onClick={() => handleConfirmDelete(item.product_variant_id)}
                                                    className="btn d-flex align-items-center justify-content-center p-0"
                                                    style={{
                                                        width: '36px', height: '36px', backgroundColor: '#dc3545',
                                                        border: '1px solid #dc3545', color: 'white', pointerEvents: 'auto', transition: 'opacity 0.2s ease'
                                                    }}
                                                    title="Xóa sản phẩm"
                                                    onMouseOver={e => {
                                                        e.currentTarget.style.opacity = '0.8';
                                                    }}
                                                    onMouseOut={e => {
                                                        e.currentTarget.style.opacity = '1';
                                                    }}
                                                >
                                                    <FaTrashAlt style={{ width: '18px', height: '18px' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <FormDelete
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => handleDelete(deleteItemId)}
                message={deleteMessage}
                Id={deleteItemId}
            />

            <FormDelete
                isOpen={showConfirmClear}
                onClose={() => setShowConfirmClear(false)}
                onConfirm={handleClearCart}
                message="Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?"
            />
        </div>
    );

    const renderCheckoutSection = () => (
        <div className="d-flex justify-content-end w-100">
            <div style={{ width: '100%', maxWidth: '500px' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <p className="fs-5 fw-medium text-qblack mt-5">
                        Tổng cộng: {Number(totalPrice).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    </p>
                </div>

                {selectedItems.length > 0 ? (
                    <Link
                        to={{
                            pathname: "/checkout",
                            state: {
                                selectedItems,
                                cartItems: cartItems.filter(item =>
                                    selectedItems.includes(item.product_variant_id)
                                ),
                                totalPrice,
                                originalTotalPrice,
                            },
                        }}
                        className="no-underline"
                        onClick={() => {
                            const checkoutData = {
                                selectedItems,
                                cartItems: cartItems.filter(item =>
                                    selectedItems.includes(item.product_variant_id)
                                ),
                                totalPrice,
                                originalTotalPrice,
                            };
                            localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
                        }}
                    >
                        <div className="w-100 h-[50px] bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center">
                            <span className="text-xl fw-semibold">
                                Tiến hành thanh toán
                            </span>
                        </div>
                    </Link>
                ) : (
                    <div className="w-100 h-[50px] bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center cursor-not-allowed">
                        <span className="text-xl fw-semibold">
                            Tiến hành thanh toán
                        </span>
                    </div>
                )}
                {selectedItems.length === 0 && (
                    <p className="text-danger text-sm">Vui lòng chọn ít nhất một sản phẩm để thanh toán.</p>
                )}
            </div>
        </div>
    );

    if (cart === false) {
        return (
            <div childrenClasses="pt-0 pb-0">
                <div className="cart-page-wrapper w-full">
                    <div className="container-x mx-auto">
                        <div
                            paths={[
                                { name: "Trang chủ", path: "/" },
                                { name: "Giỏ hàng", path: "/cart" },
                            ]}
                        />
                        <div />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div childrenClasses="pt-0 pb-0">
            <div className="cart-page-wrapper w-full bg-white pb-[60px]">
                <div className="w-full">
                    <div
                        title="Giỏ hàng của bạn"
                        breadcrumb={[
                            { name: "Trang chủ", path: "/" },
                            { name: "Giỏ hàng", path: "/cart" },
                        ]}
                    />
                </div>
                <div className="w-full mt-[23px]">
                    <div className="container-x mx-auto">
                        {renderCartContent()}
                        <div className="flex flex-col lg:flex-row gap-6 mt-[30px]">
                            <div className="lg:w-1/2 w-full"></div>
                            {renderCheckoutSection()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;