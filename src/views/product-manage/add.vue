<template>
  <div>
    <el-form :model="addProductsForm" status-icon ref="addProductsForm" label-width="90px">
      <div style="display:flex">
        <div  class="mainpic">
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
            <el-image v-if="preMainPic" style="width: 100%; height: 100%" :src="preMainPic">

            </el-image>
            <template v-else  >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                封面图，或
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
                封面视频，或
                <em>点击上传</em>
              </div>
            </template>
          </el-upload>
        </div>
        <div>
          <div style="display:flex"> 
            <el-cascader v-model="category" placeholder="请选择商品类别" 
                
              :options ="options"
              :props="{checkStrictly: true }"
              > 
            </el-cascader> 
            <el-form-item label="标题" prop="title">
              <el-input v-model="addProductsForm.title"></el-input>
            </el-form-item>  
            <el-checkbox v-model="isbook"  class="book">预约商品</el-checkbox> 
            <el-checkbox v-model="ready"  class="book">立即上架</el-checkbox> 
            <el-checkbox v-model="recommend"  class="book">设为推荐</el-checkbox>
            
          </div>
          <div style="display: flex"> 
            <el-form-item label-width="90px" label="推荐理由" prop="lighlight">
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
            <el-form-item label=" 标签:" label-width="80px" prop="newtag"> 
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

          <div  >
            <div class="button"  >
              <el-button
                type="primary" 
                @click.prevent="addExtraRow()"
              > 添加服务</el-button> 
              <el-button type="danger" @click.prevent="batchExtraDelete">删除服务</el-button>
            </div>
            <div class="table">
              <el-table
                :data="extras"
                ref="multipleTable"
                tooltip-effect="dark"
                border
                stripe 
                @selection-change="handleExtraSelectionChange"
              >
                <el-table-column type="selection" width="45" align="center"></el-table-column>
                <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
                <el-table-column label="名称" align="center">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.name"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="价格">
                  <template slot-scope="scope">
                    <el-input type="number" v-model="scope.row.price"  step="0.01" :min="0"></el-input>
                  </template>
                </el-table-column>  
                <el-table-column label="备注">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.remark"></el-input>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>


          <div class="button"  style="margin-top: 20px;" >
              <el-button
                type="primary" 
                @click.prevent="addRow()"
              >{{uuid?'添加规格':'添加规格'}}</el-button>
              <!-- <el-button type="primary" @click.prevent="addRow()">{{id?'禁用按钮':'添加规格'}}</el-button> -->
              <el-button type="danger" @click.prevent="batchDelete()">删除规格</el-button>
            </div>
          <div class="table">
            <el-table
              :data="tableData"
              ref="multipleTable"
              tooltip-effect="dark"
              border
              stripe
              style="width:900px"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="45" align="center"></el-table-column>
              <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
              <el-table-column label="名称" align="center">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.name"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="价格">
                <template slot-scope="scope">
                  <el-input type="number" @blur="priceChanged(scope)" 
                  v-model="scope.row.price"  step="0.01" :min="0"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="积分单价">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.coin" ></el-input>
                </template>
              </el-table-column>
              <el-table-column label="商品数量">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.number"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="商品规格">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.content"></el-input>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
       
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="baseImage+dialogImageUrl" alt />
      </el-dialog>
      <div style="display: flex">
        <tinymce v-model="addProductsForm.content"  style="width: 450px;" />
      </div>
      <!-- <el-form-item label="商品说明" prop="content" style="margin-top:10px">
        <el-input v-model="addProductsForm.content" type="textarea" :rows="5" placeholder="请输入商品说明"></el-input>
      </el-form-item>-->
      <div class="btn">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm">{{uuid?'修改':'发布'}}</el-button>
      
      </div>
    </el-form>
  </div>
</template>

