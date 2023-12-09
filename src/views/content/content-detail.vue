<template>
  <main class="message-detail">
    <el-button @click="goBack" icon="el-icon-arrow-left" size="mini">
    </el-button>
    <article class="detail-wrap">
      <div class="phone-wrap">
        <div class="item-content" v-loading="idMsgLoading">
          <div class="scroll-wrap">
            <div class="msg-title" :title="result.title">
              {{ result.title }}
            </div>
            <div class="msg-info">
              {{ result.org.name }} {{ result.creator_info.username }}
              {{ result.date | timeFormat }}
            </div>
            <image :src="baseUrl + result.picture" class="newimage"></image>
            <div class="content">{{ result.content }}</div>
            <div v-html="result.detail" width="100%"></div>
            <div class="community-name">{{ result.communityname }}</div>
          </div>
        </div>
      </div>

      <div class="detail-items">
        <LikesReadComment
          :entityuuid="$route.query.id"
          :entitytype="CONTENTTYPE"
          :baseUrl="`https://shopdemo.chidict.com/images/`"
          :baseAppUrl="`https://shopdemo.chidict.com/app/`"
          :owneruuid="result.creator_info.uuid"
          :allowcomment="result.allow_comment"
          :orguuid="result.org.uuid"
        />
      </div>
    </article>
  </main>
</template>

<script>
import { getNoticesApi } from "@/api/content";
import LikesReadComment from "./components/LikesReadComment";

import dayjs from "dayjs";
const CONTENTTYPE = 18
export default {
  name: "messageDetail",
  components: {
    LikesReadComment
  },
  data() {
    return {
      result: {
        org: {},
        creator_info: {}
      },
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
      idMsgLoading: false
    };
  },
  filters: {
    timeFormat(val) {
      return val && dayjs.unix(val).format("YYYY-MM-DD HH:mm");
    }
  },
  mounted() {
    this.getDetail(this.$route.query.id);
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    getDetail(uuid) {
      this.idMsgLoading = true;
      const communityuuid = localStorage.getItem("communityuuid");

      getNoticesApi({ uuid, communityuuid })
        .then(({ msg }) => {
          this.result = msg;
        })
        .finally(() => {
          this.idMsgLoading = false;
        });
    }
  }
};
</script>

<style lang="scss">
.message-detail {
  .detail-wrap {
    display: flex;
    justify-content: space-between;
    padding-top: 16px;
    gap: 0 32px;

    .detail-items {
      flex: 1 1 auto;
      position: relative;
      &::before {
        content: " ";
        width: 1px;
        height: 100%;
        background-color: #efefef;
        position: absolute;
        top: 0;
        left: -16px;
      }
    }
    .item-label {
      margin-bottom: 16px;
      display: block;
    }
    .phone-wrap {
      flex: 0 0 340px;

      .item-content {
        background: url("~@/assets/img/phone.png") no-repeat;
        background-size: contain;
        background-position: top;
        padding: 48px 34px 34px;
        height: 680px;
        font-size: 13px;
        .scroll-wrap {
          overflow-y: auto;
          height: 100%;

          .msg-title {
            font-weight: 600;
            font-size: 14px;
          }
          .msg-info {
            padding: 4px 0;
            margin-top: 8px;
            border-top: 1px solid #ff8000;
            color: #909399;
          }
          .community-name {
            padding-top: 8px;
            color: #909399;
          }

          &::-webkit-scrollbar-track-piece {
            background: #efefef;
          }

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 16px;
          }
        }
      }
    }
  }
}
</style>
