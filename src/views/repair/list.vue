<template>
  <div id="product-list">
    <!-- 订单列表 -->

    <el-row type="flex" justify="space-between">
      <el-form inline>
        <el-form-item>
          <el-select v-model="queryForm.status">
            <el-option
              v-for="(item, index) in statuses"
              :key="index"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-input v-model="queryForm.keyword" placeholder="关键词">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="queryForm.username" placeholder="提交人姓名">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="search()">
              查询
            </el-button>
            <el-button type="primary" plain @click="resetParams()">
              重置
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row>
      <el-col
        :span="6"
        v-loading="isTableLoading"
        v-for="(item, index) in tableList"
        :key="index"
      >
        <div class="papers">
          <el-image
            v-if="item.status == 0"
            class="imgstatus"
            :src="require('@/assets/img/daichuli.png')"
          ></el-image>
          <el-image
            v-if="item.status == 1"
            class="imgstatus"
            :src="require('@/assets/img/yibanjie.png')"
          ></el-image>
          <div class="userinfo">
            <div class="username">
              {{ item.user.username }}({{ item.user.phone }})
            </div>
            <div class="date">{{ item.date | dateFormat }}</div>
          </div>
          <p>{{ item.content }}</p>
          <el-row class="imageholder">
            <el-col
              :span="8"
              v-for="(itemimage, indeximage) in item.request_img_list"
              :key="indeximage"
            >
              <el-image
                fit="contain"
                :src="itemimage.filepath"
                :preview-src-list="item.pureImages"
              ></el-image>
            </el-col>
          </el-row>

          <div class="reply" v-if="item.status == 0">
            <!--回复办理情况-->
            <div class="btn">
              <el-tooltip
                effect="dark"
                content="点击按钮完成该维修单."
                placement="top"
              >
                <el-button
                  type="success"
                  @click="openReplyDialog(item.uuid, index)"
                >
                  结单
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="replyinfo" v-else>
            <!--回复办理情况-->
            <div class="replyuserinfo">
              <div class="username">【办理情况】</div>
            </div>
            <span>{{ item.reply_date | dateFormat }}由</span
            ><span>{{ item.reply_user }}结单</span>

            <p>{{ item.result }}</p>
            <el-row class="replyimageholder">
              <el-col
                :span="8"
                v-for="(itemimage, indeximage) in item.reply_img_list"
                :key="indeximage"
              >
                <el-image
                  fit="contain"
                  :src="itemimage.filepath"
                  :preview-src-list="item.pureReplyImages"
                ></el-image>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-dialog
      title="回复办理情况"
      :visible.sync="dialogReply"
      width="512px"
      :modal="false"
    >
      <el-form class="replyform">
        <textarea class="content" v-model="result"> </textarea>
        <div class="reply-images" v-if="reply_img_list.length > 0">
          <el-row class="imageholder">
            <el-col
              :span="6"
              v-for="(itemimage, indeximage) in reply_img_list"
              :key="indeximage"
            >
              <el-tooltip effect="dark" content="删除该图片." placement="top">
                <i
                  class="el-icon-error"
                  @click="deletePic(itemimage.id, indeximage)"
                ></i>
              </el-tooltip>
              <el-image
                style="width: 100px; height: 100px"
                fit="contain"
                :src="baseImage + itemimage.filepath"
              >
              </el-image>
            </el-col>
          </el-row>
        </div>
        <el-upload
          v-if="reply_img_list.length < 9"
          v-loading="uploadloading"
          accept="picture/jpeg, picture/jpg, picture/png"
          ref="upload"
          class="upload-demo-logo"
          action="prx/api/prorepair/prorepair/"
          :data="{
            method: 'put',
            uuid: currentRepairUuid,
            status: 1,
            communityuuid: communityuuid,
          }"
          :headers="headers"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
          drag
          :show-file-list="false"
        >
          <template>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text el-upload__text__logo">
              <el-tooltip
                effect="dark"
                content="点击上传现场图片."
                placement="top"
              >
                <em>现场图片</em>
              </el-tooltip>
            </div>
          </template>
        </el-upload>
        <el-form-item align="center">
          <el-tooltip
            effect="dark"
            content="点击按钮完成该维修单."
            placement="top"
          >
            <el-button type="success" @click="saveReply">结单</el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-dialog>
     <el-form v-if="tableList.length == 0">
       <el-form-item align="center" >
          <div class="papers" style="width: 360px;height:500px"> 
          <p style="text-align:center; color:#8a8a8a;margin-top: 150px">没有相关维修单</p> 
        </div>
       </el-form-item>
    </el-form>
    <el-form v-if="tableList.length > 0"> 
       <el-form-item align="center">
         <el-tooltip
            effect="dark"
            content="点击加载更多维修单."
            placement="top"
          >
            <el-button type="success" @click="LoadMore">加载更多...</el-button>
          </el-tooltip>
       </el-form-item>
    </el-form>   
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
import { getRepairs, postRepairs } from "@/api/repair";
export default {
  data() {
    return {
      replyForm: {},
      dialogReply: false,
      uploadloading: false,
      reply_img_list: [],
      statuses: [
        { name: "待处理", value: 0 },
        { name: "已结单", value: 1 },
      ],
      imagelength: 0,
      headers: {
        Authorization: `JWT ${getToken()}`,
      },
      currentPage: 1,
      paginationsize: 4,
      total: 0,
      tableList: [],
      isTableLoading: false,
      queryForm: {
        status: 0,
      },
      multipleSelection: [],
      baseImage: process.env.VUE_APP_BASE_IMAGE + "/images/",
      communityuuid: "",
      currentRepairUuid: "",
      result: "",
    };
  },
  filters: {
    statustxt(status) {},
  },
  created() {
    this.handleQueryList();
    this.communityuuid = localStorage.getItem("communityuuid");
  },
  methods: {
    search(){
      this.currentPage = 1;
      this.handleQueryList()
    },
    LoadMore(){
      this.currentPage = 1 + this.currentPage
      this.handleQueryList()
    },
    deletePic(imgid, index) {
      let data = {
        imgid: imgid,
        method: "delete",
        communityuuid: this.communityuuid,
      };
      postRepairs(data).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.reply_img_list.splice(index, 1);
        } else {
          this.$notify({
            type: "error",
            title: "删除失败",
            message: msg,
          });
        }
      });
    },
    saveReply() {
      let data = {
        uuid: this.currentRepairUuid,
        method: "put",
        result: this.result,
        communityuuid: this.communityuuid,
      };
      postRepairs(data).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.$notify({
            type: "success",
            title: "已结单",
            message: msg,
          });
          this.dialogReply = false;
          this.currentPage = 1;
          this.handleQueryList();
        } else {
          this.$notify({
            type: "error",
            title: "删除失败",
            message: msg,
          });
        }
      });
    },
    openReplyDialog(uuid, index) {
      this.dialogReply = true;
      this.reply_img_list = this.tableList[index].reply_img_list;
      this.currentRepairUuid = uuid;
    },
    beforeUpload(e) {
      this.uploadloading = true;
    },
    handleUploadSuccess(response, file, fileList) {
      console.log(response);
      if (response.status == 0) {
        this.reply_img_list.push(response.msg);
        this.imagelength += 1;
        this.$notify({
          type: "success",
          title: "上传成功",
        });
      } else {
        this.$notify({
          type: "error",
          title: "上传失败",
          message: response.msg,
        });
      }
      this.uploadloading = false;
    },

    handleAdd() {
      this.$router.push({
        name: "category-edit",
      });
    },
    handleQueryDetail(id) {
      this.$router.push({
        name: "product-detail",
        query: {
          id,
        },
      });
    },
    handleEdit(uuid) {
      this.$router.push({
        name: "category-edit",
        query: {
          uuid,
        },
      });
    },
    resetParams() {
      this.queryForm = {};
      this.handleQueryList();
    },
    handleQueryList() {
      this.isTableLoading = true;
      getRepairs({
        ...this.queryForm,
        communityuuid: localStorage.getItem("communityuuid"),
        page: this.currentPage,
        pagenum: this.paginationsize,
      })
        .then(({ data: { status, msg } }) => {
         
          if (status === 0) {
           
            msg.list.forEach((item) => {
              item.pureImages = [];
              item.request_img_list.forEach((imageitem) => {
                imageitem.filepath = this.baseImage + imageitem.filepath;
                item.pureImages.push(imageitem.filepath);
              });

              item.pureReplyImages = [];
              item.reply_img_list.forEach((imageitem) => {
                imageitem.filepath = this.baseImage + imageitem.filepath;
                item.pureReplyImages.push(imageitem.filepath);
              });
              
            });
            if (this.currentPage > 1){ 
                this.tableList = this.tableList.concat(msg.list); 
              }
              else{
                this.tableList = msg.list;
              } 
              if (msg.list.length == 0){
                  this.$notify({
                    type:'success',
                    title:"维修单已加载完毕",
                    message:"相关维修单已全部加载"
                  })
                  this.currentPage = this.currentPage -1
                }
            this.total = msg.total;
          } else {
            this.$notify({
              title: "获取维修单失败",
              message: msg,
              type: "error",
            });
          }
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },
    //  table选择
    handleSelectionChange(selection) {
      console.log(selection);
      this.multipleSelection = selection.map(({ uuid }) => uuid);
      console.log(this.multipleSelection);
    },
  },
};
</script>

