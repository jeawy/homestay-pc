<template>
  <div>
    <el-form
      :model="addProductsForm"
      status-icon
      ref="addProductsForm"
      label-width="90px"
    >
      <div style="display: flex">
        <div class="mainpic">
          <!-- id{{id}} -->
          <el-upload
            accept="picture/jpeg, picture/gif, picture/png"
            ref="upload"
            class="upload-demo" 
            :headers="headers" 
            action=""
            :http-request="HandleMainImg" 
            :auto-upload="false"
            drag
            :show-file-list="false"
            :on-change="handleAvatarSuccessMainPic"
          >
            <el-image
              v-if="preMainPic"
              style="width: 100%; height: 100%"
              :src="preMainPic"
            >
            </el-image>
            <template v-else>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                民宿封面图，或
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
          <el-upload
            accept=".mp4"
            ref="uploadvideo"
            class="upload-demo" 
            :headers="headers"
            action=""
            :auto-upload="false"
            :http-request="HandleVideo" 
            drag
            :show-file-list="false"
            :on-change="handleAvatarSuccessMainVideo"
          >
          <video width="100%" height="100%" :src="priVideoPath"   controls v-if="priVideoPath">
            
          </video>
            <template v-else>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                民宿封面视频，或
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
          <div >
              <el-form-item label-width="45px"  label="面积:" prop="area">
                <el-input
                  v-model="addProductsForm.area" 
                  type="number"
                  style="width: 100px;"
                ></el-input>
              </el-form-item>
              <div class="title">位置信息:</div>
              <el-form-item label-width="45px" label="地址:" prop="address">
                <el-input 
                   
                  v-model="addProductsForm.address"  
                ></el-input>
              </el-form-item>
              <el-form-item label-width="45px" label="经度:" prop="longitude">
                <el-input
                  v-model="addProductsForm.longitude" 
                  type="number"
                  style="width: 150px;"
                  placeholder="longitude"
                ></el-input>
              </el-form-item>
              <el-form-item label-width="45px" label="纬度:" prop="latitude">
                <el-input
                  v-model="addProductsForm.latitude" 
                  type="number"
                  placeholder="latitude"
                  style="width: 150px;"
                ></el-input>
              </el-form-item>
              <div class="title">入住时间:</div>
              <el-form-item label-width="100px"  label="最早入住时间:" prop="checkin_earlest_time">
                <el-input
                  v-model="addProductsForm.checkin_earlest_time"  
                  style="width: 150px;" 
                ></el-input>
              </el-form-item>
              <el-form-item label-width="100px"  label="最晚退房时间:" prop="checkout_latest_time">
                <el-input
                  v-model="addProductsForm.checkout_latest_time"   
                  style="width: 150px;"
                ></el-input>
              </el-form-item>
          </div>
        </div>
        
        <div>
          <div style="display: flex">
            <el-cascader
              v-model="category"
              placeholder="请选择类别"
              :options="options"
              :props="{ checkStrictly: true }"
            >
            </el-cascader>
            <el-form-item label="民宿标题" prop="title">
              <el-input v-model="addProductsForm.title"></el-input>
            </el-form-item>

            <el-checkbox v-model="ready" class="book">立即上架</el-checkbox>
            <el-checkbox v-model="recommend" class="book"
              >设为推荐民宿</el-checkbox
            >
          </div>
          <div style="display: flex">
            <el-form-item label="户型:" label-width="45px" prop="housetype">
              <el-input v-model="addProductsForm.housetype" maxlength="10" placeholder="两室一厅" style="width: 120px;"></el-input>
            </el-form-item>
            <el-form-item label="最多入住人数" label-width="110px" prop="maxlivers">
              <el-input v-model="addProductsForm.maxlivers" style="width: 100px;" min="1" type="number"></el-input>
            </el-form-item>
            <el-form-item label="房屋特色" prop="lighlight">
              <el-input v-model="addProductsForm.lighlight" maxlength="50" style="width: 250px;"></el-input>
            </el-form-item> 
          </div>
          
          <el-tag
            v-for="tag in history_tags"
            :key="tag.name" 
            @click="fastAddtag(tag)"
            type="success">
            {{tag.name}}
          </el-tag>
          <div style="display: flex">
            <el-form-item label="房屋标签:" label-width="80px" prop="newtag"> 
              <el-tag
                :key="index"
                v-for="(tag, index) in  newtags"
                closable
                :disable-transitions="false"
                @close="handleCloseTag(index)">
                {{tag}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="newtag"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新标签</el-button>
            </el-form-item> 
          </div>
          <div class="title">房价设置:</div>
          <p style="color:#bfbfbf">提示:只设置最近6个月工作日、周末及节假日的房价</p>
          <div style="display: flex">
            <el-form-item label="工作日价格:" prop="workday_price">
              <el-input
                v-model="addProductsForm.workday_price"
                class="price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="周末价格:" prop="weekday_price">
              <el-input
                v-model="addProductsForm.weekday_price"
                class="price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="节假日价格:" prop="holiday_price">
              <el-input
                v-model="addProductsForm.holiday_price"
                class="price"
                type="number"
              ></el-input>
            </el-form-item>
            <div class="pricetype">
              <el-radio v-model="pricemode" class="cardtype" :label="0"
                >仅覆盖日历上未设定价格的日期</el-radio
              >
              <el-radio v-model="pricemode" class="cardtype" :label="1"
                >覆盖日历所有价格</el-radio
              >
            </div>
          </div>
          
          <Calendar :mini="false" :productuuid="uuid"></Calendar>
        </div>
      </div>
     
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="baseImage + dialogImageUrl" alt />
      </el-dialog>
      <div style="display: flex">
        <tinymce v-model="addProductsForm.content"  style="width: 450px;" />
        <div class="video"> 
          <div style="margin-left: 20px;  width:500px">
             
            <div class="rules">
              <div>入住须知</div>
              <el-input v-model="addProductsForm.checkin_notice"  type="textarea" :rows="5" placeholder="入住须知"></el-input> 
            </div>
            <div class="rules" >
              <div>对客要求</div>
              <el-input v-model="addProductsForm.customer_notice" type="textarea" :rows="5" placeholder="对客要求"></el-input> 
            </div>
        </div>
        </div>
      </div> 
      <div class="btn">
        <el-button @click="cancel">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm('addProductsForm', 'tableData')"
          >{{ uuid ? "修改" : "发布" }}</el-button
        > 
      </div>
    </el-form>
    <BackToTop></BackToTop>
  </div>
</template>

<script>
import {
  viewProducts,
  addHomeStayProducts,
  viewProductsClass,
  viewProductsSpecs,
  addProductSpecs, 
} from "@/api/product";
import { getCategory } from "@/api/category";
import { getTagsApi } from "@/api/tags";
import { getToken } from "@/utils/auth";
import tinymce from "@/components/Tinymce";
import BackToTop from "@/components/BackToTop";
import Calendar from "@/components/Calendar";

export default {
  name: "alter-gifts",
  data() {
    return {
      newtag:"",
      newtags:[],
      history_tags:[],
      cardtype: 0, //默认是电子卡
      uuid: "",
      fileList: [],
      options: [],
      date: "",
      data: {
        type: "current-month",
        isSelected: false,
        day: "MM-dd",
      },
      categoriesList: [], //类别
      baseImage: process.env.VUE_APP_BASE_IMAGE + "/images/",
      isbook: false, //是否为预约民宿
      ready: false, // 立即上架
      recommend: false, //是否设为推荐民宿 
      tableData: [
        {
          // rowNum: "",
          price: null,
          coin: null,
          name: null,
          content: null,
          number: null,
        },
      ],
      multipleSelection: [],

      selectlistRow: [],
      showDate: new Date(),
      giftList: [],
      giftsClassList: [],
      giftsSpecsList: [],
      dialogImageUrl: "",
      dialogVisible: false,
      dialogShow1: false,
      pricemode:0,
      addProductsForm: {
        category: null,
        title: null,
        address:"",
        picture: null,
        turns: null,
        content: null,
        workday_price:null,
        weekday_price:null,
        holiday_price:null,
 
        area:null, 
        longitude:null,
        latitude:null,
 
        checkin_earlest_time:"12:00",
        checkout_latest_time:"12:00",

        unsubscribe_rules:"",
        checkin_notice:"",
        customer_notice:"", 

        lighlight:"",
        housetype:"",
        maxlivers:4,  
        tags:""
      },
      preMainPic:"",
      priVideoPath:"",
      inputVisible:false,
      rules: {
        spec_number: [
          {
            pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
            message: "请输入数字",
            trigger: "change",
          },
        ],
      }, 
      SRC1: "",
      headers: {
        Authorization: `JWT ${getToken()}`,
      },
      category: "",
      formfileData:null
    };
  },
  components: {
    tinymce,
    BackToTop,
    Calendar,
  },
  name: "extra-audit",
  //判断能否添加规格
  created() {
    this.getTags()
    if (this.$route.query.uuid) { 
      this.uuid = this.$route.query.uuid; 
      this.getviewProducts();
    } else {
    }
    this.getCategoryList(); 
    this.formfileData = new FormData()
    
  },

  methods: {
    fastAddtag(tag){
      if (!( this.newtags.includes(tag.name))){
          this.newtags.push(tag.name)
      }
    },
    showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
    handleInputConfirm() {
        let inputValue = this.newtag;
        if (inputValue) {
          this.newtags.push(inputValue);
        }
        this.inputVisible = false;
        this.newtag = '';
      },
    handleCloseTag(index){
      this.newtags.splice(index, 1)
    }, 
    submitFileForm(){
      this.$refs.upload.submit()
      this.$refs.uploadvideo.submit() 
    },
    handleAvatarSuccessMainVideo(file){
      this.priVideoPath = URL.createObjectURL(file.raw);
      console.log(this.priVideoPath)
    },
    handleAvatarSuccessMainPic(file){
      this.preMainPic = URL.createObjectURL(file.raw);
    },
    handlFileList(param){
      //有几个文件会被执行几次
      console.log(param)
    },
    HandleVideo(param){  
      this.formfileData.append("videopath", param.file) 
    },
    HandleMainImg(param){ 
      console.log(param.file) 
      this.formfileData.append("mainpic", param.file) 
    },
    handleRemove(file, fileList) { 
      this.fileList = [];
      for (var i = 0; i < fileList.length; i++) {
        this.fileList.push({
          url: fileList[i].url,
        });
      }
    }, 
    getviewProducts() {
      this.newtags = []
      viewProducts({
        uuid: this.uuid,
      }).then((res) => {
        if (res.data.status == 0) {
          this.addProductsForm = res.data.msg;
          
          this.fileList = [];
          for (var i = 0; i < res.data.msg.turns.length; i++) {
            this.fileList.push({
              url: this.baseImage + res.data.msg.turns[i],
            });
          }
          this.pricemode = 0
          this.preMainPic = this.baseImage + this.addProductsForm.picture
          this.priVideoPath = this.baseImage + this.addProductsForm.videopath
          this.category = res.data.msg.categoryid;
          this.isbook = res.data.msg.isbook == 0 ? false : true; 
          this.ready = res.data.msg.ready == 0 ? false : true;
          this.recommend = res.data.msg.recommend == 0 ? false : true; 
          this.tableData = this.addProductsForm.specifications;
          res.data.msg.tags.forEach((e)=>{
            this.newtags.push(e.name)
          })
        } else {
          this.$notify({
            type: "error",
            title: "获取失败",
            message: res.data.msg,
            duration: 0,
          });
        }
      });
    },
    getProductsClass() {
      viewProductsClass().then(({ data }) => {
        this.giftsClassList = [...data.msg];
      });
    },
    openDialog(Type) {
      if (Type === 1) {
        this.dialogShow1 = true;
      }
    }, 
    getEditData(){
      // 数据格式化
      this.formfileData.append("producttype", 0)
      this.formfileData.append("title", this.addProductsForm.title)
      this.formfileData.append("content", this.addProductsForm.content) 

      this.formfileData.append("workday_price", this.addProductsForm.workday_price)
      this.formfileData.append("weekday_price", this.addProductsForm.weekday_price) 
      this.formfileData.append("holiday_price", this.addProductsForm.holiday_price)
      this.formfileData.append("pricemode", this.pricemode) 
      this.formfileData.append("area", this.addProductsForm.area)


      this.formfileData.append("address", this.addProductsForm.address) 
      this.formfileData.append("longitude", this.addProductsForm.longitude)
      this.formfileData.append("latitude", this.addProductsForm.latitude)
      this.formfileData.append("checkin_earlest_time", this.addProductsForm.checkin_earlest_time)
      this.formfileData.append("checkout_latest_time", this.addProductsForm.checkout_latest_time)


      this.formfileData.append("unsubscribe_rules", this.addProductsForm.unsubscribe_rules)
      this.formfileData.append("checkin_notice", this.addProductsForm.checkin_notice)
      this.formfileData.append("customer_notice", this.addProductsForm.customer_notice)
      
      this.formfileData.append("maxlivers", this.addProductsForm.maxlivers)
      this.formfileData.append("lighlight", this.addProductsForm.lighlight)
      this.formfileData.append("housetype", this.addProductsForm.housetype)
      
      let tags = ""
      if (this.newtags.length > 0){
        this.newtags.forEach((e)=>{
          tags += e +","
        })
      }

      console.log(tags)
      this.formfileData.append("tags", tags)

 
      if (this.category.length > 0) { 
        this.formfileData.append("category", this.category[this.category.length - 1]) 
      }

      if (this.isbook == true) { 
        this.formfileData.append("isbook", 1) 
      } else {
        this.formfileData.append("isbook", 0) 
      }

      if (this.ready == true) { 
        this.formfileData.append("ready", 1) 
      } else { 
        this.formfileData.append("ready", 0) 
      } 

      if (this.recommend == true) { 
        this.formfileData.append("recommend", 1) 
      } else { 
        this.formfileData.append("recommend", 0) 
      }
      for (var key of this.formfileData.entries()) {
          console.log(key[0] + ', ' + key[1]);
      } 
    },
    //添加民宿，修改民宿
    submitForm(addProductsForm, tableData) {
      let product = {};
      this.submitFileForm()
      this.getEditData()
       
      console.log(this.fileList);
      for (var i = 0; i < this.fileList.length; i++) {
        console.log(this.fileList[i].url);
        if (i == 0) {
          // 
          product.turns = this.fileList[i].url.replace(this.baseImage, "");
        } else {
          product.turns +=
            "," + this.fileList[i].url.replace(this.baseImage, "");
        }
      } 
      if (this.uuid) { 
        this.formfileData.append("method", "put") 
        this.formfileData.append("uuid", this.uuid) 
         
        addHomeStayProducts(this.formfileData).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.addProductsForm = {}; 
            this.addProductsForm.content = "";
            this.tableData = [];
            this.getviewProducts();
          } else {
            this.$message.error(data.msg);
          }
        });
      } 
      else {
        if (product.turns == null) {
          delete product.turns;
        }  
        addHomeStayProducts(this.formfileData).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.addProductsForm = {}; 
            this.addProductsForm.content = "";
            this.tableData = [];
            this.$router.push({
              name: "product-manage",
            });
          } else {
            this.$message.error(data.msg);
          }
        });
      }
    },
    cancel() {
      this.addProductsForm = []; 
      this.addProductsForm.content = "";
      this.tableData = [];
    },
    getCategoryList() {
      //获取民宿的类别
      getCategory().then(({ data }) => {
        if (data.status == 0) {
          this.categoriesList = data.msg;
          let children = [];
          for (var i = 0; i < data.msg.length; i++) {
            children = [];
            if (data.msg[i].sub.length > 0) {
              for (var j = 0; j < data.msg[i].sub.length; j++) {
                children.push({
                  value: data.msg[i].sub[j].id,
                  label: data.msg[i].sub[j].name,
                });
              }
            }
            this.options.push({
              value: data.msg[i].id,
              label: data.msg[i].name,
              children: children,
            });
          }
        } else {
          this.$notify({
            type: "error",
            title: "获取民宿类别失败",
            message: data.msg,
            duration: 0,
          });
        }
      });
    },
    getTags(){
      let param = {
        label:"product"
      }
      getTagsApi(param).then(({data:{status, msg}})=>{ 
         this.history_tags = msg
      })
    }
  },
  mounted() { 
    this.getProductsClass();
  },
};
</script>
<style lang='scss'      >
.title {
  font-weight: 700;
  width: 100%;
  border-bottom: 5px solid #d81e06;
  margin-bottom: 10px;
}

.detail{
   width: 300px;
}

.rules{
   flex:auto;
}
.cardtype {
  margin-top: 10px;
}
.btn {
  text-align: right;
  margin-top: 50px;
}
.book {
  margin-top: 5px;
  margin-left: 15px;
}
.upload-demo {
  .el-upload-dragger {
    width: 300px;
    height: 200px;
    margin-right: 15px;
    .el-icon-upload {
      font-size: 40px;
      margin-top: 40px;
    }
  }
}

.price {
  width: 100px;
}
.pricetype {
  margin-left: 10px;
}
</style>