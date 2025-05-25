import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  // Trạng thái cho checkbox phương thức thanh toán
  const [onlinePayment, setOnlinePayment] = useState(false);
  const [codPayment, setCodPayment] = useState(false);

  useEffect(() => {
    const savedAddresses = localStorage.getItem('shippingAddresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  }, []);

  const goToAddressManager = () => {
    navigate('/shipping-address-manager');
  };

  // Giả sử danh sách sản phẩm trong giỏ hàng
  const products = [
    {
      id: 1,
      name: 'Áo Thun Nam',
      size : 'L',
      price: 200000,
      coler: 'Trắng',
      quantity: 2,
      image: require('../../../assets/img/aothun.webp'),
    },
    {
      id: 2,
      name: 'Quần Jean Nữ',
      size : 'M',
      coler : 'Nâu',
      price: 350000,
      quantity: 1,
      image: require('../../../assets/img/nu.webp'),
    },
  ];

  // Tính toán chi tiết thanh toán
  const subTotal = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
  const shippingFee = 30000;
  const discount = 0;
  const total = subTotal + shippingFee - discount;

  const handleConfirmPayment = () => {
    if (selectedAddressIndex === null) {
      alert('Vui lòng chọn địa chỉ nhận hàng!');
      return;
    }
    if (!onlinePayment && !codPayment) {
      alert('Vui lòng chọn ít nhất một phương thức thanh toán!');
      return;
    }
    if (onlinePayment && codPayment) {
      alert('Vui lòng chỉ chọn một phương thức thanh toán!');
      return;
    }
    // Tạo dữ liệu thanh toán chung
    const selectedAddress = addresses[selectedAddressIndex];
    const paymentData = {
      shippingInfo: selectedAddress,
      products,
      subTotal,
      shippingFee,
      discount,
      total,
      paymentMethods: {
        onlinePayment,
        codPayment,
      },
    };
    console.log('Payment Data:', paymentData);
    // Xử lý theo phương thức thanh toán đã chọn
    if (onlinePayment) {
      // Nếu chọn thanh toán online: chuyển trang
      navigate('/payment-detail', { state: paymentData });
    } else if (codPayment) {
      // Nếu chọn COD: hiển thị thông báo thanh toán thành công (hoặc xử lý theo yêu cầu)
      alert('Thanh toán COD thành công!');
      // Bạn có thể chuyển hướng về trang đơn hàng thành công nếu cần:
      // navigate('/order-success', { state: paymentData });
    }
  };

  return (
    <main className='container'>
      <div className="payment-page">
        <div className="payment-left">
          <h2 className="payment-left-title">Chọn Địa Chỉ Nhận Hàng</h2>
          {addresses.length === 0 ? (
            <div className="no-address text-center mb-3">
              <p>Chưa có địa chỉ được lưu.</p>
              <button className="btn btn-primary" onClick={goToAddressManager}>
                Nhập Địa Chỉ Giao Hàng
              </button>
            </div>
          ) : (
            <>
              <div className="address-selection">
                {addresses.map((addr, index) => (
                  <div
                    key={index}
                    className={`address-item ${selectedAddressIndex === index ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressIndex(index)}
                  >
                    <p><strong>{addr.fullName}</strong></p>
                    <p>
                      {addr.addressLine}, {addr.district}, {addr.ward}, {addr.city}
                    </p>
                    <p>{addr.phone}</p>
                  </div>
                ))}
              </div>
              <button className="edit-address btn-purple " onClick={goToAddressManager}>
                Chỉnh Sửa/Thêm Địa Chỉ
              </button>
            </>
          )}

          <h2 className="payment-left-title mt-4">Sản Phẩm Cần Thanh Toán</h2>
          <div className="product-list">
            {products.map((product) => (
              <div className="product-item" key={product.id}>
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <p className="product-name">{product.name}</p>
                  <p className="product-size">{product.size}</p>
                  <p className="product-coler">{product.coler}</p>
                  <p className="product-price">{product.price.toLocaleString()} VND</p>
                  <p className="product-quantity">Số lượng: {product.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-right">
          <h2 className="payment-right-title">Chi Tiết Thanh Toán</h2>
          <div className="order-summary">
            <div className="summary-item">
              <span>Tổng tiền sản phẩm:</span>
              <span>{subTotal.toLocaleString()} VND</span>
            </div>
            <div className="summary-item">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee.toLocaleString()} VND</span>
            </div>
            <div className="summary-item">
              <span>Giảm giá (Voucher):</span>
              <span>{discount.toLocaleString()} VND</span>
            </div>
            <div className="summary-item total">
              <span>Tổng số tiền:</span>
              <span>{total.toLocaleString()} VND</span>
            </div>
          </div>

          <div className="payment-method-options mt-3">
            <h3 className="payment-method-title text-center">Chọn Phương Thức Thanh Toán</h3>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="onlinePayment"
                checked={onlinePayment}
                disabled={codPayment}
                onChange={(e) => setOnlinePayment(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="onlinePayment">
                Thanh toán Online
              </label>
              <small className="form-text text-muted">
                Chọn phương thức thanh toán online để thanh toán nhanh qua thẻ tín dụng hoặc ví điện tử.
              </small>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="codPayment"
                checked={codPayment}
                disabled={onlinePayment}
                onChange={(e) => setCodPayment(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="codPayment">
                Thanh toán khi nhận hàng (COD)
              </label>
              <small className="form-text text-muted">
                Chọn COD nếu bạn muốn thanh toán trực tiếp khi nhận hàng.
              </small>
            </div>
          </div>

          <button className="confirm-payment-btn mt-3" onClick={handleConfirmPayment}>
            Xác Nhận Thanh Toán
          </button>
        </div>
      </div>
    </main>
  );
};

export default Payment;
