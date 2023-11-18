import AXIOS from "@/libs/request";

//查看获取社区列表
export function getCommunityApi(params) {
  return AXIOS.get("/community/community/", { params });
}

//获取收费制列表
export function getFixedFeeApi(params) {
  return AXIOS.get("/fee/fixed/", { params });
}

//获取非统一收费制列表
export function getDynamicFeeApi(params) {
  return AXIOS.get("/fee/dynamic/", { params });
}
 
//创建、修改、删除统一收费制
export function cudFixedFeeApi(data) {
  return AXIOS.post('/fee/fixed/', data)
}

 
//创建、修改、删除非统一性收费制
export function cudDynamicFeeApi(data) {
  return AXIOS.post('/fee/dynamic/', data)
}

//删除小区
export function deleteCommunityApi(data) {
  return AXIOS.post('/community/community/',{
    ...data,
    method:'delete'
  }  )
}

export function updateFees(data){
	return AXIOS.post('/building/order/',data)
}

export function payFees(data){
	return AXIOS.post('/building/order/',data)
}