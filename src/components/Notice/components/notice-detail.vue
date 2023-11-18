<template>
  <div id="notiec-detail">
    <div>
      <el-button
        type="danger"
        @click="delNotices"
        :disabled="this.multipleSelection.length === 0"
      >批量删除</el-button>
      <!--disabled值动态显示，默认为true,当选中复选框后值为false-->
      <el-button
        @click="updateIsReads"
        type="primary"
        :disabled="this.multipleSelection.length === 0"
      >标记为已读</el-button>
           <el-radio-group @change="changeRead" v-model="formData.read" >
            <el-radio :label="-1">全部</el-radio>
            <el-radio :label="0">未读</el-radio>
            <el-radio :label="1">已读</el-radio> 
          </el-radio-group>
    </div>

    <el-table
      :data="notice"
      style="width: 100%"
      ref="multipleTable"
      tooltip-effect="dark"
      @selection-change="handleSelectionChange"
      @row-click="updateIsRead"
    > 
      <el-table-column type="selection"></el-table-column>

      <el-table-column label="消息" width="280" show-overflow-tooltip>
        <template slot-scope="scope">
          <svg-icon v-if="scope.row.read == 0"   icon-class="notice-close" />

          <svg-icon v-if="scope.row.read == 1"  icon-class="notice-open" />
          <a :class="scope.row.read == 0?'red':''"  @click="noticeJump(scope.row.pcurl, scope.row.id)">{{scope.row.title}}</a>
        </template>
      </el-table-column> 
      <el-table-column label="时间">
        <template slot-scope="scope">{{scope.row.date|dateTimeFormat}}</template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import * as HTTP from "@/api/notice";
export default {
  name: "NoticeDetail",
  props: ["notice"],
  data() {
    return {
      formData:{
        read:0
      },
      multipleSelection: []
    };
  },

  methods: {
    changeRead(){
      this.$store.dispatch("notice/get_Notice", {
         pc:1,
        list:1,
        read:this.formData.read
      });
    },
    noticeJump(url, id) { 
      // 通知，并跳转相关页面
      let data = {
        pc: 1, // 来自pc端
        ids: id,
      };
      HTTP.removeNotice(data).then(({ data: { status, msg } }) => {
        // 标记为已读
        if (status != 0) {
          this.$notify({
            type: "error",
            title: "通知操作异常",
            message: msg,
          });
        } else {
          
        }
        this.$router.push({
          path: url,
        });
      });
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleChange(val) {
      console.log(val);
    },
    //修改是否已读
    updateIsRead(row) {
      console.log(row);
      if (row.read === 0) {
        row.read = 1;
      }
      HTTP.putNotice({
        method: "put",
        ids: row.id,
        read: row.read
      }).then(({ data }) => {
        if (data.status === 0) {
          //this.$message.success(data.msg);
          this.$emit("getNoticeDetail", this.formData.read);
        } else {
          //this.$message.error(data.msg);
        }
      });
    },
    updateIsReads() {
      const ids = this.multipleSelection.map(item => item.id).join(",");
      HTTP.putNotice({
        method: "put",
        ids: ids,
        read: 1
      }).then(({ data }) => {
        if (data.status === 0) {
          //this.$message.success(data.msg);
          this.$emit("getNoticeDetail", this.formData.read);
        } else {
          //this.$message.error(data.msg);
        }
      });
    },
    //批量删除通知
    delNotices() {
      const ids = this.multipleSelection.map(item => item.id).join(",");
      //console.log(ids);
      this.$confirm("确定删除？", "注意", {
        confirmButtonText: "删除",

        concelButtonText: "取消",

        type: "warning"
      }).then(() => {
        HTTP.removeNotice({
          ids: ids,
          pc: "delete",
          delete:1
        }).then(({ data }) => {
          if (data.status === 0) {
            this.$message.success(data.msg);
            this.$refs.multipleTable.clearSelection();
            this.$emit("getNoticeDetail", this.formData.read);
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    }
  }
};
</script>

<style scoped>
.red{
  color:#ff8000;
  font-weight: bold;
}
.item {
  position: static;
  margin-left: -10px;
  margin-top: -16px;
}

.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}

</style> 