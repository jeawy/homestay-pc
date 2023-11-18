import {
  getNotices
} from "@/api/notice"
const state = {
  Notice: null, //我的审批任务列表
  unreadCount: null,
  isShowCard:false,
}

const mutations = {
  SET_NOTICE: (state, arr) => { 
    state.Notice = [...arr]
  },
  SET_UnreadCount: (state, num) => {
    state.unreadCount = num
  },
  SET_CARDSHOW: (state, bl) => {
    state.isShowCard = bl
  },
}

const actions = {
  get_Notice({
    commit
  }, params) {
     console.log(params)
    return getNotices(params).then(({
      data
    }) => {
      console.log(data)
      commit('SET_NOTICE', data.msg.list)
      commit('SET_UnreadCount', data.msg.unreadcount)
    }).catch(() => {
      commit('SET_NOTICE', null)
      commit('SET_UnreadCount', null)
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
