import AXIOS from "@/libs/request";
 
 
 //获取 
export function getCouponApi(params) {
  return AXIOS.get('/coupon/admin/', {
      params
  })
}
//修改
export function updateCoupon(data) {
  return AXIOS.post('/coupon/admin/', data)
}

 