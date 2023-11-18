<template>
  <!-- 小区添加和修改 -->
  <main class="edit-product">
    <el-form
      :model="formData"
      status-icon
      ref="product-form"
      label-width="140px"
      :rules="rules"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="物业全称" prop="name">
            <el-input
              v-model="formData.name"
              maxlength="56"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物业简称">
            <el-input
              v-model="formData.alias"
              maxlength="10"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="统一社会信息代码" prop="code">
        <el-input
          maxlength="32"
          show-word-limit
          v-model="formData.code"
        ></el-input>
      </el-form-item>
      <el-form-item label="物业logo">
        <el-upload
          v-loading="logoloading"
          accept="picture/jpeg, picture/jpg, picture/png"
          ref="upload"
          class="upload-demo-logo"
          action="prx/api/appfile/appfile/"
          :headers="headers"
          :on-success="handleLogoSuccess"
          :before-upload="beforelogoUpload"
          drag
          :show-file-list="false"
        >
          <el-image
            v-if="logoSRC"
            style="width: 100%; height: 100%"
            :src="logoSRC"
          ></el-image>
          <template v-else>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text el-upload__text__logo">
              物业logo
              <em>点击上传</em>
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="营业执照">
        <el-upload
          v-loading="licenseloading"
          accept="picture/jpeg, picture/jpg, picture/png"
          ref="upload"
          class="upload-demo"
          action="prx/api/appfile/appfile/"
          :headers="headers"
          :on-success="handleSuccess"
          :before-upload="beforeLicenseUpload"
          drag
          :show-file-list="false"
        >
          <el-image
            v-if="SRC"
            style="width: 100%; height: 100%"
            :src="SRC"
          ></el-image>
          <template v-else>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              营业执照
              <em>点击上传</em>
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="isLoading" @click="submitForm">{{
          type == "add" ? "保存" : "修改"
        }}</el-button>
      </el-form-item>
    </el-form>
  </main>
</template>

<script>
import { addOrganizeApi, getOrganizeApi } from "@/api/organize";

import { getToken } from "@/utils/auth";
export default {
  name: "edit-product",
  data() {
    return {
      type: "add",
      formData: {
        rules: [],
        method: "create",
      },
      headers: {
        Authorization: `JWT ${getToken()}`,
      },
      organizes: [],
      isLoading: undefined,
      userList: [],
      logoSRC: "",
      SRC: "",
      licenseloading: false,
      logoloading: false,
      categoryList: [],
      baseUrl: this.$store.state.BASE_URL_IMAGE,
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

        area: [
          {
            required: true,
            message: "请输入小区行政区",
            trigger: "change",
          },
        ],
      },
      mainrule: -1, //默认服务
    };
  },
  created() {
    if (this.$route.query.uuid) {
      this.type = "put";
      this.getOrganize();
    }
  },
  methods: {
    beforeLicenseUpload() {
      console.log(111)
      this.licenseloading = true;
    },
    beforelogoUpload() {
      this.logoloading = true;
    },
    handleLogoSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.logoSRC = this.baseUrl + "/" + response.msg;
        this.formData["logo"] = response.msg;
      } else {
        this.$notify({
          type: "error",
          message: response.msg,
          duration: 2000,
        });
      }
      this.logoloading = false;
    },
    handleSuccess(response, file, fileList) {
      console.log(3333)
      if (response.status == 0) {
        this.SRC = this.baseUrl + "/" + response.msg;
        this.formData["license"] = response.msg;
      } else {
        this.$notify({
          type: "error",
          message: response.msg,
          duration: 2000,
        });
      }

      this.licenseloading = false;
    },
    // type 1 增加服务。0减少服务
    modifyRules(type = 1) {
      if (type) {
        this.formData.rules.push({
          name: "",
          price: 0,
        });
      } else {
        this.formData.rules.pop();
      }
      this.$refs["product-form"].validateField("rules");
    },
    // 根据ID查询详情（修改前）
    getOrganize() {
      getOrganizeApi({
        uuid: this.$route.query.uuid,
      }).then(({ data: { status, msg } }) => {
        if (status === 0) {
          console.log(this.baseUrl + "/" + msg.logo);
          this.formData = {
            uuid: msg.uuid,
            name: msg.name,
            alias: msg.alias,
            code: msg.code,
          };
          if (msg.logo) {
            this.logoSRC = this.baseUrl + "/" + msg.logo;
          }
          if (msg.license) {
            this.SRC = this.baseUrl + "/" + msg.license;
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

        this[`${this.type}Organize`]();
      });
    },
    addOrganize() {
      addOrganizeApi({
        ...this.formData,
      })
        .then(({ data: { status, msg } }) => {
          if (status == 0) {
            this.$notify({
              type: "success",
              title: "提交成功",
              message: msg,
              duration: 3000,
            });
          } else {
            this.$notify({
              type: "error",
              title: "提交失败",
              message: msg,
              duration: 3000,
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    putOrganize() { 
      addOrganizeApi({
        ...this.formData, 
        method: "put",
      })
        .then(({ data: { status, msg } }) => {
          if (status == 0) {
            this.$notify({
              title: "修改成功",
              message: msg,
              duration: 3000,
              type: "success",
            });
          } else {
            this.$notify({
              type: "error",
              title: "修改失败",
              message: msg,
              duration: 3000,
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    cancel() {
      this.isLoading = false;
      this.$router.go(-1);
    },
  },
};
</script>
<style lang="scss">
.upload-demo-logo .el-upload-dragger {
  width: 200px !important;
  height: 200px !important;
}
.edit-product {
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
  width: 750px;

  .type-wrap {
    display: flex;
    justify-content: space-between;
    label {
      font-weight: 400;
    }
  }
}
</style>
