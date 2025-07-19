import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Constants from "../../../Constants";
import Swal from "sweetalert2";
import axios from 'axios';
import { toast } from "react-toastify";

export default function CheakoutPage() {
  const location = useLocation();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const navigate = useNavigate();
  const [finalData, setFinalData] = useState({
    total: 0,
    shippingFee: 0,
    formattedAmount: "0"
  });
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [allAddresses, setAllAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({
    address_line: "",
    city: "",
    district: "",
    ward: "",
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [noteValue, setNoteValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = localStorage.getItem("user");
  const id = userId ? JSON.parse(userId).id : null;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUserData = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Lỗi parse user data:", error);
        }
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    let items = [];

    if (location.state?.cartItems && location.state.cartItems.length > 0) {
      items = location.state.cartItems;
    } else {
      const savedData = localStorage.getItem("checkoutData");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          items = parsedData.cartItems || [];
        } catch (error) {
          console.error("Lỗi parse dữ liệu từ localStorage:", error);
        }
      }
    }

    setCheckoutItems(items);
  }, [location.state]);

  useEffect(() => {
    const savedData = localStorage.getItem("finalTotal");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFinalData(parsed);
      } catch (e) {
        console.error("Không thể parse finalTotal từ localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDefaultAddress = async () => {
      if (!id) {
        console.warn("Người dùng chưa đăng nhập");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${Constants.DOMAIN_API}/admin/address/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!isMounted) return;

        if (response.ok && data.success && Array.isArray(data.data)) {
          const defaultAddr = data.data.find(addr => addr.is_default === 1);
          setDefaultAddress(defaultAddr || null);
        } else {
          console.error("Lỗi từ server:", data.message || "Không tìm thấy địa chỉ");
          setDefaultAddress(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Lỗi khi lấy địa chỉ:", error);
          setDefaultAddress(null);
        }
      }
    };

    fetchDefaultAddress();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const fetchAllAddresses = async () => {
    if (!id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${Constants.DOMAIN_API}/admin/address/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        setAllAddresses(data.data);
      } else {
        console.error("Không thể lấy danh sách địa chỉ:", data.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
    }
  };

  useEffect(() => {
    fetchAllAddresses();
  }, [id]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch(`${Constants.DOMAIN_API}/apiRoutes/provinces`);
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setProvinces(data);
        } else {
          console.error("Không thể tải danh sách tỉnh");
        }
      } catch (error) {
        console.error("Lỗi kết nối đến server:", error);
      }
    };

    fetchProvinces();
  }, []);

  const handleAddNewAddress = () => {
    setAddressForm({
      name: user?.name || "",
      phone: user?.phone || "",
      address_line: "",
      city: "",
      district: "",
      ward: ""
    });
    setEditingAddressId(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      name: address.name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      district: address.district,
      ward: address.ward
    });
    setDistricts(provinces.find(p => p.id === address.city)?.districts || []);
    setWards(districts.find(d => d.id === address.district)?.wards || []);

    setEditingAddressId(address.id);
    setShowAddressModal(true);
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    const url = editingAddressId
      ? `${Constants.DOMAIN_API}/admin/address/${editingAddressId}`
      : `${Constants.DOMAIN_API}/admin/address`;
    const method = editingAddressId ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...addressForm,
          is_default: defaultAddress && !editingAddressId ? 1 : 0
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedAddresses = [...allAddresses];

        if (editingAddressId) {
          const index = updatedAddresses.findIndex((a) => a.id === editingAddressId);
          updatedAddresses[index] = { ...updatedAddresses[index], ...addressForm };
        } else {
          updatedAddresses.push(data.data);
        }

        setAllAddresses(updatedAddresses);

        if (!defaultAddress && !editingAddressId) {
          setDefaultAddress(data.data);
        }

        setShowAddressModal(false);
      } else {
        alert("Lỗi khi lưu địa chỉ.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      alert("Không thể kết nối với máy chủ.");
    }
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/provinces`);
        setProvinces(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh:", error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;

    const fetchDistricts = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/apiRoutes/districts?provinceId=${selectedProvince}`
        );
        setDistricts(res.data);
        setWards([]);
        setSelectedDistrict("");
        setSelectedWard("");
      } catch (error) {
        console.error("Lỗi khi lấy danh sách quận:", error);
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) return;

    const fetchWards = async () => {
      try {
        const res = await axios.get(
          `${Constants.DOMAIN_API}/apiRoutes/wards?districtId=${selectedDistrict}`
        );
        setWards(res.data);
        setSelectedWard("");
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phường:", error);
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  const showAddressModalDiaLog = (address = null) => {
    const isEdit = !!address;

    Swal.fire({
      title: isEdit ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới",
      html: `
      <div class="container mt-3 text-left">
        <form>
          <div class="mb-4">
            <label for="swal-address_line" class="form-label font-semibold block mb-1">Địa chỉ:</label>
            <input type="text" id="swal-address_line" class="form-input w-full border rounded px-3 py-2" value="${address?.address_line || ''}">
          </div>
          <div class="mb-4">
            <label for="swal-province" class="form-label font-semibold block mb-1">Tỉnh/Thành phố:</label>
            <select id="swal-province" class="form-select w-full border rounded px-3 py-2">
              <option value="">Chọn tỉnh/thành phố</option>
              ${provinces.map(p => `<option value="${p.ProvinceID}">${p.ProvinceName}</option>`).join("")}
            </select>
          </div>
          <div class="mb-4">
            <label for="swal-district" class="form-label font-semibold block mb-1">Quận/Huyện:</label>
            <select id="swal-district" class="form-select w-full border rounded px-3 py-2" disabled>
              <option value="">Chọn quận/huyện</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="swal-ward" class="form-label font-semibold block mb-1">Xã/Phường:</label>
            <select id="swal-ward" class="form-select w-full border rounded px-3 py-2" disabled>
              <option value="">Chọn xã/phường</option>
            </select>
          </div>
          <div class="form-check mb-3 flex items-center">
            <input type="checkbox" class="form-check-input mr-2" id="swal-is_default" ${address?.is_default === 1 ? "checked" : ""}>
            <label class="form-check-label font-semibold" for="swal-is_default">Đặt làm địa chỉ mặc định</label>
          </div>
        </form>
      </div>
    `,
      didOpen: async () => {
        const provinceSelect = Swal.getPopup().querySelector("#swal-province");
        const districtSelect = Swal.getPopup().querySelector("#swal-district");
        const wardSelect = Swal.getPopup().querySelector("#swal-ward");
        const addressInput = Swal.getPopup().querySelector("#swal-address_line");

        const fetchDistricts = async (provinceId) => {
          try {
            const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/districts?provinceId=${provinceId}`);
            return res.data;
          } catch (err) {
            console.error("Lỗi tải quận:", err);
            return [];
          }
        };

        const fetchWards = async (districtId) => {
          try {
            const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/wards?districtId=${districtId}`);
            return res.data;
          } catch (err) {
            console.error("Lỗi tải phường:", err);
            return [];
          }
        };

        const updateFullAddress = () => {
          const provinceName = provinceSelect.options[provinceSelect.selectedIndex]?.text || "";
          const districtName = districtSelect.options[districtSelect.selectedIndex]?.text || "";
          const wardName = wardSelect.options[wardSelect.selectedIndex]?.text || "";

          let fullAddress = "";

          if (wardName && districtName && provinceName) {
            fullAddress = `${wardName}, ${districtName}, ${provinceName}`;
          } else if (districtName && provinceName) {
            fullAddress = `${districtName}, ${provinceName}`;
          } else if (provinceName) {
            fullAddress = `${provinceName}`;
          }

          addressInput.value = fullAddress;
        };

        if (isEdit && address) {
          const province = provinces.find(p => p.ProvinceName === address.city);
          if (province) {
            provinceSelect.value = province.ProvinceID;

            districtSelect.disabled = false;
            const districts = await fetchDistricts(province.ProvinceID);
            districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
            districts.forEach(d => {
              const option = document.createElement("option");
              option.value = d.DistrictID;
              option.text = d.DistrictName;
              if (d.DistrictName === address.district) option.selected = true;
              districtSelect.appendChild(option);
            });

            const selectedDistrictOption = districtSelect.options[districtSelect.selectedIndex];
            const districtId = selectedDistrictOption?.value;

            if (districtId) {
              wardSelect.disabled = false;
              const wards = await fetchWards(districtId);
              wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';
              wards.forEach(w => {
                const option = document.createElement("option");
                option.value = w.WardCode;
                option.text = w.WardName;
                if (w.WardName === address.ward) option.selected = true;
                wardSelect.appendChild(option);
              });
            }
          }

          updateFullAddress();
        }

        provinceSelect.addEventListener("change", async (e) => {
          const provinceId = e.target.value;
          districtSelect.disabled = !provinceId;
          wardSelect.disabled = true;
          districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
          wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';

          if (!provinceId) return;

          const districts = await fetchDistricts(provinceId);
          districts.forEach(d => {
            const option = document.createElement("option");
            option.value = d.DistrictID;
            option.text = d.DistrictName;
            districtSelect.appendChild(option);
          });

          updateFullAddress();
        });

        districtSelect.addEventListener("change", async (e) => {
          const districtId = e.target.value;
          wardSelect.disabled = !districtId;
          wardSelect.innerHTML = '<option value="">Chọn xã/phường</option>';

          if (!districtId) return;

          const wards = await fetchWards(districtId);
          wards.forEach(w => {
            const option = document.createElement("option");
            option.value = w.WardCode;
            option.text = w.WardName;
            wardSelect.appendChild(option);
          });

          updateFullAddress();
        });

        wardSelect.addEventListener("change", () => {
          updateFullAddress();
        });
      },
      showCancelButton: true,
      confirmButtonText: isEdit ? "Cập nhật" : "Thêm",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        const address_line = Swal.getPopup().querySelector("#swal-address_line").value.trim();
        const provinceSelect = Swal.getPopup().querySelector("#swal-province");
        const districtSelect = Swal.getPopup().querySelector("#swal-district");
        const wardSelect = Swal.getPopup().querySelector("#swal-ward");
        const is_default = Swal.getPopup().querySelector("#swal-is_default").checked ? 1 : 0;

        const city = provinceSelect.options[provinceSelect.selectedIndex]?.text || "";
        const district = districtSelect.options[districtSelect.selectedIndex]?.text || "";
        const ward = wardSelect.options[wardSelect.selectedIndex]?.text || "";

        if (!city || !district || !ward) {
          Swal.showValidationMessage("Vui lòng chọn đầy đủ tỉnh/quận/phường.");
          return false;
        }

        return {
          address_line,
          city,
          district,
          ward,
          is_default,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (isEdit) {
          await handleUpdateAddress(address.id, result.value);
        } else {
          await handleAddAddress(result.value);
        }
      }
    });
  };

  const handleAddAddress = async (addressData) => {
    try {
      const res = await axios.post(`${Constants.DOMAIN_API}/admin/user/${id}/addresses`, addressData);

      if (addressData.is_default === 1) {
        setDefaultAddress(res.data);
      }

      fetchAllAddresses();
      toast.success("Thêm địa chỉ thành công");
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      toast.error("Thêm địa chỉ thất bại");
    }
  };

  const handleUpdateAddress = async (addressId, addressData) => {
    const hasOtherDefault = allAddresses.some(
      (addr) => addr.is_default === 1 && addr.id !== addressId
    );

    if (addressData.is_default === 1 && hasOtherDefault) {
      toast.error("Vui lòng bỏ chọn địa chỉ mặc định hiện tại trước khi đặt địa chỉ này làm mặc định.");
      return;
    }

    try {
      const res = await axios.put(
        `${Constants.DOMAIN_API}/admin/user/${id}/addresses/${addressId}`,
        addressData
      );
      toast.success("Cập nhật địa chỉ thành công");

      const updatedAddresses = allAddresses.map(addr =>
        addr.id === addressId ? { ...addr, ...addressData } : addr
      );
      setAllAddresses(updatedAddresses);

      if (addressData.is_default === 1) {
        setDefaultAddress(updatedAddresses.find(addr => addr.id === addressId));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
      toast.error("Lỗi khi cập nhật địa chỉ");
    }
  };

  useEffect(() => {
    return () => {
      const currentPath = window.location.pathname;
      if (currentPath !== "/checkout") {
        localStorage.removeItem("finalTotal");
        localStorage.removeItem("checkoutData");
      }
    };
  }, []);

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${Constants.DOMAIN_API}/admin/user/${id}/addresses/${addressId}`,
        { is_default: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        const updatedAddresses = allAddresses.map(addr =>
          addr.id === addressId ? { ...addr, is_default: 1 } : { ...addr, is_default: 0 }
        );
        setAllAddresses(updatedAddresses);
        setDefaultAddress(updatedAddresses.find(addr => addr.is_default === 1));
        toast.success("Đặt làm địa chỉ mặc định thành công");
      }
    } catch (error) {
      console.error("Lỗi khi đặt làm địa chỉ mặc định:", error);
      toast.error("Không thể cập nhật địa chỉ mặc định");
    }
  };

  const confirmSetDefaultAddress = (addressId) => {
    const address = allAddresses.find(addr => addr.id === addressId);

    Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn đặt địa chỉ này làm mặc định?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleSetDefaultAddress(addressId);
        const newDefault = allAddresses.find(addr => addr.id === addressId);
        setDefaultAddress(newDefault);
      }
    });
  };

  const getProvinceIdByName = async (provinceName) => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/provinces`);
      const provinces = res.data;

      const province = provinces.find(p =>
        p.ProvinceName.toLowerCase().includes(provinceName.toLowerCase())
      );

      if (!province) {
        throw new Error(`Không tìm thấy mã tỉnh cho ${provinceName}`);
      }

      return province.ProvinceID;
    } catch (error) {
      console.error("Lỗi khi lấy ProvinceID:", error.message);
      toast.error("Không thể lấy mã tỉnh");
      return null;
    }
  };

  const getDistrictIdByProvinceAndName = async (provinceId, districtName) => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/districts?provinceId=${provinceId}`);
      const districts = res.data;

      const district = districts.find(d =>
        d.DistrictName.toLowerCase().includes(districtName.toLowerCase())
      );

      if (!district) {
        throw new Error(`Không tìm thấy mã quận/huyện cho ${districtName}`);
      }

      return district.DistrictID;
    } catch (error) {
      console.error("Lỗi khi lấy DistrictID:", error.message);
      toast.error("Không thể lấy mã quận/huyện");
      return null;
    }
  };

  const getWardCodeByDistrictAndName = async (districtId, wardName) => {
    try {
      const res = await axios.get(`${Constants.DOMAIN_API}/apiRoutes/wards?districtId=${districtId}`);
      const wards = res.data;

      const ward = wards.find(w =>
        w.WardName.toLowerCase().includes(wardName.toLowerCase())
      );

      if (!ward) {
        throw new Error(`Không tìm thấy mã phường/xã cho ${wardName}`);
      }

      return ward.WardCode;
    } catch (error) {
      console.error("Lỗi khi lấy WardCode:", error.message);
      toast.error("Không thể lấy mã phường/xã");
      return null;
    }
  };

  const deleteCartItem = async (variantId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${Constants.DOMAIN_API}/delete-to-carts/${variantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error(`Không thể xóa sản phẩm ID ${variantId} khỏi giỏ hàng`);
    }
  };

  const handleCheckout = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const selectedPaymentMethod = (document.querySelector('input[name="payment_method"]:checked')?.value || "").trim();
      if (!selectedPaymentMethod) {
        toast.error("Vui lòng chọn phương thức thanh toán");
        return;
      }

      const name = user?.name?.trim();
      if (!name) {
        toast.error("Vui lòng nhập họ và tên");
        return;
      }

      const email = user?.email?.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        toast.error("Vui lòng nhập email");
        return;
      } else if (!emailRegex.test(email)) {
        toast.error("Email không đúng định dạng");
        return;
      }

      const phone = user?.phone?.trim();
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phone) {
        toast.error("Vui lòng nhập số điện thoại");
        return;
      } else if (!phoneRegex.test(phone)) {
        toast.error("Số điện thoại không hợp lệ");
        return;
      }

      if (!defaultAddress || !defaultAddress.address_line) {
        toast.error("Vui lòng chọn hoặc thêm địa chỉ giao hàng");
        return;
      }

      const payload = {
        products: checkoutItems,
        user_id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: defaultAddress?.address_line || "",
        note: noteValue,
        payment_method: selectedPaymentMethod,
        shipping_fee: finalData.shippingFee || 0,
        amount: finalData.total
      };

      payload.submitTimestamp = Date.now();

      if (selectedPaymentMethod === "VNPay") {
        const response = await axios.post(`${Constants.DOMAIN_API}/orders-vnpay`, payload);

        if (response.data.success && response.data.data?.paymentUrl) {
          window.location.href = response.data.data.paymentUrl;
          return;
        }

        throw new Error(response.data.message || "Không thể tạo URL thanh toán VNPay");
      }

      let url = `${Constants.DOMAIN_API}/orders`;
      if (selectedPaymentMethod === "momo") {
        url = `${Constants.DOMAIN_API}/orders-momo`;
      }

      const response = await axios.post(url, payload);

      if (response.data.success) {
        const successfullyOrderedProductIds =
          response.data.data?.successfullyOrderedProductIds || [];

        for (const variantId of successfullyOrderedProductIds) {
          await deleteCartItem(variantId);
        }

        setCheckoutItems((prev) =>
          prev.filter((item) => !successfullyOrderedProductIds.includes(item.product_variant_id))
        );

        if (selectedPaymentMethod === "momo" && response.data?.data?.payUrl) {
          const payUrl = response.data.data.payUrl;
          if (payUrl.startsWith("https://")) {
            window.open(payUrl, "_self");
          } else {
            toast.error("Liên kết thanh toán MoMo không hợp lệ.");
          }
        } else {
          toast.success("Đặt hàng thành công!");
          navigate("/cart");
        }
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      const serverMessage = error.response?.data?.message;

      if (serverMessage?.includes("Giao dịch bị từ chối")) {
        toast.error("Giao dịch bị từ chối: Vui lòng kiểm tra tài khoản thanh toán hoặc dùng phương thức khác.");
      } else if (serverMessage?.includes("Số tiền thanh toán không hợp lệ")) {
        toast.error("Số tiền thanh toán không hợp lệ: phải từ 10.000đ đến 50.000.000đ.");
      } else {
        toast.error(serverMessage || "Có lỗi xảy ra khi đặt hàng.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateShippingFee = async () => {
    if (!defaultAddress) {
      setFinalData(prev => ({
        ...prev,
        shippingFee: 0,
        shippingService: "Chưa có địa chỉ",
        formattedAmount: prev.total.toLocaleString("vi-VN")
      }));
      return;
    }

    try {
      const toProvinceId = await getProvinceIdByName(defaultAddress.city);
      if (!toProvinceId) throw new Error("Không tìm thấy mã tỉnh");

      const toDistrictId = await getDistrictIdByProvinceAndName(toProvinceId, defaultAddress.district);
      if (!toDistrictId) throw new Error("Không tìm thấy mã quận");

      const toWardCode = await getWardCodeByDistrictAndName(toDistrictId, defaultAddress.ward);
      if (!toWardCode) throw new Error("Không tìm thấy mã phường");

      const warehouse = {
        from_province_id: 220,
        from_district_id: 1574,
        from_ward_code: "550110"
      };

      const servicePriority = [
        { id: 53320, name: "Giao hàng tiêu chuẩn" },
        { id: 53322, name: "Giao hàng hỏa tốc" }
      ];

      for (const service of servicePriority) {
        try {
          const response = await axios.post(`${Constants.DOMAIN_API}/shipping/shipping-fee`, {
            from_district_id: warehouse.from_district_id,
            from_ward_code: warehouse.from_ward_code,
            to_district_id: Number(toDistrictId),
            to_ward_code: toWardCode,
            service_id: service.id,
            weight: 500,
            length: 20,
            width: 20,
            height: 15
          });

          if (response.data.success) {
            const shippingFee = response.data.data.total;
            const total = checkoutItems.reduce(
              (sum, item) => sum + parseFloat(item.variant.price || 0) * item.quantity,
              0
            ) + shippingFee;

            setFinalData({
              total: total,
              shippingFee: shippingFee,
              shippingService: service.name,
              formattedAmount: total.toLocaleString("vi-VN")
            });
            return;
          }
        } catch (error) {
          console.warn(`Dịch vụ ${service.name} không khả dụng:`, error.message);
        }
      }

      setFinalData(prev => ({
        ...prev,
        shippingFee: 0,
        shippingService: "Không hỗ trợ giao hàng tới khu vực này",
        formattedAmount: prev.total.toLocaleString("vi-VN")
      }));

    } catch (error) {
      console.error("Lỗi tính phí vận chuyển:", error);
      setFinalData(prev => ({
        ...prev,
        shippingFee: 0,
        shippingService: "Lỗi tính phí",
        formattedAmount: prev.total.toLocaleString("vi-VN")
      }));
    }
  };

  const getServiceName = (serviceId) => {
    const services = {
      53320: "Tiêu chuẩn",
      53321: "Tiết kiệm",
      53322: "Hỏa tốc"
    };
    return services[serviceId] || `Dịch vụ ${serviceId}`;
  };

  useEffect(() => {
    if (defaultAddress) {
      calculateShippingFee();
    }
  }, [defaultAddress]);

  useEffect(() => {
    const subTotal = checkoutItems.reduce(
      (sum, item) => sum + parseFloat(item.variant.price || 0) * item.quantity,
      0
    );

    setFinalData(prev => ({
      ...prev,
      total: subTotal,
      formattedAmount: (subTotal + prev.shippingFee).toLocaleString("vi-VN")
    }));

    if (defaultAddress) {
      calculateShippingFee();
    }
  }, [checkoutItems, defaultAddress]);

  useEffect(() => {
    if (defaultAddress) {
      calculateShippingFee();
    }
  }, [defaultAddress]);

  if (!id) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Bạn cần đăng nhập để thanh toán</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div childrenClasses="pt-0 pb-0">
      <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
        <div className="checkout-main-content w-full">
          <div className="container-x mx-auto">
            <div className="w-full lg:flex lg:space-x-[30px]">
              <div className="lg:w-1/2 w-full">
                <h1 className="sm:text-2xl text-xl text-qblack font-medium mb-5">
                  Chi tiết đơn hàng
                </h1>
                <div className="form-area">
                  <form className="w-full px-10 py-[30px] border border-[#EDEDED]">
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên*</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={user?.name || ""}
                          onChange={(e) => setUser({ ...user, name: e.target.value })}
                          className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          required
                        />
                        {user?.name && (
                          <span
                            onClick={() => setUser({ ...user, name: "" })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-sm"
                          >
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
                        <input
                          type="email"
                          placeholder="example@example.com"
                          value={user?.email || ""}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại*</label>
                        <input
                          type="tel"
                          placeholder="0909xxxxxx"
                          value={user?.phone || ""}
                          onChange={(e) => setUser({ ...user, phone: e.target.value })}
                          className="w-full h-[44px] px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
                      <textarea
                        placeholder="Ví dụ: Giao hàng sau 17h, không gọi điện..."
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                        rows="3"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ*</label>

                      <div className="w-full p-4 border border-gray-200 rounded-lg bg-white shadow-sm relative">
                        <button
                          type="button"
                          onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                          className="absolute top-2 right-3 text-blue-500 text-xl font-bold z-10"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            className={`transition-transform duration-300 ${showAddressDropdown ? "rotate-180" : ""}`}
                          >
                            {showAddressDropdown ? (
                              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z" />
                            ) : (
                              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                            )}
                          </svg>
                        </button>

                        {!showAddressDropdown && defaultAddress ? (
                          <div className="flex items-center space-x-2">
                            <div className="text-red-500">
                              <FontAwesomeIcon icon={faMapMarkerAlt} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-sans font-semibold text-black text-base leading-5 truncate">
                                {user?.name} (+84) {user?.phone}
                              </p>
                              <p className="font-sans text-gray-600 text-sm leading-5">
                                {defaultAddress.address_line}, Việt Nam
                              </p>
                            </div>
                            <i className="fas fa-chevron-right text-gray-400 text-base"></i>
                          </div>
                        ) : null}

                        {showAddressDropdown && (
                          <>
                            <div className="flex items-center justify-between mt-2 mb-4">
                              <button
                                type="button"
                                className="px-2 py-1 text-gray-500 rounded-md hover:text-gray-700 transition duration-200 ease-in-out text-sm flex items-center space-x-1 "
                                onClick={() => showAddressModalDiaLog()}
                              >
                                <span>+ Thêm địa chỉ mới</span>
                              </button>
                            </div>

                            <div className="mt-2 border-t pt-4">
                              {allAddresses.length > 0 ? (
                                allAddresses.map((address) => (
                                  <div key={address.id} className="mb-4 border-b pb-3 last:border-b-0">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-semibold">{user?.name} (+84) {user?.phone}</p>
                                        <p>{`${address.address_line}, Việt Nam`}</p>
                                        {address.is_default === 1 ? (
                                          <span className="inline-block px-2 py-1 bg-gray-200 text-gray-500 rounded-sm mt-1">
                                            Mặc định
                                          </span>
                                        ) : (
                                          <button type="button"
                                            onClick={() => confirmSetDefaultAddress(address.id)}
                                            className="text-green-500 hover:text-green-700 text-sm"
                                          >
                                            Đặt làm mặc định
                                          </button>
                                        )}
                                      </div>
                                      <div className="flex flex-col space-y-1">
                                        <button
                                          type="button"
                                          onClick={() => showAddressModalDiaLog(address)}
                                          className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                          Sửa
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 px-3">Chưa có địa chỉ nào.</p>
                              )}
                            </div>
                          </>
                        )}

                        {!defaultAddress && !showAddressDropdown && (
                          <div className="text-gray-500">Chưa có địa chỉ mặc định</div>
                        )}
                      </div>

                    </div>
                  </form>
                </div>
              </div>

              <div className="w-full px-10 py-[30px] border border-[#EDEDED]">
                <ul className="flex flex-col space-y-5">
                  {checkoutItems.length > 0 ? (
                    <ul className="space-y-4">
                      {checkoutItems.map((item) => {
                        const variant = item.variant;
                        const price = parseFloat(variant.price || 0);
                        const quantity = item.quantity;
                        const total = price * quantity;
                        const attributes = variant.attributeValues;
                        const image = variant?.images?.[0]?.image_url || "";

                        return (
                          <li key={item.id} className=" pb-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="w-[80px] h-[80px] flex justify-center items-center border border-[#EDEDED] overflow-hidden">
                                <img
                                  src={image}
                                  alt="product"
                                  className="w-full h-full object-contain"
                                />
                              </div>

                              <div className="flex-1 space-y-1">
                                <p className="font-medium text-[15px] text-qblack">{variant.sku}</p>

                                <div className="space-y-1">
                                  {attributes.map((attr) => {
                                    const attrName = attr.attribute?.name;
                                    const attrValue = attr.value;
                                    const isColor = attrName.toLowerCase() === "color";

                                    return (
                                      <div key={attr.id} className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{attrName}:</span>
                                        {isColor ? (
                                          <span
                                            className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: attrValue }}
                                          ></span>
                                        ) : (
                                          <span>{attrValue}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                <p className="text-sm text-gray-700">
                                  Số lượng: <strong>{quantity}</strong>
                                </p>
                              </div>

                              <div className="text-right min-w-[100px]">
                                <span className="text-lg font-bold text-qred block">
                                  {total.toLocaleString("vi-VN")}₫
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-red-500">Không có sản phẩm nào được chọn.</p>
                  )}
                </ul>
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <div className="text-right">
                      {finalData.shippingService === "Đang tính..." ? (
                        <span className="text-gray-500 text-sm">Đang tính phí...</span>
                      ) : (
                        <>
                          <span className="font-semibold">
                            {finalData.shippingFee ? `${finalData.shippingFee.toLocaleString("vi-VN")}₫` : 'Không hỗ trợ'}
                          </span>
                          {finalData.shippingService && (
                            <span className="text-xs text-gray-500 block">({finalData.shippingService})</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Hiển thị tổng cộng */}
                  <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <span className="text-lg font-bold">Tổng cộng:</span>
                    <span className="text-xl font-bold text-qred">
                      {finalData.formattedAmount || "0"}₫
                    </span>
                  </div>
                </div>

                <div className="shipping mt-[30px]">
                  <ul className="flex flex-col space-y-1">
                    <li>
                      <div className="flex space-x-2.5 items-center mb-5">
                        <div className="input-radio">
                          <input
                            type="radio"
                            name="payment_method"
                            value="momo"
                            defaultChecked
                          />
                        </div>
                        <label id="momo" className="text-[18px] text-normal text-qblack">
                          MoMo
                        </label>
                      </div>
                    </li>
                    <li>
                      <div className="flex space-x-2.5 items-center mb-5">
                        <div className="input-radio">
                          <input
                            type="radio"
                            name="payment_method"
                            value="VNPay"
                          />
                        </div>
                        <label htmlFor="vnpay" className="text-[18px] text-normal text-qblack">
                          VNPay
                        </label>
                      </div>
                    </li>
                    <li>
                      <div className="flex space-x-2.5 items-center mb-5">
                        <div className="input-radio">
                          <input
                            type="radio"
                            name="payment_method"
                            value="COD"
                            defaultChecked
                          />
                        </div>
                        <label htmlFor="cod" className="text-[18px] text-normal text-qblack">
                          Thanh toán khi nhận hàng
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full h-[50px] black-btn flex justify-center items-center mt-4"
                >
                  <span className="text-sm font-semibold">Đặt hàng ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}