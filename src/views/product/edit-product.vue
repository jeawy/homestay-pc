<template>
  <!-- 阿姨添加和修改 -->
  <main class="edit-product">
    <el-form
      :model="formData"
      status-icon
      ref="product-form"
      label-width="90px"
      :rules="rules"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="选择阿姨" prop="aunty">
            <el-select v-model="formData.aunty">
              <el-option
                v-for="item of userList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="选择类型" prop="categoryid">
            <el-select v-model="formData.categoryid">
              <el-option
                v-for="item of categoryList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="服务方式" prop="rules">
        <section :key="index" class="type-wrap" v-for="(el, index) of formData.rules">
          <el-form-item
            
            label="服务名称"
            :prop="`rules.${index}.name`"
            :rules="[
              { required: true, message: '请输入服务名称', trigger: 'blur' },
            ]"
          >
            <el-input placeholder="服务名称" v-model="el.name"></el-input>
          </el-form-item>
          <el-form-item label="服务价格">
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
      <el-form-item label="经度">
            <el-input v-model="formData.longitude"></el-input>
      </el-form-item>
      <el-form-item label="维度">
            <el-input v-model="formData.latitude"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea"> </el-input>
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
      },
      isLoading: undefined,
      userList: [],
      categoryList: [],
      rules: {
        aunty: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
          },
        ],
        categoryid: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
          },
        ],
        description: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        rules: [
          {
            type: "array",
            required: true,
            message: "请添加服务",
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
  watch: {
    $route(to, from) {  
      if(to.name == "edit-product"){ 
        this.queryUsers();
        this.queryCategories();
        this.queryDetail();
      }
       
    }, 
  }, 
  created() { 
    this.queryUsers();
    this.queryCategories();
    if (this.$route.query.id) {
      this.type = "put";
      this.queryDetail();
    }
    this.queryDetail();
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
        productid: this.$route.query.id,
      }).then(({ data: { status, msg } }) => {
        if (status === 0) {
          console.log(msg)
          this.formData = {
            id: msg.product_id,
            aunty: msg.aunty_id,
            title: msg.productname,
            categoryid:msg.categoryid,
            rules: msg.rules,
            detail: msg.detail,
            longitude: msg.longitude,
            latitude: msg.latitude,
            description: msg.description,
            method: "put",
          };
          this.mainrule = msg.rules.findIndex((e) => e.mainrule == true) ?? -1;
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
        title:'null'
      })
        .then(({ data: { status, msg } }) => {
          this.$message(msg);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    putProduct() {
      putProduct({
        ...this.formData,
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
