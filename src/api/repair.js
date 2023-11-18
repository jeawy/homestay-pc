import AXIOS from '@/libs/request'
//获取维修单
export function getRepairs(params){
    return AXIOS.get('/prorepair/prorepair/',{params})
}

export function postRepairs(data){
    return AXIOS.post('/prorepair/prorepair/',data)
}
 