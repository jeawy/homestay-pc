/* 民宿自定义日期 */
<template>
  <div class="main">
    <div class="header">
      <div class="left">{{ year }}年{{ month }}月</div>
      <div class="right">
        <el-button-group>
          <el-button type="primary" @click="lastmonth" icon="el-icon-arrow-left"
            >上个月</el-button
          >
          <el-button type="success" @click="nextmonth"
            >下个月<i class="el-icon-arrow-right el-icon--right"></i
          ></el-button>
        </el-button-group>
      </div>
    </div>
    <div class="mycalendar">
      <div class="line2">
        <div class="lineitem" :style="{'height':height +'px', 'line-height':height +'px'}" 
        v-for="(item, index) in weekdays" :key="index">
          <div class="weekend" v-if="item.weekend == 1">{{ item.name }}</div>
          <div class="workday" v-else>{{ item.name }}</div>
        </div>
      </div>
      <div class="months"> 
          <div    class="day" :style="{'height':height +'px' }" :class="[dayitem.lastmonth==1?'lastmonth':'']" 
          v-for="(dayitem, dayindex) in  days" :key="dayindex" @click="openDialog(dayitem)"  > 
              <div  class="daytxt"   >{{ dayitem.day |dateDayFormat  }}</div >   
              <div  class="holiday" v-if="dayitem.holiday" >{{ dayitem.holiday  }}</div >   
              <div  class="holiday" v-if="dayitem.price" >￥{{ dayitem.price  }}</div > 
          </div> 
      </div> 
    </div>
    <el-dialog :visible.sync="showEditDialog" width="30%" title="编辑房价" >
       <div class="dialogprice">
         <div class="newname">{{currendday.day|dateFormat }}日房价:</div>
         <el-input type="number" v-model="currendday.price" class="newprice"></el-input>
         <el-button-group>
          <el-button type="primary" @click="handlDate" icon="el-icon-s-goods">保存</el-button>
          <el-button type="warning" @click="openDialog">取消<i class="el-icon-close"></i></el-button>
         </el-button-group>
       </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCalendarApi,  alterProductSpecs} from "@/api/product.js";
export default {
  name: "Calendar",
  props: {
    productuuid: {
      type: String,
      default: "",
    },
    mini:{
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      showEditDialog:false,
      weekdays: [ 
        {
          name: "一",
          weekend: 0,
        },
        {
          name: "二",
          weekend: 0,
        },
        {
          name: "三",
          weekend: 0,
        },
        {
          name: "四",
          weekend: 0,
        },
        {
          name: "五",
          weekend: 0,
        },
        {
          name: "六",
          weekend: 1,
        },
        {
          name: "日",
          weekend: 1,
        },
      ],
      days: {},
      year: new Date().getFullYear(),
      month: new Date().getMonth() +1,
      height:80,
      paddingtop:10, 
      currendday:{ 
      }
    };
  },
  watch:{
     
  },
  mounted() {
    this.getCalendarData();
    if (this.mini){
      this.height = 40 
      this.paddingtop = 0
    }
  },
  beforeDestroy() {},
  methods: {
    openDialog(day){
      console.log(222222)
      this.showEditDialog = !this.showEditDialog
      this.currendday = day
      console.log(this.currendday)
    },
    handlDate( ) {
      //日期点击事件
      let data = {
        id:this.currendday.id,
        price:this.currendday.price,
        date : this.$options.filters['dateFormat'](this.currendday.day),
        method:"put"
      }  
      alterProductSpecs(data).then(({data:{status, msg}})=>{
          //编辑价格
          if(status ==0){
            this.$notify({
              type: "success",
              title: "设置成功",
              message: msg,
            });
            this.showEditDialog = !this.showEditDialog
          }
          else{
            this.$notify({
              type: "error",
              title: "设置失败",
              message: msg,
            });
          }
      }) 
    },
    getCalendarData() {
      let param = {
        year: this.year,
        month: this.month,
      }; 
      if (this.productuuid) {
        param.productuuid = this.productuuid;
      }
      getCalendarApi(param).then(({ data: { status, msg } }) => {  
        this.days = msg;
      });
    },
    lastmonth() {
      if (this.month == 1) {
        this.month = 12;
        this.year = this.year - 1;
      } else {
        this.month = this.month - 1;
      }

      this.getCalendarData();
    },
    nextmonth() {
      if (this.month == 12) {
        this.month = 1;
        this.year = this.year + 1;
      } else {
        this.month = this.month + 1;
      }
      this.getCalendarData();
    },
  },
};
</script>

<style   scoped>
.line2 {
  display: flex;
  width:100%;
   
  border-top: 1px solid #d8dce0;
  border-bottom: 1px solid #d8dce0; 
  background-color: white; 
}

.holiday{
  color:#fea037;
  font-weight: bold;
  font-size:12px;
}
.months{
  display: flex;
  flex-wrap: wrap;
}
.day
{
  width:14.28%;
  height: 80px;
}
.lineitem { 
    width:14.28%;
    text-align: center; 
    font-weight: 700;
    height: 80px;
    line-height: 80px;
  }
  .weekend {
    color: #fea037;
    text-align: center;  
  }
 .lastmonth{
  background-color: #f6f8ea;
 }
 
.header {
  display: flex;
  text-align: center;
  justify-content: space-between;
  width: 100%;
}
.item {
  flex: auto;
}

.left {
  font-size: 20px;
  font-weight: 700;
}
.dayheader { 
  text-align: center;
  border: 1px solid #e6e6e6;
  font-weight: 700;
}
.day { 
  border: 1px solid #e6e6e6;
  text-align: center;
   
}
.dayvalue,
.price {
  width: 100%;
  
}

.price{
  font-weight: 400;
  color:#d81e06;
}
.lastday {
  background-color: #e6e6e6;
}
.holidayname {
  position: absolute;
  text-align: left;
  color: #d4237a;
  font-size: 12px;
  font-weight: bold;
}
.dialogprice{
  width: 100%;
  height: 200px;
  text-align: center;
  border:1px solid #bfbfbf;
  padding:40px;
}
.newprice{
  margin-bottom:  40px;
}
</style>
