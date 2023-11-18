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
              发布待办
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
      <el-table-column   width="240"  label="标题">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.title }}
          </div>
        </template>
      </el-table-column>  
      <el-table-column  width="100" label="待办状态">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.status| statustxt}}
          </div>
        </template>
      </el-table-column>   
      <el-table-column  width="120" label="发布时间">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.date| dateTimeFormat}}
          </div>
        </template>
      </el-table-column>   
      <el-table-column  label="待办内容">
        <template slot-scope="{ row }"> 
            <div v-html="row.detail"></div>  
        </template>
      </el-table-column>  
      
      <el-table-column   align="center" label="操作">
        <template slot-scope="{ row }">
          <el-radio :value="row.status" @change="statusChange(row.uuid, 1)"  :label="1">已完成</el-radio>
          <el-radio  :value="row.status"  @change="statusChange(row.uuid, 0)" :label="0">未完成</el-radio>
          <el-tooltip effect="dark" content="详情" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-tickets"
              type="primary"
              @click="handleQueryDetail(row.uuid)"
            />
          </el-tooltip>
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
    <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[50, 150, 200, 300]"
          :page-size="paginationsize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
  </div>
</template>

<script>
import { queryBacklog, updateBacklog } from "@/api/backlog";
export default {
  data() {
    return {
      paginationsize:50,
      currentPage: 1,
      total:0,
      tableList: [],
      isTableLoading: false,
      queryForm: {},
      statusDict: ["未完成", "已完成" ],
      multipleSelection: [],
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
    };
  },
  filters:{
    statustxt(status){
      if (status == 0)
      {
        return "未完成"
      }
      else if (status == 1)
      {
        return "已完成"
      } 
    }
  },
  created() {
    this.handleQueryList();
  },
  methods: {
    statusChange( uuid, backlogstatus){ 
       updateBacklog({
        status:backlogstatus,
        uuid: uuid,
        method: "put", 
      })
        .then(({ data: { status, msg } }) => {
          
          if(status == 0){
              this.$notify({
                title: msg,
                message: "已更新", 
                type: "success"
              });
              this.handleQueryList()
          }
          else{
            this.$notify({
                title: "更新失败",
                message: msg,
                  type: "error"
              });
          } 
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    handleCurrentChange(e) {
      this.currentPage = e;
      this.handleQueryList(this.currentPage);
    },
    handleSizeChange(e) {
      // 切换条数
      setPaginationSize(e);
      this.paginationsize = e;
      this.handleQueryList(this.currentPage);
    },
    handleAdd() {
      this.$router.push({
        name: "backlog-edit",
      });
    },
    handleQueryDetail(id) {
      this.$router.push({
        name: "backlog-detail",
        query: {
          id
        },
      });
    },
    handleEdit(uuid) {
      this.$router.push({
        name: "backlog-edit",
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
      updateBacklog({ method: "delete", uuids}).then(
        ({ data: { status, msg } }) => {
          
          if (status === 0) {
            this.$notify({
              title:"删除成功",
              message:msg,
              type:"success"
            })
            this.handleQueryList(1);
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
      this.handleQueryList(1);
    },
    handleQueryList(currentPage) {
      let that = this;
      this.isTableLoading = true;
      queryBacklog({...this.queryForm,
      page: currentPage,
        pagenum: this.paginationsize,
      communityuuid:localStorage.getItem('communityuuid'),
      })
        .then(({ data: { status, msg } }) => {
          console.log(msg)
          if (status === 0) {
            that.tableList = msg.list;
            that.total = msg.total;
          }
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },
    //  table选择
    handleSelectionChange(selection) {
      console.log(selection)
      this.multipleSelection = selection.map(({ uuid }) => uuid);
      console.log(this.multipleSelection)
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
