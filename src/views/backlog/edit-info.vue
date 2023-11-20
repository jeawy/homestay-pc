<template>
  <!-- 添加和修改 -->
  <main class="edit-content">
    <el-form
      :model="formData"
      status-icon
      ref="product-form"
      label-width="90px"
      :rules="rules"
    >
      
      <el-form-item label="标题" prop="title">
            <el-input v-model="formData.title"></el-input>
      </el-form-item> 
    
      <el-form-item label="待办内容">
        <tinymce
          v-model="formData.detail"
        ></tinymce> 
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="isLoading" @click="submitForm">{{
          type == "add" ? "发布" : "修改"
        }}</el-button>
      </el-form-item>
    </el-form>
  </main>
</template>

<script>
import { 
  queryBacklog,
  updateBacklog,
} from "@/api/backlog";
import { getToken } from "@/utils/auth";
import tinymce from "@/components/Tinymce";
export default {
  name: "edit-content",
  data() {
    return {
      type: "add",
      formData: { 
        method: "create",
        title:"", 
        detail:null
      },
      picSRC:"",
      picloading:false,
       headers: {
        Authorization: `JWT ${getToken()}`,
      },
      isLoading: undefined, 
      rules: { 
        title:[
          {required:true,
          message:"请输入标题",
          trigger:"blur"}
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
    // 根据ID查询详情（修改前）
    queryDetail() {
      queryBacklog({
        uuid: this.$route.query.uuid 
      }).then(({ data: { status, msg } }) => {
        if (status === 0) { 
          this.formData = {
            uuid: msg.uuid, 
            title: msg.title, 
            detail: msg.detail, 
            content: msg.content, 
            method: "put",
            picture:msg.picture, 
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
        this[`${this.type}Backlog`]();
      });
    },
    addBacklog() {
      this.formData.detail = this.formData.detail.replace('<img src=','<img style="max-width:70px" src=')
      updateBacklog({
        ...this.formData,
        rules: JSON.stringify(this.formData.rules),
        method: "create", 
      })
        .then(({ data: { status, msg } }) => {
          
          if(status == 0){
              this.$notify({
                title: msg,
                message: "发布成功", 
                type: "success"
              });
          }
          else{
            this.$notify({
                title: "发布失败",
                message: msg,
                  type: "error"
              });
          } 
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    putBacklog() {
      this.formData.detail = this.formData.detail.replace(/<img src=/g,'<img style="max-width: 100%" src=')
      updateBacklog({
        ...this.formData, 
      })
        .then(({ data: { status, msg } }) => { 
          if (status == 0) {
            this.cancel();
            this.$notify({
                title: msg,
                message: "修改成功", 
                type: "success"
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
.edit-content {
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
  width: 750px;
  .myQuillEditor {
    .ql-container.ql-snow {
      min-height: 360px;
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
