<template>
  <div id="deliveryInfo">
    <!-- 订单列表 -->

    <el-row type="flex" justify="space-between">
      <el-form inline>
        <el-form-item label="快递单号">
          <el-input v-model="queryForm.billno" style="width: 90px"> </el-input>
        </el-form-item>
        <el-form-item label="下单人姓名">
          <el-input v-model="queryForm.username" style="width: 90px">
          </el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select filterable v-model="queryForm.status" style="width: 90px">
            <el-option
              v-for="item of columnSelect"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单日期">
          <el-date-picker
            value-format="yyyy/MM/d"
            v-model="queryForm.daterange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-checkbox v-model="queryForm.coin">积分订单</el-checkbox>
        <el-checkbox v-model="queryForm.yue">余额支付</el-checkbox>
        <el-checkbox v-model="queryForm.cash">现金订单</el-checkbox>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="getOrders()">查询</el-button>
            <el-button type="primary" plain @click="resetQuery()"
              >重置</el-button
            >
          </el-button-group>
        </el-form-item>
      </el-form>
    </el-row>

    <el-table
      v-loading="isLoading"
      :data="orderList"
      :stripe="true"
      highlight-current-row
      row-class-name="hover"
    >
      >
      <el-table-column label="订单号" width="220">
        <template slot-scope="{ row }">
          {{ row.subject }}<br />
          <el-link type="success" @click="handleDetail(row.uuid)">{{
            row.billno
          }}</el-link>
        </template>
      </el-table-column>
      <el-table-column width="500" align="center" :formatter="moneyFomat">
        <template slot-scope="{ row }">
          <div class="name-wrap">
            <el-table :data="row.specs" border>
              <el-table-column prop="title" label="商品" />
              <el-table-column prop="name" label="规格" />
              <el-table-column prop="price" align="center" label="单价" />
              <el-table-column prop="number" align="center" label="购买数量" />
              <el-table-column prop="money" align="center" label="总额" />
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        width="100"
        align="center"
        prop="money"
        label="总金额"
        :formatter="moneyFomat"
      ></el-table-column>
      <el-table-column label="支付方式" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.ordertype == 0">积分</span>
          <span v-else>{{ row.payway | paywayFomat }} </span>
        </template>
      </el-table-column>
      <el-table-column prop="user" width="100" align="center" label="购买人">
        <template slot-scope="{ row }">
          {{ row.user__username }}<br />
          {{ row.user__phone }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="订单状态"
        :formatter="statusFomat"
      ></el-table-column>
      <el-table-column prop="express_number" label="快递">
        <template slot-scope="{ row }">
          <div v-if="row.delivery_way == 0">
          {{ row.express_number }}<br />
          {{ row.express_company }}
          </div>
          <div v-else>
            买家自提
          </div>
        </template>
      </el-table-column>

      <el-table-column
        width="180"
        prop="date"
        :formatter="dateForm"
        label="订单日期"
      ></el-table-column>
      <el-table-column width="80" align="center" fixed="right" label="操作">
        <template slot-scope="{ row }">
          <el-tooltip
            effect="dark"
            v-if="row.status == 2 && row.delivery_way ==0"
            content="发货"
            placement="top"
          >
            <el-link
              :underline="false"
              type="danger"
              @click="handleDetail(row.uuid)"
              >发货</el-link
            >
          </el-tooltip>
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
import { getBillsApi, deleteOrder } from "@/api/order";
import { setPaginationSize, getPaginationSize } from "@/utils/pagination";
import dayjs from "dayjs";
export default {
  data() {
    return {
      total: 0,
	  
      currentPage: 1,
      paginationsize: 50,
      queryForm: {
        status: 2,
      },
      isLoading: false,
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
      columnSelect: [
        {
          label: "待发货",
          value: 2,
        },
        {
          label: "已发货",
          value: 3,
        },
        {
          label: "已签收",
          value: 4,
        },
      ],
      paywaySelect: [
        {
          label: "支付宝",
          value: "0",
        },
        {
          label: "微信",
          value: "1",
        },
        {
          label: "余额支付",
          value: "2",
        },
      ],
      orderList: [],

      dialogShow: false, 
    };
  },
  filters: {
    paywayFomat(val) {
      if (val == 1) {
        return "微信";
      } else if (val == 2) {
        return "余额支付";
      } else if (val == 0) {
        return "支付宝";
      }
    },
  },
  created() {
    if (this.$route.query.status) {
      this.queryForm.status = parseInt(this.$route.query.status);
    }
    if (this.$route.query.ordertype) {
      let ordertype = parseInt(this.$route.query.ordertype);
      if (ordertype == 1) {
        this.queryForm.coin = true;
      } else if (ordertype == 2) {
        this.queryForm.yue = true;
      } else if (ordertype == 3) {
        this.queryForm.cash = true;
      }
    } 
    this.getOrders();
  },
  methods: {
    handleCurrentChange(e) {
      this.currentPage = e;
      this.getOrders(this.currentPage);
    },
    handleSizeChange(e) {
      // 切换条数
      setPaginationSize(e);
      this.paginationsize = e;
      this.getOrders(this.currentPage);
    },
    handleDetail(uuid) {
      this.$router.push({
        name: "order-detail",
        query: {
          uuid: uuid,
        },
      });
    },
    // 删除和批量删除
    async handleDelete(billnos) {
      await this.$confirm("确定删除?", {
        type: "warning",
      });
      if (Array.isArray(billnos)) {
        billnos = billnos.join();
      }
      deleteOrder({ method: "delete", billnos }).then(
        ({ data: { status, msg } }) => {
          if (status === 0) {
            this.$notify({
              type: "success",
              message: msg,
              title: "删除成功",
              duration: 2000,
            });
            this.getOrders();
          } else {
            this.$notify({
              type: "error",
              message: msg,
              title: "删除失败",
              duration: 0,
            });
          }
        }
      );
    },

    moneyFomat(row, col, val) {
      if (val == null) {
        return "";
      }
      return val.toLocaleString(undefined, "currency");
    },
    statusFomat(row, col, val) {
      const res = this.columnSelect.find((e) => e.value == val);
      return res ? res.label : null;
    },

    dateForm(row, col, val) {
      return dayjs(val * 1000).format("YYYY-MM-DD HH:ss");
    },
    getOrders() {
      this.isLoading = true;
      let daterange2 = "";
      if (this.queryForm.daterange) {
        daterange2 =
          this.queryForm.daterange[0] + "-" + this.queryForm.daterange[1];
        this.queryForm.daterange2 = daterange2;
      }

      if (this.queryForm.coin) {
        this.queryForm.coinbill = 1;
      } else {
        this.queryForm.coinbill = 0;
      }

      if (this.queryForm.yue) {
        this.queryForm.yuebill = 1;
      } else {
        this.queryForm.yuebill = 0;
      }

      if (this.queryForm.cash) {
        this.queryForm.cashbill = 1;
      } else {
        this.queryForm.cashbill = 0;
      }

      getBillsApi({ ...this.queryForm,
	     page:this.currentPage, pagenum:this.paginationsize})
        .then(({ data: { status, msg } }) => {
          if (status === 0) {
            this.orderList = msg.orders;
            this.total = msg.total;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    resetQuery() {
      this.queryForm = {};
      this.getOrders();
    },
  },
};
</script>
<style lang="scss">
#deliveryInfo {
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
}
</style>
