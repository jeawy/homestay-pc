<script>
import noticeDetail from "@/components/Notice/components/notice-detail";
import { getActivityList } from "@/api/activity";
import { queryProductList } from "@/api/product"; 
import { viewGifts } from "@/api/gift";   
import { getNotices, removeNotice } from "@/api/notice";  
import {getBillCountApi, getBillsApi} from "@/api/order";
import { mapState } from "vuex";
import ECharts from '@/components/ECharts/BaseECharts'
import { 
  queryCards,
  updateCards
} from "@/api/card"; 
export default {
  name: "dashboard",
  components: {
    noticeDetail,
    ECharts
  },
  data() {
    return {  
      MsgList: [],
      totalmoney: 0,
      orderloading: false,
      detail: "",
      selectedMsgItem: "0", 
      msg_buynum: 1,
      dialogMsgVisible: false,
      baseurl: this.$store.state.BASE_URL_IMAGE + "/",
      comminities: [],
      totalCoin: "",
      addCoin: "",
      totalUser: "",
      addUser: "",
      totalOrder: "",
      addOrder: "",
      undelivered: "",
      baseurlapp: this.$store.state.BASE_URL_IMAGE + "/app/",
      msgLeft: [], 
      feeRateLine: null,
      communityuuids: "", //小区列表
      spreads: [], // 活动列表
      feedbacks: [], // 未完成的有偿服务订单
      notices: [], // 系统通知列表
      notice_total: 0, // 系统消息总数 
      orderList: [], // 最新通知公告 
      inventories:[],
      cardsList: [], //    
      backlogTotal:0, 
      payed_count:0,
      deliveried_count:0,
      finished_count:0, 

      totalbills :0, // 总订单数
      cashcount:0, // 现金订单数
      yuecount :0, // 余额支付订单数
      todaymoney :0, // 今日收入
      totalcoin :0,// 积分订单数

      selling:0, // 出售中
      unready :0, // 未上架
      recommend :0, // 推荐
      isbook :0,// 积分订单数
      leftcount :0,// 库存预警

    };
  },
  watch: {
    dialogMsgVisible(val) { 
      if (val) return
      this.clearTimer() 
    } 
  },
  filters: {
    statustxt(status){
      if (status == 0){
        return "已申请"
      }
      else if  (status == 1){
        return "已支付"
      }
       else if  (status == 2){
        return "已拒绝"
      }  
    },
    noticeread(read) {
      if (read == 0) {
        return "未读";
      } else {
        return "已读";
      }
    },
  },  
  computed: {
    ...mapState("notice", ["Notice", "unreadCount"]),
    ...mapState("login", ["userInfo"]),
    unreadList() {
      if (this.Notice && this.Notice.length) {
        return this.Notice.filter((t) => !t.read);
      } else {
        return [];
      }
    },
  },
  methods: {
    BillFilter(status){
      console.log(status)
      this.$router.push({
        name:"order-msg",
        query:{
          status:status
        }
      }) 
    },
    BillOrderTypeFilter(ordertype){ 
      this.$router.push({
        name:"order-msg",
        query:{
          ordertype:ordertype
        }
      }) 
    },
    getOrders() {
			this.isLoading = true;
			getBillsApi({status:2,delivery_way:0})
				.then(({ data: { status, msg } }) => {
					if (status === 0) {
						this.orderList = msg.orders;
						this.total = msg.total
					}
				})
				.finally(() => {
					this.isLoading = false;
				});
		},
    getBillCount(){
      let params = {
        count:1
      }
      getBillCountApi(params).then(({data:{status, msg}})=>{
        if (status == 0){
          this.payed_count = msg.payed_count
          this.deliveried_count = msg.deliveried_count
          this.finished_count = msg.finished_count 
        }
      })
    },
    getGiftInventory(){
      let params = {
        leftcount:1
      }
      viewGifts(params).then(({data:{status, msg}})=>{
        if (status == 0){
          this.inventories = msg  
          console.log(msg)
        }
      })
    },
    getGiftCount(){
      let params = {
        count:1
      }
      viewGifts(params).then(({data:{status, msg}})=>{
        if (status == 0){
          this.unready = msg.unready
          this.selling = msg.selling
          this.recommend = msg.recommend 
          this.isbook = msg.isbook 
          this.leftcount = msg.leftcount 
        }
      })
    },
    getTotalBillAccount(){
      // 获取顶部订单统计信息
      let params = {
        count:1
      }
      getBillsApi(params).then(({data:{status, msg}})=>{
        console.log(msg)
        if (status == 0){
          this.totalbills = msg.totalbills
          this.cashcount = msg.cashcount
          this.yuecount = msg.yuecount 
          this.todaymoney = msg.todaymoney 
          this.totalcoin = msg.totalcoin 
        }
      })
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
    fastWay(index){
      // 卡片跳转
      console.log(index)
      if(index == 1){
        this.$router.push({
           name: "product", 
           query: { 
             product_type:1,//通知
          },
        });
      }
      else if(index == 2){
        this.$router.push({
           name: "product", 
           query: { 
             product_type:2,//公告
          },
        });
      } 
      else if(index == 3){
        this.$router.push({
           name: "card-manage", 
           query: { 
             product_type:3,//购物卡
          },
        });
      }
      else if(index == 4){
        // 消息：直接弹出侧边栏
        this.$store.commit("notice/SET_CARDSHOW", true);
      }
      else if(index == 5){
        this.$router.push({
           name: "product", 
           query: { 
             product_type:0,//百事通
          },
        });
      }
      else if(index == 6){
        this.$router.push({
           name: "product", 
           query: { 
             product_type:3,//社区见闻
          },
        });
      }
       else if(index == 7){
        this.$router.push({
           name: "repair-list",  
        });
      }
       else if(index == 8){
        this.$router.push({
           name: "records-list",  
        });
      }
       else if(index == 9){
        this.$router.push({
           name: "coinInfo",  
        });
      }
      else if(index == 10){
        this.$router.push({
           name: "withdraw-list", 
        });
      }
      else if(index == 11){
        this.$router.push({
           name: "gift-managet", 
        });
      }
      else if(index == 12){
        this.$router.push({
           name: "activityList", 
        });
      }
      else if(index == 13){
        this.$router.push({
           name: "product", 
        });
      }
    },
    withdraw(uuid){
      this.$router.push({
        name: "withdraw-list",
        query: { 
          communityuuid:uuid,
        },
      });
    }, 
    getDatas(){
      // 获取首页数据 
      this.getSpreads(); 
      this.getOrders(); 
      this.getCardsList();  
      this.getTotalBillAccount()
    }, 
    getCardsList() {
      let queryForm ={
        status:2,// 查询待激活的卡
        
      }
      queryCards(queryForm)
        .then(({ data: { status, msg } }) => { 
          if (status === 0) { 
            this.cardsList = msg.cards;
          }
        })
        .finally(() => {});
    },
     
    productJump(uuid) {
      this.$router.push({
        name:"order-detail",
        query:{
          uuid:uuid
        }
      })
    },
    noticeJump(url, id) { 
      // 删除通知，并跳转相关页面
      let data = {
        pc: 1, // 来自pc端
        ids: id,
      };
      removeNotice(data).then(({ data: { status, msg } }) => {
        // 标记为已读
        if (status != 0) {
          this.$notify({
            type: "error",
            title: "通知操作异常",
            message: msg,
          });
        } else {
          this.getNoticeList();
        }
        this.$router.push({
          path: url,
        });
      });
    },
    
    packageChanged() {
      this.totalmoney =
        this.MsgList[this.selectedMsgItem].price * this.msg_buynum;
      this.specificationid = this.MsgList[this.selectedMsgItem].id;
    },  
    gotoPayFee(feetype = 0) {
      if (feetype == 0) {
        this.$router.push({
          name: "fee-list",
          query: {
            fee_status_checked: 1,
          },
        });
      } else {
        this.$router.push({
          name: "fee-list",
          query: {
            cannot_cal_fee: 1,
          },
        });
      }
    }, 
    gotoRepair() {
      this.$router.push({
        name: "repair-list",
      });
    },
    gotoProduct(index){
       this.$router.push({
        name: "gift-manage",
        query:{
          index:index
        }
      });
    },
    gotoProductDetail(uuid){
      this.$router.push({
        name: "commodity-detail",
        query:{
          uuid:uuid
        }
      });
    },
    gotoProductEdit(uuid){
      this.$router.push({
        name: "add-gifts",
        query:{
          uuid:uuid
        }
      });
    },
    gotoCardsList() {
      this.$router.push({
        name: "card-manage",
      });
    },
    gotoOrder() {
      this.$router.push({
        name: "order-msg",
      });
    }, 
    getNoticeList() {
      // 获取系统活动
      let params = {
        read: 0, // 获取未读消息
        pc: 1,
      };
      getNotices(params).then(({ data: { status, msg } }) => { 
        if (status == 0) {
          this.notices = msg.list;
          this.notice_total = msg.total;
        } else {
          this.$notify({
            type: "error",
            title: "获取消息失败",
            message: msg,
          });
        }
      });
    },
    getSpreads() {
      // 获取活动
      let params = {
        pc: 1, 
      };
      getActivityList(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.spreads = msg; 
        } else {
          this.$notify({
            type: "error",
            title: "获取活动失败",
            message: msg,
          });
        }
      });
    }, 
    //修改是否已读
    updateIsRead(row) { 
      if (row.read === 0) {
        row.read = 1;
      }
      HTTP.putNotice({
        method: "put",
        ids: row.id,
        read: row.read,
      }).then(({ data }) => {
        if (data.status === 0) {
          this.getNoticeDetail();
        }
      });
    },
    getNoticeDetail() {
      this.$store.dispatch("notice/get_Notice", {
        pc:1,
        list:1
      });
    },   
  }, 
  created() {
    this.getDatas()
    this.getBillCount() 
    this.getNoticeList();
    this.getGiftCount()
    this.getGiftInventory()
  },
};
</script>
<template>
<div class="">
  <el-row class="header" :gutter="15">
        <el-col :span="4" @click.native="BillOrderTypeFilter(5)">
            <el-card class="links">
                <div class="header-stat">
                    <img class="img"
                    src="@/assets/operateCenter/orderStat.png" alt="">
                    <div class="stat-num">{{todaymoney}}</div>
                </div>
                <div class="header-text">今日订单总金额(元)</div>
            </el-card>
        </el-col>
         <el-col :span="4" @click.native="BillOrderTypeFilter(4)">
            <el-card class="links">
                <div class="header-stat">
                    <img class="img"
                    src="@/assets/operateCenter/orderNum.png" alt="">
                    <div class="stat-num">{{payed_count+deliveried_count+finished_count}}</div>
                </div>
                <div class="header-text">订单总数(笔)</div>
            </el-card>
        </el-col>
        <el-col :span="4" @click.native="BillOrderTypeFilter(3)">
            <el-card class="links">
                <div class="header-stat">
                    <img class="img"
                    src="@/assets/operateCenter/gift.png" alt="">
                    <div class="stat-num">{{cashcount}}</div>
                </div>
                <div class="header-text">现金订单(笔)</div>
            </el-card>
        </el-col>
        <el-col :span="4"  @click.native="BillOrderTypeFilter(2)">
            <el-card class="links" >
                <div class="header-stat">
                    <img class="img"
                    src="@/assets/operateCenter/gift.png" alt="">
                    <div class="stat-num">{{yuecount}}</div>
                </div>
                <div class="header-text">余额支付订单(笔)</div>
            </el-card>
        </el-col>
       
        <el-col :span="4">
            <el-card class="links" @click.native="BillOrderTypeFilter(1)">
                <div class="header-stat">
                    <img class="img"
                    src="@/assets/operateCenter/orderNum.png" alt="">
                    <div class="stat-num">{{totalcoin}}</div>
                </div>
                <div class="header-text">积分订单(笔)</div>
            </el-card>
        </el-col> 
    </el-row>
    <el-row class="middle-top" :gutter="15">
        <el-col :span="14">
            <el-card>
                <div style="display:flex">
                    <img class="img"
                    src="@/assets/operateCenter/dot.png" alt="">
                    <div class="top-text">交易提示</div>
                </div>
                <el-row class="top-row"> 
                    <el-col :span="8" class="links" >
                        <div class="row-num"  @click="BillFilter(2)">{{payed_count}}</div>
                        <div @click="BillFilter(2)">待发货</div>
                    </el-col>
                    <el-col :span="8" class="links" >
                        <div class="row-num"  @click="BillFilter(3)">{{deliveried_count}}</div>
                        <div  @click="BillFilter(3)">已发货</div>
                    </el-col> 
                    <el-col :span="8" class="links" >
                        <div class="row-num"  @click="BillFilter(4)">{{finished_count}}</div>
                        <div  @click="BillFilter(4)">已签收</div>
                    </el-col>
                     
                </el-row>
            </el-card>
        </el-col>
        <el-col :span="10">
            <el-card>
                <div style="display:flex">
                    <img class="img"
                    src="@/assets/operateCenter/dot.png" alt="">
                    <div class="top-text">商品提示</div>
                </div>
                <el-row class="top-row">
                    <el-col :span="6" class="links" @click.native="gotoProduct(1)">
                        <div class="row-num">{{selling}}</div>
                        <div>出售中</div>
                    </el-col>
                    <el-col :span="6" class="links" @click.native="gotoProduct(2)">
                        <div class="row-num">{{unready}}</div>
                        <div>未上架</div>
                    </el-col>
                    <el-col :span="6" class="links" @click.native="gotoProduct(3)">
                        <div class="row-num">{{recommend}}</div>
                        <div>推荐商品</div>
                    </el-col> 
                    <el-col :span="6" class="links" @click.native="gotoProduct(4)">
                        <div class="row-num row-num-red">{{leftcount}}</div>
                        <div>库存预警</div>
                    </el-col>
                </el-row>
            </el-card>
        </el-col>
    </el-row>
  <div id="home-page" ref="homepage">
    
    <div class="col1 communityparent">
    
      <div class="funlist">
        <el-row>
          <el-col :span="24" class="todolist">
            <div @click="gotoOrder" class="feetitle">待发货订单</div>
            <div class="list">
              <table class="feetable" v-if="orderList.length > 0">
                <tr
                  class="feetable-tr"
                  v-for="(item, index) in orderList"
                  :key="index"
                >
                  <td> 
                    <span @click="productJump(item.uuid)" class="noticetitle">
                      {{ item.subject }}
                    </span>
                  </td>
                  <td>  
                      {{ item.money }} 
                  </td>
                  <td>
                    {{ item.date | dateFormat }}
                  </td>
                  <td>
                    <el-link
                    :underline="false" 
                    type="danger"
                    @click="productJump(item.uuid)"
                  >点击发货</el-link>
                  </td>
                </tr>
              </table>
              <div class="noresult" v-else>
                <el-empty
                  :image-size="100"
                  class="empty"
                  description="没有相关消息"
                ></el-empty>
              </div>
            </div>
          </el-col>
           
        </el-row>
      </div>
    </div>
    <div class="col2">
      <div class="carousel-wrap">
          <el-carousel indicator-position="outside">
            <el-carousel-item v-for="(spread, index) in spreads" :key="index">
              <el-image
                :src="baseurl + spread.image"
                fit="fit"
                class="spreadimage"
              ></el-image>
              <div class="spreadcontent">
                <span class="communityname"> {{ spread.communityname }}:</span>
                <span>{{ spread.title }}</span>
              </div>
            </el-carousel-item>
        </el-carousel>
      </div> 
      <div class="funlist">
        <el-row>
          <el-col :span="24" class="todolist" v-if="notice_total > 0">
            <el-badge
              :max="99"
              :hidden="notice_total == 0"
              :value="notice_total"
              class="item"
            >
              <div class="feetitle">系统消息</div>
            </el-badge>
            <div class="list">
              <table class="feetable" v-if="notice_total > 0">
                <tr
                  class="feetable-tr"
                  v-for="(item, index) in notices"
                  :key="index"
                >
                  <td>
                    <span
                      @click="noticeJump(item.pcurl, item.id)"
                      class="noticetitle"
                    >
                      {{ item.title }}
                    </span>
                  </td>
                  <td>
                    {{ item.date | dateFormat }}
                  </td>
                  <td @click="noticeJump(item.pcurl, item.id)">
                    <span class="status">{{ item.read | noticeread }} </span>
                  </td>
                </tr>
              </table>
              <div class="noresult" v-else>
                <el-empty
                  :image-size="100"
                  class="empty"
                  description="没有相关消息"
                ></el-empty>
              </div>
            </div>
          </el-col> 
          <el-col :span="24" class="todolist">
            <el-badge
              :max="99"
              :hidden="inventories.length == 0"
              :value="inventories.length"
              class="item"
            >
              <div class="feetitle">
                库存预警商品
              </div>
            </el-badge>
            <div class="list">
              <table class="feetable" v-if="inventories.length > 0">
                <tr
                  class="feetable-tr"
                  v-for="(item, index) in inventories"
                  :key="index"
                >
                 
                  <td @click="gotoProductDetail(item.gift__uuid)">
                    <el-image
                    class="inventoryimage links"
                    :src="baseurl + item.gift__picture"
                    fit="cover"
                  ></el-image> 
                  </td>
                  <td @click="gotoProductDetail(item.gift__uuid)">
                    <div   class="producttitle links">{{ item.gift__title }}</div>  
                    <div   class=" links">{{ item.name }}</div>
                  </td>
                  <td>
                   剩余库存: {{ item.number }}
                  </td>
                  
                  <td>
                    <el-button
                      type="success" 
                      @click="gotoProductEdit(item.gift__uuid)"
                      >修改库存</el-button
                    >
                  </td>
                </tr>
              </table>
              <div class="noresult" v-else>
                <el-empty
                  :image-size="100"
                  class="empty"
                  description="没有相关反馈"
                ></el-empty>
              </div>
            </div>
          </el-col> 
          <el-col :span="24" class="todolist">
            <el-badge
              :max="99"
              :hidden="feedbacks.length == 0"
              :value="feedbacks.length"
              class="item"
            >
              <div class="feetitle">
                新反馈
              </div>
            </el-badge>
            <div class="list">
              <table class="feetable" v-if="feedbacks.length > 0">
                <tr
                  class="feetable-tr"
                  v-for="(item, index) in feedbacks"
                  :key="index"
                >
                  <td v-if="communityuuids.length > 1">
                    {{ item.communityname }}
                  </td>
                  <td>
                    {{ item.username }}
                  </td>
                  <td>
                    {{ item.phone }}
                  </td>
                  <td>
                    {{ item.subject }}
                  </td>
                  <td>
                    {{ item.date | dateFormat }}
                  </td>
                  <td>
                    <el-button
                      type="success" 
                      >结单</el-button
                    >
                  </td>
                </tr>
              </table>
              <div class="noresult" v-else>
                <el-empty
                  :image-size="100"
                  class="empty"
                  description="没有相关反馈"
                ></el-empty>
              </div>
            </div>
          </el-col> 
        </el-row>
      </div>
    </div>
    <div class="col3">
       <div class="funcards1"> 
        <div class="funcards-item" @click="fastWay(5)">
          <div>订单</div>
          <el-image
            class="funicon"
            :src="baseurlapp + `baishitong.png`"
            fit="cover"
          ></el-image>
        </div>
        <div class="funcards-item" @click="fastWay(6)">
          <div>商品类别</div>
          <el-image
            class="funicon"
            :src="baseurlapp + `xinwen.png`"
            fit="cover"
          ></el-image>
        </div>
          <div class="funcards-item" @click="fastWay(3)">
          <el-badge
              :max="99"
              :hidden="feedbacks.length == 0"
              :value="feedbacks.length"
              class="item"
            >
          <div>购物卡</div>
          <el-image
            class="funicon"
            :src="baseurlapp + `qianbao.png`"
            fit="cover"
          ></el-image>
          </el-badge>
        </div> 
        <div class="funcards-item" @click="fastWay(4)">
          <el-badge
            :hidden="notice_total == 0"
            :max="99"
            :value="notice_total"
            class="item"
          >
            <div>消息</div>
            <el-image
              class="funicon"
              :src="baseurlapp + `pinlun.png`"
              fit="cover"
            ></el-image>
          </el-badge>
        </div>
        <div class="funcards-item"  @click="fastWay(9)">
          <div>积分</div>
          <el-image
            class="funicon"
            :src="baseurlapp + `jifen.png`"
            fit="cover"
          ></el-image>
        </div> 
        <div class="funcards-item"  @click="fastWay(11)">
          <el-badge
            :max="99"
            :hidden="backlogTotal == 0"
            :value="backlogTotal"
            class="item"
          >
            <div>商品管理</div>
            <el-image
              class="funicon"
              :src="baseurlapp + `shangpin.png`"
              fit="cover"
            ></el-image>
          </el-badge>
        </div>
        <div class="funcards-item"  @click="fastWay(13)"> 
            <div>内容管理</div>
            <el-image
              class="funicon"
              :src="baseurlapp + `neirong.png`"
              fit="cover"
            ></el-image>  
        </div>
        <div class="funcards-item" @click="fastWay(12)">
          <div>活动</div>
          <el-image
            class="funicon"
            :src="baseurlapp + `huodong.png`"
            fit="cover"
          ></el-image>
        </div>
      </div>
      <div class="funcards"> 
        <div class="funlist">
          <el-row>
             
            <el-col :span="24" class="todolist">
              <el-badge
                :max="99"
                :hidden="cardsList.length == 0"
                :value="cardsList.length"
                class="item"
              >
                <div @click="gotoCardsList" class="feetitle">待激活购物卡</div>
              </el-badge>
              <div class="list">
                <table class="feetable" v-if="cardsList.length > 0">
                  <tr
                    class="feetable-tr"
                    v-for="(item, index) in cardsList"
                    :key="index"
                  >
                    <td  >
                      {{ item.user__username }}
                    </td>
                    <td>
                      {{ item.cardtype == 0?"电子卡":"实体卡"}} 
                    </td> 
                    <td>
                      <span class="money">{{ item.money }}元</span>
                    </td>
                    <td>
                      {{ item.saledate | dateFormat }}
                    </td>
                    <td> 
                    <el-link
                       v-if="item.status == 2"
                      :underline="false" 
                      type="success"
                      @click="activateCard(item , true)"
                    >激活卡片</el-link> 
                    </td>
                  </tr>
                </table>
                <div class="noresult" v-else>
                  <el-empty
                    :image-size="100"
                    class="empty"
                    description="没有相关账单"
                  ></el-empty>
                </div>
              </div>
            </el-col>   
          </el-row>
        </div>
      </div>
    </div> 
  </div>
</div>
</template>

<style lang="scss" scoped src="./dashboard.scss"></style>