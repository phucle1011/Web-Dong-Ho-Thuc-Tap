import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Constants from "../../../Constants";
import Swal from "sweetalert2";
import axios from 'axios';
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [allAddresses, setAllAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const users = JSON.parse(localStorage.getItem("user"));
  const id = users?.id;
  const [finalData, setFinalData] = useState({
    total: 0,
    shippingFee: 0,
    shippingService: "Đang tính...",
    formattedAmount: "0",
  });
    const [discountInfo, setDiscountInfo] = useState(null);
  const [finalTotal, setFinalTotal] = useState(0);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Shipping state
  const [shippingData, setShippingData] = useState({
    fee: 0,
    service: "Đang tính...",
    total: 0
  });

  useEffect(() => {
    if (!location.state && !localStorage.getItem("checkoutData")) {
      toast.error("Không có sản phẩm để thanh toán. Vui lòng quay lại giỏ hàng.");
      navigate("/cart");
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let items = [];
    let savedTotalPrice = 0;

    if (location.state?.cartItems && location.state.cartItems.length > 0) {
      items = location.state.cartItems;
      savedTotalPrice = location.state.totalPrice || 0;
      localStorage.setItem(
        "checkoutData",
        JSON.stringify({
          cartItems: items,
          totalPrice: savedTotalPrice
        })
      );
    } else {
      const savedData = localStorage.getItem("checkoutData");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          items = parsedData.cartItems || [];
          savedTotalPrice = parsedData.totalPrice || 0;
        } catch (error) {
          console.error("Lỗi parse dữ liệu từ localStorage:", error);
          toast.error("Dữ liệu giỏ hàng không hợp lệ. Vui lòng quay lại giỏ hàng.");
          navigate("/cart");
        }
      }
    }

    setCheckoutItems(items);
    setTotalPrice(savedTotalPrice);
  }, [location.state]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (user) {
        setUser(user);
      } else {
        toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      }
    } else {
      toast.error("Vui lòng đăng nhập để tiếp tục thanh toán.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchDefaultAddress = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${Constants.DOMAIN_API}/admin/address/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "user": user.id,
          },
        });

        const data = await response.json();

        if (!isMounted) return;

        if (response.ok && data.success && Array.isArray(data.data)) {
          const defaultAddr = data.data.find(addr => addr.is_default === 1);
          setDefaultAddress(defaultAddr || null);
        } else {
          setDefaultAddress(null);
        }
      } catch (error) {
        if (isMounted) {
          setDefaultAddress(null);
        }
      }
    };

    fetchDefaultAddress();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const fetchAllAddresses = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${Constants.DOMAIN_API}/admin/address/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "user": user.id,
        },
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        setAllAddresses(data.data);
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
    }
  };

  useEffect(() => {
    fetchAllAddresses();
  }, [user?.id]);

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
            <label for="swal-address_line" class="form-label">Địa chỉ:</label>
            <input type="text" id="swal-address_line" class="form-control" value="${address?.address_line || ''}">
          </div>
          <div class="mb-4">
            <label for="swal-province" class="form-label">Tỉnh/Thành phố:</label>
            <select id="swal-province" class="form-select">
              <option value="">Chọn tỉnh/thành phố</option>
              ${provinces.map(p => `<option value="${p.ProvinceID}">${p.ProvinceName}</option>`).join("")}
            </select>
          </div>
          <div class="mb-4">
            <label for="swal-district" class="form-label">Quận/Huyện:</label>
            <select id="swal-district" class="form-select" disabled>
              <option value="">Chọn quận/huyện</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="swal-ward" class="form-label">Xã/Phường:</label>
            <select id="swal-ward" class="form-select" disabled>
              <option value="">Chọn xã/phường</option>
            </select>
          </div>
          <div class="form-check mb-3">
            <input type="checkbox" class="form-check-input" id="swal-is_default" ${address?.is_default === 1 ? "checked" : ""}>
            <label class="form-check-label" for="swal-is_default">Đặt làm địa chỉ mặc định</label>
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

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.put(
        `${Constants.DOMAIN_API}/admin/user/${id}/addresses/${addressId}`,
        { is_default: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user": user.id,
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
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      await axios.delete(`${Constants.DOMAIN_API}/delete-to-carts/${variantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "user": user.id,
        },
      });
    } catch (err) {
      console.error(`Không thể xóa sản phẩm ID ${variantId} khỏi giỏ hàng`);
    }
  };

  const calculateShippingFee = async () => {
    setIsCalculatingShipping(true);

    try {

      if (!defaultAddress) {
        setFinalData(prev => {
          const amount = Math.max(0, prev.total - prev.voucherDiscount - prev.promoDiscount);
          return {
            ...prev,
            shippingFee: 0,
            shippingService: "Chưa có địa chỉ",
            formattedAmount: amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
          };
        });
        return;
      }

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
        { "id": 53320, "name": "Giao hàng tiêu chuẩn" },
        { "id": 53322, "name": "Giao hàng hỏa tốc" },
        { "id": 53321, "name": "Giao hàng nhanh" },
        { "id": 53323, "name": "Giao hàng siêu tốc" },
        { "id": 53324, "name": "Giao hàng tiết kiệm" }
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
            const total = totalPrice - (discountInfo?.voucherDiscount || 0) - (discountInfo?.promoDiscount || 0) + shippingFee;

            setFinalData({
              total: totalPrice,
              shippingFee: shippingFee,
              shippingService: service.name,
              promoDiscount: discountInfo?.promoDiscount || 0,
              voucherDiscount: discountInfo?.voucherDiscount || 0,
              formattedAmount: Number(total).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
            });
            return;
          }
        } catch (error) {
          console.warn(`Dịch vụ ${service.name} không khả dụng:`, error.message);
        }
      }

      setFinalData(prev => {
        const amount = Math.max(0, prev.total - prev.voucherDiscount - prev.promoDiscount);
        return {
          ...prev,
          shippingFee: 0,
          shippingService: "Không hỗ trợ giao hàng tới khu vực này",
          formattedAmount: amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
        };
      });

    } catch (error) {
      console.error("Lỗi tính phí vận chuyển:", error);
      setFinalData(prev => ({
        ...prev,
        shippingFee: 0,
        shippingService: "Lỗi tính phí",
        formattedAmount: Number(prev.total - prev.voucherDiscount - prev.promoDiscount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      }));
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  useEffect(() => {
    if (defaultAddress) {
      calculateShippingFee();
    }
  }, [defaultAddress, totalPrice]);

  const updateUserInfo = async (userId, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await axios.put(
        `${Constants.DOMAIN_API}/users/${userId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user": user.id,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Cập nhật thông tin người dùng thất bại");
      return null;
    }
  };

  const handleUserInfoChange = async (field, value) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) return;

    const updatedUser = { ...user, [field]: value };
    setUser(updatedUser);

    const payload = {
      [field]: value
    };

    const updatedUserData = await updateUserInfo(user.id, payload);
    if (updatedUserData) {
      setUser(updatedUserData);
    }
  };

