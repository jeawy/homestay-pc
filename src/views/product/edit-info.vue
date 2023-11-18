<template>
  <!-- 添加和修改 -->
  <main class="edit-product">
    <el-row :gutter="10">
      <el-col :span="16">
      <el-form
        :model="formData"
        status-icon
        ref="product-form"
        label-width="90px"
        :rules="rules"
      > 
        <el-form-item label="标题" prop="title">
              <el-input maxlength="100" show-word-limit v-model="formData.title"></el-input>
        </el-form-item>
        <el-form-item label="内容类型" >
          <el-radio-group v-model="formData.product_type" >
   
            <el-radio :label="2">内容</el-radio> 
            
          </el-radio-group>
          </el-form-item>
        <el-form-item label="开启评论?">
            <el-switch 
            v-model="formData.allow_comment"
            active-color="#13ce66"
            inactive-color="#13ce66"
            :active-value="1"
            :inactive-value="0"
            active-text="是"
            inactive-text="否"
            >
            </el-switch>
        </el-form-item>
        <el-form-item label="缩略图">
          <el-upload
            v-loading="picloading"
            accept="image/jpeg,image/jpg,image/png"
            ref="upload"
            class="upload-demo-logo"
            action="prx/api/appfile/appfile/"
            :headers="headers"
            :on-success="handlePicSuccess"
            :before-upload="beforepicUpload"
            drag
            :show-file-list="false"
          >
            <el-image
              v-if="picSRC"
              style="width: 420px; height: 240px"
              :src="baseImage+'/'+picSRC"
            ></el-image>
            <template v-else>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text el-upload__text__logo">
                图片
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
          <label  class="tips">为了保证在APP和微信小程序端的美观，
            必须上传图片，才可以在APP和微信小程序中展示.图片尺寸宽高比例推荐7:4</label>
        </el-form-item>
        
        <el-form-item label="简要描述" prop="content">
          <el-input v-model="formData.content" type="textarea"> </el-input>
        </el-form-item>

        
        <el-form-item label="详情">
          <tinymce
            v-model="formData.detail"
          ></tinymce> 
        </el-form-item>
        <el-form-item>
          <el-button @click="cancel" :loading="isDraftLoading">
            {{leftbtn}}

          </el-button>
          <el-button type="primary" :loading="isLoading" @click="submitForm">{{
            type == "add" ? "发布" : "修改"
          }}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    
    </el-row>
  </main>
</template>

<script>
import {
  addProduct,
  queryProductDetail,
  queryUserList,
  querycategoryList,
  putProduct,
} from "@/api/product";
import { getToken } from "@/utils/auth";
import tinymce from "@/components/Tinymce";

