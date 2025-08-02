import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Constants from "../../../Constants";
import { Star, StarHalf, Star as StarOutline } from "lucide-react";
import { toast } from "react-toastify";
import { decodeToken } from "../Helpers/jwtDecode";

/* ========== Helpers ========== */
const toText = (val) => {
  if (val == null) return "";
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object" && val.name) return val.name;
  return "";
};
const toVND = (n) => {
  const num = Number.isFinite(n) ? n : parseFloat(n);
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") + "₫" : "0₫";
};

export default function ProductDetail() {
  const { id } = useParams();

  const [productData, setProductData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantImages, setVariantImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ========== Fetch product + variants (2 API) ========== */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1) Product
        const productRes = await axios.get(`${Constants.DOMAIN_API}/products/${id}`);
        const product = productRes.data?.data ?? productRes.data;
        if (!product) {
          toast.error("Sản phẩm không tồn tại");
          setProductData(null);
          return;
        }
        setProductData(product);

        // 2) Variants
        const variantRes = await axios.get(`${Constants.DOMAIN_API}/products/${id}/variants`);
        const list = Array.isArray(variantRes.data?.data) ? variantRes.data.data : [];
        setVariants(list);

        // Default select
        if (list.length > 0) {
          const first = list[0];
          setSelectedVariant(first);
          const imgs = first?.images || [];
          setVariantImages(imgs);
          setSelectedImage(
            imgs[0]?.image_url || product?.thumbnail || product?.image || ""
          );
        } else {
          setVariantImages([]);
          setSelectedImage(product?.thumbnail || product?.image || "");
        }
      } catch {
        toast.error("Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  /* ========== Rating theo biến thể chọn ========== */
  useEffect(() => {
    if (selectedVariant) {
      const avg = Number(selectedVariant.averageRating) || 0;
      const count = parseInt(selectedVariant.ratingCount || 0, 10);
      setAvgRating(avg);
      setRatingCount(Number.isFinite(count) ? count : 0);
    } else {
      setAvgRating(0);
      setRatingCount(0);
    }
  }, [selectedVariant]);

  /* ========== Handlers ========== */
  const handleVariantSelect = (v) => {
    if (!v) return;
    setSelectedVariant(v);
    const imgs = v?.images || [];
    setVariantImages(imgs);
    setSelectedImage(
      imgs[0]?.image_url || productData?.thumbnail || productData?.image || ""
    );
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn biến thể");
      return;
    }
    if (quantity > (selectedVariant.stock ?? 0)) {
      toast.error(`Chỉ còn ${selectedVariant.stock ?? 0} sản phẩm`);
      return;
    }

    const token = localStorage.getItem("token");
    const userId = decodeToken(token)?.id;
    if (!token || !userId) {
      toast.error("Bạn cần đăng nhập để mua hàng");
      return;
    }

    try {
      await axios.post(
        `${Constants.DOMAIN_API}/add-to-carts`,
        { userId, productVariantId: selectedVariant.id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      const msg = error?.response?.data?.message || "Có lỗi khi thêm giỏ hàng";
      toast.error(msg);
    }
  };

  const renderStars = (avg) => {
    const full = Math.floor(avg);
    const half = avg % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`s-f-${i}`} className="text-yellow-400 w-4 h-4" />
        ))}
        {half && <StarHalf className="text-yellow-400 w-4 h-4" />}
        {Array.from({ length: empty }).map((_, i) => (
          <StarOutline key={`s-e-${i}`} className="text-gray-300 w-4 h-4" />
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="h-[520px] bg-gray-100 animate-pulse rounded" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 bg-gray-100 animate-pulse w-3/4 rounded" />
            <div className="h-4 bg-gray-100 animate-pulse w-1/3 rounded" />
            <div className="h-40 bg-gray-100 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  /* ========== Tính giá hiển thị ========== */
  const showPrice = (v) => {
    const sale = Number(v?.final_price);
    const base = Number(v?.price);
    return {
      sale: Number.isFinite(sale) ? sale : Number.isFinite(base) ? base : 0,
      base: Number.isFinite(base) ? base : undefined,
    };
  };
  const price = selectedVariant ? showPrice(selectedVariant) : { sale: 0, base: undefined };

  /* ========== UI ========== */
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <span className="hover:text-gray-700 cursor-pointer">Trang chủ</span>
        <span className="mx-2">/</span>
        <span className="hover:text-gray-700 cursor-pointer">Sản phẩm</span>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{toText(productData.name)}</span>
      </nav>

      <section className="grid lg:grid-cols-12 gap-8">
        {/* LEFT: Gallery */}
        <div className="lg:col-span-7">
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="aspect-[4/3] min-h-[420px] flex items-center justify-center bg-white">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt=""
                  className="max-h-[560px] w-auto object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">Không có ảnh</span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="p-3 border-t">
              <div className="flex gap-3 overflow-x-auto">
                {variantImages.map((img, idx) => (
                  <button
                    type="button"
                    key={img?.id ?? idx}
                    onClick={() => img?.image_url && setSelectedImage(img.image_url)}
                    className={`w-20 h-20 border rounded overflow-hidden flex-shrink-0 ${
                      selectedImage && img?.image_url === selectedImage
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    {img?.image_url ? (
                      <img
                        src={img.image_url}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 m-auto">
                        No image
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <p className="uppercase text-xs tracking-wider text-gray-500">Đồng hồ</p>
            <h1 className="text-2xl font-semibold text-gray-900">
              {toText(productData.name)}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              {renderStars(avgRating)}
              <span className="text-sm text-gray-500">{ratingCount} đánh giá</span>
            </div>
          </div>

          {/* Giá */}
          {selectedVariant && (
            <div className="mt-2">
              <div className="inline-flex items-baseline gap-3 px-4 py-2 border rounded-lg">
                <div className="text-red-600 font-bold text-2xl">
                  {toVND(price.sale)}
                </div>
                {price.base && price.base > price.sale && (
                  <div className="text-gray-400 line-through">{toVND(price.base)}</div>
                )}
                <div className="text-sm text-gray-600">
                  Còn lại: {selectedVariant?.stock ?? 0}
                </div>
              </div>
            </div>
          )}

          {/* Biến thể */}
          <div>
            <h3 className="uppercase text-sm font-semibold text-gray-600 mb-2">
              Biến thể
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {variants.map((v) => {
                const active = selectedVariant?.id === v.id;
                const p = showPrice(v);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVariantSelect(v)}
                    className={`text-left border rounded-xl p-3 transition ${
                      active ? "border-blue-600 ring-2 ring-blue-200" : "hover:shadow"
                    }`}
                  >
                    <p className="font-semibold truncate">
                      {toText(v.name) || toText(v.sku) || "Biến thể"}
                    </p>
                    <p className="text-red-600 font-bold">{toVND(p.sale)}</p>
                    {p.base && p.base > p.sale && (
                      <p className="text-xs text-gray-500 line-through">
                        {toVND(p.base)}
                      </p>
                    )}
                    <p className="text-xs mt-1">
                      {(v.stock ?? 0) > 0 ? `Còn lại: ${v.stock}` : "Hết hàng"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Số lượng + Thêm giỏ hàng */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center border rounded-lg overflow-hidden">
              <button
                type="button"
                className="px-3 py-2 text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
              >
                −
              </button>
              <span className="px-4 py-2 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                className="px-3 py-2 text-lg"
                onClick={() =>
                  setQuantity((q) =>
                    selectedVariant
                      ? Math.min(q + 1, selectedVariant.stock ?? q + 1)
                      : q + 1
                  )
                }
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant || (selectedVariant?.stock ?? 0) <= 0}
              className={`h-11 px-6 rounded-lg font-semibold text-white transition ${
                !selectedVariant || (selectedVariant?.stock ?? 0) <= 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              Thêm giỏ hàng
            </button>
          </div>

          {/* Thuộc tính */}
          {selectedVariant && Array.isArray(selectedVariant.attributeValues) && (
            <div className="pt-2">
              <h4 className="font-semibold mb-2">Thuộc tính của biến thể:</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border text-left w-1/3">Tên thuộc tính</th>
                      <th className="p-2 border text-left">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVariant.attributeValues.map((attr, idx) => {
                      const name = toText(attr?.attribute?.name);
                      const value = toText(attr?.value);
                      const isColor = (name || "").toLowerCase() === "color";
                      return (
                        <tr key={idx} className="odd:bg-white even:bg-gray-50">
                          <td className="p-2 border">{name || "Thuộc tính"}</td>
                          <td className="p-2 border">
                            {isColor && value ? (
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className="w-5 h-5 rounded border"
                                  style={{ background: value }}
                                  title={value}
                                />
                                
                              </span>
                            ) : (
                              value || "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="text-sm text-gray-600">
            <p>
              Danh mục: <b>{toText(productData.category)}</b>
            </p>
          </div>
        </div>
      </section>

      {/* Mô tả đầy đủ (nếu có) */}
      {productData.description && (
        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-3">Mô tả sản phẩm</h3>
          <div
            className="prose max-w-none prose-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: productData.description }}
          />
        </section>
      )}
    </main>
  );
}
