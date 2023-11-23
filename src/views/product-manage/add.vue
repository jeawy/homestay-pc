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
            action="prx/api/appfile/appfile/"
            :headers="headers"
            :on-success="handleSuccess"
            drag
            :show-file-list="false"
          >
            <el-image v-if="SRC" style="width: 100%; height: 100%" :src="baseImage+SRC">

            </el-image>
            <template v-else  >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                商品缩略图，或
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
            <el-form-item label="商品标题" prop="title">
              <el-input v-model="addProductsForm.title"></el-input>
            </el-form-item> 
             
            <el-checkbox v-model="isbook"  class="book">预约商品</el-checkbox> 
            <el-checkbox v-model="ready"  class="book">立即上架</el-checkbox> 
            <el-checkbox v-model="recommend"  class="book">设为推荐商品</el-checkbox>
            <el-checkbox v-model="shopcard"  class="book">购物卡</el-checkbox>
            <el-radio v-model="cardtype" class="cardtype" v-if="shopcard" :label="0">电子卡</el-radio>
            <el-radio v-model="cardtype"  class="cardtype" v-if="shopcard" :label="1">实物卡</el-radio>
            
          </div>
          <div class="button"  >
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
      <el-upload
        accept="turns/jpeg, turns/gif, turns/png"
        action="prx/api/appfile/appfile/"
        :headers="headers"
        ref="piclist"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess1"
         
        :limit="6"
        :file-list="fileList"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="baseImage+dialogImageUrl" alt />
      </el-dialog>

      <tinymce v-model="addProductsForm.content" />
      <!-- <el-form-item label="商品说明" prop="content" style="margin-top:10px">
        <el-input v-model="addProductsForm.content" type="textarea" :rows="5" placeholder="请输入商品说明"></el-input>
      </el-form-item>-->
      <div class="btn">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm('addProductsForm','tableData')">{{uuid?'修改':'发布'}}</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
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
export default {
  name: "alter-gifts",
  data() {
    return { 
      cardtype:0,//默认是电子卡
      uuid:   "", 
      fileList: [],
      options:[],
      categoriesList:[],//类别
      baseImage:process.env.VUE_APP_BASE_IMAGE +"/",
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
        content: null
      },
      rules: {
        spec_number: [
          {
            pattern: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
            message: "请输入数字",
            trigger: "change"
          }
        ]
      },
      SRC: "",
      SRC1: "",
      headers: {
        Authorization: `JWT ${getToken()}`
      },
      category:""
    };
  },
  components: {
    tinymce
  },
  name: "extra-audit",
  //判断能否添加规格 
  created(){
    this.getCategoryList()
  },
  methods: {
    nextStep(){
      //下一步
      this.$refs.piclist.submit()
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
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    handleRemove(file, fileList) {
      console.log(  fileList)
      console.log(file )
      this.fileList  = []
      for (var i = 0; i < fileList.length; i++){
          this.fileList.push({
            url:fileList[i].url
          })
      } 
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    getviewProducts() { 
      viewProducts({
        uuid: this.uuid
      } ).then((res) => {
        if (res.data.status == 0){
          this.addProductsForm = res.data.msg
          console.log(res.data.msg)
          this.fileList  = []
          for (var i = 0; i < res.data.msg.turns.length; i++){
             this.fileList.push({
               url:this.baseImage+res.data.msg.turns[i]
             })
          }  
          this.category = res.data.msg.categoryid;
          this.isbook = res.data.msg.isbook == 0 ? false:true;
          this.shopcard = res.data.msg.gifttype == 0 ? false:true;
          this.ready = res.data.msg.ready == 0 ? false:true;
          this.recommend = res.data.msg.recommend == 0 ? false:true;
          this.SRC = this.addProductsForm.picture
          this.tableData = this.addProductsForm.specifications
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
    //监听上传图片成功，成功后赋值给form ，并且赋值给图片src显示图片
    handleSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.SRC =   response.msg;
        this.addProductsForm["picture"] = response.msg; 
      } else {
        this.$message.error(response.msg);
      }
    },
    handleSuccess1(response, file, fileList) { 
      
      console.log(fileList)
      if (response.status == 0) {  
          this.fileList.push({
            url:this.baseImage+response.msg
          }) 
         console.log(this.fileList)
      } else {
        this.$message.error(response.msg);
      }
    },
    //添加商品，修改商品
    submitForm(addProductsForm, tableData) {
      let product = {};
        product = { 
          title: this.addProductsForm.title, 
          content: this.addProductsForm.content,
          picture: this.addProductsForm.picture, 
          specifications: JSON.stringify( this.tableData), 
       };
      if(this.category.length > 0){
        product.category = this.category[this.category.length -1]
      }
      if (this.isbook == true){
        product['isbook'] = 1
      }
      else{
        product['isbook'] = 0
      } 
      if (this.ready == true){
        product['ready'] = 1
      }
      else{
        product['ready'] = 0
      } 
      if (this.recommend == true){
        product['recommend'] = 1
      }
      else{
        product['recommend'] = 0
      } 
      if (this.shopcard == true){
        product['gifttype'] = 1
        product['cardtype'] = this.cardtype
      }
      else{
        product['gifttype'] = 0
      } 
      console.log(this.fileList)
      for (var i = 0; i <this.fileList.length; i++){
        console.log(this.fileList[i].url)
        if(i ==0){
          //

          product.turns = this.fileList[i].url.replace(this.baseImage, "")
        }
        else{
          product.turns += ","+this.fileList[i].url.replace(this.baseImage, "") 
        }
          
      } 
      console.log(product.turns)
     
      if (this.uuid) {
         product.method = "put"
         product.uuid = this.uuid
        if (product.turns == null) {
          delete product.turns;
        }
        if (product.title == null) {
          delete product.title;
        }
        if (product.category == null) {
          delete product.category;
        }
        if (product.content == "") {
          delete product.content;
        }
        if (product.picture == null) {
          delete product.picture;
        }

        alterProduct(product).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.addProductsForm = {};
            this.SRC = "";
            this.addProductsForm.content = "";
            this.tableData = [];
            this.getviewProducts();
          } else {
            this.$message.error(data.msg); 
          }
        });
      } else {  
        if (product.turns == null) {
          delete product.turns;
        }
        //delete product.specifications
        if (product.specifications == null || product.specifications.length === 0) {
          delete product.specifications;
        }
        addProducts(product).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.addProductsForm = {};
            this.SRC = "";
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
      this.SRC = "";
      this.addProductsForm.content = "";
      this.tableData = [];
    },
    getCategoryList(){
      //获取商品的类别
      getCategory().then(({data})=>{ 
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