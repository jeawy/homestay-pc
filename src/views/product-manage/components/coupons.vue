<template>
  <!-- 阅读量、赞、评论 -->
  <div class="vmain"> 
       <div class="title">{{ title }}</div>
       <div class="coupon" v-for="(item, index) in coupons" :key="index" >
        <el-radio  class="couponradio" v-model="currentcouponuuid" name="selectedcoupon" :label="item.uuid">
           {{ item.name }}  
        </el-radio>
          <div class="coupontypetxt" >{{ item.coupontype|coupontypetxt }}</div> 
          <div class="discount"  v-if="item.coupontype==0">{{ item.discount}}折 </div>
          <div class="discount" v-if="item.coupontype==1">满{{ item.top_money}}元 减{{ item.reduce_money}}元</div>
          <div class="rules" >{{ item.rules }}</div>
          <div class="rules" >有效期:{{ item.start |dateFormat}} -  {{ item.end|dateFormat}}</div>
      </div>
      <div class="btns">
        <el-button type="info" @click="close">关闭</el-button>
        <el-button type="success" @click="confirm">确定</el-button>
      </div> 
  </div>
</template>

<script>  
import { getCouponApi, updateCoupon } from "@/api/coupon";
export default {
  props: [ 
    "title"
  ],
  components: { 
  },
  data() {
    return {  
      coupons: [],
      currentcouponuuid:""
    };
  },
  filters: { 
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
  }, 
  mounted() { 
    this.getCoupons()
  },
  methods: {   
    confirm() {   
      if (this.currentcouponuuid  ){ 
        this.$emit("selectConpon", this.currentcouponuuid)
      }
    }, 
    getCoupons() {
      getCouponApi({ pc: "" }).then(({ data }) => {
        
        if (data.status == 0) {
          this.coupons = data.msg.coupons; 
        } else {
          return false;
        }
      });
    },
    close() {
      this.$emit("close") 
    },  
  },
};
</script>

<style lang="scss" scoped> 
    .vmain{
      height: 400px;
      width:100%;
      text-align: center;
      .title{
        font-weight: bold;
        margin-bottom: 20px;
      }
    }
    .rules{
      margin-left: 5px;
      margin-right: 5px;
    }
    .coupontypetxt{
      margin-right: 10px;
    }
    .btns{
      border-top:1px solid #bfbfbf;
      padding-top:20px;
      text-align: center;
    }
    .dialog{
      height: 400px; 
      width:100%; 
    }
    .couponradio{
      width:100px;
      height: 40px;
      line-height: 40px;
      text-align: left;
    }
    .coupon{
      height: 40px;
      line-height: 40px;
      display: flex; 
      border-top:1px solid #bfbfbf;
    }
</style>
  
