import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ShippingAddressManager.css';

const ShippingAddressManager = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: '',
    addressLine: '',
    district: '',
    ward: '',
    city: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const savedAddresses = localStorage.getItem('shippingAddresses');
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  }, []);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!address.fullName.trim()) newErrors.fullName = 'Họ và Tên không được để trống.';
    if (!address.addressLine.trim()) newErrors.addressLine = 'Địa chỉ không được để trống.';
    if (!address.district.trim()) newErrors.district = 'Quận/Huyện không được để trống.';
    if (!address.ward.trim()) newErrors.ward = 'Phường/Xã không được để trống.';
    if (!address.city.trim()) newErrors.city = 'Thành phố không được để trống.';
    if (!address.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống.';
    } else if (!/^\d{10,11}$/.test(address.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số).';
    }
    return newErrors;
  };

  const handleSave = () => {
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    // Nếu không có lỗi, lưu địa chỉ
    const newAddresses = [...addresses, address];
    setAddresses(newAddresses);
    localStorage.setItem('shippingAddresses', JSON.stringify(newAddresses));
    setAddress({
      fullName: '',
      addressLine: '',
      district: '',
      ward: '',
      city: '',
      phone: '',
    });
    setErrors({});
    alert('Địa chỉ đã được lưu!');
    // Sau khi lưu thành công, chuyển hướng về trang Payment
    navigate('/payment');
  };

  const handleBackToPayment = () => {
    navigate('/payment');
  };

  return (
    <div className="shipping-address-manager-container container mt-4">
      <h2 className="shipping-address-manager-title mb-3">Quản Lý Địa Chỉ Giao Hàng</h2>

      <div className="shipping-address-manager-form card p-3 mb-4">
        <div className="form-group mb-2">
          <label htmlFor="fullName">Họ và Tên</label>
          <input
            type="text"
            className="form-control shipping-address-manager-input"
            id="fullName"
            name="fullName"
            placeholder="Nhập họ và tên"
            value={address.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <small className="text-danger">{errors.fullName}</small>}
        </div>
        <div className="form-group mb-2">
          <label htmlFor="addressLine">Địa chỉ</label>
          <input
            type="text"
            className="form-control shipping-address-manager-input"
            id="addressLine"
            name="addressLine"
            placeholder="Nhập địa chỉ"
            value={address.addressLine}
            onChange={handleChange}
          />
          {errors.addressLine && <small className="text-danger">{errors.addressLine}</small>}
        </div>
        <div className="form-group mb-2">
          <label htmlFor="district">Quận/Huyện</label>
          <input
            type="text"
            className="form-control shipping-address-manager-input"
            id="district"
            name="district"
            placeholder="Nhập quận/huyện"
            value={address.district}
            onChange={handleChange}
          />
          {errors.district && <small className="text-danger">{errors.district}</small>}
        </div>
        <div className="form-group mb-2">
          <label htmlFor="ward">Phường/Xã</label>
          <input
            type="text"
            className="form-control shipping-address-manager-input"
            id="ward"
            name="ward"
            placeholder="Nhập phường/xã"
            value={address.ward}
            onChange={handleChange}
          />
          {errors.ward && <small className="text-danger">{errors.ward}</small>}
        </div>
        <div className="form-group mb-2">
          <label htmlFor="city">Thành phố</label>
          <input
            type="text"
            className="form-control shipping-address-manager-input"
            id="city"
            name="city"
            placeholder="Nhập thành phố"
            value={address.city}
            onChange={handleChange}
          />
          {errors.city && <small className="text-danger">{errors.city}</small>}
        </div>
        <div className="form-group mb-2">
          <label htmlFor="phone">Số điện thoại</label>
          <input
            type="text"
            className="form-control shipping-address-manager-input"
            id="phone"
            name="phone"
            placeholder="Nhập số điện thoại"
            value={address.phone}
            onChange={handleChange}
          />
          {errors.phone && <small className="text-danger">{errors.phone}</small>}
        </div>
        <div className="d-flex justify-content-between mt-2">
          <button className="button-save" onClick={handleSave}>
            Lưu Địa Chỉ
          </button>
          <button className="button-back" onClick={handleBackToPayment}>
            Trở về trang Payment
          </button>
        </div>
      </div>

      <div className="shipping-address-manager-saved card p-3 mb-4">
        <h4 className="shipping-address-manager-saved-title mb-3">Địa chỉ đã lưu</h4>
        {addresses.length > 0 ? (
          <ul className="list-group shipping-address-manager-list">
            {addresses.map((addr, index) => (
              <li key={index} className="list-group-item shipping-address-manager-list-item">
                <strong>{addr.fullName}</strong>
                <p>{addr.addressLine}, {addr.district}, {addr.ward}, {addr.city}</p>
                <p>{addr.phone}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="shipping-address-manager-no-address">Chưa có địa chỉ được lưu.</p>
        )}
      </div>
    </div>
  );
};

export default ShippingAddressManager;
