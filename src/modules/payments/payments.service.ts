import crypto from 'crypto'
import querystring from 'querystring'
import { prisma } from '../../config/database'

function formatDateVNPay(date: Date) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

function sortObject(obj: any) {
  let sorted: any = {};
  let str = [];
  let key;
  for (key in obj){
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

export const paymentsService = {
  createVNPayUrl(order: { orderCode: string; totalAmount: number; clientIp?: string }) {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    let vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = `${process.env.CLIENT_URL}/checkout/payment-result`;

    if (!tmnCode || !secretKey || tmnCode === 'your_tmn_code') {
      console.warn('Thiếu cấu hình VNPay thật, dùng URL giả lập');
      return `${returnUrl}?vnp_ResponseCode=00&vnp_TxnRef=${order.orderCode}`; // Fake success return URL
    }

    const date = new Date();
    const createDate = formatDateVNPay(date);
    const expireDate = formatDateVNPay(new Date(date.getTime() + 15 * 60 * 1000));
    
    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = order.orderCode;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${order.orderCode}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = order.totalAmount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = order.clientIp || '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams);
    
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sortedParams['vnp_SecureHash'] = signed;

    vnpUrl += '?' + querystring.stringify(sortedParams);
    return vnpUrl;
  },

  async vnpayReturn(query: any) {
    let vnp_Params = { ...query };
    const secureHash = vnp_Params['vnp_SecureHash'];
    
    // Support fake dev mode
    if (!secureHash && vnp_Params['vnp_ResponseCode'] === '00') {
      const orderCode = vnp_Params['vnp_TxnRef'];
      await prisma.order.updateMany({
        where: { orderCode: orderCode as string },
        data: { paymentStatus: 'paid' }
      });
      return { success: true, orderCode };
    }

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNPAY_HASH_SECRET;
    
    if (!secretKey) return { success: false, message: 'Missing secret key' };

    const signData = querystring.stringify(vnp_Params);
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const orderCode = vnp_Params['vnp_TxnRef'];
      const responseCode = vnp_Params['vnp_ResponseCode'];

      if (responseCode === '00') {
        await prisma.order.updateMany({
          where: { orderCode: orderCode as string },
          data: { paymentStatus: 'paid' }
        });
        return { success: true, orderCode };
      }
      return { success: false, orderCode };
    }
    
    return { success: false, message: 'Invalid signature' };
  },

  async createMoMoUrl(order: { orderCode: string; totalAmount: number }) {
    // MoMo Sandbox giả lập
    return `${process.env.CLIENT_URL}/checkout/payment-result?momo_status=success&orderId=${order.orderCode}`;
  },

  async momoIPN(body: any) {
    return { success: true };
  }
}
