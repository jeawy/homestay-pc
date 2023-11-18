<template>
  <main class="product-detail">
    <el-button-group>
      <el-button
        @click="goBack"
        icon="el-icon-arrow-left"
        size="mini"
      ></el-button>
      <el-tooltip
        effect="dark"
        content="制定统一收费制，如一费制"
        placement="top"
      >
        <el-button
          type="primary"
          icon="el-icon-plus"
          plain
          @click="handleAddbtn()"
        >
          添加新收费制
        </el-button>
      </el-tooltip>
    </el-button-group>
    <el-row :gutter="10">
      <el-col class="ruleitem" :span="6">
        <el-card shadow="never">
          <el-row
            slot="header"
            type="flex"
            justify="space-between"
            align="middle"
            class="card-header"
          >
            <span>非统一收费项</span>
            <el-tooltip
              effect="dark"
              content="添加非统一收费项，如停车费"
              placement="top"
            >
              <el-button-group>
                <el-button
                  type="primary"
                  icon="el-icon-s-tools"
                  @click="handleDynamicFee()"
                >
                  管理非统一收费项
                </el-button>
              </el-button-group>
            </el-tooltip>
          </el-row>
          <el-row>
             <el-row>
            <div
              class="row-item"
              inline
              v-for="(item, index) in dynamicFees"
              :key="index"
            >
              <div class="name">{{ item.name }}:</div>
              <div class="money">{{ item.money }}元/</div>
              <div class="way">
                {{ item.feetype == 0 ? "每月每平米" : "每月每户" }}
              </div>
            </div>
          </el-row>
          </el-row>
        </el-card>
      </el-col>
      <el-col
        class="ruleitem"
        :span="6"
        v-for="(item, index) in fees"
        :key="index"
      >
        <el-card shadow="never">
          <el-row
            slot="header"
            type="flex"
            justify="space-between"
            align="middle"
            class="card-header"
          >
            <span>{{ item.name }}</span>
            <el-button-group>
              <el-button
                type="primary"
                icon="el-icon-edit-outline"
                @click="handleEdit(item.uuid)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                plain
                @click="openDeleteDialog(item.uuid, item.name)"
              >
                删除
              </el-button>
            </el-button-group>
          </el-row>
          <el-row>
            <div
              class="row-item"
              inline
              v-for="(fee_item, fee_index) in item.items"
              :key="fee_index"
            >
              <div class="name">{{ fee_item.name }}:</div>
              <div class="money">{{ fee_item.money }}元/</div>
              <div class="way">
                {{ fee_item.feetype == 0 ? "每月每平米" : "每月每户" }}
              </div>
            </div>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog
      :title="'删除收费制:' + deleteTitle"
      :visible.sync="dialogDelete"
    >
      <div>
        <label type="warning">
          收费制删除后，按照该收费制进行收费的业主需要重新绑定收费制。<br
        /></label>
        确认删除吗
      </div>
      <el-divider></el-divider>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDelete = false">取 消</el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="'删除收费项:' + deleteDynamicTitle"
      :visible.sync="dialogDynamicDelete"
    >
      <div>
        <label type="warning">
          收费项删除后，按照该收费项进行收费的业主需要重新绑定收费项。<br
        /></label>
        确认删除吗
      </div>
      <el-divider></el-divider>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDynamicDelete = false">取 消</el-button>
        <el-button type="danger" @click="handleDynamicDelete">删除</el-button>
      </div>
    </el-dialog>

    <el-dialog title="非统一收费项" :visible.sync="dialogDynamicFeeVisible">
      <el-card shadow="never">
        <el-form :model="form">
          <el-button
            type="primary"
            icon="el-icon-plus"
            plain
            @click="handleDynamicFeeItem()"
          >
            添加新收费项
          </el-button>
          <el-form-item
            label="收费项"
            v-for="(item, index) in dynamicFees"
            :key="index"
          >
            <el-input
              style="width: 120px"
              maxlength="10"
              show-word-limit
              v-model="item.name"
              placeholder="如：停车费"
              autocomplete="off"
            ></el-input>
            <el-input
              style="width: 80px"
              maxlength="10"
              show-word-limit
              v-model="item.money"
              placeholder="0.00"
              type="number"
              min="0"
              @change="moneyChanged(index, item.money)"
              autocomplete="off"
            ></el-input>元
            <el-radio v-model="item.feetype" :label="0">每月每平米</el-radio>
            <el-radio v-model="item.feetype" :label="1">每月每户</el-radio> 
            <el-button-group>
              <el-button
                type="primary"
                icon="el-icon-s-cooperation"
                plain
                @click="saveDynamicFee(index)"
              >
                保存
              </el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                plain
                @click="deleteDynamicFee(index, item.uuid, item.name)"
              >
                删除
              </el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </el-card>

      <div slot="footer" class="dialog-footer"> 
        <el-button
          type="primary"
          :loading="saveRulesLoading"
          @click="manageDynamicFees"
          >关闭</el-button
        >
      </div>
    </el-dialog>

    <el-dialog title="收费制" :visible.sync="dialogFormVisible">
      <el-card shadow="never">
        <el-form :model="form">
          <el-form-item label="收费制名称">
            <el-input
              style="width: 200px"
              maxlength="10"
              show-word-limit
              v-model="form.name"
              placeholder="如：一费制"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-button
            type="primary"
            icon="el-icon-plus"
            plain
            @click="handleAddNewItem()"
          >
            添加新收费项
          </el-button>
          <el-form-item
            label="收费项"
            v-for="(item, index) in form.items"
            :key="index"
          >
            <el-input
              style="width: 200px"
              maxlength="10"
              show-word-limit
              v-model="item.name"
              placeholder="如：物业费"
              autocomplete="off"
            ></el-input>
            <el-input
              style="width: 100px"
              maxlength="10"
              show-word-limit
              v-model="item.money"
              placeholder="0.00"
              type="number"
              min="0"
              @change="moneyChanged(index, item.money)"
              autocomplete="off"
            ></el-input>
            <el-radio v-model="item.feetype" :label="0">每月每平米</el-radio>
            <el-radio v-model="item.feetype" :label="1">每月每户</el-radio>
            <el-button
              type="danger"
              icon="el-icon-delete"
              plain
              @click="deleteRuleItem(index)"
            >
              删除
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="saveRulesLoading"
          @click="addNewRule"
          >保 存</el-button
        >
      </div>
    </el-dialog>
  </main>
