<template>
  <main class="product-detail">
    <el-button-group class="noprint">
      <el-button
        @click="goBack"
        icon="el-icon-arrow-left"
        size="mini"
      ></el-button>
    </el-button-group>

    <el-row :gutter="10">
      <el-col class="ruleitem noprint" :span="10">
        <el-card shadow="never">
          <el-row align="middle" class="card-header topcard">
            <el-col :span="24">
              <div
                :class="
                  roominfo.fee_status == 0
                    ? 'roomname roomnamered'
                    : 'roomname roomnamegreen'
                "
              >
                {{ roominfo.buildingname }}{{ roominfo.unitname
                }}{{ roominfo.name }}
              </div>
              <div>
                业主:{{ roominfo.username }} {{ roominfo.phone }} 面积:{{
                  roominfo.area
                }}平米
              </div>
              <div>
                收费方式:
                {{ roominfo.fixed_fee ? roominfo.fixed_fee.name : "未设置" }}
              </div>
             
              <el-tooltip
                effect="dark"
                content="编辑房产信息及收费方式"
                placement="right"
              >
                <i @click="editFee" class="el-icon-s-tools settings">设置</i>
              </el-tooltip>
              
            </el-col>
          </el-row>
          <el-row class="feeholder" v-loading="fixedfeeloading" ><!-- 物业费 -->
            <el-col :span="24">
              <div class="feetitle">
                <span>物业费</span>
                <span class="date"
                  >已缴费至:{{
                    roominfo.arrearage_start_date | dateFormat
                  }}</span
                >
              </div>
            </el-col> 
            <el-col v-if="roominfo.fee_status == 1 && roominfo.billstatus==2" :span="24" class="moneyholder">
              <div class="payoff">已缴清</div>
               <el-tooltip content="点击更改预缴费日期" placement="top">
               <el-popover  ref="fixedfeepopover" placement="top" trigger="click" width="150">
                 <table class="newdate">
                   <tr @click="selectParentItem(item  )" class="newdate-tr" v-for="(item, index) in roominfo.arrearage_end_date_pre" :key="index">
                     <td>{{item|dateFormat}}</td>
                   </tr> 
                </table> 
                <span class="changedate" slot="reference">预交费至:{{
                  roominfo.arrearage_end_date | dateFormat
                }}</span> 
                 </el-popover>
               </el-tooltip>
            </el-col>
            <el-col v-if="roominfo.fee_status == 0 || roominfo.billstatus == 0" :span="24" class="moneyholder">
              <span>金额</span><span class="money">{{ roominfo.money }}</span
              >元
              
            </el-col>
            <el-col  v-if="roominfo.fee_status == 0  || roominfo.billstatus == 0" :span="24" class="moneyholder">
                <el-button @click="openPayDialog(roominfo.bill.uuid, roominfo.money, '物业费')" type="danger" icon="el-icon-bank-card" size="medium" >收款</el-button>
            </el-col>
            <el-col  v-if="roominfo.fee_status == 0  || roominfo.billstatus == 0" :span="24">
              <span>计费周期:</span
              ><span>{{ roominfo.arrearage_start_date | dateFormat }}-</span>
               <el-tooltip content="点击更改缴费日期" placement="top">
               <el-popover  ref="fixedfeepopover" placement="top" trigger="click" width="150">
                 <table class="newdate">
                   <tr @click="selectParentItem(item  )" class="newdate-tr" v-for="(item, index) in roominfo.arrearage_end_date_pre" :key="index">
                     <td>{{item|dateFormat}}</td>
                   </tr> 
                </table> 
                <span class="changedate" slot="reference">{{
                  roominfo.arrearage_end_date | dateFormat
                }}</span> 
            </el-popover>
               </el-tooltip>
            </el-col>
            <el-col  v-if="roominfo.fee_status == 0 || roominfo.billstatus == 0"  :span="24">
              <span>费用明细:</span>
            </el-col>
            <el-col  v-if="roominfo.fee_status == 0 || roominfo.billstatus == 0"  :span="24">
              <table class="table">
                <tr v-for="(item, index) in roominfo.fixedfees" :key="index">
                  <td>{{ item.feename }}</td>
                  <td>
                    <span class="money">{{ item.money }}</span
                    >元
                  </td>
                  <td>{{ item.detail }}</td>
                </tr>
              </table>
            </el-col>
          </el-row>
          <el-row
            class="feeholder"
            v-for="(item, index) in roominfo.dynamicfees"
            :key="index"
            v-loading="dynamicfeeloading"
            ><!-- 非统一性收费 -->
            <el-col :span="24">
              <div class="feetitle">
                <span>{{ item.dynamicfee_detail__dynamicfee__name }}</span>
                <span class="date"
                  >到期:{{ item.start_date | dateFormat }}</span
                >
              </div>
            </el-col>
            <el-col :span="24" class="moneyholder">
              <span>续费至:</span>
                <el-tooltip content="点击更改续费日期" placement="top">
              <el-popover ref="dynamicpopover" placement="top" trigger="click" width="150">
                 <table class="newdate">
                   <tr class="newdate-tr"
                   @click="selectDynamicItem(index, item.dynamicfee_detail__uuid, dateitem )"
                    v-for="(dateitem, dateindex) in roominfo.arrearage_end_date_pre" :key="dateindex">
                     <td>{{dateitem|dateFormat}}</td>
                   </tr> 
                </table> 
              
                <span slot="reference" class="changedate">{{
                  item.end_date | dateFormat
                }}</span>
             
            </el-popover>
              </el-tooltip >
              <span> 需支付 </span>
              <span class="money">{{ item.money }}</span
              >元
            </el-col>

            <el-col :span="24" class="moneyholder"> 
                <el-button @click="openPayDialog(item.uuid, item.money,item.dynamicfee_detail__dynamicfee__name)" type="danger" icon="el-icon-bank-card" size="medium" >收款</el-button>
            </el-col> 
            <el-col :span="24">
              <span>{{ item.detail }}</span>
            </el-col>
          </el-row>

          <el-button-group class="noprint">
            <el-button
              type="primary"
              icon="el-icon-message"
              @click="sendMessage"
            >
              短信催缴
            </el-button>
            <el-button
              type="primary"
              icon="el-icon-printer"
              plain
              @click="printBill"
            >
              打印催缴单
            </el-button>
          </el-button-group>
        </el-card>
      </el-col>

      <el-col class="ruleitem  whenprint" ref="printHistory" :span="24">
        <div class="carditem">
          <el-row slot="header" type="flex" align="center" class="card-header">
            <div class="print-title">物业费催缴记录单</div>
          </el-row>
          <el-row
            slot="header"
            type="flex"
            justify="space-between"
            align="middle"
            style="margin: 40px 10px; border-bottom: 1px dashed #8a8a8a"
            class="print-header"
          >
            <div class="print-room">
              房号:{{ roominfo.building }}{{ roominfo.unitname
              }}{{ roominfo.name }}
            </div>
            <div class="print-name">业主:{{ roominfo.username }}</div>
          </el-row>
          <el-row
            slot="header"
            align="middle"
            v-for="(item, index) in historyRecords"
            :key="index"
            style="border-bottom: 1px dashed #8a8a8a"
            class="card-header"
          >
            <div class="print-item-holder">
              <h4 v-if="item.reminder_type == 0">
                【短信】{{ item.reminder_date | dateFormat }}
              </h4>
              <h4 v-if="item.reminder_type == 1">【上门催缴】{{ item.reminder_date | dateFormat }}</h4>

              <h4 v-if="item.reminder_type == 0">{{ item.detail }}</h4>
             
                <image
                  v-if="item.reminder_type == 1"
                  style="max-width:100%; text-align: center"
                  :src="baseUrl + '/' + item.detail"
                >
                </image>
              
            </div>
          </el-row>
        </div>
      </el-col>

      <el-col class="ruleitem recordprint" :span="14">
        <el-card shadow="never">
          <el-row
            slot="header"
            type="flex"
            justify="space-between"
            align="middle"
            class="card-header"
          >
            <span>历史催缴记录</span>
            <el-button-group class="noprint">
              <el-button
                type="primary"
                @click="printRecord"
                icon="el-icon-printer"
              >
                打印催缴记录
              </el-button>
              <el-button
                type="primary"
                icon="el-icon-upload"
                plain
                @click="uploadHistory"
              >
                上传催缴记录
              </el-button>
            </el-button-group>
          </el-row>
          <el-row align="middle" class="card-header">
            <el-date-picker
              v-model="daterange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              @change="datechange"
              end-placeholder="结束日期"
            >
            </el-date-picker>
            <el-button type="primary" @click="getRecord" icon="el-icon-search">
              查询
            </el-button>
            <el-empty
              description="未查到催缴记录"
              v-if="historyRecords.length == 0"
            ></el-empty>
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in historyRecords"
                :key="index"
                :timestamp="item.reminder_date | dateFormat"
                placement="top"
              >
                <el-tag
                  type="warning"
                  v-if="item.reminder_type == 0"
                  effect="dark"
                  >短信</el-tag
                >
                <el-tag
                  type="danger"
                  v-if="item.reminder_type == 1"
                  effect="dark"
                  >上门催缴</el-tag
                >
                {{ item.username }} 提交于 {{ item.reminder_date | dateFormat }}
                <br />
                <br />
                <h4 v-if="item.reminder_type == 0">{{ item.detail }}</h4>
                <el-image
                  v-if="item.reminder_type == 1"
                  style="  height: 100px"
                  :src="baseUrl + '/' + item.detail"
                  :preview-src-list="[baseUrl + '/' + item.detail]"
                >
                </el-image>

                <el-divider></el-divider>
              </el-timeline-item>
            </el-timeline>
          </el-row>

          <el-divider></el-divider>
        </el-card>
      </el-col>
    </el-row>
   
    <el-dialog title="短信预览" :visible.sync="dialogSendMessage">
      <div>
        {{ sms_content }}
      </div>

      <el-divider></el-divider>
      <div class="tips">
        <strong style="color: #ff8000">短信发送说明:</strong>
        <div>1、不会给正常缴费的业主发送短信</div>
        <div>
          2、房产未绑定业主时，不会发送短信<el-link type="success"
            >去绑定业主信息</el-link
          >
        </div>
        <div>
          3、可以在短信发送记录中查看短信发送状态<el-link type="success"
            >查看</el-link
          >
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSendMessage = false">取 消</el-button>
        <el-button
          type="primary"
          v-loading="msgLoading"
          icon="el-icon-s-promotion"
          @click="confirmSendMsg"
          >发送</el-button
        >
      </div>
    </el-dialog>

    <el-col v-if="printHistory" class="whenprint " ref="printEles" :span="24">
      <div
        class="carditem"
        v-for="(item, index) in sms_content_print"
        :key="index"
      >
        <el-row slot="header" type="flex" align="center" class="card-header">
          <div class="print-title">物业费催缴记录单</div>
        </el-row>
        <el-row
          slot="header"
          type="flex"
          justify="space-between"
          align="middle"
          class="print-header"
        >
          <div class="print-room">
            房号:{{ item.communityname }}{{ item.roomname }}
          </div>
          <div class="print-name">业主:{{ item.username }}</div>
        </el-row>
        <el-row slot="header" align="middle" class="card-header">
          <div class="print-item-holder" v-html="item.content">
            {{ item.content }}
          </div>
          <div class="footer">
            <div class="organizename">{{ item.organize }}</div>
            <p>{{ item.date }}</p>
          </div>
        </el-row>
      </div>
    </el-col>

    <el-dialog
      class="dialog-upload"
      title="现场催缴记录上传"
      :visible.sync="dialogUpload"
    >
      <el-upload
        v-loading="recordPicLoading"
        accept="picture/jpeg, picture/gif, picture/png"
        ref="upload"
        class="upload-demo"
        action="prx/api/appfile/appfile/"
        :headers="headers"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        drag
        :show-file-list="false"
      >
        <el-image
          v-if="SRC"
          style="width: 100%; height: 100%"
          :src="SRC"
        ></el-image>
        <template v-else>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将现场照片拖到此处，或
            <em>点击上传</em>
          </div>
        </template>
      </el-upload>
      <el-divider></el-divider>
      <span class="demonstration">现场催缴日期</span>
      <el-date-picker
        v-model="reminder_date"
        type="datetime"
        placeholder="现场催缴日期"
      >
      </el-date-picker>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogUpload = false">取 消</el-button>
        <el-button type="primary" @click="saveRecordPic">保存到系统</el-button>
      </div>
    </el-dialog>

     <el-dialog 
      :visible.sync="dialogpay"
      style="padding-top: 15px"
      width="700px"
    > 
   
     
      <div
        class="el-money"
        customClass="loading"
        v-loading="orderloading"
        element-loading-text="等待业主支付"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.5)"
      >  
       <input type="text" class="authcode" @blur="inputblur" v-model="auth_code"  v-on:keyup.enter="pay" ref="authcode">
        <div class="payholder">
          <div class="title">{{paytitle}}</div>
          <div class="money">{{paymoney}}<span class="moneyunit">元</span></div>
          <table class="pay-table"  >
            <tr>
              <td class="td-pay-image">
                <el-image
                  class="image-alipay"
                  style="width: 190px; height:55px; text-align: right"
                  :src="require('@/assets/img/alipay.png')"
                  
                ></el-image>
              </td>
              <td class="td-pay-image">
                <el-image
                  class="image-weipay"
                  style="width: 190px; height:55px; text-align: left"
                  :src="require('@/assets/img/weipay.png')" 
                ></el-image>
              </td>
            </tr>
            <tr>
              <td class="td-pay-text" colspan="2">
                 <div class="tips">
                  <strong style="color: #ff8000">提示业主出示微信或者支付宝支付二维码</strong>
                </div>
              </td> 
            </tr>
            <tr>
              <td class="td-pay-text" colspan="2"> 
              </td> 
            </tr> 
          </table>
        </div>
      </div>
    </el-dialog>
     <el-dialog
    :visible.sync="dialogWxpay"
    style="padding-top: 15px"
      width="350px"
    >
      <div class="wxpay">
       
        <div class="imgholder"> 
          <el-image
          class="erweima"
          :src='wxerweima'
          ></el-image>
        </div>
        <div class="bottom">
          <el-image
          class="logo"
          :src='require("@/assets/img/logo.png")'
          ></el-image>
          <div class="msgholder">
             <div class="moneyholder">{{paytitle}},总金额:<span class="money">{{paymoney}}</span>元</div>
             <div class="wxtxt">使用微信扫一扫支付</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </main>