<script>
import {
  viewProducts,
  addProducts,
  viewProductsClass,
  viewProductsSpecs,
  addProductSpecs,
  alterProduct
} from "@/api/product";
import {  getCategory } from "@/api/category";
import { getToken } from "@/utils/auth";
import tinymce from "@/components/Tinymce";
import { getTagsApi } from "@/api/tags";
export default {
  name: "alter-gifts",
  data() {
    return { 
      cardtype:0,//默认是电子卡
      uuid:   "",  
      newtag:"",
      newtags:[],
      options:[],
      history_tags:[],
      categoriesList:[],//类别
      baseImage:process.env.VUE_APP_BASE_IMAGE +"/images/",
      isbook:false,//是否为预约商品
      ready:false,// 立即上架
      recommend:false,//是否设为推荐商品
      shopcard:false,//表示是否为购物卡
      tableData: [
        {
          // rowNum: "",
          price: null,
          coin: null,
          name: null,
          content: null,
          number: null, 
        }
      ],
      multipleSelection: [], 
      selectlistRow: [], 
      giftList: [],
      giftsClassList: [],
      giftsSpecsList: [],
      dialogImageUrl: "",
      dialogVisible: false,
      dialogShow1: false,
      addProductsForm: {
        category: null,
        title: null,
        picture: null,
        turns: null,
        content: null,
        lighlight:""
      },
      formfileData:null,
      inputVisible:false,
      rules: {
        spec_number: [
          {
            pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
            message: "请输入数字",
            trigger: "change"
          }
        ]
      },
      preMainPic:"",
      priVideoPath:"",  
      headers: {
        Authorization: `JWT ${getToken()}`
      },
      category:"",
      producttype:10,//其他
      extras: [
        { 
          price: null,  
          name: null, 
          remark: null,
        },
      ],
      multipleExtraSelection:[]
    };
  },
  components: {
    tinymce
  },
  name: "extra-audit",
  //判断能否添加规格 
  created(){
    if(this.$route.query.producttype){
      this.producttype = this.$route.query.producttype
    }
    this.getCategoryList()
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
    handleAvatarSuccessMainVideo(file){
      this.priVideoPath = URL.createObjectURL(file.raw);
      console.log(this.priVideoPath)
    },
    handleAvatarSuccessMainPic(file){
      this.preMainPic = URL.createObjectURL(file.raw);
    },
    HandleVideo(param){  
      this.formfileData.append("videopath", param.file) 
    },
    HandleMainImg(param){ 
      console.log(param.file) 
      this.formfileData.append("mainpic", param.file) 
    },
   
    getTags(){
      let label = "product"
      if (this.producttype==1){
        label = "ticket"
      }
      let param = {
        label: label
      }
      getTagsApi(param).then(({data:{status, msg}})=>{ 
         this.history_tags = msg
      })
    },
    addExtraRow(){
      var list = { 
        name: null,
        price: null,  
        remark: null
      };
      this.extras.push(list);
    },
    //添加行
    addRow() {
      var list = {
        //rowNum: "",
        name: null,
        price: null,
        coin: null,
        number: null,
        content: null
      };
      this.tableData.push(list);
    },
    priceChanged(row){ 
      if (this.tableData[row.$index].price <= 0)
      {
        this.tableData[row.$index].price = -this.tableData[row.$index].price
      }
    },
    batchExtraDelete() {
      let multData = this.multipleExtraSelection;
      let tableData = this.extras;
      let multDataLen = multData.length;
      let tableDataLen = tableData.length;
      for (let i = 0; i < multDataLen; i++) {
        for (let y = 0; y < tableDataLen; y++) {
          if (JSON.stringify(tableData[y]) == JSON.stringify(multData[i])) {
            //判断是否相等，相等就删除
            this.extras.splice(y, 1);
          }
        }
      }
    },
    // 删除方法
    // 删除选中行
    batchDelete() {
      let multData = this.multipleSelection;
      let tableData = this.tableData;
      let multDataLen = multData.length;
      let tableDataLen = tableData.length;
      for (let i = 0; i < multDataLen; i++) {
        for (let y = 0; y < tableDataLen; y++) {
          if (JSON.stringify(tableData[y]) == JSON.stringify(multData[i])) {
            //判断是否相等，相等就删除
            this.tableData.splice(y, 1);
          }
        }
      }
    },
    handleExtraSelectionChange(val) {
      this.multipleExtraSelection = val;
    }, 

    handleSelectionChange(val) {
      this.multipleSelection = val;
    }, 
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    submitFileForm(){
      this.$refs.upload.submit()
      this.$refs.uploadvideo.submit() 
    },
    getEditData(){
      // 数据格式化 
      this.formfileData.append("producttype", this.producttype)//民宿以外的商品
      this.formfileData.append("specifications", JSON.stringify( this.tableData))
      this.formfileData.append("title", this.addProductsForm.title)
      let content = this.addProductsForm.content.replace(/(alt=.*\/>)/g, 'width="100%" />')
      this.formfileData.append("content", content) 
      this.formfileData.append("lighlight", this.addProductsForm.lighlight)

       
      let tags = ""
      if (this.newtags.length > 0){
        this.newtags.forEach((e)=>{
          tags += e +","
        })
      }
 
      this.formfileData.append("tags", tags)
      
      if (this.shopcard == true){ 
        this.formfileData.append("gifttype", 1) 
        this.formfileData.append("cardtype", this.cardtype)
      }
      else{ 
        this.formfileData.append("gifttype", 0) 
      } 
 
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

      if(this.extras.length > 0){
        this.formfileData.append("extras", JSON.stringify( this.extras))
      } 
   
    },

    getviewProducts() { 
      viewProducts({
        uuid: this.uuid
      } ).then((res) => {
        if (res.data.status == 0){
          this.addProductsForm = res.data.msg
          console.log(res.data.msg) 
          this.category = res.data.msg.categoryid;
          this.isbook = res.data.msg.isbook == 0 ? false:true;
          this.shopcard = res.data.msg.gifttype == 0 ? false:true;
          this.ready = res.data.msg.ready == 0 ? false:true;
          this.recommend = res.data.msg.recommend == 0 ? false:true; 

          if(this.addProductsForm.extras){
            this.extras = this.addProductsForm.extras; 
          }
          this.tableData = this.addProductsForm.specifications
          this.preMainPic = this.baseImage + this.addProductsForm.picture
          if ( this.addProductsForm.videopath){
            this.priVideoPath = this.baseImage + this.addProductsForm.videopath 
          }
          
        }
        else{
          this.$notify({
              type:"error",
              title:"获取失败",
              message:res.data.msg,
              duration:0
            }
          )
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
    //添加商品，修改商品
    submitForm() {
      this.submitFileForm()
      this.getEditData()
      let product = {};
       
      if (this.uuid) {
        this.formfileData.append("method", "put") 
        this.formfileData.append("uuid", this.uuid) 
         
        alterProduct(this.formfileData).then(({ data }) => {
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
      } else {  
         
        addProducts(this.formfileData).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.addProductsForm = {}; 
            this.addProductsForm.content = "";
            this.tableData = [];
            this.$router.push({
              name:"product-manage"
            })
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
    getCategoryList(){
      //获取商品的类别
      let categorytypes = "1,10" 
      
      getCategory({pc:"", categorytypes:categorytypes}).then(({data})=>{ 
         if(data.status == 0){
           this.categoriesList = data.msg
           let children = []
           for(var i = 0; i < data.msg.length;i ++){
             children = []
             if (data.msg[i].sub.length > 0){
               for(var j = 0; j < data.msg[i].sub.length;j ++){
                 children.push({
                   value: data.msg[i].sub[j].id,
                   label: data.msg[i].sub[j].name,
                 })
               }
             }
             this.options.push(
               {
                 value: data.msg[i].id,
                 label: data.msg[i].name,
                 children:children
               }
             )
           }
         }
         else{
           this.$notify(
             {
               type:"error",
               title:"获取商品类别失败",
               message:data.msg,
               duration:0 
             }
           )
         }
      })
    }
  },
  mounted() {
    if (this.$route.query.uuid) {
      this.uuid = this.$route.query.uuid; 
      this.getviewProducts();
    } 
    else{

    }  
    this.getProductsClass(); 
    this.getTags()
  }
};
</script>
<style lang='scss'   >
.cardtype{
  margin-top:10px;
}
.btn {
  text-align: right;
  margin-top: 50px;
}
.book{
  margin-top:5px;
  margin-left:15px;
}
.upload-demo { 
  .el-upload-dragger {
    width: 190px !important;
    height: 190px !important;
    margin-right:15px;
    .el-icon-upload {
      font-size: 40px;
      margin-top: 20px;
    } 
  }
} 
  
</style>