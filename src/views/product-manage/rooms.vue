<template>
  <div>
     
      <el-form inline>
        <el-form-item label="民宿类别">
          <el-select
            filterable
            v-model="queryForm.category"
            style="width: 120px"
          >
          <el-option 
              label="全部"
              value="-1"
            />
            <el-option
              v-for="item of categories"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="民宿标题">
          <el-input v-model="queryForm.title"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="queryForm.selling">
            <el-radio label="1">已上架</el-radio>
            <el-radio label="0">未上架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="queryForm.recommend">推荐民宿</el-checkbox>
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
       
        <el-form-item>
          <el-button-group>
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
              发布民宿
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form> 
    <div class="rooms">
      <div class="item" v-for="(item, index) in homestayList" :key="index">
        <div class="imageholder">
          <el-image
            :src="baseImage + item.picture"
            fit="cover"
            :preview-src-list="[baseImage + item.picture]"
            class="pic"
          />
        </div>
        <div class="info">
          <div>{{ item.title }}</div>
          <div>{{ item.address }}</div>
        </div>
        <Calendar :productuuid="item.uuid"></Calendar>
        <div class="actions">
          <el-tooltip effect="dark" content="图片库" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-picture-outline"
              type="primary"
              @click="modify(item.uuid, true)"
            />
          </el-tooltip>
          <el-tooltip effect="dark" content="详情" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-tickets"
              type="primary"
              @click="targetDetail(item.uuid)"
            />
          </el-tooltip>
          <el-tooltip effect="dark" content="修改" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-edit"
              type="primary"
              @click="modify(item.uuid)"
            />
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="top">
            <el-link
              :underline="false"
              icon="el-icon-delete"
              type="danger"
              @click="delProduct(item)"
            />
          </el-tooltip>
          <el-link
            v-if="item.recommend == 0"
            :underline="false"
            type="success"
            @click="recommendProduct(item, true)"
            >推荐商品</el-link
          >
          <el-link
            v-else
            :underline="false"
            type="success"
            @click="recommendProduct(item, false)"
            >取消推荐</el-link
          >

          <el-link
            v-if="item.ready == 0"
            :underline="false"
            type="success"
            @click="readyProduct(item, true)"
            >上架商品</el-link
          >
          <el-link
            v-else
            :underline="false"
            type="danger"
            @click="readyProduct(item, false)"
            >下架商品</el-link
          >
        </div>
      </div>
    </div>
    <div class="vpage">
      <el-button-group>
        <el-button type="primary" @click="prepage" icon="el-icon-arrow-left"
          >上一页</el-button
        >
        <el-button type="primary" icon="el-icon-s-shop"
          >共{{ total }}个房屋</el-button
        >
        <el-button type="primary" icon="el-icon-notebook-2"
          >第{{ currentPage }}页</el-button
        >
        <el-button type="primary" @click="nextpage"
          >下一页<i class="el-icon-arrow-right el-icon--right"></i
        ></el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import { viewProducts, viewProductsClass, deleteProduct } from "@/api/product";
