/**
 *
 * @file 封装axios请求的配置   加强版，自动处理错误分支，status!=0走catch
 *
 */

import axios from "axios";
import qs from "qs";
import { Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";

const baseURL = process.env.VUE_APP_BASE_API;

const AXIOS = axios.create({
  baseURL,
  transformRequest: [data => qs.stringify(data)]
});

AXIOS.defaults.headers["Access-Control-Allow-Origin"] = "*";

AXIOS.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers.common["Authorization"] = `JWT ${getToken()}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

AXIOS.interceptors.response.use(
  res => {
    if (res.status === 200) {
      switch (res.data.status) {
        case 0:
          return Promise.resolve(res.data);
        default:
          Message({
            message: `${res.data.msg}`,
            type: "warning",
            duration: 4 * 1000
          });
          return Promise.reject(res.data);
      }
    }
    Message({
      message: res.message || "Response error",
      type: "warning",
      duration: 4 * 1000
    });
    return Promise.reject(new Error(res.message || "Response error"));
  },
  error => {
    Message({
      message: `错误内容：${error.response.statusText}  状态码：${
        error.response.status
      }`,
      type: "error",
      duration: 4 * 1000
    });
    return Promise.reject(error);
  }
);

export default AXIOS;
