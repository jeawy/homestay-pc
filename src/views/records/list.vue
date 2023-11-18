<template>
  <div id="product-list">
    <!-- 订单列表 -->

    <el-row type="flex" justify="space-between">
      <el-form inline>
        <el-form-item>
          <el-select v-model="queryForm.status" placeholder="状态" filterable>
            <el-option
              v-for="(item, index) in statusList"
              :key="index"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="queryForm.title" placeholder="标题"  >
             
          </el-input>
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
              发起登记
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
      <el-table-column   label="标题">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.title }}
          </div>
        </template>
      </el-table-column>  
      <el-table-column   label="状态">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.status|statusfilter }}
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="是否需要登录">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.need_login |need_loginfilter }} 
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="公开用户登记情况">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.show_userinfo |show_userinfofilter }} 
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="谁可以导出登记结果">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.only_owner_export |only_owner_exportfilter }} 
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="定时登记薄">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.autorecord |autorecordfilter }} <br/>
            <div v-if="row.autorecord == 1">【{{row.autotype |  autotypefilter}}】</div>
          </div>
          <div v-if="row.autorecord == 1">
              <span v-for="(item, index) in row.autodays" :key="index">{{item}} </span>
            </div>
        </template>
      </el-table-column>
        <el-table-column   label="移动端是否可见">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.available_appside | available_appsidefilter }} 
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="发布时间">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.date| dateTimeFormat}}
          </div>
        </template>
      </el-table-column>  
      
      <el-table-column prop="username" label="发布人" width="80" /> 
        
      <el-table-column width="80" align="center" label="操作">
        <template slot-scope="{ row }">
          <el-tooltip effect="dark" content="详情" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-tickets"
              type="primary"
              @click="handleDetail(row.uuid)"
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
  </div>
</template>

<script>
import { getRecords, postRecords  } from "@/api/record"; 
export default {
  name: "records-list",
  data() {
    return {
      tableList: [],
      isTableLoading: false,
      queryForm: {},
      statusList: [{
        name:"草稿",
        id:0  },
        {
        name:"已发布",
        id:1  },
        {
        name:"已关闭",
        id:2  } ],
      multipleSelection: [],
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
    };
  },
  filters:{
    autotypefilter(autotype){
      if (autotype == 0)
      {
        return "每天"
      }
      else if (autotype == 1)
      {
        return "每周"
      } 
      else if (autotype == 2)
      {
        return "每月"
      } 
    },
    available_appsidefilter(available_appside){
      if (available_appside == 0)
      {
        return "否"
      }
      else if (available_appside == 1)
      {
        return "是"
      } 
    },
    autorecordfilter(autorecord){
      if (autorecord == 0)
      {
        return "否"
      }
      else if (autorecord == 1)
      {
        return "是"
      } 
    },
    only_owner_exportfilter(only_owner_export){
      if (only_owner_export == 0)
      {
        return "所有人"
      }
      else if (only_owner_export == 1)
      {
        return "仅发起人"
      } 
       else if (only_owner_export == 2)
      {
        return "注册用户"
      } 
    },
    show_userinfofilter(show_userinfo){
      if (show_userinfo == 0)
      {
        return "不公开"
      }
      else if (show_userinfo == 1)
      {
        return "公开"
      } 
    },
    need_loginfilter(need_login){
      if (need_login == 0)
      {
        return "否"
      }
      else if (need_login == 1)
      {
        return "是"
      }
      
    },
    statusfilter(status){
      if (status == 0)
      {
        return "草稿"
      }
      else if (status == 1)
      {
        return "已发布"
      }
      else if (status == 2)
      {
        return "已结束"
      } 
    }
  },
  created() {
    this.handleQueryList();
  },
  methods: {
    handleAdd() {
      this.$router.push({
        name: "records-edit",
      });
    }, 
    handleDetail(uuid){
      this.$router.push({
        name: "records-detail",
        query: {
          uuid
        },
      });
    },
    handleEdit(uuid) {
      this.$router.push({
        name: "records-edit",
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
      postRecords({ method: "delete", uuids,communityuuid:localStorage.getItem('communityuuid') }).then(
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
      getRecords({...this.queryForm,communityuuid:localStorage.getItem('communityuuid')})
        .then(({ data: { status, msg } }) => {
          console.log(msg)
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
