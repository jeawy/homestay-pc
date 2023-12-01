<template>
  <div>
    <el-row type="flex" justify="space-between">
      <el-form inline>
         <el-form-item label="商品类别">
          <el-select filterable v-model="queryForm.category" style="width: 90px">
            <el-option
              v-for="item of categories"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item> 
        <el-form-item label="商品标题">
          <el-input v-model="queryForm.title"  > </el-input>
        </el-form-item> 
        <el-form-item >
           <el-radio-group v-model="queryForm.selling">
            <el-radio   label="1" >出售中</el-radio>
            <el-radio   label="0" >未上架</el-radio>
          </el-radio-group>
           </el-form-item> 
        <el-form-item >
        <el-checkbox v-model="queryForm.recommend">推荐商品</el-checkbox> 
        </el-form-item> 
        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleQueryList">
              查询
            </el-button>
            <el-button type="primary" plain @click="resetParams()">
              重置
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
      <el-form inline>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
              发布商品
            </el-button>
            
          </el-button-group>
        </el-form-item>
      </el-form>
    </el-row>

    <el-table 
      :data="giftList"
      border
      :stripe="true"
      :header-cell-style="{
        'font-size': '12px',
        background: '#eef1f6',
        color: '#606266',
      }"
      highlight-current-row
      row-class-name="hover" 
    >
        
      <el-table-column width="160"    label="商品">
        <template slot-scope="{ row }">
          <div class="name-wrap" style=" text-align:center"> 
            <el-image
                  class="mini-image"
                  :src="row.picture?baseImage+row.picture:''"
                  fit="contain"
                  style=" width: 90px; height: 90px;"
                > 
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture" style="color:#909399"></i>
                  </div>
                </el-image> 
                <br/>
            {{ row.title }}
            <span class="name-wrap" v-if="row.gifttype == 1"> 
            【{{ row.cardtype==1?"电子卡":"实物卡" }}】
          </span>
          </div>
        </template>
      </el-table-column>   
       <el-table-column width="80"  label="商品状态" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap" v-if="row.ready == 0"> 
             未上架
          </div>
          <div class="name-wrap" v-else> 
             已上架
          </div>
        </template>
      </el-table-column> 
      <el-table-column width="80"  label="商品类别" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.category }}
          </div>
        </template>
      </el-table-column> 
      <el-table-column width="80"  label="销售方式" align="center">
        <template slot-scope="{ row }">
          <div class="name-wrap"> 
            {{ row.isbook|booktype }}
          </div>
        </template>
      </el-table-column> 
      
      <el-table-column prop="creator_info.username" width="80"  label="发布人" /> 
      <el-table-column prop="status"  label="规格" >
        <template slot-scope="{ row }"> 
          <div class="name-wrap">  
            <el-table 
              :data="row.specifications"
              border>
              <el-table-column prop="name"  label="规格" />
              <el-table-column prop="price"  label="价格" />
              <el-table-column prop="number"  label="库存" />
              <el-table-column prop="coin"  label="积分" />
            </el-table>
          </div>
          </template>
      </el-table-column>

      
      <el-table-column width="180" align="center" label="操作">
        <template slot-scope="{ row }">
          <el-tooltip effect="dark" content="详情" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-tickets"
              type="primary"
              @click="targetDetail(row.uuid)"
            />
          </el-tooltip>
          <el-tooltip effect="dark" content="修改" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-edit"
              type="primary"
              @click="modify(row.uuid)"
            />
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-delete"
              type="danger"
              @click="delProduct(row )"
            />
          </el-tooltip>
          <br/>
          
            <el-link
            v-if="row.recommend == 0"
              :underline="false" 
              type="success"
              @click="recommendProduct(row , true)"
            >推荐商品</el-link>
            <el-link
            v-else
              :underline="false" 
              type="success"
              @click="recommendProduct(row , false)"
            >取消推荐</el-link>
        
            <el-link
            v-if="row.ready == 0"
              :underline="false" 
              type="success"
              @click="readyProduct(row, true )"
            >上架商品</el-link>
             <el-link
              v-else
              :underline="false" 
              type="danger"
              @click="readyProduct(row, false )"
            >下架商品</el-link>
         
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[50, 150, 200, 300]"
          :page-size="paginationsize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
    </el-pagination>
    
  </div> 
</template>

