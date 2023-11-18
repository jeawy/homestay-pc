<template>
  <div id="product-list">
    <el-container>
    
      <el-main>
        <el-row type="flex" justify="space-between">
          <el-form inline>
           
            <el-form-item>
             <el-input
             @keyup.enter.native="handleQueryList"
                    class="search-group"
                    placeholder="输入物业名字进行搜索"
                    v-model="queryForm.name"></el-input>
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
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  @click="handleAdd"
                >
                  添加物业
                </el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  :disabled="!multipleSelection.length"
                  plain
                  @click="handleDelete(multipleSelection)"
                >
                  删除选中物业
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
          <el-table-column type="index" align="center" label="序号"> </el-table-column>
           <el-table-column label="LOGO" width="90">
            
            <template slot-scope="{ row }">
              <el-image
                :src="baseurl+row.logo"
                style="width: 70px; height: 70px;line-height:90px"
              >
                <div slot="placeholder" class="image-slot">
                  加载中
                  <span class="dot">...</span>
                </div>
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture" style="color:#909399"></i>
                </div>
              </el-image> 
            </template>
          </el-table-column>
          <el-table-column label="物业全称"> 
            <template slot-scope="{ row }"> 
              <div class="name-wrap">
                {{ row.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="简称">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.alias }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="统一社会信息代码" width="400px">
            <template slot-scope="{ row }">
              <div class="name-wrap">
               {{ row.code }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="入驻日期" align="center">
        <template slot-scope="scope">{{scope.row.date|dateFormat}}</template>
      </el-table-column>
      
          <el-table-column width="120" align="center" label="操作">
            <template slot-scope="{ row }">
               
              <el-tooltip effect="dark" content="修改" placement="top">
                <el-link
                  :underline="false" 
                  type="primary"
                  @click="handleEdit(row.uuid)"
                >编辑</el-link>
              </el-tooltip>
              <el-tooltip effect="dark" content="删除" placement="top">
                <el-link
                  :underline="false" 
                  type="danger"
                  @click="handleDelete(row.uuid)"
                >删除</el-link>
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
      </el-main>
    </el-container> 
  </div>
</template>

<script> 
import {getOrganizeApi, deleteOrganizeApi} from "@/api/organize"
import { setPaginationSize, getPaginationSize  } from "@/utils/pagination";
export default {
  data() {
    return {
      currentPage: 1,
      total: 0,
      area:[],
      paginationsize: 50,
      tableList: [],
      isTableLoading: false,
      queryForm: {}, 
      EditAuth: true, //编辑权限，暂时设置为true
      DialogType: {},
      GroupForm: {},
      filterText: "",
      baseurl:this.$store.state.BASE_URL_IMAGE +"/",
      ActiveGroup: null,
      multipleSelection: [], 
       
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  
  created() {
    this.getOrganize();
    this.paginationsize = getPaginationSize();
  },
  methods: {
    searchGroup(value, data) {
      if (!value) return true;

      return data.name.indexOf(value) !== -1;
    },
    // 单击触发事件
    handleGroupClick(data) { 
      this.showList = false;
      this.ActiveGroup = { ...data };
      this.tableLoading = true;
      this.getRooms(1);
      this.tableLoading = false;
    },
    removeGroup(data) {
      this.$confirm("此操作将永久删除?", "注意", {
        confirmButtonText: "删除", 
        cancelButtonText: "取消", 
        type: "warning",
      }).then(() => { 
        updateBuilding({
          uuids: data.uuid,
          method: "delete",
          organizeuuid: localStorage.getItem("organizeuuid"),
          level: data.level,
        }).then(({ data: { status, msg } }) => {
          if (status === 0) {
            this.$notify({
              title: "删除成功",
              message: msg,
              type: "success",
            });
            this.getOrganize();
          } else {
            this.$notify({
              title: "删除失败",
              message: msg,
              type: "error",
            });
          }
        });
      });
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
     
    buildingChanged() {
      // 切换楼栋
      this.currentPage = 1;
      this.getRooms(this.currentPage);
    },
    getOrganize() {
      // 获得楼栋和对应的单元号信息
      let that = this;
      let params = {...this.queryForm} 
     
      getOrganizeApi({...params 
      }).then(({ data: { status, msg } }) => {
        if (status == 0) {
          that.total = msg.total;
          that.tableList = msg.organizes;
        } else {
          that.$notify({
            title: "获取物业信息失败",
            message: msg,
          });
        }
      });
    },
    handleAdd() {
      this.$router.push({
        name: "edit",
      });
    }, 
    handleEdit(uuid) {
      this.$router.push({
        name: "edit",
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
      deleteOrganizeApi({
        uuids, 
      }).then(({ data: { status, msg } }) => {
        if (status === 0) {
          this.$notify({
            title: "删除成功",
            message: msg,
            type: "success",
          });
          this.handleQueryList();
        } else {
          this.$notify({
            title: "删除失败",
            message: msg,
            type: "error",
          });
        }
      });
    },
    resetParams() {
      this.queryForm = {};
      this.ActiveGroup = null;
      this.handleQueryList();
    },
    handleQueryList() {
      this.getOrganize();
    },
    //  table选择
    handleSelectionChange(selection) { 
      this.multipleSelection = selection.map(({ uuid }) => uuid); 
    },
   
  },
};
</script>

<style lang="scss">
#product-list {
  .el-avatar {
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
  .name-wrap {
    display: flex;
    align-items: center;
  }
  .el-container {
    height: 100%;
  }
}
</style>
