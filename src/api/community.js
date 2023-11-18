import AXIOS from "@/libs/request";

//查看获取社区列表
export function getCommunityApi(params) {
  return AXIOS.get("/community/community/", { params });
}

//IT查看获取社区列表
export function getITCommunityApi(params) {
  return AXIOS.get("/community/community/", { params });
}
 
//修改或发布小区信息
export function addCommunityApi(data) {
  return AXIOS.post('/community/community/', data)
}

 
//修改物业公示信息
export function updateCommunityPublishApi(data) {
  return AXIOS.post('/community/info/', data)
}

//删除小区
export function deleteCommunityApi(data) {
  return AXIOS.post('/community/community/',{
    ...data,
    method:'delete'
  }  )
}