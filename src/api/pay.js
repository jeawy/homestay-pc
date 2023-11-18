import AXIOS from "@/libs/request";
//支付宝支付
export function payAlipay(params) {
  return AXIOS.get("/msg/order/", { params });
} 

// 订单提交
export function submitOrder(params) {
  return AXIOS.post("/msg/order/", params );
} 

//支付宝订单状态查询
export function checkAlipay(params) {
  return AXIOS.get("/pay/alipay/", { params });
} 
 
//微信查询订单
export function checkWxpay(params) {
  return AXIOS.get("/pay/weixin/", { params });
}

//微信提交短信充值订单
export function sendWxMsgpay(params) {
  return AXIOS.post("/msg/order/", { params });
}
