<template>
  <div> 
      <div style="display: flex">
        <div class="title">{{ addProductsForm.title }}</div>
      </div>
      <div
        style="display: flex; flex-wrap: wrap; justify-content: space-between"
      >
        <div class="picitem" v-for="(item, index) in pics" :key="index">
          <div class="info">
            <div class="infoitem">
              <label>相册名称</label>
              <el-input class="albumname" v-model="item.name"></el-input>
            </div>
            <div class="infoitem">
              <label>排序</label>
              <el-input
                type="number"
                class="sort"
                v-model="item.sort"
              ></el-input>
            </div>
            <div class="infoitem infoitem-del">
              <el-tooltip effect="dark" content="删除" placement="top">
                <el-link
                  :underline="false"
                  icon="el-icon-delete"
                  type="danger"
                  @click="delAlbum(index)"
                />
              </el-tooltip>
              <el-tooltip effect="dark" content="保存相册" placement="top">
                <el-link
                  :underline="false"
                  icon="el-icon-sell"
                  type="danger"
                  @click="saveAlbum(index)"
                />
              </el-tooltip>
            </div>
          </div>

          <el-upload
            accept="turns/jpeg, turns/gif, turns/png"
            action=""
            :ref="'uploadfiles' + index"
            list-type="picture-card"
            :on-remove="handleRemove"
            :http-request="handlFileList"
            :limit="9"
            :multiple="true"
            :auto-upload="false"
            :file-list="item.pic"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </div>
        <div class="picitem picitem_blank" @click="addAlbum">
          <div>添加新相册</div>
          <i class="el-icon-plus"></i>
        </div>
      </div> 
    
    <BackToTop></BackToTop>
  </div>
</template>

<script>
import {
  viewProducts,
  addHomeStayProducts, 
  updateProductImg,
  getProductImg
} from "@/api/product";
import BackToTop from "@/components/BackToTop";

export default {
  name: "alter-gifts",
  data() {
    return {
      uuid: "",
      fileList: [],
      date: "",
      addProductsForm: {},
      baseImage: process.env.VUE_APP_BASE_IMAGE + "/images/",
      giftList: [],
      pricemode: 0,
      category: "",
      index:0,
      formfileData: null,
      pics: [
        {
          name: "客厅",
          imgs: [],
          sort: 1,
        },

        {
          name: "卧室",
          imgs: [],
          sort: 2,
        },
        {
          name: "卫生间",
          imgs: [],
          sort: 3,
        },
      ],
    };
  },
  components: {
    BackToTop,
  },
  name: "extra-audit",
  //判断能否添加规格
  created() {
    if (this.$route.query.uuid) {
      this.uuid = this.$route.query.uuid;
      this.getviewProducts();
      this.getImgs()
    } else {
    }
    this.formfileData = new FormData();

  },
  methods: {
    getImgs(){
      let params = {
        uuid:this.uuid
      }
      getProductImg(params).then(({
        data:{status, msg} 
      })=>{
        console.log(msg) 
        if (msg.length > 0){
          //赋值
          this.pics = msg
          for (let i = 0; i < this.pics.length; i++){
            let pic = []
            this.pics[i].imgs.forEach(element => {
              console.log(element) 
              pic.push({
                name:element.id,
                url:this.baseImage +  element.img}
                )
            });
            this.pics[i].pic = pic 
          }
        }
      })
    },
    saveAlbum(index){
      //保存相册
      this.index = 0
      this.formfileData = new FormData();
      let key = eval("this.$refs.uploadfiles" +index)[0];
      console.log(key) 
      key.submit()
      
      
      let album = this.pics[index] 
      console.log(album)
      if (album.id){
        this.formfileData.append("imgid", album.id)
        this.formfileData.append("method", "put")
      }
      this.formfileData.append("sort", album.sort)
      this.formfileData.append("name", album.name)
      this.formfileData.append("productuuid", this.uuid)
     
      updateProductImg(this.formfileData).then(({data:{status, msg}})=>{
        console.log(msg)
        if (status == 0){
          this.formfileData = new FormData()
          this.$notify({
            type: "success",
            title: "已保存",
            message: "相册已保存"
          });
        }
        else{
          this.$notify({
            type: "error",
            title: "保存失败",
            message: msg,
            duration: 0,
          });
        }
      }) 
    },
    addAlbum() {
      this.pics.push({
        name: "",
        imgs: [],
        sort: "3",
      });
    },
    delAlbum(index) {
      let album = this.pics[index]
      
      let dataform = new FormData()
      dataform.append("typeid", album.id)
      dataform.append("method", "delete")
      updateProductImg(dataform).then(({data:{status, msg}})=>{
        console.log(msg)
        if (status == 0){ 
          this.$notify({
            type: "success",
            title: "删除成功",
            message: msg
          });
          this.pics.splice(index, 1);
        }
        else{
          this.$notify({
            type: "error",
            title: "删除失败",
            message: msg,
            duration: 0,
          });
        }
      }) 
    },
    submitFileForm() {
      this.$refs.uploadfiles.submit();
    },
    handlFileList(param) {
      //有几个文件会被执行几次
      console.log(this.index)
      console.log(param);
      this.formfileData.append("img"+this.index, param.file)
      this.index += 1
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
      let dataform = new FormData()
      dataform.append("imgid", file.name)
      dataform.append("method", "delete")
      updateProductImg(dataform).then(({data:{status, msg}})=>{
        console.log(msg)
        if (status == 0){ 
          this.$notify({
            type: "success",
            title: "删除成功",
            message: msg
          });
        }
        else{
          this.$notify({
            type: "error",
            title: "删除失败",
            message: msg,
            duration: 0,
          });
        }
      }) 
    },
    getviewProducts() {
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
          this.pricemode = 0;
          this.SRC = this.addProductsForm.picture;
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
    //添加民宿，修改民宿
    submitForm(addProductsForm) {
      let product = {};
      this.submitFileForm();

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
        this.formfileData.append("method", "put");
        this.formfileData.append("uuid", this.uuid);

        addHomeStayProducts(this.formfileData).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.addProductsForm = {};
            this.SRC = "";
            this.addProductsForm.content = "";

            this.getviewProducts();
          } else {
            this.$message.error(data.msg);
          }
        });
      } else {
        if (product.turns == null) {
          delete product.turns;
        }
        addHomeStayProducts(this.formfileData).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.addProductsForm = {};
            this.SRC = "";
            this.addProductsForm.content = "";
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
      this.$router.push({
        name: "product-rooms",
      });
    },
  },
};
</script>
<style lang='scss'  scoped  >
.title {
  font-weight: 700;
  width: 100%;
  border-bottom: 5px solid #d81e06;
  margin-bottom: 10px;
}
.infoitem-del {
  margin-left: 10px;
  position: relative; 
  top: 5px;
}

.info {
  display: flex;
  margin-bottom: 5px;
}
.picitem {
  width: 325px;
  border: 1px solid #bfbfbf;
  padding: 5px;
  margin-bottom: 10px;
}
.btn {
  text-align: right;
  margin-top: 50px;
}

.sort {
  width: 60px;
}
.albumname {
  width: 100px;
  margin-right: 10px;
}

.picitem_blank {
  background-color: #cdcdcd;
  text-align: center;
  color: #d81e06;
  font-weight: 700;
  padding-top: 70px;
  min-height: 200px;
}
</style>