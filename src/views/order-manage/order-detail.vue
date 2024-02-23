<template>
  <div class="order-detail">
    <el-button @click="goBack" icon="el-icon-arrow-left" size="mini">
    </el-button>

    <article class="detail-wrap">
      <div class="phone-wrap">
        <div class="item-content" v-loading="detailLoading">
          <div class="scroll-wrap">
            <div class="detail-address" v-if="responseData.delivery_way ==0">
              <i class="el-icon-map-location"></i>
              <div class="address__content">
                {{ responseData.receiver }} {{ responseData.receiver_phone }}
                <div class="address__text">
                  {{ responseData.receiver_address }}
                </div>
              </div>
            </div>
             <div class="detail-address" v-else>
              <i class="el-icon-map-location"></i>
              <div class="address__content">
                买家自提 
              </div>
            </div>
            <div class="item-group">
              <div class="bill-num">
                订单号: {{ responseData.billno
                }}
                <div class="price">
                  {{ responseData.status | statusFilter }}
                </div>
              </div>
              <div
                v-for="item of responseData.spec"
                class="product-item"
                :key="item.spec__gift__uuid"
              >
                <el-image
                  class="product-image"
                  :src="imageURL + item.picture"
                ></el-image>
                <div class="product-content">
                  <div>{{ item.title }}</div>

                  <div>
                    {{ item.name }}*{{ item.number }}
                    <div class="price">¥{{ item.money }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="item-group">
              <div class="detail-item">
                <span class="item__label">商品金额：</span>
                <div class="price">{{ responseData.money }}</div>
              </div>
              <div class="detail-item">
                <span class="item__label">支付方式：</span>
                <div>{{ ["支付宝", "微信"][responseData.payway] }}</div>
              </div>
              <div class="detail-item">
                <span class="item__label">备注：</span>
                <div>{{ responseData.remark }}</div>
              </div>
              <div class="detail-item" v-if="responseData.delivery_way ==0">
               
                <div>{{ responseData.express_number }}</div>
                <div>{{ responseData.express_company }}</div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <div class="detail-items">
        <el-form label-width="100px" 
           v-if="responseData.status == 2 && responseData.delivery_way ==0"
          ><el-form-item label="快递单号：">
            <el-input v-model="deliveryForm.express_number" placeholder="快递号" ></el-input>
          </el-form-item>
          <el-form-item label="快递公司：">
             <el-input v-model="deliveryForm.express_company" placeholder="快递公司" ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
            @click="delivery"
            >
              发货
            </el-button>
          </el-form-item>
        </el-form>
        <el-form label-width="100px" 
           v-if="responseData.status == 2 && responseData.delivery_way ==1"
          >
          <el-form-item>
            <el-button type="primary"
            @click="delivery(1)"
            >
              标记为已提货
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </article>
  </div>
</template>
<script>
import { getBillsApi,postBillsApi, getBills  } from "@/api/order";
export default {
  data() {
    return {
      deliveryForm:{},
      orderTimeLine :[],
      billuuid: "",
      detailLoading: false,
      responseData: { spec: [] },
      imageURL: process.env.VUE_APP_BASE_IMAGE + "/images/"
    };
  },
  filters: {
    statusFilter(status) {
      let statustxt = "未支付";
      if (status == 2) {
        statustxt = "已支付";
      }else if (status == 3) {
        statustxt = "已发货";
      } else if (status == 4) {
        statustxt = "已签收";
      }
      return statustxt;
    },
  },
  mounted() {},
  watch: {
    $route: {
      handler(e) {
        this.queryDetail(e.query.uuid);
      },
      immediate: true
    }
  },
  methods: {
    getDelivery(){
				getBills({ billuuid: this.billuuid }).then(({data})=>{
					 
					if(data.status ==0){
						this.orderTimeLine = data.msg;
						console.log(this.orderTimeLine)
					}
					else{
						this.$notify({
							type:"error",
							title:data.msg
						})
					}
					
				}).finally((res)=>{
					this.loading = false
				})
			},
    delivery(status = 0){
      let msg = "确认发货?" 
      if (status == 1){
        msg =  "确认买家已提货？"
      }
      this.$confirm(msg, "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.deliveryForm.billuuid = this.billuuid
        this.deliveryForm.status = 4
        postBillsApi(this.deliveryForm).then(({ data })=>{
          if(data.status == 0 ){
            this.$notify({
              title:data.msg,
              type:"success"
            })
            this.queryDetail()
          }
        })
      }); 
    },
    goBack() {
      this.$router.go(-1);
    },
    queryDetail(billuuid = this.billuuid) {
      this.billuuid = billuuid;
      this.detailLoading = true;
      getBillsApi({
        billuuid
      })
        .then(({ data: { status, msg } }) => {
          if (status !== 0) return;
          this.responseData = msg;
          console.log(this.responseData)
          this.getDelivery()
        })
        .finally(() => {
          this.detailLoading = false;
        });
    },
  }
};
</script>
<style lang="scss" scoped>
$border--base: 1px solid #efefef;
.order-detail {
  .detail-wrap {
    display: flex;
    justify-content: space-between;
    padding-top: 16px;
    gap: 0 32px;

    .detail-items {
      flex: 1 1 auto;
      position: relative;
      &::before {
        content: " ";
        width: 1px;
        height: 100%;
        background-color: #efefef;
        position: absolute;
        top: 0;
        left: -16px;
      }
    }
    .phone-wrap {
      flex: 0 0 340px;
      .item-content {
        background: url("~@/assets/img/phone.png") rgb(248, 248, 248) no-repeat;
        background-size: contain;
        background-position: top;
        padding: 50px 23px 34px;
        border-radius: 54px;
        height: 680px;
        font-size: 12px;
        .scroll-wrap {
          overflow-y: auto;
          height: 100%;

          .detail-address {
            border-bottom: 1px solid #ff8000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 0 16px 8px;
            .el-icon-map-location {
              font-weight: 600;
              font-size: 14px;
            }
            .address__content {
              margin-left: 16px;
              .address__text {
                color: #909399;
                font-size: 12px;
                margin-top: 4px;
                left: 1.4;
              }
            }
          }
          .item-group {
            background-color: #fff;
            $item-padding: 12px 16px;
            & + .item-group {
              margin-top: 8px;
            }
            .bill-num {
              border-bottom: $border--base;
              padding: $item-padding;
              display: flex;
              justify-content: space-between;
            }
            .product-item {
              padding: $item-padding;
              display: flex;

              & + .product-item {
                border-top: $border--base;
              }
              .product-image {
                width: 80px;
                height: 80px;
                border-radius: 3px;
              }
              .product-content {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                margin-left: 8px;
              }
            }
            .price {
              color: #ed4014;
            }
            .detail-item {
              padding: $item-padding;
              position: relative;
              display: flex;
              justify-content: space-between;
              .item__label {
                color: #666;
              }
              & + .detail-item::before {
                width: calc(100% - 16px);
                content: " ";
                height: 1px;
                background-color: #efefef;
                position: absolute;
                top: 0;
                right: 0;
              }
            }
          }

          &::-webkit-scrollbar-track-piece {
            background: #efefef;
          }

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 16px;
          }
        }
      }
    }
  }
}
</style>
