/* 民宿自定义日期 */
<template>
  <div class="main">
  <div class="header">
    <div class="left">{{year}}年{{month}}月</div>
    <div class="right">
      <el-button-group>
        <el-button type="primary" @click="lastmonth" icon="el-icon-arrow-left">上个月</el-button>
        <el-button type="success" @click="nextmonth" >下个月<i class="el-icon-arrow-right el-icon--right"></i></el-button>
      </el-button-group>
    </div>
  </div>
  <div class="mycalendar" >
     <div class="item" v-for ="([key, value], index) of  Object.entries (days)" :key="index" >
        <div v-if="key == 0" class="line">
          <div class="dayheader">周一</div>
          <div class="day" @click="handlDate(day)" :class="day.lastmonth == 1?'lastday':''" v-for="(day, dayindex) in value" :key="dayindex">
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue" >{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 1" class="line">
          <div class="dayheader">周二</div>
          <div class="day" @click="handlDate(day)" :class="day.lastmonth == 1?'lastday':''" v-for="(day, dayindex) in value" :key="dayindex">
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue" >{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 2" class="line">
          <div class="dayheader">周三</div>
          <div class="day" @click="handlDate(day)" :class="day.lastmonth == 1?'lastday':''" v-for="(day, dayindex) in value" :key="dayindex">
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue" >{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 3" class="line">
          <div class="dayheader">周四</div>
          <div class="day" @click="handlDate(day)" :class="day.lastmonth == 1?'lastday':''" v-for="(day, dayindex) in value" :key="dayindex">
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue" >{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 4" class="line">
          <div class="dayheader">周五</div>
          <div class="day" @click="handlDate(day)" :class="day.lastmonth == 1?'lastday':''" v-for="(day, dayindex) in value" :key="dayindex">
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue" >{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
          
        </div>
        <div v-if="key == 5" class="line">
          <div class="dayheader">周六</div>
          <div class="day" @click="handlDate(day)" :class="day.lastmonth == 1?'lastday':''" v-for="(day, dayindex) in value" :key="dayindex">
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue" >{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
        <div v-if="key == 6" class="line">
          <div class="dayheader">周日</div>
          <div class="day" @click="handlDate(day)" :class="day.lastmonth == 1?'lastday':''" v-for="(day, dayindex) in value" :key="dayindex">
            <div class="holidayname" v-if="day.holiday">{{ day.holiday }}</div>
            <div class="dayvalue" >{{ day.day | dateDayFormat }}</div>
            <div class="price" v-if="day.price">￥{{ day.price }}</div>
          </div>
        </div>
     </div>
  </div>
</div>
</template>

<script>
import {getCalendarApi} from '@/api/product.js';
export default {
  name: 'Calendar', 
  props: {
     
    productuuid:{
      type: String,
      default: ""
    }
  },
  data() {
    return { 
      days: {},
      year :new Date().getFullYear(),
       month : new Date().getMonth()
    }
  },
  mounted() { 
    this.getCalendarData()
  },
  beforeDestroy() { 
  },
  methods: { 
    handlDate(day){
      //日期点击事件
      console.log(day)
      this.$notify({
            type: "error",
            title: "通知操作异常",
            message: day,
          });
    },
    getCalendarData(){
      let param = {
        year : this.year,
        month : this.month 
      }

      if (this.productuuid){
        param.productuuid = this.productuuid
      } 
      getCalendarApi(param).then(({data:{status, msg}})=>{
          console.log(msg)
          this.days = msg
      }) 
    },
    lastmonth(){
      if(this.month == 1){
        this.month = 12
        this.year = this.year -1
      }
      else{
        this.month = this.month - 1
      }

      this.getCalendarData()
    },
    nextmonth(){
      if(this.month == 12){
        this.month = 1
        this.year = this.year + 1
      }
      else{
        this.month = this.month + 1
      } 
      this.getCalendarData()
    }
  },
  
}
</script>

<style   scoped>
.mycalendar, .header{
  display: flex; 
  text-align: center;     
  justify-content: space-between;
  width:100%; 
}
.item{ 
  flex: auto ; 
}

.left{
  font-size:20px;
  font-weight: 700;
}
.dayheader{
  height: 100px;
  line-height: 100px;
  text-align: center; 
  border:1px solid #e6e6e6;
  font-weight: 700;
}
.day{
  height: 80px; 
  border:1px solid #e6e6e6;
  text-align: center; 
  padding-top: 10px;
}
.dayvalue, .price{ 
  width:100%;
}
.lastday{
  background-color:  #e6e6e6;
}
.holidayname{
  position: relative;
  text-align: left; 
  color:#d81e06;
  font-size: 12px;
  font-weight: bold;
}
</style>
