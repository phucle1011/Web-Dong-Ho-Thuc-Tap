import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Constants from "../../../Constants";
import { Star, StarHalf, Star as StarOutline } from "lucide-react";
import { toast } from "react-toastify";

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
  const { id: productId } = useParams();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const orderDetailId = query.get("orderDetailId");

  // === User ID từ localStorage ===
  const [currentUserId, setCurrentUserId] = useState(null);
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    const u = userJson ? JSON.parse(userJson) : null;
    setCurrentUserId(u?.id ?? null);
  }, []);

  // === State sản phẩm & variants ===
  const [productData, setProductData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantImages, setVariantImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // === State bình luận ===
  const [commentsList, setCommentsList]         = useState([]);
  const [newCommentText, setNewCommentText]     = useState("");
  const [newCommentRating, setNewCommentRating] = useState(0);

  /* ========== Fetch product + variants ========== */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1) Product
        const { data: pr } = await axios.get(
          `${Constants.DOMAIN_API}/products/${productId}`
        );
        const product = pr.data ?? pr;
        if (!product) {
          toast.error("Sản phẩm không tồn tại");
          return setProductData(null);
        }
        setProductData(product);

        // 2) Variants
        const { data: vr } = await axios.get(
          `${Constants.DOMAIN_API}/products/${productId}/variants`
        );
        const list = Array.isArray(vr.data) ? vr.data : [];
        setVariants(list);

        // 3) Chọn biến thể đầu tiên
        if (list.length > 0) {
          const first = list[0];
          setSelectedVariant(first);
          const imgs = first.images || [];
          setVariantImages(imgs);
          setSelectedImage(imgs[0]?.image_url || product.thumbnail || "");
        } else {
          setVariantImages([]);
          setSelectedImage(product.thumbnail || "");
        }
      } catch {
        toast.error("Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [productId]);

  /* ========== Fetch bình luận ========== */
  useEffect(() => {
    async function fetchComments() {
      try {
        const { data: cr } = await axios.get(
          `${Constants.DOMAIN_API}/comments/product/${productId}`
        );
        setCommentsList(cr.data || []);
      } catch {
        console.error("Lỗi tải bình luận");
      }
    }
    fetchComments();
  }, [productId]);

  /* ========== Cập nhật rating khi đổi biến thể ========== */
  useEffect(() => {
    if (selectedVariant) {
      const avg   = Number(selectedVariant.averageRating) || 0;
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
    setSelectedVariant(v);
    const imgs = v.images || [];
    setVariantImages(imgs);
    setSelectedImage(imgs[0]?.image_url || productData.thumbnail || "");
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      return toast.error("Vui lòng chọn biến thể");
    }
    if (quantity > (selectedVariant.stock ?? 0)) {
      return toast.error(`Chỉ còn ${selectedVariant.stock ?? 0} sản phẩm`);
    }
    if (!currentUserId) {
      return toast.error("Bạn cần đăng nhập để mua hàng");
    }
    try {
      await axios.post(`${Constants.DOMAIN_API}/add-to-carts`, {
        userId:           currentUserId,
        productVariantId: selectedVariant.id,
        quantity
      });
      toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Lỗi thêm vào giỏ hàng");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      return toast.error("Bạn cần đăng nhập để bình luận");
    }
    if (!orderDetailId) {
      return toast.error("Không có đơn hàng liên kết");
    }
    if (!newCommentText.trim()) {
      return toast.error("Nội dung bình luận không được để trống");
    }
    if (newCommentRating < 1 || newCommentRating > 5) {
      return toast.error("Bạn phải đánh giá từ 1 đến 5 sao");
    }
    try {
      await axios.post(`${Constants.DOMAIN_API}/comments`, {
        user_id:         currentUserId,
        order_detail_id: orderDetailId,
        product_id:      productId,
        rating:          newCommentRating,
        comment_text:    newCommentText
      });
      toast.success("Gửi bình luận thành công!");
      setNewCommentText("");
      setNewCommentRating(0);
      const { data: cr } = await axios.get(
        `${Constants.DOMAIN_API}/comments/product/${productId}`
      );
      setCommentsList(cr.data || []);
    } catch {
      toast.error("Gửi thất bại");
    }
  };

  const renderStars = (avg) => {
    const full  = Math.floor(avg);
    const half  = avg % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {Array(full).fill().map((_, i) => (
          <Star key={`f-${i}`} className="w-4 h-4 text-yellow-400" />
        ))}
        {half && <StarHalf className="w-4 h-4 text-yellow-400" />}
        {Array(empty).fill().map((_, i) => (
          <StarOutline key={`e-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </>
    );
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }
  if (!productData) {
    return <div className="p-10 text-center">Không tìm thấy sản phẩm</div>;
  }

  const showPrice = (v) => {
    const sale = Number(v.final_price);
    const base = Number(v.price);
    return {
      sale: Number.isFinite(sale) ? sale : Number.isFinite(base) ? base : 0,
      base: Number.isFinite(base) ? base : undefined
    };
  };
  const price = selectedVariant ? showPrice(selectedVariant) : { sale: 0 };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <span className="hover:text-gray-700 cursor-pointer">Trang chủ</span>
        <span className="mx-2">/</span>
        <span className="hover:text-gray-700 cursor-pointer">Sản phẩm</span>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{toText(productData.name)}</span>
      </nav>

      {/* Product Info */}
      <section className="grid lg:grid-cols-12 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="aspect-[4/3] min-h-[420px] flex items-center justify-center">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt=""
                  className="max-h-[560px] w-auto object-contain"
                />
              ) : (
                <span className="text-gray-400">Không có ảnh</span>
              )}
            </div>
            <div className="p-3 border-t">
              <div className="flex gap-3 overflow-x-auto">
                {variantImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => img.image_url && setSelectedImage(img.image_url)}
                    className={`w-20 h-20 border rounded ${
                      img.image_url === selectedImage ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    {img.image_url ? (
                      <img
                        src={img.image_url}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-5 space-y-4">
          <h1 className="text-2xl font-semibold">{toText(productData.name)}</h1>
          <div className="flex items-center gap-2">
            {renderStars(avgRating)}
            <span className="text-sm text-gray-500">{ratingCount} đánh giá</span>
          </div>
          {selectedVariant && (
            <div className="inline-flex items-baseline gap-3 px-4 py-2 border rounded-lg">
              <div className="text-red-600 font-bold text-2xl">
                {toVND(price.sale)}
              </div>
              {price.base && price.base > price.sale && (
                <div className="text-gray-400 line-through">{toVND(price.base)}</div>
              )}
              <div className="text-sm text-gray-600">
                Còn lại: {selectedVariant.stock ?? 0}
              </div>
            </div>
          )}
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2">Biến thể</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleVariantSelect(v)}
                  className={`border rounded-xl p-3 ${
                    selectedVariant?.id === v.id ? "border-blue-600 ring-2" : "hover:shadow"
                  }`}
                >
                  <p className="truncate font-semibold">{toText(v.name) || toText(v.sku)}</p>
                  <p className="text-red-600 font-bold">{toVND(showPrice(v).sale)}</p>
                  <p className="text-xs mt-1">
                    {(v.stock ?? 0) > 0 ? `Còn lại: ${v.stock}` : "Hết hàng"}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span className="px-4">{quantity}</span>
              <button onClick={() =>
                setQuantity((q) =>
                  selectedVariant
                    ? Math.min(q + 1, selectedVariant.stock ?? q + 1)
                    : q + 1
                )
              }>+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              className={`px-6 py-2 rounded-lg text-white ${
                !selectedVariant || selectedVariant.stock <= 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              Thêm giỏ hàng
            </button>
          </div>
        </div>
      </section>

      {/* Mô tả */}
      {productData.description && (
        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-3">Mô tả sản phẩm</h3>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: productData.description }}
          />
        </section>
      )}

      {/* Bình luận và đánh giá */}
      <section className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold">Bình luận và đánh giá</h2>

        {orderDetailId ? (
  <form onSubmit={handleSubmitComment} className="space-y-4">
    <div>
      <label className="block mb-1">Đánh giá của bạn:</label>
      <select
        value={newCommentRating}
        onChange={(e) => setNewCommentRating(+e.target.value)}
        className="border px-2 py-1 rounded"
      >
        <option value={0}>Chọn sao</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{`${n} sao`}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block mb-1">Nội dung:</label>
      <textarea
        rows={3}
        className="w-full border rounded px-3 py-2"
        placeholder="Viết bình luận..."
        value={newCommentText}
        onChange={(e) => setNewCommentText(e.target.value)}
      />
    </div>
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      Gửi bình luận
    </button>
  </form>
) : (
  <p className="text-sm text-gray-500 italic">
    * Bạn cần mua sản phẩm này để được bình luận.
  </p>
)}


        <div className="space-y-6">
          {commentsList.length > 0 ? (
            commentsList.map((c) => (
              <div key={c.id} className="border-b pb-4">
                <div className="flex justify-between mb-1">
                  <strong>{c.user?.name || "Khách"}</strong>
                  <span className="text-sm text-gray-500">
                    {new Date(c.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  {renderStars(c.rating)}
                </div>
                <p>{c.comment_text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Chưa có bình luận nào.</p>
          )}
        </div>
      </section>
    </main>
  );
}
