const axios = require("axios");
const OrderModel = require("../../models/ordersModel");
const OrderDetail = require("../../models/orderDetailsModel");
const UserModel = require("../../models/usersModel");
const CartModel = require("../../models/cartDetailsModel");
const ProductVariantModel = require("../../models/productVariantsModel");

const querystring = require("querystring");
const moment = require('moment');
const dateFormat = require('dateformat');
const now = new Date();
const { Op } = require("sequelize");
const sequelize = require('../../config/database');

require("dotenv").config();
const nodemailer = require("nodemailer");

const { BACKEND_URL } = require("../../config/url");
const { FRONTEND_URL } = require("../../config/url");

const crypto = require("crypto");
const { log } = require("console");

class OrderController {

    static async get(req, res) {
        const userId = req.user.id;

        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const currentPage = parseInt(page, 10);
        const perPage = parseInt(limit, 10);
        const offset = (currentPage - 1) * perPage;

        try {
            const whereClause = {
                user_id: userId,
            };

            if (startDate || endDate) {
                whereClause.created_at = {};

                if (startDate) {
                    whereClause.created_at[Op.gte] = new Date(startDate);
                }

                if (endDate) {
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    whereClause.created_at[Op.lte] = endOfDay;
                }
            }

            if (status && status !== "all") {
                whereClause.status = status;
            }

            const { count, rows } = await OrderModel.findAndCountAll({
                where: whereClause,
                include: [{ model: UserModel, as: "user" }],
                order: [["created_at", "DESC"]],
                offset,
                limit: perPage,
            });

            const filteredOrders = await OrderModel.findAll({
                where: whereClause,
                include: [{ model: UserModel, as: "user" }],
                order: [["created_at", "DESC"]],
            });

            const statusCounts = {
                all: filteredOrders.length,
                pending: 0,
                confirmed: 0,
                shipping: 0,
                completed: 0,
                delivered: 0,
                cancelled: 0
            };

            filteredOrders.forEach(order => {
                if (statusCounts.hasOwnProperty(order.status)) {
                    statusCounts[order.status]++;
                }
            });

            res.status(200).json({
                status: 200,
                message: "Lấy danh sách thành công",
                data: rows,
                pagination: {
                    totalItems: count,
                    currentPage,
                    totalPages: Math.ceil(count / perPage),
                },
                statusCounts
            });
        } catch (error) {
            console.error(
                "Lỗi khi lấy danh sách đơn hàng:",
                error.message,
                error.stack
            );
            res.status(500).json({
                success: false,
                message: "Lỗi máy chủ.",
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                name,
                status,
                address,
                phone,
                email,
                total_price,
                payment_method_id,
            } = req.body;

            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            if (name !== undefined) order.name = name;
            if (status !== undefined) order.status = status;
            if (address !== undefined) order.address = address;
            if (phone !== undefined) order.phone = phone;
            if (email !== undefined) order.email = email;
            if (total_price !== undefined) order.total_price = total_price;
            if (payment_method_id !== undefined)
                order.payment_method_id = payment_method_id;

            await order.save();

            res.status(200).json({
                status: 200,
                message: "Cập nhật thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async cancelOrder(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { cancellation_reason } = req.body;

            const order = await OrderModel.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            if (order.status !== "pending") {
                return res.status(400).json({
                    message: "Chỉ được hủy đơn hàng có trạng thái là 'Chờ xác nhận'",
                });
            }

            const orderDetails = await OrderDetail.findAll({
                where: { order_id: order.id },
                transaction: t
            });

            for (const detail of orderDetails) {
                const productVariant = await ProductVariantModel.findByPk(detail.product_variant_id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (productVariant) {
                    productVariant.stock += detail.quantity;
                    await productVariant.save({ transaction: t });
                }
            }

            order.status = "cancelled";
            order.cancellation_reason = cancellation_reason || null;
            await order.save();
            await t.commit();

            res.status(200).json({
                status: 200,
                message: "Hủy đơn hàng thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async confirmDelivered(req, res) {
        try {
            const { id } = req.params;

            const order = await OrderModel.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            }

            if (order.status !== "completed") {
                return res.status(400).json({
                    message: "Chỉ được xác nhận giao hàng cho đơn hàng có trạng thái 'Hoàn thành'",
                });
            }

            order.status = "delivered";
            await order.save();

            res.status(200).json({
                status: 200,
                message: "Xác nhận giao hàng thành công",
                data: order,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        const {
            products,
            user_id,
            name,
            phone,
            email,
            address,
            payment_method,
            note,
            shipping_fee,
            cancellation_reason
        } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống." });
        }

        if (!user_id) {
            return res.status(400).json({ message: "Thiếu user_id trong yêu cầu." });
        }

        const t = await sequelize.transaction();
        try {
            let totalPrice = 0;
            const detailedCart = [];

            for (const item of products) {
                const variant = item.variant;
                if (!variant) {
                    await t.rollback();
                    return res.status(400).json({ message: "Thông tin biến thể sản phẩm bị thiếu." });
                }

                const productVariant = await ProductVariantModel.findByPk(variant.id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!productVariant) {
                    await t.rollback();
                    return res.status(400).json({ message: `Biến thể sản phẩm với ID ${variant.id} không tồn tại.` });
                }

                if (productVariant.stock < item.quantity) {
                    await t.rollback();
                    return res.status(400).json({ message: `Sản phẩm ${variant.sku} không đủ số lượng tồn kho.` });
                }

                const price = parseFloat(variant.price);
                totalPrice += price * item.quantity;

                detailedCart.push({
                    variant: variant.id,
                    name: variant.sku,
                    price: price,
                    quantity: item.quantity,
                    total: price * item.quantity,
                });

                productVariant.stock -= item.quantity;
                await productVariant.save({ transaction: t });

            }
            let discountAmount = 0;

            const order_code = `ORD-${Date.now()}`;
            const currentDateTime = new Date(Date.now() + 7 * 60 * 60 * 1000);

            const newOrder = await OrderModel.create({
                user_id,
                name,
                phone,
                email,
                address,
                total_price: totalPrice,
                payment_method,
                order_code,
                shipping_address: address,
                note: note,
                shipping_fee: shipping_fee || 0,
                status: "pending",
                cancellation_reason: note || null,
                shipping_code: null,
                discount_amount: discountAmount,
            }, { transaction: t });

            const orderDetails = detailedCart.map((item) => ({
                order_id: newOrder.id,
                product_variant_id: item.variant,
                quantity: item.quantity,
                price: item.price,
            }));

            await OrderDetail.bulkCreate(orderDetails, { transaction: t });

            await t.commit();

            await OrderController.sendOrderConfirmationEmail(
                newOrder,
                { name, phone },
                products,
                email,
                currentDateTime
            );

            const successfullyOrderedProductIds = products.map(p => p.variant.id);

            return res.status(201).json({
                success: true,
                message: "Đặt hàng thành công.",
                data: {
                    order: newOrder,
                    successfullyOrderedProductIds
                },
            });
        } catch (error) {
            await t.rollback();
            console.error("Lỗi khi tạo đơn hàng:", error.message);
            return res.status(500).json({
                success: false,
                message: "Lỗi máy chủ khi tạo đơn hàng.",
                error: error.message,
            });
        }
    }

    static async createMomoUrl(req, res) {
        const {
            products,
            user_id,
            name,
            phone,
            email,
            address,
            note,
            payment_method,
            shipping_fee,
        } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống." });
        }

        if (!user_id) {
            return res.status(400).json({ message: "Thiếu user_id trong yêu cầu." });
        }

        try {
            let totalPrice = 0;
            const detailedCart = [];

            for (const item of products) {
                const variant = item.variant;
                if (!variant) {
                    return res.status(400).json({ message: "Thông tin biến thể sản phẩm bị thiếu." });
                }

                const price = parseFloat(variant.price);
                totalPrice += price * item.quantity;

                detailedCart.push({
                    product_id: variant.id,
                    name: variant.sku,
                    price: price,
                    quantity: item.quantity,
                    total: price * item.quantity,
                });
            }

            let discountAmount = 0;
            let finalAmount = totalPrice;

            const finalTotalWithShipping = finalAmount + (parseFloat(shipping_fee) || 0);

            const simplifiedProducts = products.map(item => ({
                product_id: item.variant.id,
                price: parseFloat(item.variant.price),
                quantity: item.quantity
            }));

            const order_code = `ORD-${Date.now()}`;
            const extraData = Buffer.from(JSON.stringify({
                user_id,
                name,
                phone,
                email,
                address,
                note,
                products: simplifiedProducts,
                orderId: order_code,
                amount: finalAmount,
                originalAmount: totalPrice,
                discountAmount: discountAmount,
                shipping_fee: shipping_fee || 0
            })).toString("base64");

            const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
            const partnerCode = "MOMOBKUN20180529";
            const accessKey = "klm05TvNBzhg7h7j";
            const secretKey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
            const amount = finalTotalWithShipping.toString();
            const orderId = order_code;
            const requestId = Date.now().toString();

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${BACKEND_URL}/payment-notification&orderId=${orderId}&orderInfo=MoMo&partnerCode=${partnerCode}&redirectUrl=${FRONTEND_URL}/cart&requestId=${requestId}&requestType=payWithATM`;

            const signature = crypto
                .createHmac("sha256", secretKey)
                .update(rawSignature)
                .digest("hex");

            const momoData = {
                partnerCode,
                partnerName: "Test",
                storeId: "MomoTestStore",
                requestId,
                amount,
                orderId,
                orderInfo: "MoMo",
                redirectUrl: `${FRONTEND_URL}/cart`,
                ipnUrl: `${BACKEND_URL}/payment-notification`,
                requestType: "payWithATM",
                extraData,
                lang: "vi",
                signature
            };

            const response = await axios.post(endpoint, momoData, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data && response.data.payUrl) {
                return res.json({
                    success: true,
                    data: {
                        payUrl: response.data.payUrl,
                        order_code: order_code,
                        originalAmount: totalPrice,
                        discountAmount: discountAmount,
                        finalAmount: finalAmount
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Không thể tạo URL thanh toán MoMo.",
                    error: response.data
                });
            }
        } catch (error) {
            if (error.response) {
                const momoError = error.response.data;
                console.error("Lỗi phản hồi MoMo:", momoError);

                if (momoError?.resultCode === 22) {
                    return res.status(400).json({
                        message: "Số tiền thanh toán không hợp lệ: phải từ 10.000đ đến 50.000.000đ.",
                        error: momoError
                    });
                }

                return res.status(400).json({
                    message: "Giao dịch bị từ chối bởi MoMo.",
                    error: momoError
                });
            } else {
                console.error("Lỗi khác:", error.message);

                return res.status(500).json({
                    message: "Lỗi máy chủ khi tạo thanh toán.",
                    error: error.message
                });
            }
        }
    }

    static async momoPaymentNotification(req, res) {
        const { resultCode, orderId, amount, extraData } = req.body;

        if (resultCode !== 0) {
            return res.status(200).json({ message: "Thanh toán thất bại hoặc bị hủy." });
        }

        const t = await sequelize.transaction();

        try {
            const decoded = JSON.parse(Buffer.from(extraData, "base64").toString("utf-8"));
            const {
                user_id,
                name,
                phone,
                email,
                address,
                note,
                products,
                originalAmount,
                discountAmount,
                shipping_fee
            } = decoded;

            if (parseFloat(amount) !== parseFloat(decoded.amount)) {
                console.error("Số tiền không khớp:", {
                    momoAmount: amount,
                    decodedAmount: decoded.amount
                });
                await t.rollback();
                return res.status(400).json({ message: "Số tiền thanh toán không hợp lệ." });
            }

            for (const item of products) {
                const productVariant = await ProductVariantModel.findByPk(item.product_id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!productVariant) {
                    await t.rollback();
                    return res.status(400).json({ message: `Biến thể sản phẩm với ID ${item.product_id} không tồn tại.` });
                }

                if (productVariant.stock < item.quantity) {
                    await t.rollback();
                    return res.status(400).json({ message: `Sản phẩm ID ${item.product_id} không đủ số lượng tồn kho.` });
                }

                productVariant.stock -= item.quantity;
                await productVariant.save({ transaction: t });
            }

            const uniqueOrderCode = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const orderData = {
                user_id,
                total_price: parseFloat(amount),
                discount_amount: parseFloat(discountAmount) || 0,
                payment_method: "Momo",
                order_code: uniqueOrderCode,
                shipping_address: address,
                note: note || "",
                shipping_fee: shipping_fee || 0,
                status: "pending",
                cancellation_reason: null,
                shipping_code: null,
            };

            const newOrder = await OrderModel.create(orderData, {
                transaction: t,
                validate: true
            });

            if (!newOrder || !newOrder.id) {
                throw new Error("Không tạo được đơn hàng (newOrder null)");
            }

            const orderDetails = decoded.products.map((item) => ({
                order_id: newOrder.id,
                product_variant_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
            }));

            await OrderDetail.bulkCreate(orderDetails, { transaction: t });

            const successfullyOrderedProductIds = products.map(p => p.variant?.id || p.product_id);

            await CartModel.destroy({
                where: {
                    user_id: user_id,
                    product_variant_id: successfullyOrderedProductIds
                },
                transaction: t
            });


            await t.commit();

            await OrderController.sendOrderConfirmationEmail(
                newOrder,
                { name, phone },
                products,
                email,
                new Date()
            );

            return res.status(200).json({
                success: true,
                message: "Đơn hàng đã được tạo sau khi thanh toán thành công.",
                data: {
                    order: newOrder,
                    successfullyOrderedProductIds
                }
            });

        } catch (err) {
            if (t && !t.finished) {
                await t.rollback();
            }

            console.error("Lỗi xử lý IPN:", {
                error: err.message,
                errors: err.errors || [],
                stack: err.stack,
                receivedData: req.body
            });

            return res.status(500).json({
                message: "Lỗi xử lý thông báo thanh toán.",
                error: err.message,
                details: err.errors || []
            });
        }
    }

    static sortObject(obj) {
        // Thứ tự chính xác theo yêu cầu VNPay
        const orderedParams = [
            'vnp_Version', 'vnp_Command', 'vnp_TmnCode',
            'vnp_Amount', 'vnp_BankCode', 'vnp_CreateDate',
            'vnp_CurrCode', 'vnp_IpAddr', 'vnp_Locale',
            'vnp_OrderInfo', 'vnp_OrderType', 'vnp_ReturnUrl',
            'vnp_TxnRef', 'vnp_SecureHash', 'vnp_SecureHashType'
        ];

        const sorted = {};
        orderedParams.forEach(key => {
            if (obj[key] !== undefined) {
                sorted[key] = obj[key];
            }
        });
        return sorted;
    }

    static async createVNPayUrl(req, res) {
        try {
            // Validate environment variables
            const requiredEnvVars = ['VNPAY_TMN_CODE', 'VNPAY_HASH_SECRET', 'VNPAY_PAYMENT_URL', 'VNPAY_RETURN_URL'];
            for (const envVar of requiredEnvVars) {
                if (!process.env[envVar]) {
                    throw new Error(`Missing required environment variable: ${envVar}`);
                }
            }

            // Get client IP
            let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket?.remoteAddress;
            ipAddr = ipAddr?.replace('::ffff:', '') || '127.0.0.1';

            // Get config
            const tmnCode = process.env.VNPAY_TMN_CODE.trim();
            const secretKey = process.env.VNPAY_HASH_SECRET.trim();
            const vnpUrl = process.env.VNPAY_PAYMENT_URL.trim();
            const returnUrl = process.env.VNPAY_RETURN_URL.trim();

            // Validate amount
            const amount = Math.floor(Number(req.body.amount));
            if (isNaN(amount)) {
                return res.status(400).json({ code: '03', message: 'Amount must be a number' });
            }
            if (amount <= 0 || amount > 9999999999) {
                return res.status(400).json({ code: '03', message: 'Invalid amount' });
            }

            // Create date and order ID
            const createDate = moment().format("YYYYMMDDHHmmss");
            const orderId = req.body.orderId || `VNPAY-${Date.now()}`;

            // Process order info
            const orderInfo = (req.body.orderDescription || `Thanh toan don hang ${orderId}`)
                .substring(0, 255)
                .replace(/[^a-zA-Z0-9\s]/g, '');

            // Prepare parameters
            const vnpParams = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: tmnCode,
                vnp_Amount: amount * 100,
                vnp_BankCode: req.body.bankCode || '',
                vnp_CreateDate: createDate,
                vnp_CurrCode: 'VND',
                vnp_IpAddr: ipAddr,
                vnp_Locale: req.body.language || 'vn',
                vnp_OrderInfo: orderInfo,
                vnp_OrderType: req.body.orderType || 'other',
                vnp_ReturnUrl: returnUrl,
                vnp_TxnRef: orderId,
                vnp_SecureHashType: 'SHA512'
            };

            // Remove empty values
            Object.keys(vnpParams).forEach(key => {
                if (vnpParams[key] === '' || vnpParams[key] === null || vnpParams[key] === undefined) {
                    delete vnpParams[key];
                }
            });

            // Sort params
            const sortedParams = {};
            Object.keys(vnpParams).sort().forEach(key => {
                sortedParams[key] = vnpParams[key];
            });

            // Create sign data
            const signData = Object.entries(sortedParams)
                .map(([key, val]) => `${key}=${val}`)
                .join('&');

            // Create signature
            const hmac = crypto.createHmac('sha512', secretKey);
            hmac.update(signData);
            const signed = hmac.digest('hex');
            sortedParams.vnp_SecureHash = signed;

            // Create payment URL
            const queryString = Object.entries(sortedParams)
                .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
                .join('&');

            const paymentUrl = `${vnpUrl}?${queryString}`;

            return res.json({
                success: true,
                message: 'success',
                data: {
                    paymentUrl,
                    orderId,
                    amount,
                    returnUrl
                }
            });

        } catch (error) {
            console.error('VNPay Error:', error);
            return res.status(500).json({
                code: '99',
                message: 'System error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async handleVNPayCallback(req, res) {
        try {
            const crypto = require("crypto");
            const vnp_Params = { ...req.query };
            console.log('VNPay Callback Received:', {
                params: vnp_Params,
                headers: req.headers,
                ip: req.ip
            });

            // Check required parameters
            const requiredParams = [
                'vnp_TmnCode',
                'vnp_Amount',
                'vnp_BankCode',
                'vnp_BankTranNo',
                'vnp_CardType',
                'vnp_PayDate',
                'vnp_OrderInfo',
                'vnp_TransactionNo',
                'vnp_ResponseCode',
                'vnp_TransactionStatus',
                'vnp_TxnRef',
                'vnp_SecureHash'
            ];
            const missingParams = requiredParams.filter(param => !vnp_Params[param]);
            if (missingParams.length > 0) {
                console.error('Missing required parameters:', missingParams);
                return res.status(400).json({
                    RspCode: '02',
                    Message: `Thiếu tham số bắt buộc: ${missingParams.join(', ')}`,
                    receivedParams: Object.keys(vnp_Params)
                });
            }

            const secureHash = vnp_Params['vnp_SecureHash'];
            // Clone and remove hash fields before verifying
            const verifyParams = { ...vnp_Params };
            delete verifyParams['vnp_SecureHash'];
            delete verifyParams['vnp_SecureHashType'];
            const sortedParams = OrderController.sortObject(verifyParams);

            const signData = Object.keys(sortedParams)
                .map(key => `${key}=${sortedParams[key]}`)
                .join('&');

            console.log('Sign Data for Verification:', signData);

            // Verify signature
            const hmac = crypto.createHmac("sha512", process.env.VNPAY_HASH_SECRET);
            const signed = hmac.update(signData, 'utf-8').digest("hex");
            console.log('Hash Comparison:', {
                received: secureHash,
                calculated: signed,
                match: secureHash.toLowerCase() === signed.toLowerCase()
            });

            if (!secureHash || secureHash.toLowerCase() !== signed.toLowerCase()) {
                console.error('Invalid signature:', {
                    received: secureHash,
                    calculated: signed,
                    params: vnp_Params,
                    signData
                });
                return res.status(200).json({
                    RspCode: '97',
                    Message: 'Sai checksum',
                    details: {
                        receivedHash: secureHash,
                        calculatedHash: signed
                    }
                });
            }

            // Check transaction status
            if (vnp_Params['vnp_ResponseCode'] === '00') {
                // Success case - Update database
                const orderId = vnp_Params['vnp_TxnRef'];
                const amount = parseInt(vnp_Params['vnp_Amount']) / 100;
                console.log('Payment success for order:', {
                    orderId,
                    amount,
                    transactionNo: vnp_Params['vnp_TransactionNo'],
                    bankCode: vnp_Params['vnp_BankCode']
                });
                // Redirect to frontend success page
                return res.redirect(`${FRONTEND_URL}/payment/success?orderId=${orderId}&amount=${amount}`);
            } else {
                // Failed case
                console.log('Payment failed:', {
                    orderId: vnp_Params['vnp_TxnRef'],
                    responseCode: vnp_Params['vnp_ResponseCode'],
                    message: vnp_Params['vnp_Message'] || 'Unknown error'
                });
                // Redirect to frontend failure page
                return res.redirect(`${FRONTEND_URL}/payment/failed?orderId=${vnp_Params['vnp_TxnRef']}&code=${vnp_Params['vnp_ResponseCode']}`);
            }
        } catch (error) {
            console.error('Error processing VNPay callback:', {
                error: error.message,
                stack: error.stack,
                receivedData: req.query
            });
            // Redirect to frontend error page
            return res.redirect(`${FRONTEND_URL}/payment/error?message=${encodeURIComponent('Lỗi hệ thống xử lý thanh toán')}`);
        }
    }

    static async sendOrderConfirmationEmail(order, user, products, customerEmail, currentDateTime) {
        try {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const currentDateTimeUTC = new Date(
                currentDateTime.getTime() - 7 * 60 * 60 * 1000
            );
            const formattedDate = currentDateTimeUTC.toLocaleString("vi-VN", {
                hour12: false,
            });
            const formattedPrice = new Intl.NumberFormat("vi-VN").format(
                order.total_price
            );
            const formattedShipping = new Intl.NumberFormat("vi-VN").format(
                order.shipping_fee || 0
            );

            let productHTML = "<p>";
            if (products && products.length > 0) {
                for (const item of products) {
                    const variant = item.variant;
                    const productName = variant?.sku || "Sản phẩm không xác định";
                    const price = new Intl.NumberFormat("vi-VN").format(variant?.price || 0);
                    productHTML += `
                                    <p><strong>Tên sản phẩm:</strong> ${productName} </p>
                                    <p><strong>Số lượng:</strong> ${item.quantity} </p>
                                    <p><strong>Đơn giá:</strong> ${price} VND </p>
        `;
                }
                productHTML += "</p>";
            } else {
                productHTML = "<p>Không có sản phẩm nào.</p>";
            }

            const emailContent = `
            <h3>Cảm ơn bạn đã đặt hàng!</h3>
            <p><strong>Thông tin đơn hàng:</strong></p>
            <p><strong>Mã đơn hàng:</strong> ${order.order_code}</p>
            <p><strong>Ngày tạo:</strong> ${formattedDate}</p>
            <p><strong>Danh sách sản phẩm:</strong></p>
            ${productHTML}
            <p><strong>Tổng tiền:</strong> ${formattedPrice} VND</p>
            <p><strong>Phí vận chuyển:</strong> ${formattedShipping} VND</p>
            <p><strong>Phương thức thanh toán:</strong> ${order.payment_method}</p>
            <p><strong>Thông tin giao hàng:</strong></p>
            <p><strong>Họ tên:</strong> ${user.name || "Không có thông tin"}</p>
            <p><strong>Số điện thoại:</strong> ${user.phone || "Không có thông tin"}</p>
            <p><strong>Địa chỉ:</strong> ${order.shipping_address || order.address}</p>
            <p>Cảm ơn bạn đã ủng hộ chúng tôi!</p>
        `;

            let mailOptions = {
                from: `"Cửa hàng của chúng tôi" <${process.env.EMAIL_USER}>`,
                to: customerEmail,
                subject: `Xác nhận đơn hàng #${order.id}`,
                html: emailContent,
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Lỗi gửi email xác nhận đơn hàng:", error);
            throw new Error("Không thể gửi email xác nhận đơn hàng.");
        }
    }
}

module.exports = OrderController;
