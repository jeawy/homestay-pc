import AXIOS from "@/libs/ajax";

//  获取消息内容
export const getNoticesApi = (params, isLogin = false) => {
  if (isLogin) {
    return AXIOS.get("/content/contents/", { params });
  }
  return AXIOS.get("/content/anonymous/", { params });
};

//  点赞或者取消赞
export const updateLikeApi = data => AXIOS.post("/like/like/", data);

// 获取点赞列表
export const getLikesApi = params => AXIOS.get("/like/anonymous/", { params });

// 获取阅读数
export const getCountApi = params => AXIOS.get("/like/count/", { params });

export const modifyCommentApi = data => AXIOS.post("/comment/comment/", data);
// 匿名获取
export const getCommentsApi = params =>
  AXIOS.get("/comment/anonymous/", { params });

export const uploadFile = data =>
  AXIOS.post("/comment/comment/", data, {
    headers: {
      "Content-Type": "multipart/form-data;charset=UTF-8"
    },
    transformRequest: [data => data]
  });

  export const uploadImage = (data,onProgress) =>
  AXIOS.post("/api/appfile/appfile/", data, {
    headers: {
      "Content-Type": "multipart/form-data;charset=UTF-8"
    },
    onUploadProgress(e){
      onProgress(Math.round(e.loaded / e.total * 100))
    },
    transformRequest: [data => data]
  });

  // 新增商品
export const addContent = data =>
AXIOS.post("/content/contents/", data);
// 修改商品
export const putcontent = data =>
AXIOS.post("/content/contents/", data);
// 查询列表
export const queryUserList = () =>
AXIOS.get("/users/list/?usertype=0");
// 查询列表
export const querycategoryList = () =>
AXIOS.get("/category/categories/");

//查询
export const querycontentList = params =>
  AXIOS.get("/content/contents/", { params });
//查询对应状态下的订单详情
export const querycontentDetail = params =>
  AXIOS.get("/content/contents/", { params });
//删除订单
export const deletecontent = data =>
  AXIOS.post("/content/contents/?01", data);