</template>

<script>
import { getToken } from "@/utils/auth";
import { parseTime } from "@/utils/index";
import { updateFees, payFees } from "@/api/fee";
import { getMsgTemplate, sendMsg } from "@/api/msg";
import { checkAlipay, checkWxpay } from "@/api/pay"; 
import { 
  uploadRecordPic,
  getRecords,
  getOrgRoomApi,
} from "@/api/building";
export default {
  data() {
    return {
      auth_code:"", // 支付码
      dialogpay:false,
      dialogWxpay:false,
      orderloading:false,
      dynamicfeeloading:false,
      fixedfeeloading:false,
      printHistory: false,
      dialogUpload: false,
      roomuuid: "",
      sms_content: "",
      sms_detail: "",
      roominfo: {},
      reminder_date: "",
      filepath: "", //上传的现场催缴记录路径
      dialogSendMessage: false,
      SRC: "",
      headers: {
        Authorization: `JWT ${getToken()}`,
      },
      dialogFormVisible: false,
      msgLoading: false,
      daterange: "",
      sms_content_print: [],
      baseUrl: this.$store.state.BASE_URL_IMAGE,
      recordPicLoading: false,
      historyRecords: [],
      communityuuid: "",
      wxtimer:null,
      timer:null,
      paytitle:"",
      paymoney:9999999,
      payway:0,
      wxerweima:"",
      orderuuid:""//当前正在支付的订单uuid
    };
  },
  created() {
    const yourDate = new Date();
    this.reminder_date = yourDate; //.toISOString().split('T')[0]
    console.log(this.reminder_date);
    this.roomuuid = this.$route.query.uuid;
    this.communityuuid = this.$route.query.communityuuid;
    if (!this.communityuuid) {  
      this.communityuuid = localStorage.getItem("communityuuid");
    } 
    this.queryDetail();
    this.getRecord();
  },
  watch: {
    dialogMsgVisible(val) { 
      if (val) return
      this.clearTimer() 
    }, 
    dialogWxpay(val){ 
      if (val) return
      this.clearWxTimer()
    }, 
  },
  beforeDestroy() {
    this.clearTimer()
    this.clearWxTimer() 
  },
  methods: {  
     openPayDialog(orderuuid, money, title) { 
       this.paytitle = title
       this.paymoney = money
       this.orderuuid = orderuuid
       this.dialogpay = true; 
       this.$nextTick((x)=>{ //正确写法 
          this.$refs.authcode.focus(); 
          this.orderloading = true
      })
    },
    clearTimer(){
      this.timer &&  clearInterval(this.timer);
    },
     clearWxTimer(){
      this.wxtimer &&  clearInterval(this.wxtimer);
    },
      inputblur(){
          setTimeout(()=>{
            this.$refs.authcode.focus(); 
            this.auth_code = ""
          }, 10)
        },
    pay() {  
        let data = {
          webpay: 1,
          orderuuid: this.orderuuid, 
          payway:1, 
          auth_code:this.auth_code 
        }; 
      
        let that = this;
        payFees({ ...data }).then(({ data: { status, msg } }) => { 
          if (status == 0) {
            let payCallback
            if (msg.payway == 0) {
              // 支付宝支付
              window.open(msg.payurl, "_blank"); 
              this.orderloading = true;
              payCallback = ()=> {
                // 查询订单状态
                checkAlipay({ out_trade_no: msg.orderno }).then((res) => {
                  if (res.status == 200) {
                    if (res.data.status == 0) {
                      that.orderloading = false;
                      that.$notify({
                        type: "success",
                        message: "缴费成功",
                        duration: 0,
                        title: "支付成功",
                      });
                      that.clearTimer() 
                      that.dialogpay = false;
                      that.queryDetail(); 
                    } else if (res.data.status == 1) {
                      that.$notify({
                        type: "error",
                        message: res.data.msg,
                        duration: 0,
                        title: "支付失败",
                      });
                      that.clearTimer() 
                    }
                  }
                });
              }
              that.timer = setInterval(payCallback,2000)
            }
            else{
              // 微信支付 
              payCallback = ()=> {
                  checkWxpay({
                    checkbill:1,
                    billno:msg.orderno,
                    sub_mch_id:msg.sub_mch_id
                  }).then((res)=>{ 
                    if (res.data.status == 0) {
                      that.orderloading = false;
                      that.$notify({
                        type: "success",
                        message: "缴费成功",
                        duration: 0,
                        title: "支付成功",
                      });
                      that.clearWxTimer() 
                      that.dialogpay = false;
                      that.queryDetail()  
                    } else if (res.data.status == 1) {
                      that.$notify({
                        type: "error",
                        message: res.data.msg,
                        duration: 0,
                        title: "支付失败",
                      });
                      that.clearWxTimer() 
                    } 
                  })
              }
              that.wxtimer = setInterval(payCallback,2000)
            }  
          }
        }).finally(res=>{
          this.orderloading = false
        }); 
    },
    selectDynamicItem(index, dynamicfeeuuid, final_date) {
      //预付非固定费，如停车费 
      let data = {
        dynamicfeeuuid: dynamicfeeuuid,
        final_date: final_date,
        communityuuids:1
      };
      this.dynamicfeeloading = true
      this.$refs.dynamicpopover[index].doClose()
      updateFees(data)
        .then((res) => {
          console.log(res);
          if (res.data.status == 0) {
            this.queryDetail()
          }
          else{
            this.$notify(
              {type:"error",
              title:"更新失败",
              message:res.data.msg}
            )
          }
        })
        .finally(() => {
           this.dynamicfeeloading = false
        });
    },
    selectParentItem(final_date) { 
      // 预付固定物业费 
      let data = {
        roomuuid: this.roomuuid,
        final_date: final_date,
        communityuuids:""
      }; 
      this.fixedfeeloading = true
      this.$refs.fixedfeepopover.doClose()
      updateFees(data)
        .then((res) => {
          console.log(res);
          if (res.data.status == 0) {  
            this.queryDetail()
          }
          else{
            this.$notify(
              {type:"error",
              title:"更新失败",
              message:res.data.msg}
            )
          }
        })
        .finally(() => {
          this.fixedfeeloading = false
          
        });
    },
    editFee() {
      this.$router.push({
        name: "asset-edit-room",
        query: {
          uuid: this.roomuuid,
          communityuuid: this.communityuuid,
        },
      });
    },
    getRecord() {
      // 获取催缴记录
      let params = {
        roomuuid: this.roomuuid,
      };
      if (this.daterange.length == 2) {
        params["start"] = parseTime(this.daterange[0].getTime());
        params["end"] = parseTime(this.daterange[1].getTime());
      }
      getRecords(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.historyRecords = msg;
          console.log(this.historyRecords);
        } else {
          this.$notify({
            type: "error",
            title: "查询失败",
            message: msg,
            duration: 0,
          });
        }
      });
    },
    datechange() {
      console.log(this.daterange);
    },
    saveRecordPic() {
      // 上传现场催缴记录
      let data = {
        communityuuid: this.communityuuid,
        roomuuid: this.roomuuid,
        detail: this.filepath,
        reminder_date: parseTime(this.reminder_date.getTime()),
      };
      uploadRecordPic(data).then(({ data: { msg, status } }) => {
        if (status === 0) {
          this.$notify({
            type: "success",
            title: "保存成功",
            message: msg,
            duration: 2000,
          });
          this.dialogUpload = false;
          this.getRecord()
        } else {
          this.$notify({
            type: "error",
            title: "保存失败",
            message: msg,
            duration: 0,
          });
        }
      });
    },
    beforeUpload() {
      this.recordPicLoading = true;
    },
    printRecord() {
      this.printHistory = false;
      this.$print(this.$refs.printHistory);
    },
    confirmSendMsg() {
      //确认发送短信
      let data = {
        roomuuids: JSON.stringify([this.roomuuid]),
        communityuuid: this.communityuuid,
      };
      this.msgLoading = true;
      sendMsg(data)
        .then(({ data: { status, msg } }) => {
          if (status == 0) {
            this.$notify({
              type: "success",
              title: "提交成功",
              message: msg,
              duration: 2000,
            });
            this.dialogSendMessage = false;
          } else if (status == 2) {
            // 短信余额不足
            this.$notify({
              type: "error",
              title: "短信余额不足",
              message: msg,
              duration: 0,
            });
          } else {
            this.$notify({
              type: "error",
              title: "获取短信模板失败",
              message: msg + "请联系平台IT支持",
              duration: 0,
            });
          }
        })
        .finally(() => {
          this.msgLoading = false;
        });
    },
    batchSendMsg() {
      // 批量发送短信提醒缴费
      // 获得短信交房模板
      let params = {
        roomuuids: JSON.stringify([this.roomuuid]),
        communityuuid: this.communityuuid,
        template_sms: 1,
      };
      getMsgTemplate(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          if (msg.sms_content_ls.length == 1) {
            this.sms_content = msg.sms_content_ls[0];
          }
          this.number = msg.number;
          this.dialogMsgFormVisible = true;
        } else {
          this.$notify({
            type: "error",
            title: "获取短信模板失败",
            message: msg + "请联系平台IT支持",
            duration: 0,
          });
        }
      });
    },
    printBill() {
      this.printHistory = true;
      let params = {
        roomuuids: JSON.stringify([this.roomuuid]),
        communityuuid:this.communityuuid,
        template_sms: 1,
        print: 1,
      };
      getMsgTemplate(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.sms_content_print = msg.sms_content_ls;

          setTimeout(() => {
            this.$print(this.$refs.printEles);
          }, 100);
        } else {
          this.$notify({
            type: "error",
            title: "获取业主信息模板失败",
            message: msg + "请联系平台IT支持",
            duration: 0,
          });
        }
      });
    },
    uploadHistory() {
      this.dialogUpload = true;
    },
    sendMessage() {
      this.batchSendMsg();
      this.dialogSendMessage = true;
    },
    //监听上传图片成功，成功后赋值给form ，并且赋值给图片src显示图片
    handleSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.SRC = this.baseUrl + "/" + response.msg;
        this.filepath = response.msg;
        this.recordPicLoading = false; 
      } else {
        this.$notify({
          type: "error",
          title: "上传失败",
          message: response.msg,
          duration: 0,
        });
        this.recordPicLoading = false;
      }
    },

    addNewRule() {},

    handleAddbtn() {
      this.dialogFormVisible = true;
    },
    handleDelete(uuid) {},
    goBack() {
      this.$router.go(-1);
    },

    // 根据ID查询详情（修改前）
    queryDetail() {
      getOrgRoomApi({
        roomuuid: this.$route.query.uuid,
        communityuuid: this.communityuuid,
      }).then(({ data: { status, msg } }) => {
        
        if (status === 0) {
          this.roominfo = msg;
          console.log(this.roominfo);
        }
      });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
<style lang="scss" scoped src="./history.scss">
</style>
