<template>
  <div id="asset-list">
    <div style="padding-bottom:15px;">
      <input class="file_inp" ref="file_inp" accept=".xlsx" type="file" @change="importExcel" />
      <el-button
        icon="el-icon-circle-plus"
        type="success"
        @click="openFile"
        class="pan-btn green-btn"
        size="mini"
      >读取Excel</el-button> 
      <el-button
        icon="el-icon-upload"
        type="success"
        @click="getAsset"
        class="pan-btn green-btn"
        size="mini"
        :loading="uploadLoading"
        :disabled="uploadDisabled"
      >上传</el-button>
      <el-button
        icon="el-icon-refresh-left"
        type="success"
        @click="importAsset(1)"
        class="pan-btn green-btn"
        size="mini"
      >清空表格</el-button>
      <el-button
        icon="el-icon-delete-solid"
        type="danger"
        @click="deleteTableRow()"
        class="pan-btn red-btn"
        v-show="$refs.tableTemplate?$refs.tableTemplate.tableData.length : false"
        size="mini"
      >删除已选</el-button>
      <span class="btn-explain" @click="openExplain()">
        使用帮助:
        <svg-icon icon-class="wenhao" />
      </span>
      <span class="btn-explain" @click="openExplain()">
        使用帮助:
        <svg-icon icon-class="wenhao" />
      </span>
    </div>
    <import-table-template ref="tableTemplate" @returnAssemblingData="returnAssemblingData"></import-table-template>
    <el-dialog title="注意事项" :visible.sync="dialogVisible" width="365px">
      <div class="notice-matter">
        <div style="font-size:12px">
          <h3>绑定数据</h3>
          <div style="padding-top:2px">
              读取excel后，请将excel中的数据与列名进行绑定
          </div>
           <h3>不正确的数据会被忽略</h3>
          <div style="padding-top:2px">
               如：身份证号码必须是16位，否则会被忽略掉，手机号码必须是11位数字，否则会被忽略掉等等。
          </div> 
        </div> 
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as HTTP from "@/api/building";
import XLSX from "xlsx";
import ImportTableTemplate from "@/views/components/importTableTemplate";
export default {
  neme: "edit-room",
  data() {
    
    return {
      dialogVisible: false,
      uploadLoading: false,
      uploadDisabled: true,
      requiredKeysMap: {
        building_name: "楼号", 
        unit_name: "单元号",
        roomname: "房号",
      },
      keysMap: {  
        area: "房屋面积", 
        username: "业主姓名", 
        phone: "业主电话", 
        arrearage_start_date: "已交费至", 
      },
      testDataJSON: []
    };
  },
  components: { ImportTableTemplate },
  methods: {
    //导入说明
    openExplain() {
      this.dialogVisible = true;
    },
    //点击隐藏的上传文件按钮
    openFile() {
      this.$refs.file_inp.click();
    },
    deleteTableRow() {
      this.$refs.tableTemplate.deleteRow();
    },
    //导入excel 变异为数组
    importExcel(e) {
      if (!e.target.files) {
        return;
      }
      let file = e.target.files[0];
      let Fdata = new FormData();
      Fdata.append("file", file);
      this.$refs.tableTemplate.openLoading("数据导入中");
      HTTP.parseExcel(Fdata).then(({ data }) => {
        //这里可判断数据是否为空
        this.testDataJSON = [...data.msg];
        this.importAsset();
        this.uploadDisabled = false;
        e.target.value = null; //可以重新导入同一个表
      });
    },
    //获得编辑后的数据
    getAsset() {
      this.$refs.tableTemplate.getAssemblingData();
    },
    /**
     * 获取表格组装好的数据
     * 组件中必须 @returnAssemblingData="returnAssemblingData"
     */
    returnAssemblingData(data) {
      data = { ...data, community_uuid: localStorage.getItem("communityuuid") };
      //提交jsons数据
      this.uploadLoading = true;
      HTTP.uploadBuildingInfo(data)
        .then(({ data }) => {
          
            this.$notify({
              title: "导入结果", 
              dangerouslyUseHTMLString: true,
              message: `<div>导入成功${data.success_num}条、失败${data.failure_num}条</div>`
             
            });
            
          
        })
        .finally(() => {
          this.uploadLoading = false;
        });
    },
    //导入数据 type=1表示重置
    importAsset(type) {
      if (type === 1) {
        this.$refs.tableTemplate.initData({
          reset: true,
          datas: [],
          keysMap: {},
          requiredKeysMap: {}
        });
        return;
      }
      let data = {
        reset: false,
        datas: this.testDataJSON,
        keysMap: this.keysMap,
        requiredKeysMap: this.requiredKeysMap
      };
      this.$refs.tableTemplate.initData(data);
    }
  }
};
</script>
<style lang="scss" scoped>
.file_inp {
  display: none;
}
.btn-explain {
  padding-left: 15px;
  font-size: 12px;
  color: #808080;
  cursor: pointer;
}
.notice-matter {
  padding-left: 5px;
  padding-bottom: 20px;
  padding-right: 5px;
}
</style>
