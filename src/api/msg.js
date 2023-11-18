import AXIOS from "@/libs/request";
//查看
export function getMsg(params) {
  return AXIOS.get("/msg/product/", { params });
}
 
//获取最新的短信购买套餐
export function getLatestMsgPackge(params) {
  return AXIOS.get("/msg/product/?latest");
} 
//添加 
export function publishMsg(data) {
  return AXIOS.post("/msg/product/", data, {
    headers: {
      "Content-Type": "application/json;charset=UTF-8"
    },
    transformRequest: [
      params => {
        return JSON.stringify(params);
      }
    ]
  });
} 
//删除
export function deleteMsg(data) {
  return AXIOS.post("/msg/product/", data);
}
 
//查询对应状态下的订单详情
export const queryMsgDetail = params =>
  AXIOS.get("/msg/product/", { params });


//获取各个物业的短信剩余量
export function getMsgLeft() {
  return AXIOS.get("/msg/record/?count");
} 

//获取短信发送模板
export function getMsgTemplate(params) {
  return AXIOS.post("/msg/msg/?template_sms",  params);
} 

export function sendMsg(data) {
  return AXIOS.post("/msg/msg/", data);
} 

export function getMsgRecordsApi(params) {
  return AXIOS.get("/msg/msg/", {params});
} 