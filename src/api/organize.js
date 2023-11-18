import AXIOS from "@/libs/request";

//查看获取 列表
export function getOrganizeApi(params) {
  return AXIOS.get("/organize/organize/", { params });
}
 
//修改或发布
export function addOrganizeApi(data) {
  return AXIOS.post('/organize/organize/', data)
}

//删除 
export function deleteOrganizeApi(data) {
  return AXIOS.post('/organize/organize/',{
    ...data,
    method:'delete'
  }  )
}