import { getCategory } from "@/api/category";
import Calendar from "@/components/Calendar";
export default {
  data() {
    return {
      baseImage: process.env.VUE_APP_BASE_IMAGE + "/images/",
      homestayList: [],
      giftsClassList: [],
      dialogShow2: false,
      paginationsize: 4,
      SRC: "",
      total: 0,
      queryForm: {
        selling: "1",
        producttype: 0, // 只查询民宿产品
      },
      categories: [],
      currentPage: 1,  
      loadMore:true
    };
  },
  components: {
    Calendar,
  },
  filters: {
    booktype(isbook) {
      if (isbook == 0) {
        return "现货";
      } else {
        return "预售";
      }
    },
  },
  methods: {
    nextpage() {
      if (this.loadMore ){
        this.currentPage += 1;
        this.getviewProducts(); 
      } 
    },
    prepage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
        this.getviewProducts();
      }
    },
    resetParams() {
      this.queryForm = {
        selling: "1",
        producttype: 0, // 只查询民宿产品
      };
      this.currentPage = 1;
      this.handleQueryList();
    },
    getCategories() {
      getCategory({ pc: "", categorytype:0 }).then(({ data }) => {
        if (data.status == 0) {
          console.log(data)
          this.categories = data.msg; 
        } else {
          return false;
        }
      });
    },
    handleQueryList() {
      this.currentPage = 1;
      this.getviewProducts();
    },
    targetDetail(uuid) {
      this.$router.push({
        name: "product-detail",
        query: {
          uuid,
        },
      });
    },
    handleAdd() {
      this.$router.push({
        name: "add-room",
      });
    },
    modify(uuid, pic=false) {
      if (pic){
        this.$router.push({
          name: "add-room-pic",
          query: {
            uuid: uuid,
          },
        });
      }
      else{
        this.$router.push({
          name: "add-room",
          query: {
            uuid: uuid,
          },
        }); 
      } 
    },
    getviewProducts() {
      this.isLoading = true;
      if (this.queryForm.selling == 1) {
        this.queryForm.selling_prodcut = 1;
      } else {
        this.queryForm.selling_prodcut = 0;
      }
      if (this.queryForm.unready) {
        this.queryForm.unready_prodcut = 1;
      } else {
        this.queryForm.unready_prodcut = 0;
      }

      if (this.queryForm.recommend) {
        this.queryForm.recommend_prodcut = 1;
      } else {
        this.queryForm.recommend_prodcut = 0;
      }

      if (this.queryForm.leftcount) {
        this.queryForm.leftcount_prodcut = 1;
      } else {
        this.queryForm.leftcount_prodcut = 0;
      }

      viewProducts({
        ...this.queryForm,
        page: this.currentPage,
        pagenum: this.paginationsize,
      }).then(({ data }) => {
        this.homestayList = [...data.msg.list];
        this.total = data.msg.total;
        if( this.homestayList.length < this.paginationsize){
          this.loadMore = false
        }
        else{
          this.loadMore = true
        }
      });
    },
    getProductsClass() {
      viewProductsClass().then(({ data }) => {
        this.giftsClassList = [...data.msg];
      });
    },
    readyProduct(item, ready = false) {
      let msg = "下架该民宿，是否继续?";
      if (ready == true) {
        msg = "上架该民宿，是否继续?";
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        deleteProduct({
          method: "put",
          uuid: item.uuid,
          ready: ready ? 1 : 0,
        }).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.getviewProducts();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
    recommendProduct(item, recommend = false) {
      let msg = "取消推荐该民宿，是否继续?";
      if (recommend == true) {
        msg = "推荐该民宿，是否继续?";
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        deleteProduct({
          method: "put",
          uuid: item.uuid,
          recommend: recommend ? 1 : 0,
        }).then(({ data }) => {
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
      this.$confirm("此操作将永久删除该民宿，是否继续?", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        deleteProduct({ method: "delete", uuids: item.uuid }).then(
          ({ data }) => {
            //console.log(data.msg);
            if (data.status === 0) {
              this.$message.success(data.msg);
              this.getviewProducts();
            } else {
              this.$message.error(data.msg);
            }
          }
        );
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
 
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
    },
    
  },
  created() {
    if (this.$route.query.index) {
      let index = parseInt(this.$route.query.index);
      if (index == 1) {
        //出售中
        this.queryForm.selling = "1";
      } else if (index == 2) {
        //未上架
        this.queryForm.selling = "0";
      } else if (index == 3) {
        //推荐民宿
        this.queryForm.recommend = true;
      } else if (index == 4) {
        //库存预警
        this.queryForm.leftcount = true;
      }
    }
    this.getviewProducts();
    this.getProductsClass();
    this.getCategories();
  },
};
</script>
<style lang='scss' scoped>
.el-card {
  position: relative;
  margin: 0 5px 30px 5px;
  width: 300px;
}
.rooms {
  display: flex;
  flex-wrap: wrap;
}
.item {
  flex: auto;
  max-width: 380px;
  border: 1px solid #bfbfbf;
  padding: 15px;
  
}
.imageholder {
  text-align: center;
}
.pic {
  width: 300px;
  height: 200px;
}
.actions {
  margin-top: 15px;
  text-align: center;
  display: flex;
  justify-content: space-between;
  width: 70%;
  margin-left: 15%;
}
.box-card-header {
  position: relative;
  height: 162px;
  overflow: hidden;
  border: 1px solid #dbdbdb;
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
.vpage{
  width: 100%;
  text-align: center;
  margin-top: 10px;
}
</style>