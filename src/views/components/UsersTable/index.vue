<template >
  <div id="users-table" ref="drawer-parent">
    <template v-if="UserList">
      <el-table
        :data="UserList.slice((currentPage-1)*pageSize,currentPage*pageSize)"
        v-loading="tableLoading"
        style="width: 100%"
        highlight-current-row
        @selection-change="handleSelectionChange"
        :row-key="({row,$index})=>$index"
      >
        <el-table-column type="selection" :reserve-selection="true" width="55px"></el-table-column>
        <el-table-column label="头像" width="80" align="center">
          <template slot-scope="scope">
            <el-image v-if="scope.row.thumbnail_portait" :src="baseUrl+'/images/'+scope.row.thumbnail_portait" 
            size="small"></el-image>
            <el-avatar size="small" v-else>{{scope.row.username | avatarFormat}}</el-avatar>
          </template>
        </el-table-column>
         <el-table-column prop="username" label="姓名" align="left" 
         class-name="links" width="120px">
          <template slot-scope="scope"> 
              <span>{{scope.row.username}}</span>  
          </template>
        </el-table-column>
        <el-table-column prop="sex" label="性别" align="center" width="150">
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.sex"
              v-if="editing&&clickId === scope.row.id"
              @change="showEditIcon"
            >
              <el-option label="男" value="男">男</el-option>
              <el-option label="女" value="女">女</el-option>
            </el-select>
            <span v-if="!editing||clickId !== scope.row.id">{{scope.row.sex}}</span>
          </template>
        </el-table-column>
      
        <el-table-column prop="phone" label="电话" align="left">
          <template slot-scope="scope">
            <el-input
              size="small"
              v-model="scope.row.phone"
              placeholder="请输入电话"
              v-if="editing&&clickId === scope.row.id"
              @change="showEditIcon"
            >
              <span>{{scope.row.phone}}</span>
            </el-input>
            <span v-if="!editing||clickId !== scope.row.id">{{scope.row.phone}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="virtual" label="虚拟用户" align="left">
          <template slot-scope="scope">
           <div v-if="scope.row.virtual == 1">是</div>
           <div v-else>否</div>
          </template>
        </el-table-column>
        
         <el-table-column label="是否启用" align="center" >
          <template slot-scope="scope">
            <div v-if="scope.row.is_active == 1">是</div>
             <div v-else>否</div>
          </template>
        </el-table-column>  

        <el-table-column label="操作" align="center" show-overflow v-if="perssion">
          <template slot-scope="scope"> 
           <!-- <el-tooltip content="用户权限" placement="top">
            <el-button icon="el-icon-user" type="text" style="color:deepskyblue" />
            </el-tooltip> -->
            <el-tooltip effect="dark" content="修改" placement="top">
              <el-button
                v-if="!editing||clickId !== scope.row.id"
                type="primary"
                icon="el-icon-edit"
                @click="editUser(scope.row)"
              />
            </el-tooltip>
            <el-tooltip effect="dark" content="保存" placement="top">
              <el-button
                v-if="editing&&clickId === scope.row.id"
                type="success"
                icon="el-icon-check"
                @click="saveEdit(scope.$index,scope.row)"
              />
            </el-tooltip>
            <el-tooltip effect="dark" content="移除" placement="top">
              <el-button type="danger" icon="el-icon-delete" @click="deleteUser(scope.row.id)" />
            </el-tooltip>

          <!-- <el-tooltip content="移除用户" placement="top">
            <el-button icon="el-icon-delete" type="text" style="color:red"  />
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <div class="block" style="text-align: right;margin-top:10px">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pageSizeList"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="UserList.length"
        ></el-pagination>
      </div>
    </template>
    <Drawer
      scrollable
      closable
      v-model="drawer"
      width="526"
      :transfer="false"
      :mask="false"
      :inner="isInner"
      :title="drawerTitle"
    >
      <attrsBind
        :project="project"
        :customAttrs="customAttrs"
        :attrsList="attrsList"
        @refresh_customAttrs="NewcustomAttrs"
        :attrsTypeNum="attrsTypeNum"
      />
    </Drawer>
  </div>
</template>

<script>
import { editCommunityUserDetail, removeStaff } from "@/api/admin";
import { searchBind, getAttrsEntityList } from "@/api/attrs";
import attrsBind from "@/components/projectDrawer/components/attrsBind";
import thumbtackMixin from "@/mixins/thumbtack-mixin";
export default {
  mixins: [thumbtackMixin],
  name: "UsersTable",
  props: {
    UserList: {
      type: Array
    },
    tableLoading: {
      type: Boolean,
      default: false
    },
    perssion: {
      type: Boolean
    }
  },
  components: {
    attrsBind
  },
  data() {
    return {
      drawerTitle:'',
      currentPage: 1,
      pageSize: 20,
      pageSizeList: [10, 20, 50, 100],
      editing: false,
      clickId: null,
      iconShow: false,
      baseUrl: process.env.VUE_APP_BASE_IMAGE ,
      multipleSelection: [],
      drawer: false,
      project: null,
      attrsList: [],
      customAttrs: [],
      attrsTypeNum: null
    };
  },
  methods: {
    showDrawer(row) {
      this.drawer = true;
      this.drawerTitle = row.username
      this.project = row;
      searchBind({ entity_type: 7 }).then(({ data }) => {
        this.attrsList = [...data.msg];
      });
      getAttrsEntityList({ entity_id: row.id, entity_type: 7 }).then(({ data }) => {
        // console.log("llllll");
        this.customAttrs = [...data.msg];
        // console.log("mmmm");
        // console.log(this.customAttrs);
        this.attrsTypeNum = 7;
      });
    },
    NewcustomAttrs() {
      getAttrsEntityList({ entity_id: this.project.id, entity_type: 7 }).then(
        ({ data }) => {
          this.customAttrs = [...data.msg];
          this.attrsTypeNum = 7;
        }
      );
    },
    jump(id) {
      // console.log(id);
      this.$emit("jump", id);
    },
    //分页
    handleSizeChange(val) {
      this.pageSize = val;
      //console.log(this.pagesize);
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      //console.log(this.currentPage);
    },
    showEditIcon() {
      this.iconShow = true;
    },
    editUser(row) {
      this.$emit('editUser', row);
    },
    //移除单个用户
    deleteUser(id) {
      console.log(this.UserList)
      this.$confirm("此操作将移除该用户，是否继续?", "提示", {
        confirmButtonText: "确认", 
        type: "warning"
      }).then(() => {
        
      console.log(id)
        removeStaff({ ids: id, method: "delete"  }).then(({ data }) => {
          if (data.status === 0) {
            
            this.$notify({
              type:"success",
              message:data.msg,
              duration:2000,
              title:"移除成功"
            }) 
            this.$emit("refresh");
          } else {
            this.$notify({
              type:"error",
              message:data.msg,
              duration:2000,
              title:"移除失败"
            })
          }
         
        });
      });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.$emit("selection", val);
    },
    saveEdit(index, row) {
      this.$confirm("确定保存当前修改？", "注意", {
        confirmButtonText: "确定",
 

        type: "warning"
      }).then(() => {
        this.iconShow = false; 
       
        editCommunityUserDetail({
          method: "put",
          id: row.id,
          username: row.username,
          email: row.email,
          phone: row.phone, 
          isactive: row.is_active === true ? 1 : 0,
          sex: row.sex
        }).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.editing = false;
            this.$emit("refresh");
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    }
  }
};
</script>
<style lang="scss">
#users-table {
  border: 1px solid #dfe6ec;
  padding: 15px;
}
.links {
  cursor: pointer;
  color: #2d8cf0;
}
</style>