import AXIOS from '@/libs/request'
//登记薄
export function getRecords(params){
    return AXIOS.get('/record/record/',{params})
}

export function postRecords(data){
    return AXIOS.post('/record/record/',data)
}

// 获得用户登记情况
export function getUserInfos(params){
    return AXIOS.get('/record/userinfo/',{params})
}

// 用户登记
export function getExcel(params){ 
	// 匿名用户进行登记
	return AXIOS.get('/record/userinfo/anonymous/',{params}) 
}