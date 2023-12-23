<template>
  <div id="activityInfo">
    <!-- 优惠券列表 -->
    <el-row class="row-lg">
      
      <el-col :span="3">
        <el-button type="primary" icon="el-icon-plus" @click="openTopDialog"
          >新增优惠券</el-button
        >
      </el-col>
    </el-row>
    <el-table
      row-key="id"
      :data="coupons"
      border
      :stripe="true"
      :row-style="{ 'font-size': '13px' }"
      :header-cell-style="{
        'font-size': '12px',
        background: '#eef1f6',
        color: '#606266',
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
      <el-table-column label="优惠券标题" align="center">
        <template slot-scope="scope">
          <div slot="placeholder" class="image-slot">
            <span class="dot">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类别" align="center" width="80">
        <template slot-scope="scope">
          <div slot="placeholder" class="image-slot">
            <span class="dot">{{ scope.row.coupontype | coupontypetxt }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="优惠力度"  >
        <template slot-scope="scope">
          <div slot="placeholder" class="image-slot" v-if="scope.row.coupontype==0">
            <span class="dot">{{ scope.row.discount}}折</span>
          </div>
          <div slot="placeholder" class="image-slot" v-if="scope.row.coupontype==1">
            <span class="dot">满{{ scope.row.top_money}}元 减{{ scope.row.reduce_money}}元 </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="使用规则" align="center" >
        <template slot-scope="scope">
          <div slot="placeholder" class="image-slot">
            <span class="dot">{{ scope.row.rules}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="使用范围" align="center" >
        <template slot-scope="scope">
          <span slot="placeholder" class="image-slot" v-for="(item, index ) in scope.row.categories" :key="index">
             {{ item.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="有效期" align="center" >
        <template slot-scope="scope">
          <div slot="placeholder" class="image-slot">
            <span class="dot">{{ scope.row.start |dateFormat}} -  {{ scope.row.end|dateFormat}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :key="20" label="状态" align="center" width="80">
        <template slot-scope="{ row }">
          <div slot="placeholder" class="image-slot">
            <span class="dot">{{  row.status | statustxt }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :key="18" label="操作"   align="center">
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
              @click="deleteAct(scope.row.uuid)"
              >删除</el-button
            >
          </el-tooltip>
         
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :visible.sync="dialogShow"
      :title="dialogName"
      width="500px"
      @closed="initForm"
    >
      <el-form
        :loading="buttonStates.createLoading"
        :model="actForm"
        ref="actForm"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="使用范围" prop="name">
          <el-cascader v-model="actForm.category" placeholder="请选择商品类别" 
                
              :options ="options"
              :props="{ checkStrictly: true, multiple: true }"
              > 
            </el-cascader> 
        </el-form-item>
        <el-form-item label="优惠券标题" prop="name">
          <el-input
            v-model="actForm.name"
            placeholder="请输入优惠券标题"
          ></el-input>
        </el-form-item>

        <el-form-item label="是否启用" prop="status">
          <el-switch
            v-model="actForm.status"
            :active-value="1"
            active-text="发布"
            inactive-text="未发布"
            :inactive-value="0"
          >
          </el-switch>
        </el-form-item>

        <el-form-item label="类别" prop="coupontype">
          <el-radio v-model="actForm.coupontype" class="cardtype" :label="1"
            >满减券</el-radio
          >
          <el-radio v-model="actForm.coupontype" class="cardtype" :label="0"
            >折扣券</el-radio
          >
        </el-form-item>
        
        <el-form-item label="优惠力度" prop="coupontype"  v-if="actForm.coupontype ==1">
           <div class="detail">
            <div class="txt">满</div>
            <input class="inputtxt" type="number" v-model="actForm.top_money" min="0"/>
            <div class="txt">元 减</div>
            <input class="inputtxt" type="number" v-model="actForm.reduce_money" min="0"/>
            <div class="txt">元</div>
           </div>
        </el-form-item>
        <el-form-item label="优惠力度" prop="coupontype"  v-if="actForm.coupontype == 0">
           <div class="detail"> 
            <input class="inputtxt" type="number" v-model="actForm.discount" min="0" max="10"/>
            <div class="txt">折</div> 
           </div>
        </el-form-item>
        <el-form-item label="有效期" prop="coupontype">
          <el-date-picker
            v-model="actForm.daterange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="使用说明" prop="coupontype"> 
            <input class="inputtxt  rules"  v-model="actForm.rules" /> 
        </el-form-item>
        <el-form-item label="用户领取上限" prop="coupontype"> 
          <el-input-number v-model="actForm.limit" :min="1" :max="10" ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addAct('actForm')">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { getCouponApi, updateCoupon } from "@/api/coupon"; 
import {  getCategory } from "@/api/category";
export default {
  data() {
    return {
      communityuuid: "",
      coupons: [],
      options:[],
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
        status:0,
        visible: 1,
        limit:1,
        coupontype:1,
        daterange:[]
      },
      total:0,
      SRC: "", 
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
    getCategoryList(){
      //获取商品的类别
      let categorytypes = "10" 
      
      getCategory({pc:"", categorytypes:categorytypes}).then(({data})=>{ 
         if(data.status == 0){
          console.log(data)
           this.categoriesList = data.msg
           let children = []
           for(var i = 0; i < data.msg.length;i ++){
             children = []
             if (data.msg[i].sub.length > 0){
               for(var j = 0; j < data.msg[i].sub.length;j ++){
                 children.push({
                   value: data.msg[i].sub[j].id,
                   label: data.msg[i].sub[j].name,
                 })
               }
             }
             this.options.push(
               {
                 value: data.msg[i].id,
                 label: data.msg[i].name,
                 children:children
               }
             )
           }
         }
         else{
           this.$notify(
             {
               type:"error",
               title:"获取商品类别失败",
               message:data.msg,
               duration:0 
             }
           )
         }
      })
    },
    //  显隐切换
    onVisibleChange(visible, row, idx) {
      this.coupons.splice(idx, 1, { ...row, disabled: true });
      updateCoupon({ id: row.id, method: "put", visible }).then(({ data }) => {
        if (data.status === 0) {
          this.$message.success(data.msg);
          this.coupons.splice(idx, 1, {
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
    
      console.log(new Date(row.start), new Date(row.end))
      this.actForm.daterange = [new Date(row.start * 1000), new Date(row.end* 1000)]
      this.dialogName = "编辑"; 
      this.dialogShow = true;
    },
    //获取优惠券列表
    getCategories() {
      getCouponApi({ pc: "" }).then(({ data }) => {
        console.log(data)
        if (data.status == 0) {
          this.coupons = data.msg.coupons;
          this.total = data.msg.total
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
    },
    closeSub(id, name) {
      this.$confirm("是否删除" + name + "优惠券?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        updateCoupon({ ids: id, method: "delete" }).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getCategories();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
    //删除优惠券
    deleteAct(id) {
      this.$confirm("是否删除该优惠券?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        updateCoupon({ uuid: id, method: "delete" }).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getCategories();
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
      this.dialogName = "新增优惠券";
      this.dialogShow = true;
    },
    //新增优惠券
    addAct(actForm) {
      this.postSpread();
    }, 
    //关闭添加优惠券弹出框
    cancel() {
      this.postSpread();
    },
    postSpread() {
      if (this.parentid > 0) {
        this.actForm.parentid = this.parentid;
      }
      let time = ""
      if(this.actForm.daterange.length < 2){
        this.$notify({
              type: "error",
              title: "提交失败",
              message: "请设置有效期",
            });
            return
      }
      else{
        time = this.actForm.daterange[0].getTime() +"," +this.actForm.daterange[1].getTime() 
      }
      let data = {
        ...this.actForm,
        time:time
      } 
      data.categoryids  = ""
      console.log(this.actForm.category)
      this.actForm.category.forEach((item)=>{ 
        console.log(item)
        data.categoryids += item[item.length - 1] +","
      }) 
      updateCoupon(data).then(({ data }) => {
        if (data.status == 0) {
          this.$message.success(data.msg);
          this.dialogShow = false;
          this.$refs["actForm"].resetFields();
          this.getCategories();
        } else {
          this.$message.error(data.msg);
        }
      });
    }
  }, 
  filters:{
    coupontypetxt(status){
      if (status == 0)
      {
        return "折扣券"
      }
      else if (status == 1)
      {
        return "满减券"
      } 
    },
    statustxt(status){
      if (status == 0)
      {
        return "未发布"
      }
      else if (status == 1)
      {
        return "已发布"
      } 
      else if (status == 2)
      {
        return "已过期"
      } 
    }
  },
  created() {
    this.getCategories();
    this.getCategoryList()
  }
}
</script>
<style lang="scss" scoped>
.row-lg {
  margin-bottom: 5px;
}
.detail{
  display: flex;
  
}
input.inputtxt {
      height: 20px; 
      width: 94px;
      border: none;
      border-bottom: 1px solid #bfbfbf;
  }

  input.rules{
    width:100%;
  }
</style>
