import AXIOS from "@/libs/request";
//查看
export function getCategory(params) {
  return AXIOS.get("/category/categories/api", { params });
}
  
//添加、删除
export function postCategory(data) {
  return AXIOS.post("/category/categories/api", data);
}
  