import AXIOS from "@/libs/request";

//更新快递信息
export function updateExpressInfo(data) {
  return AXIOS.post("/product/bill/?put", data);
}
//获取订单
export function getBillsApi(params) {
  return AXIOS.get("/bills/admin/", { params });
}

export function postBillsApi(data) {
  return AXIOS.post("/bills/admin/", data);
}


//获取订单统计
export function getBillCountApi(params) {
  return AXIOS.get("/bills/bills/", { params });
}

export function getBills(params) {
  return AXIOS.get("/bills/bills/", { params });
}
 
 
//新增商品的购买方式
export function addPurchaseWay(data) {
  return AXIOS.post("/product/purchase_way/", data);
}
//修改商品的购买方式
export function editPurchaseWay(data) {
  return AXIOS.post("/product/purchase_way/", data);
}

//查询订单
export const queryOrderList = params => AXIOS.get("/bill/bills/", { params });
//查询对应状态下的订单详情
export const queryOrderDetail = params => AXIOS.get("/bill/bills/?", { params });
 
//查询短信充值订单
export function getMsgOrders(params) {
  return AXIOS.get("/organize/order/", { params });
}
export function deleteOrder(data) {
  return AXIOS.post("/organize/order/", data);
}

