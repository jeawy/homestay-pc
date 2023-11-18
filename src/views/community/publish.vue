<template>
  <!-- 阿姨添加和修改 -->
  <main class="product-detail">
    <el-button @click="goBack" icon="el-icon-arrow-left" size="mini">
    </el-button>
    <article class="detail-wrap">
      <div class="detail-items">
        <section class="detail-item">
          <label class="item-label">头像</label>
          <div class="item-content">
            <el-avatar :size="40" :src="baseUrl + detailData.thumbnail_portait">
              <el-image :src="require('@/assets/img/dft.png')"></el-image>
            </el-avatar>
          </div>
        </section>
        <section
          class="detail-item"
          v-for="([key, value], index) of Object.entries(dictTransform)"
          :key="index"
        >
          <label class="item-label">{{ value }}</label>
          <div class="item-content">
            {{ detailData[key] }}
          </div>
        </section>
      </div>
      <div class="phone-wrap">
        <label class="item-label">详情</label>
        <div class="item-content" v-html="detailData.detail" />
      </div>
    </article>
  </main>
</template>

<script>
import { queryProductDetail } from "@/api/product";
export default {
  name: "edit-product",
  data() {
    return {
      detailData: {
        detail: "",
      },
      dictTransform: {
        username: "阿姨名字",
        sex: "性别",
        languages: "语言",
        workyears: "工作年限",
        tools: "是否自带工具",
        category: "类型",
        description: "描述",
      },
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
    };
  },
  created() {
    this.queryDetail();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    // 根据ID查询详情（修改前）
    queryDetail() {
      queryProductDetail({
        productid: this.$route.query.id,
      }).then(({ data: { status, msg } }) => {
        if (status === 0) {
          this.detailData = {
            ...msg,
            languages: msg.languages.join(),
            tools: ["自带", "雇主提供"][msg.tools],
          };
        }
      });
    },
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
<style lang="scss">
.product-detail {
  .detail-wrap {
    display: flex;
    justify-content: space-between;
    .detail-items{
      flex: 1 1 auto;
    }
    .detail-item {
      display: flex;
      padding: 16px;
      
      border-radius: 2px;
      &:nth-of-type(2n) {
        background-color: #ececec;
      }
      .item-label {
        width: 100px;
        font-weight: 600;
      }
    }

    .phone-wrap {
      flex: 0 0 320px;
      .item-content {
        background: url("~@/assets/img/phone.png") no-repeat;
        background-size: contain;
        background-position: top;
        padding: 46px 50px 30px;
        min-height: 580px;
        font-size: 12px;
      }
    }
  }
}
</style>
