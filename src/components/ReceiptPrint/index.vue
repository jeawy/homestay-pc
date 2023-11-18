<template>
  <div :class="{ 'print-wrap': !isDebug }">
    <div v-if="isReady" id="print-el" :style="{ width: width + 'px' }">
      <header class="text-center print-header">
        收费票据
      </header>

      <div class="receipt-info">
        <div class="receipt-info--item3">流水号：{{ row.paybillno }}</div>
        <div class="receipt-info--item3">凭证号：{{ row.billno }}</div>
        <div class="receipt-info--item3">
          收费时间：{{ row.date | dateTimeFormat }}
        </div>
      </div>
      <div class="receipt-info">
        <div class="receipt-info--item2">
          资源名称：{{ row.room__unit__building__name }}
          {{ row.room__unit__name }} {{ row.room__name }}
        </div>
        <div class="receipt-info--item2">
          客户名称：{{ row.user__username }}
        </div>
      </div>

      <table
        cellspacing="0"
        rules="all"
        border="1"
        cellpadding="0"
        class="receipt-table"
      >
        <tr>
          <th>
            <div class="table--cell">{{ row.feename }}</div>
          </th>
          <th>
            <div class="table--cell">XXXXXX</div>
          </th>
          <th><div class="table--cell">XXXXXX</div></th>
          <th><div class="table--cell">XXXXXX</div></th>
          <th><div class="table--cell">XXXXXX</div></th>
          <th><div class="table--cell">XXXXXX</div></th>
        </tr>
        <tr>
          <td>
            <div class="table--cell">{{ row.detail }}</div>
          </td>
          <td><div class="table--cell">XXXXXX</div></td>
          <td><div class="table--cell">XXXXXX</div></td>
          <td><div class="table--cell">XXXXXX</div></td>
          <td><div class="table--cell">XXXXXX</div></td>
          <td><div class="table--cell">XXXXXX</div></td>
        </tr>
        <tr>
          <td><div class="table--cell">XXXXXX</div></td>
          <td colspan="2"><div class="table--cell">XXXXXX</div></td>
          <td><div class="table--cell">XXXXXX</div></td>
          <td><div class="table--cell">XXXXXX</div></td>
          <td><div class="table--cell">XXXXXX</div></td>
        </tr>
      </table>

      备注：{{ row.remark }}
      <footer class="receipt-footer">
        <div>操作员：XXXXXX</div>
        <div>支付方式：{{ row.payway == 0 ? "支付宝" : "微信" }}</div>
        <div>交款人：{{ row.user__username }}</div>
        <div>收款人：XXXXXX</div>
        <div>财务审核：XXXXXX</div>
        <div>打印时间：{{ dayjs().format("YYYY-MM-DD HH:ss") }}</div>
      </footer>
    </div>
  </div>
</template>

<script>
import print from "print-js";
import dayjs from "dayjs";
import "print-js/dist/print.css";
export default {
  data() {
    return {
      row: {},
      isReady: false,
      dayjs,
      width: 1080,
      isDebug: false //   调试模式   true可以再页面显示打印的元素
    };
  },
  methods: {
    async onPrint(payload) {
      this.row = payload;
      this.isReady = true;
      await this.$nextTick();
      print({
        printable: "print-el",
        type: "html",
        targetStyles: ["*"],
        maxWidth: this.width
      });
    }
  }
};
</script>

<style lang="scss">
#print-el {
  .print-header {
    font-weight: 600;
    padding: 8px 0;
    margin-bottom: 16px;
    border-bottom: 1px solid #000;
  }
  .receipt-info {
    display: flex;
    justify-content: space-between;
    .receipt-info--item3 {
      flex: 1 1 auto;
    }
    .receipt-info--item2 {
      flex: 1 1 auto;
    }
  }
  .receipt-table {
    margin: 8px 0;
    width: 100%;
    text-align: center;
    .table--cell {
      padding: 4px 8px;
    }
  }
  .receipt-footer {
    margin-top: 15px;
    padding: 15px 0;
    border-top: 1px dotted #000;
    display: flex;
    justify-content: space-between;
  }
}

.print-wrap {
  position: fixed;
  top: -1000px;
  left: -1000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
