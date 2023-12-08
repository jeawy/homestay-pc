<template>
  <div id="product-list">
    <!-- 订单列表 -->

    <el-row>
      <el-col :span="18">
        <div class="title" justify="space-between">
          <span> {{ record.title }}</span
          ><el-button :type="record.status | statustypefilter" round>{{
            record.status | statusfilter
          }}</el-button>
        </div>
        <div class="date">
          {{ record.date | dateTimeFormat }} {{ record.username }}
          <el-button type="success" round>{{
            record.need_login | need_loginfilter
          }}</el-button>
          <el-button type="primary" round>{{
            record.show_userinfo | show_userinfofilter
          }}</el-button>
          <el-button type="warning" round>{{
            record.only_owner_export | only_owner_exportfilter
          }}</el-button>
          <el-button type="primary" round>{{
            record.available_appside | available_appsidefilter
          }}</el-button>
          <el-button type="success" round v-if="record.autorecord == 1"
            >定时登记薄:{{ record.autotype | autotypefilter }}</el-button
          >
           <el-button type="danger" round v-if="record.limits > 0"
            >限制登记人数:{{ record.limits }}</el-button
          >
        </div>
        <div>{{ record.content }}</div>

        <el-row type="flex" justify="space-between">
          <el-form inline>
            <el-form-item>
              <el-input v-model="queryForm.keyword" placeholder="关键词">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button-group>
                <el-button type="primary" @click="handleGetUserList()">
                  登记查询
                </el-button>
                <el-button type="primary" plain @click="resetParams()">
                  重置
                </el-button>
              </el-button-group>
            </el-form-item>
          </el-form>
        </el-row>
        <table class="recordtable">
          <tr class="recordheader">
            <th v-for="(item, index) in record.extra" :key="index">
              {{ item.label }}
            </th>
          </tr>
          <tr
            :class="
              newrecord && index == 0 ? 'newrecord tabledatas' : 'tabledatas'
            "
            v-for="(item, index) in users"
            :key="index"
          >
            <td
              v-for="(itemvalue, indexvalue) in item.values"
              :key="indexvalue"
            >
              {{ itemvalue }}
            </td>
          </tr>
        </table>
      </el-col>
      <el-col :span="6" justify="center">
        <div class="export" @click="downloadExcel" >
          <el-image :src="require('@/assets/img/excel.png')"></el-image>
          <div>导出登记表格</div>
        </div>
        <div class="canvas">
          <canvas id="mycanvas" width="300" height="520"></canvas>
        </div>
        <div class="canvas">
          <el-button type="success" @click="download">下载二维码</el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getRecords, getUserInfos, getExcel } from "@/api/record";
