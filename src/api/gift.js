import AXIOS from '@/libs/request'
//查看商品
export function viewGifts(params){
    return AXIOS.get('/gift/gift/',{params})
}
//查看商品分类
export function viewGiftsClass(){
  return AXIOS.get('/gift/category/')
}
//查看商品规格
export function viewGiftsSpecs(params){
  return AXIOS.get('/gift/specifications/',{params})
}
//上传附件
export function uploadAttachment(data) {
    return AXIOS.post('/appfile/appfile/',data)
  }
  //添加商品
  export function addGifts(data) {
    return AXIOS.post('/gift/gift/', data)
  }  
  //修改商品
  export function alterGift(data) {
    return AXIOS.post('/gift/gift/', data )
  }
  //删除商品
export function deleteGift(data) {
  return AXIOS.post('/gift/gift/?delete', data)
}
//添加商品规格
export function addGiftSpecs(data) {
  return AXIOS.post('/gift/specifications/', data)
}  
//修改商品规格

export function alterGiftSpecs(data) {
  return AXIOS.post('/gift/specifications/?put', data)
}  


export function queryDetail(params){
  return AXIOS.get('/gift/anonymous/',{params})
}