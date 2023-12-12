<template>
  <div id="userGroup">
    <el-container>
      <el-header style="padding:0px;margin: 0px">
        <el-row type="flex" align="middle" justify="space-between">
          <el-row type="flex" align="middle">
            
            <el-input
              placeholder="输入姓名搜索"
              v-model="queryForm.username"
              prefix-icon="el-icon-search"
              style="width:200px;margin-right:10px"
            ></el-input>
            
            <el-radio-group v-model="queryForm.virtual">
              <el-radio :label="-1">全部</el-radio> 
              <el-radio :label="0">真实用户</el-radio>
              <el-radio :label="1">虚拟用户</el-radio>
            </el-radio-group>
            <el-button-group>
            <el-button type="primary" @click="getAllUserlist">
              查询
            </el-button>
            <el-button type="primary" plain @click="resetParams">
              重置
            </el-button>
          </el-button-group>
            总数：
            <label for style="color:#ed4014">{{ total }}</label>
          </el-row> 
          <el-row type="flex" align="middle">
            <template v-if="perssion">
            <el-button
              type="primary"
              @click="openDialog(2)"
              :disabled="this.multipleSelection.length === 0 ||this.multipleSelection.length>1"
            >重置密码</el-button>
              <el-button type="primary" icon="el-icon-plus" @click="openDialog(1)">添加用户</el-button>
               
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="delMulUsers()"
                :disabled="this.multipleSelection.length === 0"
              >批量移除</el-button>
            </template>
          </el-row>
        </el-row>
      </el-header>
      <el-main style="padding: 0px"> 
        <el-table
        :data="UserList"
        v-loading="tLoading"
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
         class-name="links"  >
          <template slot-scope="scope"> 
              <span>{{scope.row.username}}</span>  
          </template>
        </el-table-column>
        <el-table-column prop="sex" label="性别" align="center" width="150">
          <template slot-scope="scope"> 
            <span >{{scope.row.sex}}</span>
          </template>
        </el-table-column>
      
        <el-table-column prop="phone" label="电话" align="left">
          <template slot-scope="scope"> 
            <span >{{scope.row.phone}}</span>
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
            <el-tooltip effect="dark" content="修改" placement="top">
              <el-button
                
                type="primary"
                icon="el-icon-edit"
                @click="editUser(scope.row)"
              />
            </el-tooltip> 
            <el-tooltip effect="dark" content="移除" placement="top">
              <el-button type="danger" icon="el-icon-delete" @click="deleteUser(scope.row.id)" />
            </el-tooltip>
 
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
          :total="total"
        ></el-pagination>
      </div>
      </el-main>
    </el-container>
    <el-dialog :visible.sync="dialogShow1" :title="dialogName" width="400px">
      <el-form
        :loading="buttonStates.createLoading"
        :model="userForm"
        :rules="rules"
        ref="userForm"
        label-width="90px"
        hide-required-asterisk
        label-position="left"
      >
      <el-form-item label="电话" prop="phone" >
          <el-input type="number" v-model="userForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="username">
          <el-input v-model="userForm.username" ></el-input>
        </el-form-item>
         
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="userForm.sex" style="padding-top:8px">
            <el-radio-button :label="0">男</el-radio-button>
            <el-radio-button :label="1">女</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="密码(默认)" prop="password">
          <el-input v-model="userForm.password" ></el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="isactive">
          <el-switch v-model="userForm.isactive"></el-switch>
        </el-form-item>
        <el-form-item label="虚拟用户" prop="virtual">
          <el-switch v-model="userForm.virtual"></el-switch>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            accept="image/jpeg, image/gif, image/png"
            ref="upload"
            class="upload-demo"
            action="" 
            :auto-upload="false"
            :http-request="HandleImg" 
            drag
            :show-file-list="false"
            :on-change="handleAvatarSuccessMainPic"
          >
            <el-image
              v-if="SRC" 
              :src="SRC"
              fit="fill"
            ></el-image>
            <template v-else>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
          <!-- <el-input v-model="userForm.image"></el-input> -->
        </el-form-item>
        <el-form-item>
          <el-button @click="cancel(1)">取消</el-button>
          <el-button type="primary" @click="addUser">立即添加</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    
   
    <el-dialog title="重置密码" :visible.sync="dialogShow2" width="400px">
      <el-form
        :model="resetPassForm"
        status-icon
        :rules="rules"
        ref="resetPassForm"
        label-width="90px"
      >
        <el-form-item label="密码" prop="pass">
          <el-input type="password" v-model="resetPassForm.pass"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="resetPassForm.checkPass"></el-input>
        </el-form-item>
        <el-form-item>
          <!-- <el-button @click="resetForm('resetPassForm')">重置</el-button> -->
          <el-button type="primary" @click="submitForm('resetPassForm')">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import usersTable from "@/views/components/UsersTable";
