import AXIOS from '@/libs/request'
//省市区县API接口
  
//获取省市区县
export function getAreaApi(params) {
    return AXIOS.get('/area/area/', {
        params
    })
} 