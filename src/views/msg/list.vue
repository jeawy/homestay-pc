<template>
  <div id="product-list">
    <!-- 订单列表 -->

    <el-row type="flex" justify="space-between">
      <el-form inline>
        <el-form-item>
          <el-select v-model="queryForm.status" placeholder="请选择" filterable>
            <el-option
              v-for="(item, index) in statusDict"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleQueryList()">
              查询
            </el-button>
            <el-button type="primary" plain @click="resetParams()">
              重置
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
      <el-form inline>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
              发布新套餐
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              :disabled="!multipleSelection.length"
              plain
              @click="handleDelete(multipleSelection)"
            >
              删除
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </el-row>

    <el-table
      v-loading="isTableLoading"
      :data="tableList"
      border
      :stripe="true"
      :header-cell-style="{
        'font-size': '12px',
        background: '#eef1f6',
        color: '#606266',
      }"
      highlight-current-row
      row-class-name="hover"
      @select-all="handleSelectionChange"
      @select="handleSelectionChange"
    > 
      <el-table-column type="selection" align="center" width="56" />
      <el-table-column   label="套餐标题" width="150px">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.title }}
          </div>
        </template>
      </el-table-column>  
      <el-table-column   label="套餐">
        <template slot-scope="{ row }">
          <el-form
            v-for="(item, index) of row.specifications"
            :key="index"
            inline
            label-position="left"
            class="detail-form"
          > 
              <span style=" width:80px">{{ item.name }}</span> 
              <span style=" width:100px">{{ item.number }}条</span>  
              <span style=" width:100px">{{ moneyFomat(null, null, item.price) }}元</span>
               
          </el-form>
        </template>
      </el-table-column>  
      <el-table-column   label="状态" width="65">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.status|status  }}
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="描述">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.content  }}
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="发布时间" width="120">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.date| dateTimeFormat}}
          </div>
        </template>
      </el-table-column>  
       
      <el-table-column prop="content" label="描述" />  
      
      <el-table-column width="80" align="center" label="操作">
        <template slot-scope="{ row }">
          
          <el-tooltip effect="dark" content="修改" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-edit"
              type="primary"
              @click="handleEdit(row.uuid)"
            />
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-delete"
              type="danger"
              @click="handleDelete(row.uuid)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getMsg, deleteMsg } from "@/api/msg"; 
export default { 
  data() {
    return { 
      tableList: [],
      isTableLoading: false,
      queryForm: {},
      statusDict: ["草稿状态", "已发布"],
      multipleSelection: [],
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
    };
  },
  filters:{
    status(status){
      if (status == 0)
      {
        return "草稿"
      }
      else if (status == 1)
      {
        return "已发布"
      } 
    }
  },
  created() {
    this.handleQueryList();
  },
  methods: {
    handleAdd() {
      this.$router.push({
        name: "msg-edit",
      });
    },
    handleQueryDetail(id) {
      this.$router.push({
        name: "product-detail",
        query: {
          id
        },
      });
    },
    handleEdit(uuid) {
      this.$router.push({
        name: "msg-edit",
        query: {
          uuid, 
        },
      });
    },
    // 删除和批量删除
    async handleDelete(uuids) {
      await this.$confirm("确定删除?", {
        type: "warning",
      });
      if (Array.isArray(uuids)) {
        uuids = uuids.join();
      }
      deleteMsg({ method: "delete", uuids }).then(
        ({ data: { status, msg } }) => {
          
          if (status === 0) {
            this.$notify({
              title:"删除成功",
              message:msg,
              type:"success"
            })
            this.handleQueryList();
          }
          else{
            this.$notify({
              title:"删除失败",
              message:msg,
              type:"error"
            })
          }
        }
      );
    },
    resetParams() {
      this.queryForm = {};
      this.handleQueryList();
    },
    handleQueryList() {
      
      this.isTableLoading = true;
 
      getMsg({...this.queryForm})
        .then(({ data: { status, msg } }) => {
          if (status === 0) {
            this.tableList = msg;
          }
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },
    //  table选择
    handleSelectionChange(selection) { 
      this.multipleSelection = selection.map(({ uuid }) => uuid); 
    },
    moneyFomat(row, col, val) {
      if (val == null) {
        return "";
      }
      return val.toLocaleString(undefined, "currency");
    },
    toolsFormat(row, col, val) {
      if (val == null) {
        return "不详";
      }
      return ["自带", "雇主提供"][val];
    },
    languagesFormat(row, col, val) {
      if (val == null) {
        return "";
      }
      return val.join();
    },
  },
};
</script>

<style lang="scss">
#product-list {
	.el-avatar{
		margin-right: 16px;
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
  .name-wrap{
	  display: flex;
	  align-items: center;
  }
}
</style>
