//登录状态管理
import * as userApi from '@/api/login'
import {
    getToken,
    setToken,
    removeToken,
    getUserInfo,
    setUserInfo,
    resetRoles,
    removeUserInfo
} from '@/utils/auth'
import {
    resetRouter
} from '@/router'
import Cookies from 'js-cookie'
const state = {
    token: getToken(),
    userInfo: getUserInfo() ? JSON.parse(getUserInfo()) : null,
}
const mutations = {
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_USERINFO: (state, userInfo) => {
        state.userInfo = userInfo
    }
}

const actions = {
    login({ commit}, { 
        phone,
        password
    }) {
        return new Promise((resolve, reject) => {
            userApi.login({
             //   phone: phone.trim(),
                phone:phone,
                password: password,
                usertype:2
            }).then(({
                data
            }) => {
                console.log(data)
                if (data.status === 0) {
                    commit('SET_TOKEN', data.msg.token);
                    setToken(data.msg.token);
                    commit('SET_USERINFO', data.msg);
                    setUserInfo(data.msg);
                    resolve(data.msg);
                } else { 
                    reject(data)
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
    /*   logout({
        commit,
        state
      }) {
        return new Promise((resolve, reject) => {
          userApi.logout(state.token).then(() => {
            commit('SET_TOKEN', '')
            removeToken()
            resetRouter()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      }, */
    logout({
        state,
        commit
    }) {
        return new Promise((resolve, reject) => {
            commit('SET_TOKEN', '')
            removeToken()
            commit('permission/SET_ROUTES', [], {
                root: true
            })
            window.localStorage.clear()// 清空缓存
            resetRouter()
            resolve()
        })
    },
    resetToken({
        commit
    }) {
        return new Promise(resolve => {
            commit('SET_TOKEN', '')
            removeToken()
            resolve()
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}