<script>
import {
  viewProducts, 
  viewProductsClass, 
  deleteProduct
} from "@/api/product"; 
import {  getCategory } from "@/api/category";
export default {
  data() {
    return {
      baseImage:process.env.VUE_APP_BASE_IMAGE +"/images/",
      giftList: [],
      giftsClassList: [],
      dialogShow2: false,
      paginationsize:50,
      SRC: "", 
      total:100,
      queryForm:{
        selling:"1",
        producttype:1,
      },
      categories:[],
      currentPage: 1,
       pageSize: 20,
       pageSizeList: [10, 20, 50, 100],
       
    };
  },
  filters:{
    booktype(isbook){
      if(isbook == 0){
        return "现货"
      }
      else{
        return "预售"
      }
    }
  },
  methods: {
    resetParams(){
      this.queryForm={
        selling:"1",
        producttype:1, // 只查询民宿以外产品
      }
      this.currentPage = 1
      this.handleQueryList()
    },
    getCategories(){
      getCategory({pc:""}).then(({data})=>{
        
          if(data.status == 0){
              this.categories = data.msg
              console.log(data.msg)
          }else{
              return false;
          }
      })
    }, 
    handleQueryList(){ 
      console.log(1111)
       this.currentPage = 1
       this.getviewProducts()
    },
    targetDetail(uuid) {
      this.$router.push({
        name: "commodity-detail",
        query: {
          uuid
        }
      });
    },
    handleAdd(){
      this.$router.push({
        name:"add-gifts",
         
      }) 
    },
    modify(uuid){ 
      this.$router.push({
        name:"add-gifts",
        query:{
          uuid:uuid
        }
      })
    },
    getviewProducts() {
      this.isLoading = true; 
      if (this.queryForm.selling  == 1) {
        this.queryForm.selling_prodcut = 1;
      } else {
        this.queryForm.selling_prodcut  = 0;
      } 
      if (this.queryForm.recommend) {
        this.queryForm.recommend_prodcut  = 1;
      } else {
        this.queryForm.recommend_prodcut  = 0;
      }

      if (this.queryForm.leftcount) {
        this.queryForm.leftcount_prodcut  = 1;
      } else {
        this.queryForm.leftcount_prodcut  = 0;
      }

      viewProducts({...this.queryForm,
      page:this.currentPage, pagenum:this.paginationsize}).then(({ data }) => { 
        this.giftList = [...data.msg.list];
        this.total = this.giftList.total
      });
    },
    getProductsClass() {
      viewProductsClass().then(({ data }) => {
        this.giftsClassList = [...data.msg];
      });
    },
    readyProduct(item, ready=false) {
      let msg = "下架该商品，是否继续?"
      if (ready == true){
        msg = "上架该商品，是否继续?"
      } 
      this.$confirm(msg, "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteProduct({ method: "put", uuid: item.uuid, ready:ready?1:0 }).then(({ data }) => {
        
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getviewProducts();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
     recommendProduct(item, recommend=false) {
      let msg = "取消推荐该商品，是否继续?"
      if (recommend == true){
        msg = "推荐该商品，是否继续?"
      } 
      this.$confirm(msg, "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteProduct({ method: "put", uuid: item.uuid, recommend:recommend?1:0 }).then(({ data }) => {
        
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getviewProducts();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
    //删除
    delProduct(item) {
      this.$confirm("此操作将永久删除该商品，是否继续?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteProduct({ method: "delete", uuids: item.uuid }).then(({ data }) => {
          //console.log(data.msg);
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getviewProducts();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
    //监听上传图片成功，成功后赋值给form ，并且赋值给图片src显示图片
    handleSuccess(response, file, fileList) {
      if (response.status == 0) {
        this.SRC = this.$store.state.BASE_URL + response.msg;
        this.addProductsForm["picture"] = response.msg;
        // this.addProductsForm.image_id = response.id;
      } else {
        this.$message.error(response.msg);
      }
    },

     
     handleSizeChange(val) {
       this.pageSize = val;

     },
     handleCurrentChange(currentPage) {
       this.currentPage = currentPage;

    },
    // //解决索引旨在当前页排序的问题，增加函数自定义索引序号
     indexMethod(index) {
       return (this.currentPage - 1) * this.pageSize + index + 1;
     },
  }, 
  created() {
    if (this.$route.query.index){
      let index = parseInt(this.$route.query.index)
      if (index == 1){
        //出售中
        this.queryForm.selling = "1"
      }
      else if (index == 2){
        //未上架
        this.queryForm.selling = "0" 
      }
       else if (index == 3){
        //推荐商品
        this.queryForm.recommend = true 
      }
       else if (index == 4){
        //库存预警
        this.queryForm.leftcount = true 
      }
    }
    this.getviewProducts();
    this.getProductsClass();
    this.getCategories()
  }
};
</script>
<style lang='scss' scoped>
.el-card {
  position: relative;
  margin: 0 5px 30px 5px;
  width: 300px;
}
.box-card-header {
  position: relative;
  height: 162px;
  overflow: hidden;
  border:1px solid #dbdbdb;
}
.el-card__header {
  padding: 0px 0px;
}

p {
  font-size: 12px;
  color: #909399;
  margin: 10px 0 5px;
}
.subtitle {
  margin: 15px 0 5px;
}
.mini-image {
  cursor: pointer;
  overflow: hidden;
  opacity: 1;
}
.image-slot {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 56px;
  background: #dcdfe6;
}
.dropdow {
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 3;
}
</style>