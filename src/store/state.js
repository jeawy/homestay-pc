export default {
  BASE_URL: process.env.NODE_ENV === 'development' ? process.env.VUE_APP_BASE_API : `${location.origin}/`, //图片地址
  BASE_URL_IMAGE: process.env.VUE_APP_BASE_IMAGE,
  isLoginVisible:false
}
