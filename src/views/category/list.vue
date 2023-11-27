<template>
  <div id="activityInfo">
    <!-- 类别列表 -->
    <el-row class="row-lg">
      <el-col :span="3">
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="delActs()"
          :disabled="this.multipleSelection.length === 0"
          >批量删除</el-button
        >
      </el-col>
      <el-col :span="3">
        <el-button type="primary" icon="el-icon-plus" @click="openTopDialog"
          >添加类别</el-button
        >
      </el-col>
    </el-row>
    <el-table
      row-key="id"
      :data="categoriesList"
      border
      :stripe="true"
      :row-style="{ 'font-size': '13px' }"
      :header-cell-style="{
        'font-size': '12px',
        background: '#eef1f6',
        color: '#606266'
      }"
      highlight-current-row
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
        reserve-selection
      ></el-table-column>
      <el-table-column
        type="index"
        label="序号"
        align="center"
      ></el-table-column>
      <el-table-column label="类别图片" align="center"  width="200" >
        <template slot-scope="scope">
          <el-image
            :src="baseurl + scope.row.icon"
            style="width:60px; height: 60px;border-radius:10px;"
          >
            <div slot="placeholder" class="image-slot">
              加载中
              <span class="dot">...</span>
            </div>
            <div slot="error" class="image-slot">
              <i class="el-icon-picture" style="color:#909399"></i>
            </div>
          </el-image>
          <div>
            <el-tag
              v-for="sub in scope.row.sub"
              :key="sub.id"
              closable
              @close="closeSub(sub.id, sub.name)"
              type="info"
            >
              {{ sub.name }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类别标题" align="center">
        <template slot-scope="scope">
          <div slot="placeholder" class="image-slot">
            <span class="dot">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="归属" align="center"  width="80" >
        <template slot-scope="scope">
          <div slot="placeholder" class="image-slot">
            <span class="dot">{{ scope.row.categorytype |  categorytypetxt}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :key="20"  label="是否显示" align="center" width="80" >
        <template slot-scope="{ row, $index }">
          <el-switch
            :value="row.visible"
            :disabled="row.disabled"
            @change="onVisibleChange($event, row, $index)"
            :active-value="1"
            :inactive-value="0"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column :key="18" label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            @click="onEdit(scope.row)"
            icon="el-icon-edit"
            >编辑</el-button
          >
          <el-tooltip effect="dark" content="删除" placement="top">
            <el-button
              class="el-icon-delete"
              type="danger"
              @click="deleteAct(scope.row.id)"
              >删除</el-button
            >
          </el-tooltip>
          <el-tooltip effect="dark" content="增加子类别" placement="top">
            <el-button
              class="el-icon-plus"
              type="success"
              @click="addSubAct(scope.row.id)"
              >增加子类别</el-button
            >
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :visible.sync="dialogShow"
      :title="dialogName"
      width="500px"
      @closed	="initForm"
    >
      <el-form
        :loading="buttonStates.createLoading"
        :model="actForm"
        ref="actForm"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="类别标题" prop="name">
          <el-input
            v-model="actForm.name"
            placeholder="请输入类别标题"
          ></el-input>
        </el-form-item>

        <el-form-item label="是否显示" prop="name">
          <el-switch
            v-model="actForm.visible"
            :active-value="1"
            active-text="是"
            inactive-text="否"
            :inactive-value="0"
          >
          </el-switch>
        </el-form-item>

        <el-form-item label="分类归属" prop="name">
          <el-radio v-model="actForm.categorytype" class="cardtype"   :label="0">民宿</el-radio>
          <el-radio v-model="actForm.categorytype"  class="cardtype"  :label="1">其他</el-radio>
        </el-form-item>

        <el-form-item label="类别图片">
          <el-upload
            accept="image/jpeg, image/gif, image/png"
            ref="upload"
            class="upload-demo"
            action="prx/api/appfile/appfile/"
            :headers="headers"
            :on-success="handleSuccess"
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
                将文件拖到此处，或
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
          <!-- <el-input v-model="actForm.image"></el-input> -->
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="addAct('actForm')">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { getCategory, postCategory } from "@/api/category";
import { getToken } from "@/utils/auth";
export default {
  data() {
    return {
      communityuuid: "",
      categoriesList: [],
      auth: false,
      baseurl: this.$store.state.BASE_URL_IMAGE + "/",
      multipleSelection: [],
      dialogShow: false,
      dialogName: null,
      parentid: -1,
      buttonStates: {
        createLoading: false
      },
      actForm: {
        name: null,
        icon: "",
        visible: 1,
        categorytype:0
      },
      SRC: "",
      headers: {
        Authorization: `JWT ${getToken()}`
      },
      status: [
        {
          value: 0,
          label: "草稿"
        },
        {
          value: 1,
          label: "发布"
        }
      ],
      rowVisible: false
    };
  },
  methods: {
    //  显隐切换
    onVisibleChange(visible, row, idx) {
      this.categoriesList.splice(idx, 1, { ...row, disabled: true });
      postCategory({ id: row.id, method: "put", visible }).then(({ data }) => {
        if (data.status === 0) {
          this.$message.success(data.msg);
          this.categoriesList.splice(idx, 1, {
            ...row,
            visible,
            disabled: false
          });
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    //  单条数据编辑
    onEdit(row) {
      this.actForm = { ...row, method: "put" };
      this.dialogName = "编辑";
      this.SRC = this.baseurl + row.icon;
      this.dialogShow = true;
    },
    //获取类别列表
    getCategories() {
      getCategory({ pc: "" }).then(({ data }) => {
        if (data.status == 0) {
          this.categoriesList = data.msg;
        } else {
          return false;
        }
      });
    },
    initForm() {
      this.actForm = {
        name: null,
        icon: "",
        visible: 1
      };
      this.SRC = "";
    },
    closeSub(id, name) {
      this.$confirm("是否删除" + name + "类别?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        postCategory({ ids: id, method: "delete" }).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getCategories();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
    //删除类别
    deleteAct(id) {
      this.$confirm("是否删除该类别?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        postCategory({ ids: id, method: "delete" }).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getCategories();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
    //批量删除
    delActs() {
      this.$confirm("此操作将永久删除类别,是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        const ids = this.multipleSelection.map(item => item.id).join(",");
        postCategory({ ids: ids, method: "delete" }).then(({ data }) => {
          if (data.status === 0) {
            this.getCategories();
            this.$message.success(data.msg);
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    openTopDialog() {
      this.parentid = -1;
      this.dialogName = "添加类别";
      this.dialogShow = true;
    },
    //添加类别
    addAct(actForm) {
      this.postSpread();
    },
    //添加子类别
    addSubAct(id) {
      this.parentid = id;
      this.dialogName = "添加子类别";
      this.dialogShow = true;
    },
    //关闭添加类别弹出框
    cancel() {
      this.postSpread();
    },
    postSpread() {
      if (this.parentid > 0) {
        this.actForm.parentid = this.parentid;
      }
      postCategory(this.actForm).then(({ data }) => {
        if (data.status == 0) {
          this.$message.success(data.msg);
          this.dialogShow = false;
          this.$refs["actForm"].resetFields();
          this.getCategories();
        } else {
          this.$message.error(data.msg);
        }
      });
    },
    //监听上传图片成功，成功后赋值给form ，并且赋值给图片src显示图片
    handleSuccess(response, file, fileList) {
      console.log(response);
      if (response.status == 0) {
        this.SRC = this.$store.state.BASE_URL_IMAGE + "/" + response.msg;
        this.actForm["icon"] = response.msg;
      } else {
        this.$message.error(response.msg);
      }
    }
  },
  filters:{
    categorytypetxt(status){
      if (status == 0)
      {
        return "民宿"
      }
      else if (status == 1)
      {
        return "其他"
      } 
    }
  },
  created() {
    this.getCategories();
  }
};
</script>
<style lang="scss" scoped>
.row-lg {
  margin-bottom: 5px;
}
</style>
