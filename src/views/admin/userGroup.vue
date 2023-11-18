<template>
  <div id="userGroup">
    <el-container>
      <el-header style="padding:0px;margin: 0px">
        <el-row type="flex" align="middle" justify="space-between">
          <el-row type="flex" align="middle">
            
            <el-input
              placeholder="输入姓名搜索"
              v-model="filterText"
              prefix-icon="el-icon-search"
              style="width:200px;margin-right:10px"
            ></el-input>总数：
            <label for style="color:#ed4014">{{ dealUserCount }}</label>
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
        <users-table
          :UserList="UserList"
          :perssion="perssion"
          :tableLoading="tLoading"
          @refresh="getAllUserlist"
          @selection="handleSelectionChange"
        ></users-table>
      </el-main>
    </el-container>
    <el-dialog :visible.sync="dialogShow1" :title="dialogName" width="400px">
      <el-form
        :loading="buttonStates.createLoading"
        :model="userForm"
        :rules="rules"
        ref="userForm"
        label-width="100px"
        hide-required-asterisk
        label-position="left"
      >
      <el-form-item label="电话" prop="phone" @input="change($event)">
          <el-input v-model="userForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="username">
          <el-input v-model="userForm.username" @input="change($event)"></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="userForm.email" @input="change($event)"></el-input>
        </el-form-item>
        
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="userForm.sex" style="padding-top:8px">
            <el-radio-button :label="0">男</el-radio-button>
            <el-radio-button :label="1">女</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="密码(默认)" prop="password">
          <el-input v-model="userForm.password" @input="change($event)"></el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="isactive">
          <el-switch v-model="userForm.isactive"></el-switch>
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
      tLoading:false,
      radio: 1,
      communityuuid:"",
      filterText: "",
      UserList: [],
      dialogShow1: false,
      dialogShow2: false,
      dialogName: null,
      perssion: true,
      dealUserCount: 0,
      userForm: {
        password: "123456",
        isactive: true
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
        phone: [{ required: true, message: "请输入姓名", trigger: "blur" }]},
      buttonStates: {
        createLoading: false
      },
      multipleSelection: []
    };
  },

  // computed: {
  //   ...mapState('admin',['UserList'])
  // },


  methods: {
    batchImport(){
      // 跳转编辑页面
      let communityuuid = this.$route.query.communityuuid
      this.$router.push({
        name:"user-import",
        query:{
          communityuuid
        },
      })
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
      getUserList({communityuuid:this.communityuuid}).then( res => {
       
        this.UserList = res.data;
        this.dealUserCount = this.UserList.length;
        this.tLoading = false;
       
      }).catch(()=>{
        this.tLoading = false
      })
      getUserPerfession({communityuuid:this.communityuuid}).then(({ data }) => {
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
        removeStaff({ ids: ids, method: "delete", communityuuid:this.communityuuid }).then(({ data }) => {
        
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
    addUser() {
      this.$refs["userForm"].validate(valid => {
        if (valid) {
          this.createLoading = true;
          if (this.userForm.sex === 0) {
            this.userForm = {
              ...this.userForm,
              sex: "男"
            };
          } else {
            this.userForm = {
              ...this.userForm,
              sex: "女"
            };
          }

          addStaff({...this.userForm, communityuuid:this.communityuuid}).then(({ data }) => {
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
    filterText: {
      handler: function(newVal, oldVal) {
        if (newVal) { 
          getUserList({ username: newVal,communityuuid:this.communityuuid }).then(res=> {
            this.UserList = res.data;
          });
        } else {
          this.getAllUserlist();
        }
      }
    }
  },

  created() { 
    this.communityuuid = this.$route.query.communityuuid 
      if (typeof(this.communityuuid) == "undefined"){ 
        this.communityuuid = localStorage.getItem("communityuuid")
      } 
    this.getAllUserlist();
  }
};
</script>

<style lang="scss" scoped src="./userGroup.scss">
</style>
