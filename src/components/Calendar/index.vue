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
      <div
        class="item"
        v-for="([key, value], index) of Object.entries(days)"
        :key="index"
      >
        <div v-if="key == 0" class="line">
          <div class="dayheader" :style="{'height':height +'px', 'line-height':height +'px'}" >周一</div>
          <div
            class="day" :style="{'height':height +'px', 'padding-top':paddingtop+'px'}"
            @click="openDialog(day)"
            :class="day.lastmonth == 1 ? 'lastday' : ''"
            v-for="(day, dayindex) in value"
            :key="dayindex"
          >
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue">{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 1" class="line">
          <div class="dayheader" :style="{'height':height +'px', 'line-height':height +'px'}" >周二</div>
          <div
            class="day" :style="{'height':height +'px', 'padding-top':paddingtop+'px'}"
            @click="openDialog(day)"
            :class="day.lastmonth == 1 ? 'lastday' : ''"
            v-for="(day, dayindex) in value"
            :key="dayindex"
          >
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue">{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 2" class="line">
          <div class="dayheader" :style="{'height':height +'px', 'line-height':height +'px'}" >周三</div>
          <div
            class="day" :style="{'height':height +'px', 'padding-top':paddingtop+'px'}"
            @click="openDialog(day)"
            :class="day.lastmonth == 1 ? 'lastday' : ''"
            v-for="(day, dayindex) in value"
            :key="dayindex"
          >
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue">{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 3" class="line">
          <div class="dayheader" :style="{'height':height +'px', 'line-height':height +'px'}" >周四</div>
          <div
            class="day" :style="{'height':height +'px', 'padding-top':paddingtop+'px'}" 
            @click="openDialog(day)"
            :class="day.lastmonth == 1 ? 'lastday' : ''"
            v-for="(day, dayindex) in value"
            :key="dayindex"
          >
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue">{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 4" class="line">
          <div class="dayheader" :style="{'height':height +'px', 'line-height':height +'px'}" >周五</div>
          <div
            class="day" :style="{'height':height +'px', 'padding-top':paddingtop+'px'}"
            @click="openDialog(day)"
            :class="day.lastmonth == 1 ? 'lastday' : ''"
            v-for="(day, dayindex) in value"
            :key="dayindex"
          >
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue">{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 5" class="line">
          <div class="dayheader" :style="{'height':height +'px', 'line-height':height +'px'}" >周六</div>
          <div
            class="day" :style="{'height':height +'px', 'padding-top':paddingtop+'px'}"
            @click="openDialog(day)"
            :class="day.lastmonth == 1 ? 'lastday' : ''"
            v-for="(day, dayindex) in value"
            :key="dayindex"
          >
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue">{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 6" class="line">
          <div class="dayheader" :style="{'height':height +'px', 'line-height':height +'px'}" >周日</div>
          <div
            class="day" :style="{'height':height +'px', 'padding-top':paddingtop+'px'}"
            @click="openDialog(day)"
            :class="day.lastmonth == 1 ? 'lastday' : ''"
            v-for="(day, dayindex) in value"
            :key="dayindex"
          >
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue">{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
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
      this.showEditDialog = !this.showEditDialog
      this.currendday = day
    },
    handlDate( ) {
      //日期点击事件
      let data = {
        productuuid:this.productuuid,
        price:this.currendday.price,
        date : this.$options.filters['dateFormat'](this.currendday.day)
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
      console.log(this.productuuid)
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
.mycalendar,
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
