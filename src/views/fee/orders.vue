<template>
  <div id="product-list">
    <!-- 订单列表 -->

    <el-row type="flex" justify="space-between">
      <el-form inline>
        <el-form-item  >
          <el-input style="width:100px;" v-model="queryForm.building" placeholder="楼栋"  > </el-input>
        </el-form-item>
        <el-form-item >
          <el-input  style="width:100px;"  v-model="queryForm.unit" placeholder="单元号"  > </el-input>
        </el-form-item>
        <el-form-item >
          <el-input  style="width:100px;"  v-model="queryForm.room" placeholder="房号"  > </el-input>
        </el-form-item>
        <el-form-item >
          <el-input v-model="queryForm.billno" placeholder="订单号"  > </el-input>
        </el-form-item>
        <el-form-item >
          <el-input  style="width:100px;"  v-model="queryForm.feename" placeholder="服务费名称"  > </el-input>
        </el-form-item>
        <el-form-item >
          <el-input  style="width:100px;"  v-model="queryForm.username" placeholder="姓名"  > </el-input>
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
       <el-table-column   label="订单号"  width="240">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            <span class="billno"> {{ row.billno }} </span> <br/>
            房号:{{row.room__unit__building__name}} {{row.room__unit__name}}  {{row.room__name}} <br/>
            {{row.user__username}} {{row.user__phone}} <br/>
            支付时间:{{ row.date| dateTimeFormat}}
          </div>
        </template> 
      </el-table-column>    
      <el-table-column   label="账单" width="190">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.feename }} <br/>
            {{row.detail}} 
            </div>
             
        </template>
      </el-table-column>  
      <el-table-column   label="支付方式" width="280">
        <template slot-scope="{ row }">
          <div class="name-wrap-pay"> 
            <div class="paylogo">
              <el-image v-if="row.payway==0" :src="require('@/assets/img/zhifubao.png')"></el-image>
              <el-image v-if="row.payway==1" :src="require('@/assets/img/weixin.png')"></el-image>
            </div>
            <div class="detail">
              使用<span class="lightingtxt">{{row.payway==0?"支付宝":"微信"}}</span>支付，其支付订单号: <br/>
              {{row.paybillno}}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="收入">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            实际收入:<span class="lightingtxt">{{ (row.money * (1 - row.feerate)).toFixed(2) }}</span>元 <br/>
            平台费率: {{row.feerate}}<br/>
            明细:订单金额:{{row.money}} x (1 - 平台费率:{{row.feerate}}) =实际收入: {{ (row.money * (1 - row.feerate)).toFixed(2)  }}元
          </div>
        </template>
      </el-table-column>
      <el-table-column   label="打印"  width="80">
         <template slot-scope="{ row }">
           <el-tooltip effect="dark" content="打印或者保存电子版" placement="top">
          <div class="name-wrap" @click="printHandler(row)"> 
            <el-image  class="printer" :src="require('@/assets/img/dayinji.png')"></el-image>
          </div>
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
        <ReceiptPrint ref='print-wrap'/>
  </div>
</template>

<script>
import { setPaginationSize, getPaginationSize  } from "@/utils/pagination";
import { getOrders  } from "@/api/building";
import ReceiptPrint from '@/components/ReceiptPrint'
export default {
  components:{ReceiptPrint},
  data() {
    return {
      currentPage: 1,
      paginationsize: 50,
      total: 0,
      tableList: [],
      isTableLoading: false,
      queryForm: {}, 
      multipleSelection: [],
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
    };
  },
  filters:{
    statustxt(status){

    },
     
  },
  created() {
    this.handleQueryList();
  },
  methods: {
    printHandler(row){
      this.$refs['print-wrap'].onPrint(row)
    },
     handleCurrentChange(e) {
      this.currentPage = e;
      this.handleQueryList();
    },
    handleSizeChange(e) {
      // 切换条数
      console.log(e)
      setPaginationSize(e);
      this.paginationsize = e;
      this.handleQueryList();
    },
    handleAdd() {
      this.$router.push({
        name: "paidservice-edit",
      });
    },
    handleQueryDetail(id) {
      this.$router.push({
        name: "product-detail",
        query: {
          id
        },
      });
    },
    handleEdit(uuid) {
      this.$router.push({
        name: "paidservice-edit",
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
      manageService({ method: "delete", uuids,communityuuid:localStorage.getItem('communityuuid') }).then(
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
      getOrders({...this.queryForm,
      communityuuid:localStorage.getItem('communityuuid'),
      page:this.currentPage,
      pagenum:this.paginationsize})
        .then(({ data: { status, msg } }) => { 
          console.log(msg)
          if (status === 0) {
            this.tableList = msg.orders;
            this.total = msg.total
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
  .stars{
    display: flex;
    .el-image{
      width: 20px;
      height: 20px;
    }
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
  .name-wrap-pay{
    display: flex;
	  align-items: center;
    .lightingtxt{
      font-weight: bold;
      color:#FF8000;
    }
    .paylogo{  
      margin-top:10px;
      margin-right:10px;
      .el-image{
        width:40px; 
        height: 40px;
      }
    }
  }
  .name-wrap{
    .billno, .lightingtxt{
      font-weight: bold;
      color:#FF8000;
    }  
    .printer{
      width:60px; 
      height: 60px;
      cursor: pointer;
    }
    
  }
}
</style>
