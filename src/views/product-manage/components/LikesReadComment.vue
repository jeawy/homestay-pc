<template>
  <!-- 阅读量、赞、评论 -->
  <div class="vmain">
    <div class="vtitle">
      <div>
        阅读<span>{{ count | number }}次</span>
      </div>
      <div class="right"> 
        <div class="comment"   @click="openPopup">
          评论({{ totalcomments | number }})
        </div>
      </div>
    </div>
    <div class="likes" v-if="likes.length > 0"> 
      <div class="holder">
        <div class="likeitem" v-for="(item, index) in likes" :key="index">
          <el-image class="likeimg" :src="item.image"></el-image>
          <div class="username">{{ item.user__username }}</div>
        </div>
      </div>
    </div>
    <div class="comments" v-loading="loading"  >
      <div class="tags">
        <el-image class="zanimg" :src="baseAppUrl + `pinlun.png`"></el-image>
        <div class="zantxt">评论</div>
      </div>
      <div class="holder">
        <div class="commentitem" v-for="(item, index) in comments" :key="index">
          <div class="commentimg">
            <el-image class="userimg" :src="item.image"></el-image>
          </div>
          <div class="comment-content">
            <div class="line1">
              <div class="username">
                <span class="name">{{ item.user.username }}</span>
                <span v-if="item.parent" class="txt">回复</span>
                <span v-if="item.parent" class="username parent">{{
                  item.parent
                }}</span>
              </div>
              <div class="date">{{ item.date | timeFormat }}</div>
            </div>
            <div class="line2">
              <div class="content">{{ item.content }}</div>
              <div class="topimageholder" v-if="item.newimages.length">
                <el-image
                  v-for="(imgitem, imgindex) in item.newimages"
                  :key="imgindex"
                  :src="imgitem"
                  class="picture"
                  :preview-src-list="item.newimages"
                />
              </div>
              <div class="actionsholder">
                <div
                  class="reply"
                  @click="reply(item.uuid, item.user.username)"
                >
                  回复
                </div>

                <div class="delete" @click="deleteComment(item.uuid, index)">
                  删除
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end comments -->
        <el-link
          type="primary"
          :underline="false"
          v-if="more"
          class="getmore"
          @click="getmoreComments"
        >
          加载更多
        </el-link>
        <tui-nomore :visible="nomore" bgcolor="#fafafa"></tui-nomore>
      </div>
    </div>
    <el-dialog width="518px" lock-scroll center :visible.sync="isReplyShow">
      <div class="addcomment">
        
        <!-- 添加评论 -->
        <el-input
          type="textarea"
          :placeholder="placeholder"
          v-model="content"
          size=".el-input--mini"
          :autosize="{ minRows: 3, maxRows: 6 }"
        /> 
       
        <el-rate
          class="rate"
          v-model="rate"
          show-text>
        </el-rate> 
        <div class="appraisetxt">
           不选择时间时，默认当前
          </div>
        <el-date-picker 
          v-model="datetime"
          type="datetime"
          format="yyyy/MM/dd HH:mm:ss"
          value-format="yyyy/MM/dd HH:mm:ss"
          placeholder="选择评论时间">
        </el-date-picker>
        <div class="appraisetxt">
           不选择虚拟用户时，默认是自己评价
          </div>
        <el-select v-model="useruuid" filterable placeholder="虚拟用户">
            <el-option
              v-for="item in users"
              :key="item.username"
              :label="item.username"
              :value="item.uuid">
            </el-option>
          </el-select>
       
        <div class="comment-title">
          图片(选填,总大小10M以下)
          <div class="uni-uploader-info">{{ fileList.length }}/9</div>
        </div>

        <el-upload
          list-type="picture-card"
          action=" "
          :http-request="() => {}"
          :on-change="onFilesChange"
          :on-remove="onFilesChange"
          :on-preview="handlePictureCardPreview"
          :before-upload="beforeUploadHandler"
          :limit="9"
          multiple
          :file-list="fileList"
          accept="image/*"
        >
          <i class="el-icon-plus"></i>
        </el-upload>

        <el-dialog :modal="false" :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>

        <div class="tips-wrap">
          <div class="title">
            <el-image :src="baseAppUrl + 'tishi.png'" class="tishi" />
            <span>温馨提示:</span>
          </div>
          <div class="appraisetxt">构建和谐社区生活，请有爱评论:</div>
          <div class="appraisetxt">1、遵守国家和当地相关法律</div>
          <div class="appraisetxt">
            2、不得污蔑、诋毁、辱骂他人或者地域，一经发现立即禁言
          </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="onCloseModal">取消</el-button>
        <el-button
          :loading="isSubmitLoading"
          type="warning"
          class="comment-submit"
          @click="send"
          >提交</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getCountApi,
  modifyCommentApi,
  uploadFile,
  getCommentsApi
} from "@/api/content";
import { getUserList   } from "@/api/admin";
import dayjs from "dayjs";
import tuiNomore from "./nomore";
import axios from "axios";
export default {
  props: [
    "entityuuid", // 实体UUID 
    "entitytype", // 实体id
    "baseUrl", //
    "baseAppUrl", 
  ],
  components: {
    tuiNomore
  },
  data() {
    return {
      users:[],
      isReplyShow: false,
      isSubmitLoading: false,
      page: 1,
      pagenum: 9,
      more: false,
      nomore: false,
      loading: false,
      count: 0, //阅读数
      likes: [],
      rate:null,
      fileList: [],
      content: "",
      datetime:"",
      useruuid:"",
      comments: [],
      totalcomments: 0,
      placeholder: "评论...",
      pid: "", // 回复评论的id ,
      dialogImageUrl: "",
      dialogVisible: false
    };
  },
  filters: {
    number(orgnumber) {
      let txtnumber = orgnumber + "";
      if (orgnumber > 1e4) {
        txtnumber = (orgnumber / 1e4).toFixed(2) + "万";
        txtnumber = txtnumber.replace(".00", "");
      }
      return txtnumber;
    },
    timeFormat(val) {
      return val && dayjs.unix(val).format("YYYY-MM-DD HH:mm");
    }
  },
  watch: {
    entityuuid(val) {
      if (!val) return;
      this.getCount(); 
      this.getComments()
    }, 
  },
  mounted() {  
    this.getUsers()
  },
  methods: {
    getUsers(){
      let param = {
        virtual:1
      }
      getUserList(param).then(({data})=>{
        console.log(data)
        this.users = data
      })
    },
    beforeUploadHandler({ type, size }) {
      const IS_IMAGE = type.includes("image");
      !IS_IMAGE && this.$message.warning(`仅支持上传图片`);
      const IS_LIMIT = size / 1024 ** 2 <= 10;
      !IS_LIMIT && this.$message.warning(`图片大小不能超过10M`);
      return IS_IMAGE && IS_LIMIT;
    },
    onFilesChange(_, fileList) {
      this.fileList = fileList;
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    getmoreComments() {
      this.loading = true;
      this.page = this.page + 1;
      this.getComments();
    },
    deleteComment(uuid) {
      // 删除评论，可以删除自己的，发布人可以删除所有的，超级用户可以删除所有的
      this.$confirm("此操作将永久删除该评论及其子评论, 是否继续?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        confirmButtonClass: "comment-submit",
        type: "warning"
      }).then(() => {
        modifyCommentApi({
          method: "delete",
          uuid
        }).then(({ msg }) => {
          this.$message({
            type: "success",
            message: msg
          });
          this.page = 1;
          this.getComments();
        });
      });
    },
    openPopup() {
      //弹出选择小区
      this.placeholder = "评论...";
      this.pid = "";
      this.isReplyShow = true;
    },
    reply(pid, username) {
      this.placeholder = "回复:" + username;
      this.pid = pid;
      this.isReplyShow = true;
    },
    onCloseModal() {
      this.isReplyShow = false;
      this.content = "";
      this.fileList = [];
    },
    getComments() {
      // 获得评论列表
      this.nomore = false;
      this.more = false;
      this.loading = true; 
      getCommentsApi({
        entity_uuid: this.entityuuid,
        entity_type: this.entitytype,
        page: this.page,
        pagenum: this.pagenum
      })
        .then(res => {
          console.log(res)
          let newlist = res.msg.list;
          this.totalcomments = res.msg.total;

          newlist.forEach(item => {
            if (item.user.thumbnail_portait == null) {
              item.image = this.baseAppUrl + `icons/zhuce.png`;
            } else {
              item.image = this.baseUrl + "/" + item.user.thumbnail_portait;
            }
            item.newimages = [];
            item.images.forEach(imgitem => {
              item.newimages.push(this.baseUrl + imgitem[0]);
            });
          });
          if (this.totalcomments > 0) {
            if (newlist.length < this.pagenum) {
              this.nomore = true;
            } else {
              this.more = true;
            }
          }
          if (this.page == 1) {
            this.comments = [...newlist];
          } else {
            this.comments = this.comments.concat([...newlist]);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    send() {
      if (!this.content) {
        return this.$message.warning("内容不能为空");
      }
      const currentpath = this.$route.fullPath;
      let sendData = {
        entity_uuid: this.entityuuid,
        entity_type: this.entitytype,
        content: this.content,
        url: currentpath,
        rate: this.rate
      };
      if(this.useruuid){
        sendData.useruuid = this.useruuid
      }

      if(this.datetime){
        sendData.datetime = this.datetime
      }


      if (this.pid) {
        sendData.puuid = this.pid ?? null;
      }

      this.isSubmitLoading = true;

      modifyCommentApi(sendData)
        .then(({ uuid }) => {
          if (this.fileList.length) {
            const PARAMS = this.fileList.map(e => {
              return {
                file: e.raw,
                uuid,
                method: "put",
                name: e.name
              };
            });
            const requestList = PARAMS.map(e => {
              const formData = new FormData();
              Object.entries(e).forEach(([k, v]) => {
                formData.append(k, v);
              });
              return formData;
            });
            return axios.all(requestList.map(e => uploadFile(e)));
          }
          return Promise.resolve();
        })
        .then(() => {
          this.onCloseModal();
          this.getComments();
        })
        .finally(() => {
          this.isSubmitLoading = false;
        });
    }, 
    getCount() {
      // 获得阅读数
      getCountApi({
        entity_uuid: this.entityuuid,
        entity_type: this.entitytype
      }).then(({ msg }) => {
        this.count = msg;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
$border-color-base: #e4e7ed;
$base-color: #ff8000;
$border-color-light: #ebeef5;
$font-color-light: #909399;
$uni-color-error: #dd524d;
.rate{
  margin-top: 20px;
}
.vmain {
  width: 500px;
  .addcomment {
    .tips-wrap {
      padding: 16px 0;
      .title {
        font-weight: 600;
        display: flex;
        align-items: center;
        .tishi {
          width: 14px;
          margin-right: 8px;
        }
      }
    }
    .uni-uploader-info {
      color: #b2b2b2;
    }

    /*问题反馈*/
    .comment-title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0 8px;
      color: #8f8f94;
    }
    .comment-star-view.comment-title {
      justify-content: flex-start;
      margin: 0;
    }
    .comment-quick {
      position: relative;
      padding-right: 40px;
    }
    .comment-quick:after {
      font-family: uniicons;
      font-size: 40px;
      content: "\e581";
      position: absolute;
      right: 0;
      top: 50%;
      color: #bbb;
      -webkit-transform: translateY(-50%);
      transform: translateY(-50%);
    }
    .comment-input {
      font-size: 34px;
      height: 50px;
      min-height: 50px;
    }
  }
  .vtitle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $font-color-light;
    .right {
      display: flex;
      .like {
        width: 110px;
        text-align: center;
        background-color: #2c2c2c;
        color: white;
        cursor: pointer;
      }
      .comment {
        text-align: center;
        cursor: pointer;
        width: 110px;
        background-color: #2c2c2c;
        color: white;
        margin-left: 1px;
      }
    }
  }

  .getmore {
    margin: 16px auto;
    display: block;
    width: 120px;
  }

  .comments {
    display: flex;
    margin-top: 25px;
    padding-bottom: 25px;
    .tags {
      flex: 0 0 20px;
      margin-right: 10px;
      border-right: 1px solid $border-color-light;
      padding-right: 10px;
      .zanimg {
        width: 20px;
        height: 20px;
      }
      .zantxt {
        text-align: center;
        color: $base-color;
        font-weight: bold;
      }
    }

    .holder {
      flex: 1 1 auto;

      .commentitem:not(:first-child) {
        margin-top: 15px;
      }
      .commentitem {
        width: 100%;
        display: flex;
        gap: 0 16px;
        border-bottom: 1px solid $border-color-light;
        .commentimg {
          .userimg {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            // border: 1px solid $border-color-base;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12),
              0 0 6px rgba(0, 0, 0, 0.04);
          }
        }
        .comment-content {
          flex: 1 1 auto;
          .line1 {
            display: flex;
            justify-content: space-between;
            .username {
              display: flex;
              .txt {
                margin: 0 8px;
                color: #303133;
              }
            }
            .date {
              color: $font-color-light;
            }
          }
          .line2 {
            .content {
              max-height: 120px;
              overflow-y: auto;
            }
            .topimageholder {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(80px, auto));
              gap: 8px 8px;
              margin: 12px auto;
              .picture {
                position: relative;
                ::v-deep .el-image__inner {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  height: 100%;
                  padding: 4px;
                  border: 1px solid $border-color-base;
                  object-fit: cover;
                  object-position: center;
                  box-sizing: border-box;
                }
                &::after {
                  content: " ";
                  display: block;
                  width: 100%;
                  padding-bottom: 100%;
                }
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12),
                  0 0 6px rgba(0, 0, 0, 0.04);
              }
            }
            .actionsholder {
              display: flex;
              justify-content: flex-end;
              margin: 4px 0;
              font-weight: 600;
              .delete {
                color: $uni-color-error;
                text-align: center;
                margin-left: 16px;
                cursor: pointer;
              }
              .reply {
                text-align: center;
                cursor: pointer;
                color: #2d8cf0;
              }
            }
          }
        }

        .username {
          text-align: center;
          color: #ff8000;
          font-weight: bold;
        }
      }
    }
  }

  .likes {
    display: flex;
    border-bottom: 1px solid $base-color;
    margin-top: 25px;
    padding-bottom: 25px;
    .tags {
      margin-right: 10px;
      border-right: 1px solid $border-color-light;
      padding-right: 10px;
      .zanimg {
        width: 20px;
        height: 20px;
      }
      .zantxt {
        text-align: center;
        color: $base-color;
        font-weight: bold;
      }
    }
    .holder {
      display: flex;
      flex-flow: row wrap;
      .likeitem {
        padding-right: 8px;
        .likeimg {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          // border: 1px solid $border-color-base;
          // box-shadow: 0px 0px 5px $border-color-base;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
        }
        .username {
          text-align: center;
          color: $font-color-light;
          font-weight: bold;
        }
      }
    }
  }
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>

<style lang="scss">
.comment-submit {
  background-color: #df5000 !important;
  border-color: #df5000 !important;
  color: #ffffff;
  &:hover,
  &:active {
    background-color: #e67534 !important;
    border-color: #e67534 !important;
  }
}
</style>
