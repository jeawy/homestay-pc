<template>
  <!-- 阿姨添加和修改 -->
  <main class="edit-product">
    <el-form
      :model="formData"
      status-icon
      ref="product-form"
      label-width="100px"
      :rules="rules"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="套餐名称" prop="title">
            <el-input v-model="formData.title" maxlength="100"
            show-word-limit
            placeholder="请输入套餐标题" > 
            </el-input>
          </el-form-item>
        </el-col> 
      </el-row>
      <el-form-item label="套餐项" prop="rules">
        <section :key="index" class="type-wrap" v-for="(el, index) of formData.items">
          <el-form-item
            
            label="套餐名称"
            :prop="`items.${index}.name`"
            :items="[
              { required: true, message: '请输入套餐名称', trigger: 'blur' },
            ]"
          >
            <el-input placeholder="套餐名称" v-model="el.name"></el-input>
          </el-form-item>
          <el-form-item label="套餐涵盖数量">
            <el-input-number v-model="el.number"></el-input-number>
          </el-form-item>
          <el-form-item label="套餐价格">
            <el-input-number v-model="el.price"></el-input-number>
          </el-form-item>
          <el-form-item>
            <el-radio v-model="mainrule" :label="index">设为默认</el-radio>
          </el-form-item>
        </section>
        <el-form-item>
          <el-button-group>
            <el-button icon="el-icon-plus" @click="modifyRules"></el-button>
            <el-button icon="el-icon-minus" @click="modifyRules(0)"></el-button>
          </el-button-group>
        </el-form-item>
      </el-form-item>
      
      <el-form-item label="描述" prop="content">
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
  publishMsg,
  queryMsgDetail,  
} from "@/api/msg";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { quillEditor } from "vue-quill-editor";
export default { 
  data() {
    return {
      type: "add",
      formData: {
        items: [],
        method: "create",
        title:""
      },
      isLoading: undefined, 
      rules: { 
        title: [
          {
            required: true,
            message: "请输入套餐名称",
            trigger: "blur",
          },
        ],
        content: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        detail: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        items: [
          {
            type: "array",
            required: true,
            message: "请添加套餐",
            trigger: "blur",
          },
        ],
      },
      mainrule: -1, //默认服务
    };
  },
  components: {
    quillEditor,
  }, 
  created() {  
    if (this.$route.query.uuid) {
      this.type = "put";
      this.queryDetail();
    }
     
  },
  methods: {
    // type 1 增加服务。0减少服务
    modifyRules(type = 1) {
      if (type) {
        this.formData.items.push({
          name: "",
          number: 0,
          price: 0,
        });
      } else {
        this.formData.items.pop();
      }
      this.$refs["product-form"].validateField("items");
    },  
    // 根据ID查询详情（修改前）
    queryDetail() {
      queryMsgDetail({
        uuid: this.$route.query.uuid,
      }).then(({ data: { status, msg } }) => {
        if (status === 0) { 
          this.formData = {
            id: msg.product_id, 
            title: msg.title, 
            items: msg.specifications,
            detail: msg.detail, 
            content: msg.content,
            uuid:msg.uuid,
            method: "put",
          };
          this.mainrule = msg.specifications.findIndex((e) => e.mainrule == true) ?? -1;
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
          this.formData.items.forEach((e) => {
            e.mainrule = "";
            e.ruleid = e.id ?? -1;
          });
          this.formData.items[this.mainrule].mainrule = 1;
        }
        this[`${this.type}Product`]();
      });
    },
    addProduct() {
      publishMsg({
        ...this.formData,
        specifications: JSON.stringify(this.formData.items),
        method: this.type, 
      })
        .then(({ data: { status, msg } }) => {
          if(status == 0 ){
            this.$notify({
              type:"success",
              message:msg,
              title:"发布成功",
              duration:2000
            })
          }
          else{
            this.$notify({
              type:"error",
              message:msg,
              title:"发布失败",
              duration:0
            })
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    putProduct() {
      publishMsg({
        ...this.formData,
        specifications: JSON.stringify(this.formData.items),
      })
        .then(({ data: { status, msg } }) => {
          if(status == 0 ){
            this.$notify({
              type:"success",
              message:msg,
              title:"修改成功",
              duration:2000
            })
            this.cancel();
          }
          else{
            this.$notify({
              type:"error",
              message:msg,
              title:"修改失败",
              duration:0
            })
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
  width: 100%;
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
    label {
        font-weight: 400;
      }
  }
}
</style>