<style lang="scss">
#product-list {
  .imageholder {
    .el-image {
      width: 100%;
    }
  }
  .replyinfo {
    .replyuserinfo {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #1296db;
      margin-bottom: 10px;
      .date {
        text-align: left;
      }
    }
  }
  .replyform {
    .content {
      width: 100%;
      height: 80px;
      border: 1px solid #cdcdcd;
    }
    .imageholder {
      border: 1px solid #cdcdcd;
      padding: 10px;

      .el-image {
        border: 1px solid #cdcdcd;
        border-radius: 5px;
      }
      .el-icon-error {
        color: #d81e06;
        position: relative;
        left: 90px;
        top: 10px;
        width: 15px;
        height: 15px;
        z-index: 10;
        cursor: pointer;
      }
    }

    .upload-demo-logo {
      .el-upload-dragger {
        width: 70px;
        height: 70px;
        .el-icon-upload {
          font-size: 40px;
          margin: 0px;
        }
      }
    }
  }
  .el-avatar {
    margin-right: 16px;
  }
  .stars {
    display: flex;
    .el-image {
      width: 20px;
      height: 20px;
    }
  }
  .detail-form {
    display: flex;
    align-items: center;
    .el-form-item {
      margin-bottom: 0;
      margin-right: 24px;
      label {
        font-weight: 600;
      }
    }
  }
  .name-wrap-pay {
    display: flex;
    align-items: center;
    .lightingtxt {
      font-weight: bold;
      color: #ff8000;
    }
    .paylogo {
      margin-top: 10px;
      margin-right: 10px;
      .el-image {
        width: 40px;
        height: 40px;
      }
    }
  }
  .name-wrap {
    .billno,
    .lightingtxt {
      font-weight: bold;
      color: #ff8000;
    }
    .printer {
      width: 60px;
      height: 60px;
      cursor: pointer;
    }
  }

  .papers,
  .papers:before,
  .papers:after {
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.1),
      1px 1px 3px rgba(0, 0, 0, 0.2);
  }

  .papers {
    position: relative;
    width: 95%;
    padding: 2em;
    margin: 15px auto;
    .imageholder {
      height: 300px;
      overflow-y: auto;
      margin-bottom: 15px;
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
    .reply {
      .btn {
        text-align: center;
      }
    }
    .userinfo {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #ff8000;
      margin-bottom: 10px;
      .date {
        text-align: left;
      }
    }
    .imgstatus {
      position: absolute;
      right: 0px;
      top: 0px;
      width: 60px;
      height: 60px;
    }
  }

  .papers:before,
  .papers:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    -webkit-transform: rotateZ(2.5deg);
    -o-transform: rotate(2.5deg);
    transform: rotateZ(2.5deg);
    z-index: -1;
  }

  .papers:after {
    -webkit-transform: rotateZ(-2.5deg);
    -o-transform: rotate(-2.5deg);
    transform: rotateZ(-2.5deg);
  }

  .papers h2 {
    font-size: 1.8em;
    font-weight: normal;
    text-align: center;
    padding: 0.2em 0;
    margin: 0;
    border-top: 1px solid #ddd;
    border-bottom: 2px solid #ddd;
  }

  .papers p {
    text-align: left;
    margin: 1, 5em 0;
  }
}
</style>
