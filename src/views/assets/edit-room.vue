<template>
  <!-- 添加和修改 -->
  <main class="edit-product">
    <el-form
      :model="formData"
      status-icon
      ref="product-form"
      label-width="140px"
      :rules="rules"
      v-loading="pageLoading"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item label="楼号/单元号" prop="buildings">
            <el-cascader
              :props="buildings"
              v-if="isShowInfo"
              v-model="formData.unit"
            ></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="房号" prop="name">
            <el-input v-model="formData.name" maxlength="10" show-word-limit>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="房屋面积" prop="area">
            <el-input v-model="formData.area" type="number" min="0"> </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="业主姓名">
            <el-input
              placeholder="业主姓名"
              maxlength="18"
              show-word-limit
              v-model="formData.username"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="业主电话">
            <el-input
              maxlength="11"
              type="number"
              show-word-limit
              v-model="formData.phone"
            ></el-input>
          </el-form-item>
        </el-col> 
      </el-row>
       <el-row>
         
        <el-col :span="8">
          <el-form-item label="物业费" prop="fixed_fee">
            <el-select v-model="formData.fixed_fee">
              <el-option
                v-for="item of FixedFeesList"
                :key="item.value"
                :label="item.name"
                :value="item.uuid"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item label="物业费已交费至" >
              <el-date-picker
                v-model="formData.arrearage_start_date"
                type="date"
                style="width: 170px"
                format="yyyy/MM/dd"
                value-format="yyyy/MM/dd"
                placeholder="请选择起始计费日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
      </el-row>
      <el-form ref="dynamicform" label-width="140px" :rules="itemrules" :model="formFee">
        <el-row>
          <el-col :span="8">
            <el-form-item label="其他费用项"  >
              <el-select
                v-model="formFee.newDynamicfee"
                placeholder="如停车费等"
              >
                <el-option
                  v-for="item in otherFeesList"
                  :key="item.uuid"
                  :label="item.name"
                  :value="item.uuid"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="起始计费日期" >
              <el-date-picker
                v-model="formFee.start_date"
                type="date"
                style="width: 170px"
                format="yyyy/MM/dd"
                value-format="yyyy/MM/dd"
                placeholder="请选择起始计费日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="success" @click="addDynamicfees"
                >添加收费项</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
       <el-form-item>
         <span>注意：此处仅制定收费项，如需进行收费，请在<el-link type="warning" href="">收银台</el-link>进行收费</span>
       </el-form-item>
        <el-table
      :data="formData.dynamic_fees"
      style="width: 80%;margin-left:10%">
      <el-table-column
        prop="dynamicfee__name"
        label="收费项"
        width="180">
      </el-table-column>
      <el-table-column
        prop="start_date"
        label="起始计费日期"
        width="180">
      </el-table-column>
      <el-table-column >
        <el-button type="warning" @click="deleteDynamicFee">删除</el-button>
      </el-table-column>
    </el-table> 
      <el-form-item label="房屋状态">
        <el-radio v-model="formData.status" label="0">空置</el-radio>
        <el-radio v-model="formData.status" label="1">已入住</el-radio>
      </el-form-item>
      <el-form-item label="缴费状态" prop="description">
        <el-radio v-model="formData.fee_status" label="1">正常</el-radio>
        <el-radio v-model="formData.fee_status" label="0">已欠费</el-radio>
        <label v-if="formData.fee_status == '0'">欠费起始日期：</label>
        <el-date-picker
          v-model="formData.arrearage_start_date"
          v-if="formData.fee_status == '0'"
          type="date"
          format="yyyy/MM/dd"
          value-format="yyyy/MM/dd"
          placeholder="请选择欠费起始日期"
        >
        </el-date-picker>
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
import { getRoomApi, updateRoom } from "@/api/building";
import { getFixedFeeApi, getDynamicFeeApi } from "@/api/fee";
import { getBuildings } from "@/api/building";
import dayjs from "dayjs";
export default {
  name: "edit-room",
  data() {
    return {
      type: "add",
      pageLoading: false,
      otherfees: [],
      isShowInfo: false,
      itemrules: {
        newDynamicfee: [
          {
            required: true,
            message: "请选择收费项",
            trigger: "change",
          },
        ],
        start_date: [
          {
            required: true,
            message: "请选择起始计费日期",
            trigger: "blur",
          },
        ],
      },
      buildings: {
        lazy: true,
        lazyLoad(node, resolve) {
          const { level } = node;
          let params = {};
          if (level > 0) {
            params["buildinguuid"] = node.value;
          }
          getBuildings(params).then(({ data: { status, msg } }) => {
            if (status == 0) {
              const nodes = msg.map((item) => ({
                value: item.uuid,
                label: item.name,
                leaf: level >= 1,
              }));
              resolve(nodes);
            }
          });
        },
      },
      formData: {
        roomuuid: "",
        rules: [],
        method: "create",
        fee_status: "1",
        status: "0",
        dynamic_fees: [],
        newDynamicfee: "",
        start_date: "",
      },
      formFee: {
        newDynamicfee: "",
        start_date: "",
      },
      isLoading: undefined,
      FixedFeesList: [],
      options: [],
      categoryList: [],
      otherFeesList: [],
      communityuuid:"" ,
      rules: {
        fixed_fee: [
          {
            required: true,
            message: "请选择物业费收费方式",
            trigger: "change",
          },
        ],
        categoryid: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
          },
        ],
        area: [
          {
            required: true,
            message: "请输入房屋面积",
            trigger: "blur",
          },
        ],
        name: [
          {
            required: true,
            message: "请输入房号",
            trigger: "blur",
          },
        ],
        rules: [
          {
            type: "array",
            required: true,
            message: "请添加业主",
            trigger: "blur",
          },
        ],
      },
      mainrule: -1, //默认服务
    };
  },
  watch: {
    $route(to, from) {
      if (to.name == "asset-edit-room") {
        this.queryDetail();
      }
    },
  },
  created() {
    if (this.$route.query.uuid) {
      this.type = "put"; 
      if (this.$route.query.communityuuid){
        //来自首页的跳转
        this.communityuuid = this.$route.query.communityuuid
      }
      else{
        this.communityuuid = localStorage.getItem("communityuuid")
      }
      this.queryDetail();
    }
    this.initData();
  },
  methods: {
    addDynamicfees() { 
      this.$refs["dynamicform"].validate((valid) => {
        if(valid){
          let name = ""
          for (let i = 0; i < this.otherFeesList.length ; i ++){
            if (this.otherFeesList[i].uuid == this.formFee.newDynamicfee){
              name = this.otherFeesList[i].name
              let added = false
              for (let j = 0; j < this.formData.dynamic_fees.length; j++){
                 if (name == this.formData.dynamic_fees[j].dynamicfee__name){
                   added = true;
                   break
                 }
              }
              if (added){
                this.$notify({
                  title:"该收费项已添加",
                  message:"不能重复添加收费项",
                  type:"error",
                  duration:0
                })
              }
              else{
                this.formData.dynamic_fees.push({
                  dynamicfee__name:name,
                  dynamicfee__uuid: this.formFee.newDynamicfee,
                  start_date:this.formFee.start_date}
                  )
                  break
              }
               
            }
          }
         
        }
      }); 
    },
    dateFormat(date) {
      if (date) {
        date *= 1000;
        return dayjs(date).format("YYYY/MM/DD");
      } else {
        return "";
      }
    },
    deleteDynamicFee(index) {
      // 未保存到数据库的收费项直接删除
      this.$confirm("确定删除该收费项？", "注意",{
        confirmButtonText:"删除",
        cancelButtonText:"关闭",
        type:"warning"
      }).then(()=>{
          this.formData.dynamic_fees.splice(index, 1); 
      }) 
    },
    initData() {
      this.getDynamicFee();
      this.getFixedFees();
    },
    getDynamicFee() {
      // 获得物业统一收费列表
      let params = {
        communityuuid: this.communityuuid ,
      };
      getDynamicFeeApi(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.otherFeesList = msg;
        }
      });
    },
    getFixedFees() {
      // 获得物业统一收费列表
      let params = {
        communityuuid: this.communityuuid ,
      };
      getFixedFeeApi(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.FixedFeesList = msg;
        }
      });
    },
    // 根据ID查询详情（修改前）
    queryDetail() {
      this.pageLoading = true;
      console.log(this.communityuuid )
      getRoomApi({
        roomuuid: this.$route.query.uuid,
        communityuuid: this.communityuuid ,
      })
        .then(({ data: { status, msg } }) => {
          console.log(msg)
          if (status === 0) {
            this.formData = {
              roomuuid: msg.uuid,
              name: msg.name,
              area: msg.area,
              fee_status: msg.fee_status.toString(),
              unit: msg.buildinguuids,
              method: "put",
              status: msg.status.toString(),
              rules: msg.roomers,
              dynamic_fees: msg.dynamic_fees,
              arrearage_start_date: this.dateFormat(msg.arrearage_start_date),
              username: msg.username,
              phone: msg.phone,
            };
 
            if (msg.fixed_fee) {
              this.formData.fixed_fee = msg.fixed_fee["uuid"];
            }
            this.formData.unit = msg.buildinguuids;
            // 解决级联列表不能动态绑定回显数据的问题
            this.isShowInfo = false;
            setTimeout(() => {
              this.isShowInfo = true;
            }, 100);

            //this.mainrule = msg.rules.findIndex((e) => e.mainrule == true) ?? -1;
          }
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    submitForm() {
      this.$refs["product-form"].validate((e) => {
        if (!e) {
          return false;
        }
        this.isLoading = true;
        if (this.mainrule > -1) {
          this.formData.rules.forEach((e) => {
            e.mainrule = "";
            e.ruleid = e.id ?? -1;
          });
          this.formData.rules[this.mainrule].mainrule = 1;
        }
        this[`${this.type}Room`]();
      });
    },
    addRoom() {
      let unit = "";
      if (this.formData.unit.length == 2) {
        unit = this.formData.unit[1];
      }
      updateRoom({
        ...this.formData,
        roomers: JSON.stringify(this.formData.rules),
        method: "create",
        unituuid: unit,
        communityuuid: this.communityuuid ,
      })
        .then(({ data: { status, msg } }) => {
          if (status === 0) {
            this.$notify({
              type: "success",
              title: "提交成功",
              message: msg,
              duration: 2000,
            });
          } else {
            this.$notify({
              type: "error",
              title: "提交失败",
              message: msg,
              duration: 0,
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    putRoom() {
      let unit = "";
      if (this.formData.unit.length == 2) {
        unit = this.formData.unit[1];
      }
      updateRoom({
        ...this.formData,
        method: "put",
        unituuid: unit,
        dynamic_fees: JSON.stringify(this.formData.dynamic_fees),
        roomers: JSON.stringify(this.formData.rules),
        communityuuid: this.communityuuid ,
      })
        .then(({ data: { status, msg } }) => {
          if (status === 0) {
            this.$notify({
              type: "success",
              title: "提交成功",
              message: msg,
              duration: 2000,
            });
          } else {
            this.$notify({
              type: "error",
              title: "提交失败",
              message: msg,
              duration: 0,
            });
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
.edit-product {
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
  width: 850px;
  .myQuillEditor {
    .ql-container.ql-snow {
      min-height: 360px;
    }
  }

  .el-select {
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
