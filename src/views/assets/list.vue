<template>
  <div id="product-list">
    <el-container>
      <transition name="el-zoom-in-center">
        <el-aside
          width="260px"
          style="
            border-right: 1px solid #ddd;
            padding: 0 5px;
            min-height: 600px;
            margin-right: 20px;
          "
        >
          <el-input
            class="search-group"
            placeholder="输入关键字进行搜索"
            v-model="filterText"
          ></el-input>
          <el-row type="flex" align="middle" class="nav-title" v-if="EditAuth">
            <el-button @click="openGroupForm('add')" type="success"
              >添加楼号</el-button
            >
          </el-row>
          <el-tree
            class="filter-tree"
            empty-text="未创建楼栋信息"
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

              <span class="iconWarp">
                <i
                  v-if="data.level == 1"
                  class="el-icon-plus"
                  @click="openGroupForm('add', data)"
                  style="color: #409eff"
                  title="添加单元号"
                  >添加</i
                >
                <i
                  class="el-icon-edit-outline"
                  @click="openGroupForm('edit', data)"
                  style="color: #409eff"
                  title="编辑"
                  >编辑</i
                >

                <i
                  class="el-icon-delete"
                  @click="removeGroup(data)"
                  style="color: #f56c6c"
                  title="删除?"
                  >删除</i
                >
              </span>
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
                placeholder="输入房号进行搜索"
                v-model="queryForm.name"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button-group>
                <el-button type="primary" @click="handleQueryList()">
                  查询
                </el-button>
                <el-button type="primary" plain @click="resetParams()">
                  重置
                </el-button>
              </el-button-group>
            </el-form-item>
          </el-form>
          <el-form inline>
            <el-form-item>
              <el-button-group>
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  @click="handleAdd"
                >
                  通过excel批量导入房号
                </el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  :disabled="!multipleSelection.length"
                  plain
                  @click="handleDelete(multipleSelection)"
                >
                  删除选中房号
                </el-button>
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
          <el-table-column type="index" label="序号" align="center"> </el-table-column>
          <el-table-column label="房号">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.unit_name }} {{ row.name }}
              </div>
            </template>
          </el-table-column>
           
          <el-table-column label="业主">
            <template slot-scope="{ row }">
              <div class="name-wrap"  >
                {{ row.owner.username }}  {{ row.owner.phone }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="房屋面积">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.area }}
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="username" label="当前居住类型">
            <template slot-scope="{ row }">
              <div class="name-wrap">
                {{ row.status == 0?"空置":"已入住"     }}
              </div>
            </template>
          </el-table-column>

          <el-table-column width="80" align="center" label="操作">
            <template slot-scope="{ row }">
              <el-tooltip effect="dark" content="详情" placement="top">
                <el-link
                  :underline="false"
                  icon="el-icon-tickets"
                  type="primary"
                  @click="handleQueryDetail(row.uuid)"
                />
              </el-tooltip>
              <el-tooltip effect="dark" content="修改" placement="top">
                <el-link
                  :underline="false"
                  icon="el-icon-edit"
                  type="primary"
                  @click="handleEdit(row.uuid)"
                />
              </el-tooltip>
              <el-tooltip effect="dark" content="删除" placement="top">
                <el-link
                  :underline="false"
                  icon="el-icon-delete"
                  type="danger"
                  @click="handleDelete(row.uuid)"
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
    <el-dialog
      :title="DialogType.title"
      :visible.sync="dialogFormVisible"
      width="460px"
    >
      <el-form :model="GroupForm" ref="GroupForm" :rules="GroupRules">
        <el-form-item :label="DialogType.name" label-width="20%" prop="name">
          <el-input
            v-model.trim="GroupForm.name"
            autocomplete="off"
            style="width: 100%"
          ></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>

        <el-button
          :loading="Loadings.addDeptLoading"
          type="primary"
          @click="DialogType.type === 'add' ? appendGroup() : updateGroup()"
          >提 交</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getBuildingApi,
  getRoomApi,
  updateBuilding,
  deleteRooms,
} from "@/api/building";
import { setPaginationSize, getPaginationSize } from "@/utils/pagination";
export default {
  name:"assets",
  data() {
    return {
      currentPage: 1,
      total: 0,
      paginationsize: 50,
      tableList: [],
      isTableLoading: false,
      queryForm: {},
      buildings: [],
      EditAuth: true, //编辑权限，暂时设置为true
      DialogType: {},
      GroupForm: {},
      filterText: "",
      ActiveGroup: null,
      multipleSelection: [],
      dialogFormVisible: false,
      defaultProps: {
        children: "children",

        label: "name",
      },
      Loadings: {
        addDeptLoading: false,

        memberEditLoading: false,
      },
      GroupRules: {
        name: [
          {
            required: true,

            trigger: "blur",

            message: "楼号未填写",
          },
        ],
      },
      baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  filters: {
    contenttype(product_type) {
      if (product_type == 0) {
        return "百事通";
      } else if (product_type == 1) {
        return "通知";
      } else if (product_type == 2) {
        return "公告";
      }
    },
  },
  created() {
    this.getBuilding();
    this.paginationsize = getPaginationSize();
  },
  methods: {
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
    removeGroup(data) {
      this.$confirm("此操作将永久删除?", "注意", {
        confirmButtonText: "删除", 
        cancelButtonText: "取消", 
        type: "warning",
      }).then(() => { 
        updateBuilding({
          uuids: data.uuid,
          method: "delete",
          communityuuid: localStorage.getItem("communityuuid"),
          level: data.level,
        }).then(({ data: { status, msg } }) => {
          if (status === 0) {
            this.$notify({
              title: "删除成功",
              message: msg,
              type: "success",
            });
            this.getBuilding();
          } else {
            this.$notify({
              title: "删除失败",
              message: msg,
              type: "error",
            });
          }
        });
      });
    },
    openGroupForm(type, data = null) {
      if (type === "add") {
        if (data) {
          this.DialogType = Object.assign(
            {},
            {
              title: "添加单元号",
              name: "单元号",
              type,
            }
          ); 
          this.GroupForm = Object.assign(
            {},
            {
              buildinguuid: data.uuid,
            }
          );
        } else {
          this.DialogType = Object.assign(
            {},
            {
              title: "添加楼号",
              name: "楼号",
              type,
            }
          );

          this.GroupForm = Object.assign(
            {},
            {
              communityuuid: localStorage.getItem("communityuuid"),
            }
          );
        }
      } else if (type === "edit") {
        let name = "楼号";
        if (data.level == 2) {
          name = "单元号";
        } 
        this.GroupForm = Object.assign(
          {},
          {
            uuid: data.uuid,
            method: "put",
            name: data.name,
            level: data.level,
          }
        );

        this.DialogType = Object.assign(
          {},
          {
            title: "修改",
            name: name,
            type,
          }
        );
      }

      this.dialogFormVisible = true;
    },
    appendGroup() {
      //验证表单

      this.$refs["GroupForm"].validate(async (valid) => {
        if (valid) {
          this.Loadings.addDeptLoading = true; 
          await updateBuilding(this.GroupForm)
            .then(({ data: { status, msg } }) => {
              this.Loadings.addDeptLoading = false;

              if (status === 0) {
                this.$notify({
                  title: "添加成功",
                  message: msg,
                  type: "success",
                });
                this.getBuilding();
              } else {
                this.$notify({
                  title: "添加失败",
                  message: msg,
                  type: "error",
                });
              }
            })

            .catch(() => {
              this.Loadings.addDeptLoading = false;
            });

          this.dialogFormVisible = false;
        }
      });
    },
    updateGroup() {
      //验证表单
      this.$refs["GroupForm"].validate(async (valid) => {
        if (valid) {
          this.Loadings.addDeptLoading = true;

          await updateBuilding(this.GroupForm)
            .then(({ data: { status, msg } }) => {
              this.Loadings.addDeptLoading = false;

              if (status === 0) {
                this.$notify({
                  title: "修改成功",
                  message: msg,
                  type: "success",
                });
                this.getBuilding();
              } else {
                this.$notify({
                  title: "修改失败",
                  message: msg,
                  type: "error",
                });
              }
            })

            .catch(() => {
              this.Loadings.addDeptLoading = false;
            });

          this.dialogFormVisible = false;
        }
      });
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
    getRooms(currentPage) {
      this.isTableLoading = true;

      let that = this;
      let params = {
        page: currentPage,
        pagenum: this.paginationsize,
        communityuuid: localStorage.getItem("communityuuid"),
      };
      if (this.queryForm.name != "") {
        params["name"] = this.queryForm.name;
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
        name: "asset-edit",
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
    handleEdit(uuid) {
      this.$router.push({
        name: "asset-edit-room",
        query: {
          uuid,
        },
      });
    },
    // 删除和批量删除
    async handleDelete(uuids) {
      await this.$confirm("确定删除?", {
        type: "warning",
      });
      if (Array.isArray(uuids)) {
        uuids = uuids.join();
      }
      deleteRooms({
        uuids,
        communityuuid: localStorage.getItem("communityuuid"),
      }).then(({ data: { status, msg } }) => {
        if (status === 0) {
          this.$notify({
            title: "删除成功",
            message: msg,
            type: "success",
          });
          this.handleQueryList();
        } else {
          this.$notify({
            title: "删除失败",
            message: msg,
            type: "error",
          });
        }
      });
    },
    resetParams() {
      this.queryForm = {};
      this.ActiveGroup = null;
      this.handleQueryList();
    },
    handleQueryList() {
      this.getRooms(1);
    },
    //  table选择
    handleSelectionChange(selection) { 
      this.multipleSelection = selection.map(({ uuid }) => uuid); 
    }, 
  },
};
</script>

<style lang="scss">
#product-list {
  .el-avatar {
    margin-right: 16px;
  }
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
  .name-wrap {
    display: flex;
    align-items: center;
  }
  .el-container {
    height: 100%;
  }
}
</style>
