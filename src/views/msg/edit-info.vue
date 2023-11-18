<template>
  <!-- 添加和修改 -->
  <main class="edit-product">
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
      <el-form-item label="内容类型" >
        <el-radio v-model="formData.product_type" label="0">百事通</el-radio>
        <el-radio v-model="formData.product_type" label="1">通知</el-radio>
      <el-radio v-model="formData.product_type" label="2">公告</el-radio>
        </el-form-item>
      
      
      <el-form-item label="简要描述" prop="content">
        <el-input v-model="formData.content" type="textarea"> </el-input>
      </el-form-item>

      <el-form-item label="详情">
        <quill-editor
          v-model="formData.detail"
          ref="myQuillEditor"
          class="myQuillEditor"
        ></quill-editor>
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
  addProduct,
  queryProductDetail,
  queryUserList,
  querycategoryList,
  putProduct,
} from "@/api/product";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { quillEditor } from "vue-quill-editor";
export default {
  name: "edit-product",
  data() {
    return {
      type: "add",
      formData: {
        rules: [],
        method: "create",
        title:"",
        product_type:"0"
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
    };
  },
  components: {
    quillEditor,
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
      }).then(({ data: { status, msg } }) => {
        if (status === 0) { 
          this.formData = {
            uuid: msg.uuid, 
            title: msg.title, 
            detail: msg.detail, 
            content: msg.content,
            method: "put",
          }; 
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
        this[`${this.type}Product`]();
      });
    },
    addProduct() {
      addProduct({
        ...this.formData,
        rules: JSON.stringify(this.formData.rules),
        method: "create",
        communityuuid:localStorage.getItem("communityuuid"),
        
      })
        .then(({ data: { status, msg } }) => {
          
          if(status == 0){
              this.$notify({
                title: msg,
                message: "发布成功,可到微信小程序，APP中查看", 
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
    putProduct() {
      putProduct({
        ...this.formData,
        communityuuid:localStorage.getItem('communityuuid'),
        rules: JSON.stringify(this.formData.rules),
      })
        .then(({ data: { status, msg } }) => {
          this.$message(msg);
          if (status == 0) {
            this.cancel();
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
