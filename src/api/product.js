import AXIOS from '@/libs/request'
//查看商品
export function viewProducts(params){
    return AXIOS.get('/product/product/',{params})
}
//查看商品分类
export function viewProductsClass(){
  return AXIOS.get('/product/category/')
}
//查看商品规格
export function viewProductsSpecs(params){
  return AXIOS.get('/product/specifications/',{params})
}
//上传附件
export function uploadAttachment(data) {
    return AXIOS.post('/appfile/appfile/',data)
  }
  //添加商品
  
  export function addHomeStayProducts(data) {
    return AXIOS.post('/product/product/', data, {
      headers: {
          'Content-Type': 'multipart/form-data;charset=UTF-8',
      }
    })
  } 
 
  export function addProducts(data) {
    return AXIOS.post('/product/product/', data, {
      headers: {
          'Content-Type': 'multipart/form-data;charset=UTF-8',
      }
    })
  }  
  //修改商品
  export function alterProduct(data) {
    return AXIOS.post('/product/product/', data, {
      headers: {
          'Content-Type': 'multipart/form-data;charset=UTF-8',
      }
    } )
  }
  //删除商品
export function deleteProduct(data) {
  return AXIOS.post('/product/product/?delete', data)
}
//添加商品规格
export function addProductSpecs(data) {
  return AXIOS.post('/product/specifications/', data)
}  
//修改商品规格

export function alterProductSpecs(data) {
  return AXIOS.post('/product/specifications/?put', data)
}  

//获取日历信息
export function getCalendarApi(params) {
  return AXIOS.get('/product/tools/', {params})
}  

export function queryDetail(params){
  return AXIOS.get('/product/anonymous/',{params})
}

export function updateProductImg(data) {
  return AXIOS.post('/product/img/', data, {
    headers: {
        'Content-Type': 'multipart/form-data;charset=UTF-8',
    }
  })
}  

export function getProductImg(params) {
  return AXIOS.get('/product/img/', {params})
} 