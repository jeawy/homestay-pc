<template>
  <div>
    <el-row type="flex" justify="space-between">
      <el-form inline>
          
         <el-form-item> 
            <el-input v-model="queryForm.username" placeholder="搜索购买人姓名" >
            </el-input>
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="queryForm.status" @change="statusChanged"> 

          <el-radio  :label="-1">全部</el-radio>
          <el-radio  :label="2">待激活</el-radio>
          <el-radio   :label="3">已激活</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="getCardsList()">
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
      :data="cardList"
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
        
      <el-table-column  label="购买人" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap" style=" text-align:center"> 
            <el-image
                  class="mini-image"
                  :src="row.user__thumbnail_portait?baseImage+row.user__thumbnail_portait:''"
                  fit="contain"
                  style=" width: 90px; height: 90px;"
                > 
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture" style="color:#909399"></i>
                  </div>
                </el-image> 
                <br/>
            {{ row.user__username }}
          </div>
        </template>
      </el-table-column>  
      <el-table-column width="80"  label="卡类型">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.cardtype == 0?"电子卡":"实体卡" }}
          </div>
        </template>
      </el-table-column> 
      <el-table-column width="80"  label="状态" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.status | statustxt }}
          </div>
        </template>
      </el-table-column> 
      <el-table-column width="80"  label="面值(元)" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.money }}
          </div>
        </template>
      </el-table-column> 
      <el-table-column width="80"  label="余额(元)" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.left }}
          </div>
        </template>
      </el-table-column> 
      <el-table-column width="120"  label="销售日期" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.saledate|dateTimeFormat }}
          </div>
        </template>
      </el-table-column> 
      <el-table-column width="120"  label="激活日期" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap" v-if="row.activedate"> 
            {{ row.activedate|dateTimeFormat }}
          </div>
          <div class="name-wrap" v-else> 
            未激活
          </div>
        </template>
      </el-table-column>  
      <el-table-column width="280" align="center" label="操作">
        <template slot-scope="{ row }"> 
            <el-link
            v-if="row.status == 2"
              :underline="false" 
              type="success"
              @click="activateCard(row , true)"
            >激活卡片</el-link>
             
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
    
  </div> 
</template>

<script>
import { 
  queryCards, 
  updateCards
} from "@/api/card";
import { getToken } from "@/utils/auth";
export default {
  data() {
    return {
      baseImage:process.env.VUE_APP_BASE_IMAGE +"/images/",
      cardList: [],
      giftsClassList: [],
      dialogShow2: false,
      paginationsize:50,
      SRC: "",
      headers: {
        Authorization: `JWT ${getToken()}`
      },
      total:100,
      queryForm:{
        status:2
      },
      currentPage: 1,
      pageSize: 20,
      pageSizeList: [10, 20, 50, 100],
       
    };
  },
  filters:{
    statustxt(status){
      if(status == 2){
        return "待激活"
      }
      else if(status == 3){
        return "已激活"
      } 
    }
  },
 
  methods: {
    resetParams(){
      this.queryForm ={
        status:2,
        username:""
      }
      this.getCardsList()
    },
    statusChanged( ){
       
      this.getCardsList()
    },
    handleAdd(){
      this.$router.push({
        name:"add-gifts",
         
      }) 
    },
    modify(uuid){ 
      this.$router.push({
        name:"add-gifts",
        query:{
          uuid:uuid
        }
      })
    },
    getCardsList() {
      console.log(this.queryForm)
      queryCards(this.queryForm).then(({ data }) => {
        console.log(data)
        this.cardList = [...data.msg.cards];
        this.total = data.msg.total
      });
    },
    getProductsClass() {
      queryCards().then(({ data }) => {
        this.giftsClassList = [...data.msg];
      });
    },
  
     activateCard(item, recommend=false) {
      let msg = "激活该卡片，是否继续?"
        
      this.$confirm(msg, "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        updateCards({ carduuid: item.uuid  }).then(({ data }) => {
        
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getCardsList();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
       
     handleSizeChange(val) {
       this.pageSize = val;

     },
     handleCurrentChange(currentPage) {
       this.currentPage = currentPage;

    },
    // //解决索引旨在当前页排序的问题，增加函数自定义索引序号
     indexMethod(index) {
       return (this.currentPage - 1) * this.pageSize + index + 1;
     },
  },

  created() {
    this.getCardsList(); 
  }
};
</script>
<style lang='scss' scoped>
.el-card {
  position: relative;
  margin: 0 5px 30px 5px;
  width: 300px;
}
.box-card-header {
  position: relative;
  height: 162px;
  overflow: hidden;
  border:1px solid #dbdbdb;
}
.el-card__header {
  padding: 0px 0px;
}

p {
  font-size: 12px;
  color: #909399;
  margin: 10px 0 5px;
}
.subtitle {
  margin: 15px 0 5px;
}
.mini-image {
  cursor: pointer;
  overflow: hidden;
  opacity: 1;
}
.image-slot {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 56px;
  background: #dcdfe6;
}
.dropdow {
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 3;
}
</style>