export default {
  name: "edit-product",
  data() {
    return {
      isDraftLoading:false,
      leftbtn:"存草稿",
      type: "add",
      formData: {
        rules: [],
        method: "create",
        title:"",
        product_type:2,
        detail:null
      },
      picSRC:"",
      picloading:false,
       headers: {
        Authorization: `JWT ${getToken()}`,
      },
      isLoading: undefined,
      userList: [],
      categoryList: [],
      rules: { 
        title:[
          {required:true,
          message:"请输入标题",
          trigger:"blur"}
        ],
        content: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ]
      },
      mainrule: -1, //默认服务
      baseImage:process.env.VUE_APP_BASE_IMAGE
    };
  },
  components: {
    tinymce
  },
  watch: {
    $route(to, from) {  
      if(to.name == "edit-info"){  
        this.queryDetail();
      }
       
    }, 
  }, 
  created() {  
    if (this.$route.query.uuid) {
      this.type = "put";
      this.queryDetail();
    }
    //this.queryDetail();
  },
  methods: {
    beforepicUpload() {
      this.picloading = true;
    },
    handlePicSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.picSRC =  response.msg;
        this.formData["picture"] = response.msg;
      } else {
        this.$notify({
          type: "error",
          message: response.msg,
          duration: 2000,
        });
      }
      this.picloading = false;
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
    queryUsers() {
      queryUserList().then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.userList = msg.map((e) => ({
            label: e.username,
            value: e.userid,
          }));
        }
      });
    },
    queryCategories() {
      querycategoryList().then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.categoryList = msg.map((e) => ({
            label: e.name,
            value: e.id,
          }));
        }
      });
    },
    // 根据ID查询详情（修改前）
    queryDetail() {
      queryProductDetail({
        uuid: this.$route.query.uuid,
        communityuuid:localStorage.getItem('communityuuid')
      }).then((res) => {
        let msg = res.msg;
        if (res.status === 0) { 
          this.formData = {
            uuid: msg.uuid, 
            title: msg.title, 
            detail: msg.detail, 
            content: msg.content,
            product_type: msg.product_type,
            method: "put",
            picture:msg.picture,
            status:msg.status,
            allow_comment:msg.allow_comment
          }; 
          this.picSRC = msg.picture  
        }
      });
    },
    submitForm() {
      this.$refs["product-form"].validate((e) => {
        if (!e) {
          return false;
        }
        this.isLoading = true;
        if (this.mainrule > -1) {
          this.formData.rules.forEach((e) => {
            e.mainrule = "";
            e.ruleid = e.id ?? -1;
          });
          this.formData.rules[this.mainrule].mainrule = 1;
        }
        this.formData.status = 1 //
        this[`${this.type}Product`]();
      });
    },
    addProduct() {
      if( this.formData.detail){
        this.formData.detail = this.formData.detail.replace('<img src=','<img style="max-width:100%" src=')
      }
       
      addProduct({
        ...this.formData,
        rules: JSON.stringify(this.formData.rules),
        method: "create",
        communityuuid:localStorage.getItem("communityuuid"), 
      })
        .then((res) => {
          let message = "发布"
          if (this.formData.status == 0){
            message = "保存"
          }
          let msg = res.msg;
        if (res.status === 0) {  
              this.$notify({
                title: msg,
                message: message +"成功", 
                type: "success"
              });
          }
          else{
            this.$notify({
                title: message+"失败",
                message: msg,
                  type: "error"
              });
          } 
        })
        .finally(() => { 
          this.isDraftLoading = false;
          this.isLoading = false;
        });
    },
    putProduct() {
      if( this.formData.detail){
        this.formData.detail = this.formData.detail.replace(/<img src=/g,'<img style="max-width: 100%" src=')
      }
      
      putProduct({
        ...this.formData,
        communityuuid:localStorage.getItem('communityuuid'),
        rules: JSON.stringify(this.formData.rules),
      })
        .then((res) => { 
           let message = "发布"
            if (this.formData.status == 0){
              message = "保存"
            }
         let msg = res.msg;
        if (res.status === 0) { 
           
            this.$notify({
                title: msg,
                message:message+ "成功", 
                type: "success"
              });
          }
          else{
            this.$notify({
                title: message+"失败",
                message: msg,
                  type: "error"
              });
          }
        })
        .finally(() => {
          this.isDraftLoading = false;
          this.isLoading = false;
        });
    },
    cancel() {
      this.isDraftLoading = true;
       
      this.$refs["product-form"].validate((e) => {
        if (!e) {
          return false;
        }
        this.isDraftLoading = true;
        if (this.mainrule > -1) {
          this.formData.rules.forEach((e) => {
            e.mainrule = "";
            e.ruleid = e.id ?? -1;
          });
          this.formData.rules[this.mainrule].mainrule = 1;
        }
        this.formData.status = 0 // 草稿
        this[`${this.type}Product`]();
      });
       
    },
  },
};
</script>
<style lang="scss" scoped>
.edit-product {
  .el-form {
    label {
      font-weight: 600;
    }
    .tips
    {
      font-weight: 100;
      color:#d81e06;
    }
    .el-form--inline {
      label {
        font-weight: 400;
      }
    }
  }

  .el-select {
    width: 100%;
  }

  .type-wrap{
    display: flex;
    justify-content: space-between;
    label {
        font-weight: 400;
      }
  }
}
</style>
