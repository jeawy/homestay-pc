<template>
  <div id="product-list">
    <el-container> 
      <el-main>
        <el-row type="flex" justify="space-between">
          <el-form inline>
            <el-form-item>
              <el-input
                class="search-group"
                placeholder="输入房号进行搜索"
                v-model="queryForm.roomname"
              ></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button-group>
                <el-button type="primary" @click="handleQueryList()">
                  查询
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
          
        >
          <el-table-column type="expand">
              <template slot-scope="{ row }"> 
                <div v-html="row.message"></div>
              </template>
          </el-table-column> 
          <el-table-column type="index" label="序号" align="center">
          </el-table-column>
          <el-table-column label="操作者">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.username }}
              </div>
            </template>
          </el-table-column>   
          <el-table-column label="房号">
            <template slot-scope="{ row }">
              <div class="name-wrap">{{ row.unitname }} {{ row.room }}</div>
            </template>
          </el-table-column> 
          <el-table-column prop="username" label="手机号码">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.phone  }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="状态">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.status | filterStatus }}
              </div>
            </template>
          </el-table-column>
           
          <el-table-column prop="username" label="提交日期">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.date | dateTimeFormat }}
              </div>
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
      </el-main>
    </el-container>
 
  </div>
</template>

<script>
import {
  getMsgRecordsApi, 
} from "@/api/msg";
import { setPaginationSize, getPaginationSize } from "@/utils/pagination";
export default {
  name:"fee-list",
  data() {
    return {
      form: {
        name: "",
        region: "", 
        delivery: false,
        type: [], 
      },
 
      currentPage: 1,
      total: 0,
      paginationsize: 50,
      tableList: [],
      isTableLoading: false,
      queryForm: {
        name:""
      },
      buildings: [],
      EditAuth: true, //编辑权限，暂时设置为true 
      filterText: "",
      ActiveGroup: null,  
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  filters:{
    filterStatus(val){
      if (val == 0){
        return "已发送"
      }
      else if (val == 1){
        return "待发送"
      }
      else if (val == 2){
        return "短信余额不足，未发送"
      }
    }
  },

  created() { 
    this.getMsgRecords(1);
    this.paginationsize = getPaginationSize();
  },
  methods: {
    searchGroup(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    }, 
    handleCurrentChange(e) {
      this.currentPage = e;
      this.getRooms(this.currentPage);
    },
    handleSizeChange(e) {
      // 切换条数
      setPaginationSize(e);
      this.paginationsize = e;
      this.getRooms(this.currentPage);
    },     
    resetParams() {
      this.queryForm = {};
      this.ActiveGroup = null; 
      this.handleQueryList();
    },
    handleQueryList() {
      this.getMsgRecords(1);
    }, 
    getMsgRecords(currentPage) { 
      // 搜索rooms
      this.isTableLoading = true;
      let that = this;
      let params = {
        page: currentPage,
        pagenum: this.paginationsize,
        communityuuid: localStorage.getItem("communityuuid"),
      };
      if (this.queryForm.roomname != "") {
        params["roomname"] = this.queryForm.roomname;
      }
   
      getMsgRecordsApi(params)
        .then(({ data: { status, msg } }) => {
          if (status == 0) {
            that.tableList = msg.records;
            that.total = msg.total;
          } else {
            that.$notify({
              title: "获取发送记录失败",
              message: msg,
              duration:0
            });
          }
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped src="./list.scss">
</style>