import { getUserList, getUserPerfession, deleteUser, editUserDetail, removeStaff } from "@/api/admin";
import { addStaff } from "@/api/admin";
export default {
  name: "userGroup",

  components: {
    usersTable
  },

  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.resetPassForm.checkPass !== "") {
          this.$refs.resetPassForm.validateField("checkPass");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.resetPassForm.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      total:0,
      currentPage: 1,
       pageSize: 20,
       pageSizeList: [10, 20, 50, 100],
      tLoading:false,
      radio: 1, 
      queryForm:{
        username: "",
        virtual:-1
      }, 
      
      UserList: [],
      dialogShow1: false,
      dialogShow2: false,
      dialogName: null,
      perssion: true, 
      SRC:"",
      baseUrl: process.env.VUE_APP_BASE_IMAGE +"/images/",
      userForm: {
        password: "123456",
        isactive: true,
        sex:0,
        virtual:1
      },
      
      resetPassForm: {
        pass: "",
        checkPass: ""
      },
      rules: { 
            pass: [{ validator: validatePass, trigger: "blur" }],
            checkPass: [{ validator: validatePass2, trigger: "blur" }],
            username: [{ required: true, message: "请输入姓名", trigger: "blur" }
        ],
        phone: [{ required: true, message: "请输入电话", trigger: "blur" }]},
      buttonStates: {
        createLoading: false
      },
      multipleSelection: [],
      formfileData:null
    };
  },
 
  methods: {
    resetParams(){
      this.queryForm={
        username: "",
        virtual:-1
      }
      this.currentPage = 1
      this.getAllUserlist()
    },
    handleSizeChange(val) {
       this.pageSize = val; 
     },
    handleCurrentChange(currentPage) {
       this.currentPage = currentPage; 
       this.getAllUserlist()
    },
    handleAvatarSuccessMainPic(file){
      this.SRC = URL.createObjectURL(file.raw);
    },
    HandleImg(param){   
      this.formfileData.append("img", param.file) 
    },
    batchImport(){
      // 跳转编辑页面 
      this.$router.push({
        name:"user-import" 
      })
    },
    editUser(row){ 
      this.userForm = row
      this.userForm.method = "put"
      if(this.userForm.thumbnail_portait ){
        this.SRC = this.baseUrl + this.userForm.thumbnail_portait
      }

      if(this.userForm.virtual  ){
        this.userForm.virtual = true
      }

      if(this.userForm.is_active   ){
        this.userForm.isactive = true
      }

      if(this.userForm.sex == "男"   ){
        this.userForm.sex = 0
      }
      else{
        this.userForm.sex = 1
      }


      this.dialogShow1 = true
    },
    submitForm(resetPassForm) {
      this.$refs[resetPassForm].validate(valid => {
        if (valid) {
          const id = this.multipleSelection.map(item => item.id).join(",");
          editUserDetail({ method: "put", userid: id ,password:this.resetPassForm.pass }).then(({ data }) => {
   
            if (data.status === 0) {
              this.$notify({
                type:"success",
                message:data.msg,
                duration:2000,
                title:"添加成功"
              }) 
              this.dialogShow2 = false;
            }
            else{
                this.$notify({
                type:"error",
                message:data.msg,
                duration:2000,
                title:"添加失败"
              }) 
            }
          }); 
        } else { 
          return false;
        }
      });
    }, 
    change() {
      this.$forceUpdate();
    },
    getAllUserlist() {
      this.tLoading = true 
      let param = {
        ...this.queryForm, 
        page: this.currentPage,
        pagenum: this.pageSize
      }
      getUserList(param ).then( ({data}) => {
        console.log(data)
        this.UserList =  data.msg.list;
        this.total =  data.msg.total;
        this.tLoading = false;
       
      }).catch(()=>{
        this.tLoading = false
      })
      getUserPerfession( ).then(({ data }) => {
        this.perssion = data.msg.admin_management;  
      });
    },
    getNullDeptUser() {
      getUserList({ deptid: null }).then(({ data }) => {
        this.UserList = [...data];
      });
    },
    openDialog(Type) {
      if (Type === 1) {
        this.dialogName = "添加用户";
        this.dialogShow1 = true;
      }else if (Type === 2) {
        this.dialogShow2 = true;
      } else {
        this.$router.push({
          name: "user-import"
        });
      }
    },
    //批量移除用户
    delMulUsers() {
      this.$confirm("此操作将移除用户,是否继续?", "提示", {
        confirmButtonText: "确定", 
        type: "warning"
      }).then(() => {
        const ids = this.multipleSelection.map(item => item.id).join(",");
        removeStaff({ ids: ids, method: "delete"  }).then(({ data }) => {
        
          if (data.status === 0) {
            
            this.$notify({
              type:"success",
              message:data.msg,
              duration:2000,
              title:"移除成功"
            }) 
            this.getAllUserlist();
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
    getEditData(){
      // 数据格式化
      
      if (this.userForm.sex === 0) {
        this.formfileData.append("sex", "男") 
      } else {
        this.formfileData.append("sex", "女")
      }
 
      if (this.userForm.method == 'put')
      {
        this.formfileData.append("method", "put")
        this.formfileData.append("uuid", this.userForm.uuid)
      }
  
      this.formfileData.append("phone", this.userForm.phone)
      this.formfileData.append("username", this.userForm.username)
      if(this.userForm.isactive){
        this.formfileData.append("isactive", 1)  
      }
      else{
        this.formfileData.append("isactive", 0)
      }
      
      if(this.userForm.virtual){
        this.formfileData.append("virtual", 1)  
      }
      else{
        this.formfileData.append("virtual", 0)
      }
 
      this.formfileData.append("password", this.userForm.password)  
    },
    addUser() {
      this.$refs["userForm"].validate(valid => {
        if (valid) {
          this.createLoading = true; 

          this.$refs.upload.submit()
          this.getEditData()

          addStaff(this.formfileData).then(({ data }) => {
            if (data.status === 0) {
              this.createLoading = false;
              this.$message.success(data.msg);
              this.dialogShow1 = false;
              this.getAllUserlist();
            } else {
              this.createLoading = false;
              this.$message.error(data.msg);
              this.dialogShow1 = false;
            }
          });
        } else {
          return false;
        }
      });
    },
    cancel(Type) { 
      console.log(Type)
      if (Type === 1) { 
        this.dialogShow1 = false;
      }else if (Type === 2) {
        this.dialogShow2 = false;
      } else {
        this.$router.push({
          name: "user-import"
        });
      } 
      this.$refs["userForm"].resetFields();
      this.userForm = {
        password: "123456",
        isactive: true
      };
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    }
  },

  watch: {
    radio(val) {
      switch (val) {
        case 1: 
          this.getAllUserlist();
          break;

        case 2:
          this.getNullDeptUser();
          break;
      }
    }, 
  },

  created() { 
    this.formfileData = new FormData()
    this.getAllUserlist();
  }
};
</script>

<style lang="scss" scoped src="./userGroup.scss">
</style>
