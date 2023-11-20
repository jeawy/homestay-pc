<template>
  <!-- 阿姨添加和修改 -->
  <main class="edit-content">
    <el-form
      :model="formData"
      status-icon
      ref="product-form"
      label-width="100px"
      :rules="rules"
    >
      <el-row>
        <el-col :span="7">
          <el-upload
            v-loading="logoloading"
            accept="picture/jpeg, picture/jpg, picture/png"
            ref="upload"
            class="upload-demo-logo"
            action="prx/api/appfile/appfile/"
            :headers="headers"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
            drag
            :show-file-list="false"
          >
            <el-image v-if="logoSRC" :src="logoSRC"></el-image>
            <template v-else>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text el-upload__text__logo">
                物业logo
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
        </el-col>
        <el-col :span="7">
          <el-upload
            v-loading="dianziyinzhangloading"
            accept="picture/jpeg, picture/jpg, picture/png"
            ref="upload"
            class="upload-demo-logo"
            action="prx/api/appfile/appfile/"
            :headers="headers"
            :on-success="handleYinzhangSuccess"
            :before-upload="beforeYinzhangUpload"
            drag
            :show-file-list="false"
          >
            <el-image v-if="yinzhangSRC" :src="yinzhangSRC"></el-image>
            <template v-else>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text el-upload__text__logo">
                物业电子印章<br />
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
        </el-col>
        <el-col :span="10">
          <label class="">{{ communityname }} </label><br />
          <label class="">{{ organizename }}</label>

          <br />
          <label>统一社会信息代码</label> <br />
          <label class="warning red">*电子印章仅会在公告、通知用到</label>
          <br />
          <label class="warning red"
            >*物业名称、统一社会信用代码更新请联系平台</label
          >
           <br />
          <label class="warning red"
            >*物业logo大小不要超过32kb否则APP端分享到微信时，logo无法显示</label
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item>
            <el-upload
              v-loading="photoloading"
              accept="picture/jpeg, picture/jpg, picture/png"
              ref="upload"
              class="upload-manager"
              action="prx/api/appfile/appfile/"
              :headers="headers"
              :on-success="handlePhotoSuccess"
              :before-upload="beforePhotoUpload"
              drag
              :show-file-list="false"
            >
              <el-image v-if="photoSRC" :src="photoSRC"></el-image>
              <template v-else>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text el-upload__text__logo">
                  物业经理照片<br />
                  <em>点击上传</em>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="姓名">
            <el-input
              maxlength="16"
              show-word-limit
              v-model="formData.manager_name"
            ></el-input>
          </el-form-item>
          <el-form-item label="职务">
            <el-input
              maxlength="16"
              show-word-limit
              v-model="formData.manager_position"
            ></el-input>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input
              maxlength="11"
              show-word-limit
              v-model="formData.manager_phone"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="物业服务等级">
            <el-input
              maxlength="28"
              show-word-limit
              v-model="formData.service_level"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物业收费等级">
            <el-input
              maxlength="28"
              show-word-limit
              v-model="formData.fee_level"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="物业收费标准">
            <el-input
              maxlength="28"
              show-word-limit
              v-model="formData.fee_standand"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物业收费方式">
            <el-input
              maxlength="28"
              show-word-limit
              v-model="formData.fee_way"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="小区总面积">
            <el-input
              type="number"
              min="0"
              v-model="formData.total_area"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="小区总户数">
            <el-input
              type="number"
              min="0"
              v-model="formData.total_rooms"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="物业客服电话">
            <el-input
              maxlength="11"
              show-word-limit
              v-model="formData.tel"
            ></el-input>
          </el-form-item>
        </el-col>
         
      </el-row>
      <el-row>
        <el-col :span="11">
          <el-upload
            v-loading="licenseloading"
            accept="picture/jpeg, picture/jpg, picture/png"
            ref="upload"
            class="upload-license"
            action="prx/api/appfile/appfile/"
            :headers="headers"
            :on-success="handleLisencSuccess"
            :before-upload="beforeLisenceUpload"
            drag
            :show-file-list="false"
          >
            <el-image
              v-if="licenseSRC"
              style="width: 100%; height: 100%"
              :src="licenseSRC"
            ></el-image>
            <template v-else>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                物业营业执照
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
        </el-col>
        <el-col :span="1">
          <el-form-item> </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-upload
            v-loading="weibaolicenseloading"
            accept="picture/jpeg, picture/jpg, picture/png"
            ref="upload"
            class="upload-demo"
            action="prx/api/appfile/appfile/"
            :headers="headers"
            :on-success="handleWeibaoSuccess"
            :before-upload="beforeWeibaoUpload"
            drag
            :show-file-list="false"
          >
            <el-image
              v-if="weibaoSRC"
              style="width: 100%; height: 100%"
              :src="weibaoSRC"
            ></el-image>
            <template v-else>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                维保单位营业执照
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
        </el-col>
      </el-row>
      <el-form-item label="物业服务合同">
          <tinymce
            v-model="formData.contract"
          ></tinymce>  
      </el-form-item>
      <el-row>
        <el-col :span="24">
          <label>增加内容</label>
          <label class="warning">(如：新增天然气公司服务电话:96777)</label>
          <el-button @click="addNewItems">新增内容</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" v-for="(item, index) in newItems" :key="index">
          <el-form-item>
            <el-input v-model="item.value"></el-input>
            <el-button
              type="warning"
              class="deleteItem"
              @click="deleteItem(index)"
            >
              删除
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="isLoading" @click="submitForm">
          保存
        </el-button>
      </el-form-item>
    </el-form>
  </main>
</template>

