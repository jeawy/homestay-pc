<template>
  <!-- 小区添加和修改 -->
  <main class="edit-content">
    <el-form
      :model="formData"
      status-icon
      ref="product-form"
      label-width="90px"
      :rules="rules"
    >
    <el-row>
        <el-col :span="12">
      <el-form-item label="小区名称" prop="name">
        <el-input v-model="formData.name"
        maxlength="10"
        show-word-limit></el-input>
      </el-form-item>
      </el-col>
        <el-col :span="12">
           <el-form-item label="IT 管理" prop="itmanager">
        <el-select filterable v-model="formData.itmanager">
              <el-option
                v-for="item of userList"
                :key="item.uuid"
                :label="item.phone +  item.username"
                :value="item.uuid"
              />
            </el-select>
      </el-form-item>
      
      </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
       <el-form-item label="物业" prop="organize">
        <el-select filterable v-model="formData.organize">
              <el-option
                v-for="item of organizes"
                :key="item.uuid"
                :label="item.name"
                :value="item.uuid"
              />
            </el-select>
      </el-form-item>
      </el-col>
       
          <el-col :span="12">
           <el-form-item label="微信商户号">
           <el-input type="number" maxlength="56"
                show-word-limit v-model="formData.wx_sub_mch_id"  ></el-input>
           </el-form-item> 
        </el-col>
        
      </el-row>
    
      <el-row>
        <el-col :span="12">
          <el-form-item label="行政区" prop="area">
            <el-cascader 
            v-if="isShowInfo" 
            v-model="formData.area" 
            :props="areas" 
       ></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="具体地址" prop="address">
            <el-input  maxlength="56"
                show-word-limit v-model="formData.address" placeholder="如：XX街道XX路XX号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="社区">
            <el-input v-model="formData.shequ"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="街道办">
            <el-input v-model="formData.jiedaoban"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="经度">
            <el-input v-model="formData.longitude"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="维度">
            <el-input v-model="formData.latitude"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.detail" type="textarea"> </el-input>
      </el-form-item>
 
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="isLoading" @click="submitForm">{{
          type == "add" ? "保存" : "修改"
        }}</el-button>
      </el-form-item>
    </el-form>
  </main>
</template>

<script> 
import {getUserList} from "@/api/admin"
import {getAreaApi} from "@/api/area"
import {getOrganizeApi, deleteOrganizeApi} from "@/api/organize"
import {addCommunityApi, getCommunityApi} from "@/api/community" 
export default {
  name: "edit-content",
  data() {
    return {
      type: "add",
      formData: {
        rules: [],
        method: "create",
      },
      organizes:[],
      isLoading: undefined,
      userList: [],
      categoryList: [],
      isShowInfo:true,
      rules: {
        name: [
          {
            required: true,
            message: "请输入小区名字",
            trigger: "change",
          },
        ],
        address: [
          {
            required: true,
            message: "请输入小区地址",
            trigger: "change",
          },
        ],
        organize: [
          {
            required: true,
            message: "请绑定物业",
            trigger: "change",
          },
        ],
        itmanager:[{
            required: true,
            message: "请选择IT管理人员",
            trigger: "change",
          }],
        area: [
          {
            required: true,
            message: "请输入小区行政区",
            trigger: "change",
          },
        ], 
      },
      mainrule: -1, //默认服务
      areas:{
        lazy:true,
        lazyLoad(node, resolve){
          const {level} = node;  
          let params = {}
          if (level > 0){
            params['parentid'] = node.value
          } 
          getAreaApi(params).then(({data:{status, msg}})=>{ 
             if (status == 0 ){ 
                   const nodes =msg
                    .map(item => ({
                      value: item.id,
                      label: item.name,
                      leaf: level >= 2
                    }));   
                    resolve(nodes) 
             } 
          });
          
        }
      }
    };
  },
  components: { 
  },
  watch: {  
    $route(to, from) {
      if (to.name == "edit") { 
        this.queryCategories();
        this.queryDetail();
      }
    },
  }, 
  created() { 
    this.getOrganize();
    this.getUsers();
    if (this.$route.query.uuid) {
      this.type = "put"; 
      this.queryDetail();
    } 
  },
  methods: {
    getUsers() {
      getUserList({simple:"simple"}).then((  res  ) => {  
          this.userList = res.data  
      });
    },  
    getOrganize() {
      getOrganizeApi().then(({ data: { status, msg } }) => {
    
        if (status == 0) { 
          this.organizes = msg.organizes
        }
      });
    }, 
    // 根据ID查询详情（修改前）
    queryDetail() { 
      let that = this
      getCommunityApi({
        uuid: this.$route.query.uuid,
        pc:1
      }).then(({ data: { status, msg } }) => { 
        if (status === 0) {   
          that.formData.area = []
          console.log(msg)
          that.formData = {
            uuid: msg.uuid,
            name: msg.name,  
            longitude: msg.longitude,
            latitude: msg.latitude,
            address: msg.address,
            detail: msg.detail,
            shequ: msg.shequ,
            jiedaoban: msg.jiedaoban,
            organize: msg.organize,
            itmanager: msg.itmanager,
            wx_sub_mch_id: msg.wx_sub_mch_id,
            area:msg.areaids   
          }; 
          that.formData.area =  msg.areaids
          // 解决级联列表不能动态绑定回显数据的问题
          that.isShowInfo = false;
          setTimeout(() => {
            that.isShowInfo = true;
          }, 100);
            }
      });
    },
    submitForm() {
      this.$refs["product-form"].validate((e) => {
        if (!e) {
          return false;
        }
        this.isLoading = true;
        
        this[`${this.type}Community`]();
      });
    },
    addCommunity() {  
      addCommunityApi({
        ...this.formData, 
        area:this.formData.area[this.formData.area.length-1],
        method: "create", 
      })
        .then(({ data: { status, msg } }) => {
          if(status == 0 ){
            this.$notify({
              type:"success",
              title:"提交成功",
              message:msg,
              duration:3000
            })
          }else{
            this.$notify({
              type:"error",
              title:"提交失败",
              message:msg,
              duration:3000
            })
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    putCommunity() { 
      addCommunityApi({
        ...this.formData,
        area:this.formData.area[this.formData.area.length-1],
        method: "put", 
      })
        .then(({ data: { status, msg } }) => {
          if(status == 0 ){ 
            this.$notify({ 
              title:"修改成功",
              message:msg,
              duration:3000,
              type:"success"
            })
          }else{
            this.$notify({
              type:"error",
              title:"修改失败",
              message:msg,
              duration:3000
            })
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
.edit-content {
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
  .el-select, .el-cascader  {
    width: 100%;
  }

  .type-wrap {
    display: flex;
    justify-content: space-between;
    label {
      font-weight: 400;
    }
  }
}
</style>
