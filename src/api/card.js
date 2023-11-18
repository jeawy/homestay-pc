import AXIOS from "@/libs/request";
 
 //查询
export const queryCards = params =>
  AXIOS.get("/card/admin/", { params });
 
export const updateCards = data =>
  AXIOS.post("/card/admin/", data);


 //用户批量导入
export function batchAdd(data) {
  return AXIOS.post('/card/admin/', data, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: [params => {
      return JSON.stringify(params)
    }]
  })
}