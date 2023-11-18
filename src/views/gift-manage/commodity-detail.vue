<template>
  <div class="commodity-detail">
    <div class="commodity-detail__info">
      <div class="carousel-wrap">
        <el-carousel indicator-position="outside">
          <el-carousel-item
            v-for="(imgItem, index) in responseData.turns"
            :key="index"
          >
            <el-image
              :src="imageURL + imgItem"
              fit="fit"
              class="spreadimage"
            ></el-image>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <div class="detail__content">
      <div class="detail__content__top">
        <div class="commodity-title">
          {{ responseData.title }}
        </div>

        <div class="commodity-item">
          <div class="commodity-item__label">说明：</div>
          {{ responseData.recommend }}
        </div>
        <div class="commodity-item">
          <div class="commodity-item__label">类别：</div>
          {{ responseData.category }}
        </div>
        <div class="commodity-item">
          <div class="commodity-item__label">规格：</div>
          <el-table
            :data="responseData.specifications"
            class="commodity-item__cont"
            border
          >
            <el-table-column prop="name" label="规格" />
            <el-table-column prop="price" label="价格" />
            <el-table-column prop="number" label="库存" />
            <el-table-column prop="coin" label="积分" />
          </el-table>
        </div>
        <div class="commodity-item">
          <div class="commodity-item__label">销售方式：</div>
          <div class="commodity-item__cont">
            {{ responseData.isbook | booktype }}
          </div>
        </div>
      </div>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="详情" name="first">
          <div class="commodity-content" v-html="responseData.content" />
        </el-tab-pane>
        <el-tab-pane label="订单" name="second">订单</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
/* 

isbook  是否为预约商品

*/
import { queryDetail } from "@/api/gift";
export default {
  name: "CommodityDetail",
  data() {
    return {
      uuid: "",
      detailLoading: false,
      responseData: { turns: [], content: "" },
      imageURL: process.env.VUE_APP_BASE_IMAGE + "/",
      activeName: "first"
    };
  },
  filters: {
    booktype(isbook) {
      return ["现货", "预售"][isbook];
    }
  },
  watch: {
    $route: {
      handler(e) {
        this.queryDetail(e.query.uuid);
      },
      immediate: true
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    queryDetail(uuid = this.uuid) {
      this.uuid = uuid;
      this.detailLoading = true;
      queryDetail({
        uuid
      })
        .then(({ data: { status, msg } }) => {
          if (status !== 0) return;
          this.responseData = msg;
        })
        .finally(() => {
          this.detailLoading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.commodity-detail {
  display: flex;
  min-height: calc(100vh - 84px);
  .commodity-detail__info {
    width: 360px;
    /* 轮播 */
    .carousel-wrap {
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
      border-radius: 6px;
      overflow: hidden;
      &::after {
        display: block;
        content: " ";
        padding-bottom: 100%;
      }
      .el-carousel {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        ::v-deep .el-carousel__container {
          height: 100% !important;
        }
        ::v-deep .el-carousel__indicators--outside {
          bottom: 0;
          position: absolute;
          width: 100%;
          left: 0;
        }
      }

      .spreadimage {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  .detail__content {
    flex: 1 1 auto;
    margin-left: 24px;
    .detail__content__top {
      min-height: 360px;
    }
    .commodity-content {
      ::v-deep img,
      div,
      p {
        max-width: 100% !important;
      }
    }
    .commodity-title {
      font-size: 18px;
      margin-bottom: 24px;
      font-weight: 700;
    }

    .specifications-table {
      width: 400px;
    }

    .commodity-item {
      margin-bottom: 18px;
      display: flex;
      .commodity-item__label {
        color: #909399;
        width: 80px;
      }
      .commodity-item__cont {
        flex: 0 1 400px;
        color: #000;
      }
    }
  }
}
</style>
