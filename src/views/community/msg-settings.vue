<template>
  <!-- 阿姨添加和修改 -->
  <main class="edit-content">
      <el-row :gutter="10">
        <el-col :span="24">
          <el-form
            :model="formData"
            status-icon
            ref="product-form"
            label-width="140px" 
          >  
                <el-form-item label="维修负责人">
                  <el-input
                    maxlength="56"
                    show-word-limit
                    v-model="formData.repaire_msg"
                    placeholder="请输入负责人手机号码，最多支持四个手机号码，用英文逗号隔开"
                  ></el-input>
                </el-form-item>
              
                <el-form-item label="有偿服务负责人">
                  <el-input
                    maxlength="56"
                    show-word-limit
                    v-model="formData.paidservice_msg"
                    placeholder="请输入负责人手机号码，最多支持四个手机号码，用英文逗号隔开"
                  ></el-input>
                </el-form-item>
                 <el-form-item label="账单人负责人">
                  <el-input
                    maxlength="56"
                    show-word-limit
                    v-model="formData.fee_msg"
                    placeholder="请输入负责人手机号码，最多支持四个手机号码，用英文逗号隔开"
                  ></el-input>
                </el-form-item>
            
            
            <el-form-item>
              <el-button @click="cancel">取消</el-button>
              <el-button type="primary" :loading="isLoading" @click="submitForm">
                保存
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="24">
           <div class="tips">
            <strong style="color: #ff8000">短信配置说明:</strong>
            <div>
              1、多个电话可以用中文或者英文逗号隔开,例如:1303298xxxx,18932338888。最多支持四个手机号码
            </div>
            <div>
              2、如果不想用短信提醒，删除短信提醒即可。
            </div>
            <div>3、<strong>维修负责人:</strong>业主提交维修申请时，平台会给该负责人发送短信提醒。</div>
            <div>4、<strong>有偿服务负责人:</strong>业主申请有偿服务时，平台会给该负责人发送短信提醒。</div>
            <div>5、<strong>账单负责人:</strong>业主支付了物业费时，平台会给该负责人发送短信提醒。</div>
          </div>
        </el-col> 
      </el-row>
  </main>
</template>

<script>
import { getCommunityApi, updateCommunityPublishApi } from "@/api/community";
 
export default { 
  data() {
    return {
      communityname: "",
      formData: {
        method: "create",
      },
      orderList:[],
      newItems: [
        {
          value: "",
        },
      ],
      columnSelect: [
				{
					label: "已提交，未支付",
					value: 0
				},
				{
					label: "已支付",
					value: 2
				},
				{
					label: "已关闭",
					value: 3
				} 
			], 
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
      queryForm:{},
      baseUrl: this.$store.state.BASE_URL_IMAGE,
    };
  }, 
  created() { 
    this.queryDetail();
  },
  methods: { 
    // 根据ID查询详情（修改前）
    queryDetail() {
      getCommunityApi({
        uuid: this.$route.query.communityuuid,
        msg:1,//只获得短信配置信息
      }).then(({ data: { status, msg } }) => { 
        if (status === 0) { 
          console.log(msg)
          this.communityname = msg.name;  
          this.formData = msg; 
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
        })
          .then(({ data: { status, msg } }) => {
            if (status == 0) {
              this.$notify({
                type: "success",
                message: msg,
                duration: 2000,
                title: "编辑成功",
              }); 
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