export default { 
  data() {
    return {
      newrecord: true,
      record: {}, 
      isTableLoading: false,
      users:[],
      queryForm: {},
      uuid: "",
      timer:"",
      multipleSelection: [],
      baseUrl: process.env.VUE_APP_BASE_IMAGE,
      userlength:0,//登记用户数
    };
  },
  filters: {
    autotypefilter(autotype) {
      if (autotype == 0) {
        return "每天";
      } else if (autotype == 1) {
        return "每周";
      } else if (autotype == 2) {
        return "每月";
      }
    },
    available_appsidefilter(available_appside) {
      if (available_appside == 0) {
        return "APP或小程序端不可见";
      } else if (available_appside == 1) {
        return "APP或小程序端可见";
      }
    },
    autorecordfilter(autorecord) {
      if (autorecord == 0) {
        return "否";
      } else if (autorecord == 1) {
        return "定时登记薄";
      }
    },
    only_owner_exportfilter(only_owner_export) {
      if (only_owner_export == 0) {
        return "所有人可以导出结果";
      } else if (only_owner_export == 1) {
        return "仅发起人可以导出结果";
      } else if (only_owner_export == 2) {
        return "注册用户可以导出结果";
      }
    },
    show_userinfofilter(show_userinfo) {
      if (show_userinfo == 0) {
        return "不公开登记情况";
      } else if (show_userinfo == 1) {
        return "公开登记情况";
      }
    },
    need_loginfilter(need_login) {
      if (need_login == 0) {
        return "登记不需要先登录";
      } else if (need_login == 1) {
        return "登记需要先登录";
      }
    },

    statusfilter(status) {
      if (status == 0) {
        return "草稿";
      } else if (status == 1) {
        return "已发布 | 正在登记";
      } else if (status == 2) {
        return "已结束";
      }
    },
    statustypefilter(status) {
      if (status == 0) {
        return "primary";
      } else if (status == 1) {
        return "success";
      } else if (status == 2) {
        return "danger";
      }
    },
  },  
  created() {
    if (this.$route.query.uuid) {
      this.uuid = this.$route.query.uuid;
      this.handleGetDetail();
    } else {
      this.$notify({
        type: "error",
        message: "缺少登记薄参数",
        title: "参数错误",
      });
    } 
  },
  methods: {
    startTimer(){
      var _this = this; //声明一个变量指向Vue实例this，保证作用域一致
    
      if(_this.record.status == 1)
      {
        
        // 正在登记的登记薄
        
         _this.timer = setInterval(function() {
          let param = {
            uuid:_this.uuid,
            userlength:_this.userlength
          }
          getUserInfos(param).then(({data:{status, msg}})=>{
            if (status === 0) {
              if(msg.length > 0){  
                  _this.users.unshift(...msg) ;
                _this.userlength = _this.users.length; 
                _this.$notify({
                  type:"success",
                  title:"新登记",
                  message:"有"+ msg.length + "条新登记"
                })
                _this.playmusic() 
              } 
              }
          })
        }, 5000);

        this.$once('hook:beforeDestroy',()=>{
          console.log(11322323)
          clearInterval(_this.timer);
          _this.timer= null
        }) 
      }
    },
    handleGetUserList(){
      let param = {
        uuid:this.uuid,
        ...this.queryForm,
        userlength:0
      }
      getUserInfos(param).then(({data:{status, msg}})=>{
         if (status === 0) { 
            this.users = msg; 
          }
      })
    },
    downloadExcel(){
      getExcel({uuid:this.uuid}).then(({data:{status, msg}})=>{
        if (status == 0){
          let url = this.baseUrl + "/" + msg
          let a = document.createElement("a");
          let event = new MouseEvent("click");
          a.download = this.record.title+".xlsx";
          a.href = url;
          a.dispatchEvent(event);
        }
      })
    },
    playmusic() {
      // 播放提示音
      var audio = new Audio(require("@/assets/music/tishiyin.mp3")); // path to file
      audio.play();
    },
    download() {
      var canvas = document.getElementById("mycanvas");
      let url = canvas.toDataURL("image/jpg");
      let a = document.createElement("a");
      let event = new MouseEvent("click");
      a.download = "登记二维码";
      a.href = url;
      a.dispatchEvent(event);
    },
   
    doDraw(imageUrl) {
       //  imageUrl为后台提供图片地址
      // 绘制二维码
      //  获取canvas
      var canvas = document.getElementById("mycanvas");
      //  由于弹窗，确保已获取到
      var a = setInterval(() => {
        //  重复获取
        canvas = document.getElementById("mycanvas");
        if (!canvas) {
          return false;
        } else {
          clearInterval(a);
          //  可以理解为一个画笔，可画路径、矩形、文字、图像
          var context = canvas.getContext("2d");
          
          context.fillStyle = "white";
          context.fillRect(0, 0, canvas.width, canvas.height);

          context.strokeStyle = "#8a8a8a";
          context.lineWidth = 1;
          context.strokeRect(0, 0,canvas.width, canvas.height);

          var img = new Image();
          img.src = imageUrl;
          img.setAttribute("crossOrigin", "anonymous");
          //  加载图片
          img.onload = function () {
            if (img.complete) {
              //  根据图像重新设定了canvas的长宽
              //canvas.setAttribute("width",img.width)
              //canvas.setAttribute("height",img.height)
              //  绘制图片
              context.drawImage(img, 10, 10, 280, 280);

              context.font = "18px Arial bolder";
              context.fillStyle = "#515151";
              context.fillText("微信或者吉维尼APP", 58, 310);

              context.font = "26px Arial bolder";
              context.fillStyle = "#ff8000";
              context.fillText("扫一扫进行登记", 55, 350);
            }
          };
          var imglogo = new Image();
          imglogo.setAttribute("crossOrigin", "anonymous");
          imglogo.src = require("@/assets/img/logo.png");
          imglogo.onload = function () {
            if (imglogo.complete) {
              context.drawImage(imglogo, 190, 380, 80, 80);
              context.font = "14px Arial bolder";
              context.fillStyle = "#515151";
              context.fillText("吉维尼APP", 190, 480);
            }
          };

          var imgwx = new Image();
          imgwx.setAttribute("crossOrigin", "anonymous");
          imgwx.src = require("@/assets/img/weixin.png");
          imgwx.onload = function () {
            if (imgwx.complete) {
              context.drawImage(imgwx, 30, 380, 80, 80);
              context.font = "14px Arial bolder";
              context.fillStyle = "#515151";
              context.fillText("微信扫一扫", 35, 480);
            }
          };
        }
      }, 1);
    }, 
    resetParams() {
      this.queryForm = {};
      this.handleGetDetail();
    },
    handleGetDetail() {
      this.isTableLoading = true;
      getRecords({
        ...this.queryForm,
        communityuuid: localStorage.getItem("communityuuid"),
        uuid: this.uuid,
      })
        .then(({ data: { status, msg } }) => { 
          if (status === 0) {
            this.record = msg;
            this.users = msg.users
            this.userlength = this.record.users.length;
            this.doDraw(
              process.env.VUE_APP_BASE_IMAGE + "/images/" + this.record.qrcode
            );
            this.startTimer()
          }
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },   
  },
};
</script>

<style lang="scss">
@import "~@/styles/variables.scss";
#product-list {
  .canvas {
    text-align: center;
  }
  .export {
    padding-top: 5%;
    margin: 10px auto;
    width: 300px;
    text-align: center;
    height: 180px;
    border: 1px solid #bfbfbf;
    cursor: pointer;
  }
  .title {
    display: flex;
    font-weight: bold;
    font-size: 18px;
    min-width: 600px;
    border-bottom: 2px solid $base-color;
    justify-content: space-between;
  }
  .date {
    margin: 10px 0;
  }
  .recordtable {
    width: 100%;
    border-spacing: 0;
    .recordheader {
      background-color: #8a8a8a;
      color: white;
      height: 40px;

      th {
        font-weight: 100;
        border-bottom: 1px solid white;
        border-right: 1px solid white;
      }
      th:last-child {
        border-right: 1px solid #8a8a8a;
      }
    }
    tr td:first-child {
      border-left: 1px solid #bfbfbf;
    }
    td {
      border-bottom: 1px solid #bfbfbf;
      border-right: 1px solid #bfbfbf;
    }
    .newrecord {
      height: 40px;
      border: 1px solid #ff4949 !important;
      color: white;
      font-weight: 100;
      background-color: #ff4949;
    }
  }
  .el-avatar {
    margin-right: 16px;
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
  .name-wrap {
    display: flex;
    align-items: center;
  }
}
</style>
