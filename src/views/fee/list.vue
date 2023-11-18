<template>
  <main id="fee-list">
    <el-container class="noprint">
      <transition name="el-zoom-in-center">
        <el-aside class="building-aside">
          <el-input
            class="search-group"
            placeholder="输入关键字进行搜索"
            v-model="filterText"
          ></el-input>
          <el-tooltip effect="dark" content="设置收费制" placement="right">
            <el-button
              class="el-icon-setting"
              type="success"
              @click="openFeeForm"
              >设置物业费收费方式</el-button
            >
          </el-tooltip>
          <el-tree
            class="filter-tree"
            empty-text="未创建楼栋"
            highlight-current
            ref="tree"
            :data="buildings"
            @node-click="handleGroupClick"
            :props="defaultProps"
            default-expand-all
            :expand-on-click-node="false"
            :filter-node-method="searchGroup"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span style="margin-right: 6px">{{ data.name }}</span>
            </span>
          </el-tree>
        </el-aside>
      </transition>
      <el-main>
        <el-row type="flex" justify="space-between">
          <el-form inline>
            <el-form-item>
              <el-input
                class="search-group"
                placeholder="按房号进行搜索"
                v-model="queryForm.name"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-input
                class="search-group"
                placeholder="按业主姓名搜索"
                v-model="queryForm.username"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-tooltip
                effect="dark"
                content="点击筛选出所有欠缴费业主"
                placement="top"
              >
                <el-checkbox 
                v-model="queryForm.fee_status_checked"
                @change="cannotCalFeeChange" 
                  >欠缴费业主</el-checkbox
                >
              </el-tooltip>
            </el-form-item>
            <el-form-item>
              <el-tooltip
                effect="dark"
                content="点击筛选出所有条件不足无法计算物业费的房产"
                placement="top"
              >
                <el-checkbox 
                v-model="queryForm.cannot_cal_fee"
                :true-label="1"
                :false-label="0"
                @change="cannotCalFeeChange"
                  >无法计算物业费的房产</el-checkbox >
              </el-tooltip>
            </el-form-item>
            <el-form-item>
              <el-tooltip
                effect="dark"
                content="点击筛选出所有未绑定业主的房产"
                placement="top"
              >
                <el-checkbox 
                v-model="queryForm.unbinderoomer"
                :true-label="1"
                :false-label="0"
                @change="cannotCalFeeChange"
                  >未绑定业主的房产</el-checkbox >
              </el-tooltip>
            </el-form-item>
            <el-form-item>
              <el-button-group>
                <el-button type="primary" @click="handleQueryList()">
                  查询
                </el-button>
                <el-button type="primary" plain @click="resetParams()">
                  导出查询结果
                </el-button>
              </el-button-group>
            </el-form-item>
            <el-form-item>
              <span class="tips message">收费制、房屋面积和"已缴费至"数据为计算物业费必须的数据</span>
            </el-form-item>
          </el-form>
        </el-row>
        <el-row type="flex" justify="space-between">
          <el-form inline>
            <el-form-item>
              <el-button-group>
                <el-tooltip
                  effect="dark"
                  content="下载Excel模板，查看如何通过Excel发送缴费提醒短信"
                  placement="top"
                >
                  <el-button
                    type="primary"
                    icon="el-icon-download"
                    @click="handleDownload"
                  >
                    下载业主Excel模板
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  effect="dark"
                  content="在下面表格中选取业主发送缴费提醒短信"
                  placement="top"
                >
                  <el-button
                    type="primary"
                    icon="el-icon-s-promotion"
                    @click="batchSendMsg"
                    :disabled="this.multipleSelection.length == 0"
                  >
                    批量发送短信提醒缴费
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  effect="dark"
                  content="在下面表格中选取业主发送缴费提醒短信"
                  placement="top"
                >
                  <el-button
                    type="success"
                    icon="el-icon-refresh"
                    @click="batchEditDate" 
                  >
                    批量更新业主"已缴费至"
                  </el-button>
                </el-tooltip>
                <!--
                <el-tooltip
                  effect="dark"
                  content="点击上传Excel，获取业主信息，发送缴费短信"
                  placement="top"
                >
                  <el-button
                    type="primary"
                    icon="el-icon-s-promotion"
                    @click="handleAdd"
                    :disabled="this.multipleSelection.length == 0"
                  >
                    由Excel批量发送短信提醒缴费
                  </el-button>
                </el-tooltip>
               -->
                <el-tooltip
                  effect="dark"
                  content="批量打印催缴单"
                  placement="top"
                >
                  <el-button
                    type="primary"
                    icon="el-icon-printer"
                    @click="handlePrint"
                    :disabled="this.multipleSelection.length == 0"
                  >
                    批量打印催缴单
                  </el-button>
                </el-tooltip>
              </el-button-group>
            </el-form-item>
          </el-form>
        </el-row>
        <el-table
          v-loading="isTableLoading"
          :data="tableList"
          border
          :stripe="true"
          :header-cell-style="{
            'font-size': '12px',
            background: '#eef1f6',
            color: '#606266',
          }"
          highlight-current-row
          row-class-name="hover"
          @select-all="handleSelectionChange"
          @select="handleSelectionChange"
        >
          <el-table-column type="selection" align="center" width="56" />
          <el-table-column type="index" label="序号" align="center">
          </el-table-column>

          <el-table-column label="房号">
            <template slot-scope="{ row }">
              <div class="name-wrap">{{ row.unit_name }} {{ row.name }}</div>
            </template>
          </el-table-column>
          <el-table-column label="业主">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.owner.username }}<br />
                {{ row.owner.phone }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="房屋面积" width="70">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.area }}
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="username" label="收费制" width="60">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                <span v-if="row.fixed_fee">
                  {{ row.fixed_fee.name }}
                </span>
                <span style="color: #ff8000" v-else> 未设置 </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="已交费至">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.arrearage_start_date | dateFormat }}
              </div>
            </template>
          </el-table-column>
           <el-table-column prop="username" label="应交费至">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.arrearage_end_date | dateFormat }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="arrearage" width="70" label="应缴金额">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.arrearage }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="缴费状态" width="70">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                <span style="color: #d81e06" v-if="row.fee_status == 0">
                  已欠费
                </span>
                <span style="color: #1296db" v-else> 正常 </span>
              </div>
            </template>
          </el-table-column> 
          <el-table-column prop="username" label="非统一性收费">
            <template slot-scope="{ row }">
              <div
                class="name-wrap"
                v-for="(item, index) in row.dynamic_fees"
                :key="index"
              >
                {{ item.dynamicfee__name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="催费记录" width="80">
            <template slot-scope="{ row }">
              <el-link
                :underline="false"
                type="primary"
                @click="handleHistoryDetail(row.uuid)"
                >催缴记录</el-link
              >
            </template>
          </el-table-column>

          <el-table-column width="80" align="center" label="操作">
            <template slot-scope="{ row }">
              <el-tooltip effect="dark" content="设置收费内容" placement="top">
                <el-link
                  :underline="false"
                  icon="el-icon-setting"
                  type="primary"
                  @click="singleFeeSetting(row.uuid, row.unit_name, row.name)"
                />
              </el-tooltip>
              <el-tooltip
                effect="dark"
                content="发送缴费提醒短信"
                placement="top"
              >
                <el-link
                  :disabled="row.fee_status == 1"
                  :underline="false"
                  icon="el-icon-message"
                  type="primary"
                  @click="SingleSendMsg(row.uuid)"
                />
              </el-tooltip>
              <el-tooltip effect="dark" content="打印催缴单" placement="top">
                <el-link
                  :disabled="row.fee_status == 1"
                  :underline="false"
                  icon="el-icon-printer"
                  type="primary"
                  @click="SinglePrint(row.uuid)"
                />
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
      </el-main>
    </el-container>

    <el-dialog title="短信" :visible.sync="dialogMsgFormVisible">
      <el-form :model="form">
        <el-form-item>
          <div v-for="(item, index) in sms_content" :key="index">
            {{ item }}
          </div>
        </el-form-item>
        <hr />
        <div class="detail">
          {{ sms_detail }}
        </div>
        <hr />
        <div class="tips">
          <strong style="color: #ff8000">短信发送说明：</strong>
          <div>1、不会给正常缴费的业主发送短信</div>
          <div>
            2、房产未绑定业主时，不会发送短信<el-link type="success"
              >去绑定业主信息</el-link
            >
          </div>
          <div>3、发送一条短信时，立刻发送，超过一条时，24小时内发送完毕</div>
          <div>
            4、可以在短信发送记录中查看短信发送状态<el-link type="success"
              >查看</el-link
            >
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogMsgFormVisible = false">取 消</el-button>
        <el-button
          type="primary"
          icon="el-icon-s-promotion"
          v-loading="msgLoading"
          @click="confirmSendMsg"
          >发送</el-button
        >
      </div>
    </el-dialog>

    <el-col class="whenprint" ref="printEles" :span="16">
      <div
        class="carditem"
        v-for="(item, index) in sms_content_print"
        :key="index"
      >
        <el-row slot="header" type="flex" align="center" class="card-header">
          <div class="print-title">物业费催缴记录单</div>
        </el-row>
        <el-row
          slot="header"
          type="flex"
          justify="space-between"
          align="middle"
          class="print-header"
        >
          <div class="print-room">
            房号：{{ item.communityname }}{{ item.roomname }}
          </div>
          <div class="print-name">业主：{{ item.username }}</div>
        </el-row>
        <el-row slot="header" align="middle" class="card-header">
          <div class="print-item-holder" v-html="item.content">
            {{ item.content }}
          </div>
          <div class="footer">
            <div class="organizename">{{ item.organize }}</div>
            <p>{{ item.date }}</p>
          </div>
        </el-row>
      </div>
    </el-col>

    <el-dialog title="设置物业费收费方式" :visible.sync="dialogFeeFormVisible">
      <el-form :model="form">
        <el-row>
          <el-col :span="10">
            <el-form-item label="楼/单元" v-if="feeBuilding" prop="fixed_fee">
              <el-cascader
                style="width: 200px"
                v-model="selectedBuildings"
                :options="options"
                :props="props"
                collapse-tags
                clearable
              ></el-cascader
            ></el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="房号"
              v-if="feeBuilding == false"
              prop="fixed_fee"
            >
              {{ selectedRoom }}
              ></el-form-item
            >
          </el-col>
          <el-col :span="10">
            <el-form-item label="物业费" prop="fixed_fee">
              <el-select v-model="fixed_fee">
                <el-option
                  v-for="item of FixedFeesList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.uuid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button
              type="primary"
              :loading="isLoading"
              icon="el-icon-wallet"
              @click="setFee"
            >
              保存
            </el-button>
          </el-col>
        </el-row>
        <hr />
        <div class="tips">
          <strong style="color: #ff8000">物业费收费方式设置说明：</strong>
          <div>1、可以为不同楼不同单元甚至不同房屋设置不同的收费方式</div>
          <div>
            2、点击“保存”后会为某栋楼或者某个单元下所有房屋设置统一的收费方式可以为<el-link
              type="success"
              >去绑定业主信息
            </el-link>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFeeFormVisible = false">关闭 </el-button>
      </div>
    </el-dialog>
  </main>
</template>

<script>
import { getBuildingApi, getRoomApi } from "@/api/building";
import { getFixedFeeApi, cudFixedFeeApi } from "@/api/fee";
import { getMsgTemplate, sendMsg } from "@/api/msg";
import { setPaginationSize, getPaginationSize } from "@/utils/pagination";
export default {
  name: "fee-list",
  data() {
    return {
      selectedBuildings: [],
      options: [],
      dialogFeeFormVisible: false,
      props: { multiple: true },
      form: {
        name: "",
        region: "",
        delivery: false,
        type: [],
      },
      msgLoading: false,
      sms_content: "", // 短信模板
      sms_detail: "说明",
      number: 0, //可以成功发送短信的数量
      
      currentPage: 1,
      total: 0,
      paginationsize: 50,
      tableList: [],
      isTableLoading: false,
      queryForm: {
        name: "",
        fee_status_checked: false,
        cannot_cal_fee:0,
        unbinderoomer:0
      },
      isLoading: false,
      feeBuilding: true,
      selectedRoom: "",
      selectedRoomuuid: "",
      fixed_fee: "",
      buildings: [],
      EditAuth: true, //编辑权限，暂时设置为true
      filterText: "",
      ActiveGroup: null,
      multipleSelection: [],
      dialogMsgFormVisible: false,
      defaultProps: {
        children: "children",
        label: "name",
      },
      FixedFeesList: [],
      Loadings: {
        addDeptLoading: false,
        memberEditLoading: false,
      },
      sms_content_print: [],
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    '$route':'onRouteChanged'
  },
  created() {
    this.getBuilding();  
    this.paginationsize = getPaginationSize();
  },
  methods: {
    onRouteChanged () {
      console.log(this.$route.query) 
      if (this.$route.query.cannot_cal_fee){
        this.queryForm.cannot_cal_fee = 1// 查询所有无法计算物业费的房产信息 
      }
       if (this.$route.query.fee_status_checked){
        this.queryForm.fee_status_checked = true// 仅查询已欠费的业主 
      }

      if (this.$route.query.cannot_cal_fee || this.$route.query.fee_status_checked)
      {
        this.getRooms(1)
      }
    },
    cannotCalFeeChange(){
      //无法计算物业费的房产筛选
      this.getRooms(1)
    },
    batchEditDate(){
       this.$router.push({
        name: "fee-batch-edit",
      });
    },
    setFee() {
      // 设置收费制
      this.isLoading = true;
      let data = {};
      if (this.feeBuilding) {
        data = {
          assets: JSON.stringify(this.selectedBuildings),
          fixedfee: this.fixed_fee,
          communityuuid: localStorage.getItem("communityuuid"),
          method: "put",
        };
      } else {
        data = {
          assets: JSON.stringify([this.selectedRoomuuid]),
          fixedfee: this.fixed_fee,
          room:1,// 更新room
          communityuuid: localStorage.getItem("communityuuid"),
          method: "put",
        };
      }

      cudFixedFeeApi(data)
        .then(({ data: { status, msg } }) => {
          //
          if (status === 0) {
            this.$notify({
              type: "success",
              title: "设置成功",
              message: msg,
              duration: 2000,
            });
            this.getRooms(this.currentPage);
            this.dialogFeeFormVisible = false
          } else {
            this.$notify({
              type: "error",
              title: "设置失败",
              message: msg,
              duration: 0,
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    getFixedFees() {
      // 获得物业统一收费列表
      let params = {
        communityuuid: localStorage.getItem("communityuuid"),
      };
      getFixedFeeApi(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.FixedFeesList = msg;
        }
      });
    },
    SinglePrint(roomuuid) {
      this.multipleSelection = [roomuuid];
      this.handlePrint();
    },
    handlePrint() {
      // 打印交费提醒
      let params = {
        roomuuids: JSON.stringify(this.multipleSelection),
        communityuuid: localStorage.getItem("communityuuid"),
        template_sms: 1,
        print: 1,
      };
      getMsgTemplate(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.sms_content_print = msg.sms_content_ls;

          setTimeout(() => {
            this.$print(this.$refs.printEles);
          }, 100);
        } else {
          this.$notify({
            type: "error",
            title: "获取业主信息模板失败",
            message: msg + "请联系平台IT支持",
            duration: 0,
          });
        }
      });
    },
    confirmSendMsg() {
      //确认发送短信
      let data = {
        roomuuids: JSON.stringify(this.multipleSelection),
        communityuuid: localStorage.getItem("communityuuid"),
      };
      this.msgLoading = true;
      sendMsg(data)
        .then(({ data: { status, msg } }) => {
          if (status == 0) {
            this.$notify({
              type: "success",
              title: "提交成功",
              message: msg,
              duration: 2000,
            });
            this.dialogMsgFormVisible = false;
          } else if (status == 2) {
            // 短信余额不足
            this.$notify({
              type: "error",
              title: "短信余额不足",
              message: msg,
              duration: 0,
            });
          } else {
            this.$notify({
              type: "error",
              title: "获取短信模板失败",
              message: msg + "请联系平台IT支持",
              duration: 0,
            });
          }
        })
        .finally(() => {
          this.msgLoading = false;
        });
    },
    SingleSendMsg(roomuuid) {
      this.multipleSelection = [roomuuid];
      this.batchSendMsg();
    },
    batchSendMsg() {
      // 批量发送短信提醒缴费
      // 获得短信交房模板
      let params = {
        roomuuids: JSON.stringify(this.multipleSelection),
        communityuuid: localStorage.getItem("communityuuid"),
        template_sms: 1,
      };
      getMsgTemplate(params).then(({ data: { status, msg } }) => {
        if (status == 0) {
          this.sms_content = msg.sms_content_ls;
          this.number = msg.number;
          this.sms_detail = msg.detail;
          this.dialogMsgFormVisible = true;
        } else {
          this.$notify({
            type: "error",
            title: "获取短信模板失败",
            message: msg + "请联系平台IT支持",
            duration: 0,
          });
        }
      });
    },
    searchGroup(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 单击触发事件
    handleGroupClick(data) {
      this.showList = false;
      this.ActiveGroup = { ...data };
      this.tableLoading = true;
      this.getRooms(1);
      this.tableLoading = false;
    },
    singleFeeSetting(roomuuid, unitname, roomname) {
      this.feeBuilding = false;
      this.selectedRoom = unitname + roomname;
      this.selectedRoomuuid = roomuuid;
      this.getFixedFees();
      this.dialogFeeFormVisible = true;
    },
    openFeeForm() {
      this.feeBuilding = true;
      for (let i = 0; i < this.buildings.length; i++) {
        let children = [];
        for (let j = 0; j < this.buildings[i]["children"].length; j++) {
          children.push({
            value: this.buildings[i]["children"][j]["uuid"],
            label: this.buildings[i]["children"][j]["name"],
          });
        }
        this.options.push({
          value: this.buildings[i]["uuid"],
          label: this.buildings[i]["name"],
          children: children,
        });
      }
      this.getFixedFees();
      this.dialogFeeFormVisible = true;
    },
    handleCurrentChange(e) {
      this.currentPage = e;
      this.getRooms(this.currentPage);
    },
    handleSizeChange(e) {
      // 切换条数
      setPaginationSize(e);
      this.paginationsize = e;
      this.getRooms(this.currentPage);
    },

    buildingChanged() {
      // 切换楼栋
      this.currentPage = 1;
      this.getRooms(this.currentPage);
    },
    getBuilding() {
      // 获得楼栋和对应的单元号信息
      let that = this;
      getBuildingApi({
        communityuuid: localStorage.getItem("communityuuid"),
      }).then(({ data: { status, msg } }) => {
        if (status == 0) {
          that.buildings = msg;
        } else {
          that.$notify({
            title: "获取楼栋信息失败",
            message: msg,
          });
        }
      });
    },
    handleAdd() {
      this.$router.push({
        name: "edit-info",
      });
    },
    handleQueryDetail(id) {
      this.$router.push({
        name: "product-detail",
        query: {
          id,
        },
      });
    },
    handleHistoryDetail(uuid) {
      this.$router.push({
        name: "fee-history",
        query: {
          uuid,
        },
      });
    },
    handleEdit(uuid) {
      this.$router.push({
        name: "edit-info",
        query: {
          uuid,
        },
      });
    },
    // 删除和批量删除
    async handleDelete(uuids) {},
    resetParams() {
      this.queryForm = {};
      this.ActiveGroup = null;
      this.fee_status_checked = false;
      this.handleQueryList();
    },
    handleQueryList() {
      this.getRooms(1);
    },
    //  table选择
    handleSelectionChange(selection) {
      this.multipleSelection = selection.map(({ uuid }) => uuid);
    },
    handleDownload() {
      // 下载excel模板
      window.open("/template/msg.xlsx", "_blank");
    },
    getRooms(currentPage) {
      // 搜索rooms
      this.isTableLoading = true;
      let that = this;
      let params = { 
        page: currentPage,
        fee: 1, // 获取物业费相关信息
        pagenum: this.paginationsize,
        communityuuid: localStorage.getItem("communityuuid"),
      };
      if (this.queryForm.name != "") {
        params["name"] = this.queryForm.name;
      }

      if (this.queryForm.username != "") {
        params["username"] = this.queryForm.username;
      }

      if (this.queryForm.fee_status_checked) {
        params["fee_status"] = 0; // 表示业主已欠费
      } 

      if (this.queryForm.cannot_cal_fee) {
        params["cannot_cal_fee"] = 1; // 查询所有无法计算物业费的房产信息
      }

      if (this.queryForm.unbinderoomer) {
        params["unbinderoomer"] = 1; // 点击筛选出所有未绑定业主的房产
      }
    
      if (this.ActiveGroup) {
        params["uuid"] = this.ActiveGroup.uuid;
        params["level"] = this.ActiveGroup.level;
      }
      getRoomApi(params)
        .then(({ data: { status, msg } }) => {
          if (status == 0) {
            that.tableList = msg.rooms;
            that.total = msg.total;
          } else {
            that.$notify({
              title: "获取房屋信息失败",
              message: msg,
            });
          }
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },
  },
};
</script>

<style lang="scss"  src="./list.scss">
</style>