</template>

<script>
import { cudFixedFeeApi, 
getFixedFeeApi, 
cudDynamicFeeApi,
getDynamicFeeApi } from "@/api/fee";
export default {
  name: "edit-product",
  data() {
    return {
      deleteTitle: "",
      deleteDynamicTitle: "",
      deleteUuid: "", //待删除的统一收费项uuid
      deleteDynamicUuid: "", //待删除的非统一收费项uuid
      saveRulesLoading: false,
      dialogDelete: false,
      form: {
        name: "",
      },
      detailData: {
        detail: "",
      },
      dialogDynamicFeeVisible: false,
      dialogFormVisible: false,
      dialogDynamicDelete: false, 
      dynamicFees: [  ],
      fees: [],
      communityuuid: "",
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
      editFeeuuid: "",
    };
  },
  created() {
    this.communityuuid = localStorage.getItem("communityuuid");
    this.getFees();
    this.getDynamicFees()
  },
  methods: {
    manageDynamicFees() {
      // 管理非统一收费项目
      this.dialogDynamicFeeVisible = false
      this.getDynamicFees()
      this.deleteDynamicTitle = "";
      this.deleteDynamicUuid = ""; 
    },
    handleDynamicDelete() {
      cudDynamicFeeApi({
        uuid: this.deleteDynamicUuid,
        method: "delete",
        communityuuid: this.communityuuid,
      }).then(({ data: { status, msg } }) => {
        if (status === 0) {
          this.$notify({
            type: "success",
            title: "删除成功",
            message: msg,
            duration: 2000,
          });
          this.dialogDynamicDelete = false
          this.getDynamicFees()
        } else {
          this.$notify({
            type: "error",
            title: "删除失败",
            message: msg,
            duration: 0,
          });
        }
      });
    },
    saveDynamicFee(index) {
      // 保存收费项 
      let data = {
         ...this.dynamicFees[index],
          communityuuid: this.communityuuid
      }
      if (this.dynamicFees[index].uuid != ""  )
      {
        data['method'] = "put"
      }
      cudDynamicFeeApi(data).then(({ data: { status, msg } }) => {
        if (status === 0) {
          this.dynamicFees[index].uuid = msg
          this.$notify({
            type: "success",
            title: "保存成功",
            message: "保存成功",
            duration: 2000,
          });
        } else {
          this.$notify({
            type: "error",
            title: "保存失败",
            message: msg,
            duration: 0,
          });
        }
      });
    },
    deleteDynamicFee(index, feeuuid, name) {
      if (feeuuid == "" || typeof feeuuid == "undefined") {
        // 未保存到数据库的收费项直接删除
        this.dynamicFees.splice(index, 1);
        return;
      }
      this.deleteDynamicTitle = name;
      this.deleteDynamicUuid = feeuuid;
      this.dialogDynamicDelete = true;
    },
    handleDynamicFee() {
      this.dialogDynamicFeeVisible = true;
    },
    handleDynamicFeeItem() {
      this.dynamicFees.push({
        name: "",
        feetype: 0,
        money: 0,
        uuid: "",
      });
    },
    openDeleteDialog(feeuuid, title) {
      this.deleteUuid = feeuuid;
      this.deleteTitle = title;
      this.dialogDelete = true;
    },
    getFees() {
      getFixedFeeApi({ communityuuid: this.communityuuid }).then(
        ({ data: { status, msg } }) => {  
          console.log(msg)
          if (status == 0) { 
            this.fees = msg;
          }
        }
      );
    },
    getDynamicFees(){
      getDynamicFeeApi({ communityuuid: this.communityuuid }).then(
        ({ data: { status, msg } }) => { 
          if (status == 0) {
            this.dynamicFees = msg;
          }
        }
      );
    },
    handleEdit(ruleuuid) {
      getFixedFeeApi({
        communityuuid: this.communityuuid,
        uuid: ruleuuid,
      }).then(({ data: { status, msg } }) => { 
        if (status == 0) {
          this.form = msg;
          this.dialogFormVisible = true;
          this.editFeeuuid = ruleuuid;
        }
      });
    },
    moneyChanged(index, value) {
      if (value < 0) {
        this.form.items[index].money = -value;
        this.$notify({
          type: "error",
          title: "输入错误",
          message: "收费金额不能小于0",
          duration: 0,
        });
      }
    },
    addNewRule() {
      // 向后端提交
      let data = {
        ...this.form,
        communityuuid: this.communityuuid,
        items: JSON.stringify(this.form.items),
      };
      if (this.editFeeuuid != "") {
        data["method"] = "put";
        data["uuid"] = this.editFeeuuid;
      }
      this.saveRulesLoading = true;
      cudFixedFeeApi(data)
        .then(({ data: { status, msg } }) => {
          if (status === 0) {
            this.$notify({
              type: "success",
              title: "提交成功",
              message: msg,
              duration: 2000,
            });
            this.dialogFormVisible = false;
            this.editFeeuuid = "";
            this.getFees();
          } else {
            this.$notify({
              type: "error",
              title: "提交失败",
              message: msg,
              duration: 0,
            });
          }
        })
        .finally((res) => {
          this.saveRulesLoading = false;
        });
    },
    deleteRuleItem(index) {
      this.form.items.splice(index, 1);
    },
    handleAddNewItem() {
      this.form.items.push({
        name: "",
        feetype: 1,
        money: 0,
      });
    },
    handleAddbtn() {
      this.form = {
        name:"",
        items:[]
      }
      this.editFeeuuid = ""; // 将编辑UUID 设置为空
      this.dialogFormVisible = true;
    },
    handleDelete() {
      cudFixedFeeApi({
        communityuuid: this.communityuuid,
        uuids: this.deleteUuid,
        method: "delete",
      }).then(({ data: { status, msg } }) => {
        if (status === 0) {
          this.$notify({
            type: "success",
            title: "删除成功",
            message: msg,
            duration: 2000,
          });
          this.dialogDelete = false;
          this.getFees();
        } else {
          this.$notify({
            type: "error",
            title: "删除失败",
            message: msg,
            duration: 0,
          });
        }
      });
    },
    goBack() {
      this.$router.go(-1);
    },

    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>
<style lang="scss">
.row-item {
  display: flex;
}
.name {
  min-width: 90px;
}
.el-card__body {
  height: 260px;
}
.el-radio{
  margin-right: 5px !important;
}
</style>
