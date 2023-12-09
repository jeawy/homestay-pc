<template>
  <main class="message-detail"> 
    <article class="detail-wrap">
      <div class="phone-wrap">
        <div class="item-content" v-loading="idMsgLoading">
          <div class="scroll-wrap"> 
            <div class="msg-info">
               <el-image class="newimage" :src="baseUrl+'/images/'+result.picture" ></el-image>
            </div>
            <div class="msg-title" :title="result.title" >
              {{ result.title }}
            </div>
            <div class="prices">
              <Calendar :productuuid="$route.query.uuid"></Calendar>
            </div> 
            <div v-html="result.content" width="100%"></div>
            
          </div>
        </div>
      </div>

      <div class="detail-items">
        <LikesReadComment
          :entityuuid="uuid"
          :entitytype="9"
          :baseUrl="baseUrl+`/images/`"
          :baseAppUrl="baseUrl+`/app/`" 
          :allowcomment="true" 
        />
      </div>
    </article>
  </main>
</template>

<script>
import { viewProducts } from "@/api/product";
import LikesReadComment from "./components/LikesReadComment";
import Calendar from "@/components/Calendar";

import dayjs from "dayjs"; 
export default {
  name: "messageDetail",
  components: {
    LikesReadComment,
    Calendar
  },
  data() {
    return {
      result: {
        org: {},
        creator_info: {}
      },
      baseUrl: process.env.VUE_APP_BASE_IMAGE ,
      idMsgLoading: false,
      uuid:""
    };
  },
  filters: {
    timeFormat(val) {
      return val && dayjs.unix(val).format("YYYY-MM-DD HH:mm");
    }
  },
  mounted() {
    this.uuid = this.$route.query.uuid
    this.getDetail(this.uuid );
  },
  methods: { 
    getDetail(uuid) {
      this.idMsgLoading = true; 

      viewProducts({ uuid:uuid })
        .then(({data }) => {
          console.log(data)
          this.result = data.msg;
        })
        .finally(() => {
          this.idMsgLoading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.message-detail {
  .prices{
    border-bottom: 2px solid #909399;
    padding-bottom:  40px;
    margin-bottom: 20px;
  }
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
      flex: 0 0 350px;

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
            margin-bottom:  15px;
          }
          .msg-info {
            padding: 4px 0;
            margin-top: 8px;
             
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