<script>
import { getCommunityApi, updateCommunityPublishApi } from "@/api/community";
import { getToken } from "@/utils/auth";
import tinymce from "@/components/Tinymce"; 
export default { 
  data() {
    return {
      communityname: "",
      formData: {
        method: "create",
      },
      newItems: [
        {
          value: "",
        },
      ],
      rules: {
        name: [
          {
            required: true,
            message: "请输入小区名字",
            trigger: "change",
          },
        ],
        address: [
          {
            required: true,
            message: "请输入小区地址",
            trigger: "change",
          },
        ],
        itmanager: [
          {
            required: true,
            message: "请选择IT管理人员",
            trigger: "change",
          },
        ],
        area: [
          {
            required: true,
            message: "请输入小区行政区",
            trigger: "change",
          },
        ],
      },
      dianziyinzhangloading: false, // 电子印章loading
      isLoading: false,
      logoloading: false, // logo loading
      photoloading: false, // 物业经理loading
      weibaolicenseloading: false, // 维保单位loading
      licenseloading: false,
      userList: [],
      logoSRC: "",
      weibaoSRC: "",
      licenseSRC: "",
      photoSRC: "",
      yinzhangSRC: "",
      organizename: "",
      headers: {
        Authorization: `JWT ${getToken()}`,
      },
      baseUrl: this.$store.state.BASE_URL_IMAGE,
    };
  },
  components: {
    tinymce,
  },

  created() { 
    this.queryDetail();
  },
  methods: {
    addNewItems() {
      this.newItems.push({
        value: "",
      });
    },
    deleteItem(index) {
      this.newItems.splice(index, 1);
    },
    // 根据ID查询详情（修改前）
    queryDetail() {
      getCommunityApi({
        uuid: this.$route.query.communityuuid,
      }).then(({ data: { status, msg } }) => { 
        if (status === 0) { 
          this.communityname = msg.name;
          this.organizename = msg.organizename;
          if (msg.organizelogo) {
            this.logoSRC = this.baseUrl + "/" + msg.organizelogo;
          }

          if (msg.manager_photo) {
            this.photoSRC = this.baseUrl + "/" + msg.manager_photo;
          }

          if (msg.signet) {
            this.yinzhangSRC = this.baseUrl + "/" + msg.signet;
          }

          if (msg.organizelicense) {
            this.licenseSRC = this.baseUrl + "/" + msg.organizelicense;
          }

          if (msg.weibao_license) {
            this.weibaoSRC = this.baseUrl + "/" + msg.weibao_license;
          }
            console.log(msg)
          this.formData = msg;
          if (msg.extra_content == "null"){
            this.newItems = []
          }
          else{
            this.newItems = JSON.parse(msg.extra_content); 
          }
        }
      });
    },
    submitForm() {
      this.$refs["product-form"].validate((e) => {
        if (!e) {
          return false;
        }
        this.isLoading = true; 
        updateCommunityPublishApi({
          ...this.formData,
          uuid: this.$route.query.communityuuid,
          extra_content: JSON.stringify(this.newItems),
        })
          .then(({ data: { status, msg } }) => {
            if (status == 0) {
              this.$notify({
                type: "success",
                message: msg,
                duration: 2000,
                title: "编辑成功",
              });
              this.cancel();
            } else {
              this.$notify({
                type: "error",
                message: msg,
                duration: 2000,
                title: "编辑失败",
              });
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      });
    },
    cancel() {
      this.isLoading = false;
      this.$router.go(-1);
    },
    beforeLogoUpload(e) {
      this.logoloading = true;
    },
    beforeYinzhangUpload(e) {
      this.dianziyinzhangloading = true;
    },
    beforePhotoUpload(e) {
      this.photoloading = true;
    },
    beforeLisenceUpload(e) {
      this.licenseloading = true;
    },
    beforeWeibaoUpload(e) {
      this.weibaolicenseloading = true;
    },
    handleLogoSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.logoSRC = this.baseUrl + "/" + response.msg;
        this.formData["logo"] = response.msg;
      }
      this.logoloading = false;
    },
    handleYinzhangSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.yinzhangSRC = this.baseUrl + "/" + response.msg;
        this.formData["signet"] = response.msg;
      }
      this.dianziyinzhangloading = false;
    },
    handlePhotoSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.photoSRC = this.baseUrl + "/" + response.msg;
        this.formData["manager_photo"] = response.msg;
      }
      this.photoloading = false;
    },
    handleLisencSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.licenseSRC = this.baseUrl + "/" + response.msg;
        this.formData["license"] = response.msg;
      }
      this.licenseloading = false;
    },
    handleWeibaoSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.weibaoSRC = this.baseUrl + "/" + response.msg;
        this.formData["weibao_license"] = response.msg;
      }
      this.weibaolicenseloading = false;
    },
  },
};
</script>
<style lang="scss">
.upload-demo-logo .el-upload-dragger {
  width: 150px !important;
  height: 150px !important;
}
.upload-manager .el-upload-dragger {
  width: 120px !important;
  height: 150px !important;
}
.upload-manager .el-icon-upload {
  margin-top: 20px;
}
.upload-license .el-upload-dragger {
  width: 350px;
}
.edit-content {
  .el-form {
    label {
      font-weight: 600;
    }
    .el-form--inline {
      label {
        font-weight: 400;
      }
    }
  }
  width: 950px;
  .myQuillEditor {
    .ql-container.ql-snow {
      min-height: 360px;
    }
  }

  .el-select {
    width: 100%;
  }

  .type-wrap {
    display: flex;
    justify-content: space-between;
    label {
      font-weight: 400;
    }
  }
}
.warning {
  color: #f56c6c;
  font-weight: 100 !important;
  font-size: 12px;
}
.deleteItem {
  position: absolute;
  right: 0px;
}
</style>