const handleCheckout = async () => {
    console.log("🚀 handleCheckout được gọi");

    if (isSubmitting || isCalculatingShipping) {
      toast.warning("Vui lòng chờ hệ thống tính toán phí vận chuyển...");
      return;
    }

    if (
      finalData.shippingService === "Đang tính..." ||
      finalData.shippingService === "Chưa có địa chỉ"
    ) {
      toast.error("Vui lòng chờ hệ thống tính toán phí vận chuyển hoàn tất hoặc thêm địa chỉ giao hàng");
      return;
    }

    if (finalData.shippingService === "Không hỗ trợ giao hàng tới khu vực này") {
      toast.error("Rất tiếc, chúng tôi chưa hỗ trợ giao hàng tới địa chỉ của bạn");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedPaymentMethod = (document.querySelector('input[name="payment_method"]:checked')?.value || "").trim();
      console.log("💳 Selected payment method:", selectedPaymentMethod);

      if (!selectedPaymentMethod) {
        toast.error("Vui lòng chọn phương thức thanh toán");
        return;
      }

      // Validate thông tin người dùng
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

      // Chuẩn bị payload
      const payload = {
        products: checkoutItems.map(item => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          price: parseFloat(item.variant.promotion?.discounted_price || item.variant.price || 0)
        })),
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        shipping_address: `${defaultAddress.address_line}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.city}`,
        note: noteValue,
        payment_method: selectedPaymentMethod,
        shipping_fee: finalData.shippingFee,
        total_amount: finalData.total + finalData.shippingFee,
        status: selectedPaymentMethod === "COD" ? "pending" : "paid"
      };

      console.log("📤 Gửi đơn hàng với payload:", payload);

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Xử lý từng phương thức thanh toán
      let response;
      if (selectedPaymentMethod === "VNPay") {
        response = await axios.post(`${Constants.DOMAIN_API}/orders/vnpay`, payload, config);
      } else if (selectedPaymentMethod === "momo") {
        response = await axios.post(`${Constants.DOMAIN_API}/orders/momo`, payload, config);
      } else {
        // COD và các phương thức khác
        response = await axios.post(`${Constants.DOMAIN_API}/orders`, payload, config);
      }

      console.log("📩 Response từ server:", response.data);

      if (response.data.success) {
        // Xóa sản phẩm đã đặt hàng khỏi giỏ hàng
        const orderedIds = checkoutItems.map(item => item.product_variant_id);
        for (const variantId of orderedIds) {
          await deleteCartItem(variantId);
        }

        // Xử lý chuyển hướng cho các phương thức thanh toán online
        if (selectedPaymentMethod === "VNPay" && response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
          return;
        }

        if (selectedPaymentMethod === "momo" && response.data.payUrl) {
          window.open(response.data.payUrl, "_self");
          return;
        }

        // Thông báo thành công và chuyển hướng
        toast.success("Đặt hàng thành công! Mã đơn hàng: " + response.data.order_code);
        navigate("/order-success", { 
          state: { 
            orderId: response.data.order_id,
            orderCode: response.data.order_code 
          } 
        });
      } else {
        throw new Error(response.data.message || "Đặt hàng không thành công");
      }
    } catch (error) {
      console.error("❌ Lỗi đặt hàng:", error);
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Lỗi khi đặt hàng: ${errorMsg}`);
      
      // Hiển thị chi tiết lỗi trong console để debug
      if (error.response) {
        console.error("Chi tiết lỗi từ server:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div childrenClasses="pt-0 pb-0">
      <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
        <div className="w-full mb-5">
          <div
            title="Thanh toán"
            breadcrumb={[
              { name: "trang chủ", path: "/" },
              { name: "thanh toán", path: "/checkout" },
            ]}
          />
        </div>
        <div className="checkout-main-content w-full">
          <div className="container mx-auto">
            <div className="row">
              <div className="col-lg-6 col-md-12 mb-4">
                <h1 className="h2 mb-4 mt-5">Chi tiết đơn hàng</h1>
                <div className="card">
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Họ và tên*</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nguyễn Văn A"
                        value={user?.name || ""}
                        onChange={(e) => handleUserInfoChange("name", e.target.value)}
                        required
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Email*</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="example@example.com"
                          value={user?.email || ""}
                          onChange={(e) => handleUserInfoChange("email", e.target.value)}
                          disabled
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Số điện thoại*</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="0909xxxxxx"
                          value={user?.phone || ""}
                          onChange={(e) => handleUserInfoChange("phone", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Ghi chú (tùy chọn)</label>
                      <textarea
                        className="form-control"
                        placeholder="Ví dụ: Giao hàng sau 17h, không gọi điện..."
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        rows="3"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-medium text-muted">Địa chỉ*</label>

                      <div className="w-100 p-3 border border-light rounded bg-white shadow-sm position-relative">
                        <button
                          type="button"
                          onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                          className="btn btn-sm position-absolute top-0 end-0 mt-2 me-2 text-primary fw-bold z-3"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            className={`transition-transform ${showAddressDropdown ? "rotate-180" : ""}`}
                          >
                            {showAddressDropdown ? (
                              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z" />
                            ) : (
                              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                            )}
                          </svg>
                        </button>

                        {/* Hiển thị địa chỉ mặc định */}
                        {!showAddressDropdown && defaultAddress ? (
                          <div className="d-flex align-items-center gap-2">
                            <div className="flex-grow-1 overflow-hidden">
                              <p className="fw-semibold text-dark text-truncate mb-1">
                                {user?.name} (+84) {user?.phone}
                              </p>
                              <p className="text-muted small mb-0">
                                {defaultAddress.address_line}, Việt Nam
                              </p>
                            </div>
                            <i className="fas fa-chevron-right text-secondary"></i>
                          </div>
                        ) : null}

                        {/* Dropdown địa chỉ */}
                        {showAddressDropdown && (
                          <>
                            <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
                              <button
                                type="button"
                                className="btn btn-sm btn-link p-0 text-muted"
                                onClick={() => showAddressModalDiaLog()}
                              >
                                + Thêm địa chỉ mới
                              </button>
                            </div>

                            <hr className="my-2" />

                            {allAddresses.length > 0 ? (
                              allAddresses.map((address) => (
                                <div key={address.id} className="mb-3 border-bottom pb-2">
                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <p className="fw-semibold mb-1">
                                        {user?.name} (+84) {user?.phone}
                                      </p>
                                      <p className="mb-1">{`${address.address_line}, Việt Nam`}</p>
                                      {address.is_default === 1 ? (
                                        <span className="badge bg-light text-muted">Mặc định</span>
                                      ) : (
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-link text-success ps-0"
                                          onClick={() => confirmSetDefaultAddress(address.id)}
                                        >
                                          Đặt làm mặc định
                                        </button>
                                      )}
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => showAddressModalDiaLog(address)}
                                        className="btn btn-sm btn-link text-danger"
                                      >
                                        Sửa
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted">Chưa có địa chỉ nào.</p>
                            )}
                          </>
                        )}

                        {/* Khi không có địa chỉ mặc định */}
                        {!defaultAddress && !showAddressDropdown && (
                          <div className="text-muted">Chưa có địa chỉ mặc định</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div className="col-lg-6 col-md-12">
                <h1 className="h2 mb-4 mt-5">Tóm tắt đơn hàng</h1>
                <div className="card">
                  <div className="card-body">
                    {checkoutItems.length > 0 ? (
                      <ul className="list-group list-group-flush mb-4">
                        {checkoutItems.map((item) => {
                          const variant = item.variant;
                          const originalPrice = parseFloat(variant.price || 0);
                          const price = parseFloat(variant.promotion?.discounted_price || variant.price || 0);
                          const discountPercent = parseFloat(variant.promotion?.discount_percent || 0);
                          const quantity = item.quantity;
                          const total = price * quantity;
                          const attributes = variant.attributeValues;
                          const image = variant?.images?.[0]?.image_url || "";

                          return (
                            <li key={item.id} className="list-group-item py-3">
                              <div className="d-flex gap-3">
                                <div className="flex-shrink-0">
                                  <div className="border rounded" style={{ width: '80px', height: '80px' }}>
                                    <img
                                      src={image}
                                      alt="product"
                                      className="w-100 h-100 object-fit-contain"
                                    />
                                  </div>
                                </div>
                                <div className="flex-grow-1">
                                  <p className="fw-bold mb-1">{variant.sku}</p>
                                  <div className="mb-2">
                                    {attributes.map((attr) => {
                                      const attrName = attr.attribute?.name;
                                      const attrValue = attr.value;
                                      const isColor = attrName.toLowerCase() === "color";

                                      return (
                                        <div key={attr.id} className="d-flex align-items-center gap-2 small text-muted">
                                          <span>{attrName}:</span>
                                          {isColor ? (
                                            <span
                                              className="d-inline-block rounded-circle border"
                                              style={{
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: attrValue
                                              }}
                                            ></span>
                                          ) : (
                                            <span>{attrValue}</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <p className="small text-muted mb-1">
                                    Số lượng: <strong>{quantity}</strong>
                                  </p>
                                  <div>
                                    <span className={`fw-bold ${discountPercent > 0 ? "text-danger" : ""}`}>
                                      {Number(price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </span>
                                    {discountPercent > 0 && price < originalPrice && (
                                      <span className="text-muted text-decoration-line-through small ms-2">
                                        {Number(originalPrice).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <span className="fw-bold text-danger">
                                    {Number(total).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                  </span>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-danger">Không có sản phẩm nào được chọn.</p>
                    )}

                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Tổng tiền:</span>
                        <span className="fw-bold">
                          {Number(totalPrice).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Phí vận chuyển:</span>
                        <div className="text-end">
                          {isCalculatingShipping ? (
                            <div className="d-flex align-items-center justify-content-end">
                              <span className="text-muted small me-2">Đang tính phí...</span>
                              <div className="spinner-border spinner-border-sm text-muted" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="fw-bold">
                                {shippingData.fee ? `${Number(shippingData.fee).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}` : 'Không hỗ trợ'}
                              </span>
                              {shippingData.service && (
                                <span className="text-muted small d-block">({shippingData.service})</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between border-top pt-2 mt-2">
                        <span className="fw-bold fs-5">Tổng cộng:</span>
                        <span className="fw-bold fs-5 text-danger">
                          {Number(shippingData.total).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="h6 mb-3">Phương thức thanh toán</h3>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="payment_method"
                          value="momo"
                          id="momo"
                          defaultChecked
                        />
                        <label className="form-check-label" htmlFor="momo">
                          MoMo
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="payment_method"
                          value="VNPay"
                          id="vnpay"
                        />
                        <label className="form-check-label" htmlFor="vnpay">
                          VNPay
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="payment_method"
                          value="COD"
                          id="cod"
                        />
                        <label className="form-check-label" htmlFor="cod">
                          Thanh toán khi nhận hàng
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={isSubmitting || isCalculatingShipping}
                      className={`btn btn-dark w-100 mt-3 ${isSubmitting || isCalculatingShipping ? "disabled" : ""}`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang xử lý...
                        </>
                      ) : (
                        "Đặt hàng ngay"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}