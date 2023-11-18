import AXIOS from '@/libs/request'
 
// 获取小区缴费率统计
export function getFeeRate(data) {
    return AXIOS.get('/building/feerate/', data)
}

 