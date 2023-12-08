<template>
  <!-- 添加和修改 -->
  <main class="edit-record">
    <el-row :gutter="10">
      <el-col :span="16">
    <el-form
      :model="formData"
      status-icon
      ref="product-form"
      label-width="90px"
      :rules="rules"
    >
      <el-form-item label="登记标题" prop="title">
        <el-input
          v-model="formData.title"
          maxlength="32"
          show-word-limit
        ></el-input>
      </el-form-item>
      <el-form-item label="详细描述" prop="content">
        <el-input v-model="formData.content" type="textarea"> </el-input>
      </el-form-item>

      <el-form-item label="登记表格："  > 
      </el-form-item>
        <el-table
          :data="tableList"
          border
           style="width: 100%"
          :stripe="true"
          :header-cell-style="{
            'font-size': '12px',
            background: '#eef1f6',
            color: '#606266',
            'white-space':'nowrap'
          }"
          highlight-current-row
          row-class-name="hover"
        >
          <el-table-column
            v-for="(item, index) in extras"
            :key="index"
            prop="username"
            
          >
            <template slot="header" slot-scope="scope">
              <label class="column">{{ item.label }}</label>
              <el-tooltip effect="dark" content="删除该列" placement="top">
                <i
                  class="el-icon-delete"
                  @click="handleDeleteColumn(scope.$index)"
                />
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column fixed="right" width="120"
         
          >
            <template slot="header"  >
              <label class="addcolumn column" @click="handleAddColumn" >点击添加列</label>
              <i class="el-icon-plus"   @click="handleAddColumn"/>
            </template>
          </el-table-column>
        </el-table>
       
    </el-form>
    <el-form label-width="190px">
      <el-form-item label="是否公开用户登记情况?">
        <el-switch
          v-model="value"
          active-color="#13ce66"
          active-value="100"
          active-text="公开"
          inactive-text="隐藏"
          inactive-value="0"
        >
        </el-switch>
      </el-form-item>
      <el-form-item label="在APP或者小程序中展示?">
        <el-switch
          v-model="formData.available_appside"
          active-color="#13ce66"
          :active-value="1"
          active-text="是"
          inactive-text="否"
          :inactive-value="0"
        >
        </el-switch>
      </el-form-item>
      <el-form-item label="要求用户先登录?">
        <el-switch
          v-model="formData.need_login"
          active-color="#13ce66"
          :active-value="1"
          active-text="是"
          inactive-text="否"
          :inactive-value="0"
        >
        </el-switch>
      </el-form-item>
      <el-form-item label="允许登录用户重复登记?" v-if="formData.need_login==1">
        <el-switch
          v-model="formData.duplicate"
          active-color="#13ce66"
          :active-value="1"
          active-text="是"
          inactive-text="否"
          :inactive-value="0"
        >
        </el-switch>
      </el-form-item>
      <el-form-item label="限制登记人数?" 
          :rules="[
          {type:'number',message: '请输入数字'}]"
           > 
            <el-switch
              v-model="formData.switchLimit"
              active-color="#13ce66"
              :active-value="1"
              active-text="是"
              inactive-text="否"
              :inactive-value="0"
            >
            </el-switch>
            <el-input
              v-if="formData.switchLimit == 1"
              class="limits"
              :min="1"
              type="number"
              @blur="changeLimits"
              v-model.number="formData.limits" 
              placeholder="请输入人数上限"
            ></el-input>
        
       
      </el-form-item>
      <el-form-item label="谁可以导出登记结果?">
        <el-radio
          v-model="formData.only_owner_export"
          v-for="(item, index) of categoryList"
          :key="index"
          :label="item.status"
          >{{ item.name }}</el-radio
        >
      </el-form-item>
      
      <el-form-item label="定时自动创建登记薄">
        <el-switch
          v-model="formData.autorecord"
          active-color="#13ce66"
          :active-value="1"
          active-text="是"
          inactive-text="否"
          :inactive-value="0"
        >
        </el-switch>

        <el-popover
          placement="top-start"
          title="定时登记薄"
          width="300"
          trigger="hover"
          content="在指定的时间平台自动创建一份同样的登记薄，常用的应用场景包括：每日工作记录、门口出入登记薄等周期性的登记工作。"
        >
          <span class="taskdetail" slot="reference">定时登记薄说明</span>
        </el-popover>
      </el-form-item>
      <el-form-item v-if="formData.autorecord == 1">
        <el-radio
          v-model="formData.autotype"
          v-for="(item, index) of repeatList"
          :key="index"
          :label="item.status"
          >{{ item.name }}</el-radio
        >
      </el-form-item>
      <el-form-item v-if="formData.autorecord == 1">
        <label
          v-if="formData.autotype == 0" > 每天00:00自动创建 </label>
        <el-checkbox-group
          v-if="formData.autotype == 1"
          v-model="formData.autodays"
        >
          <el-checkbox
            :label="item"
            v-for="(item, index) in weekdays"
            :key="index"
          ></el-checkbox>
        </el-checkbox-group>
        <el-checkbox-group
          v-if="formData.autotype == 2"
          v-model="formData.autodays"
        >
          <el-checkbox
            :label="item"
            v-for="(item, index) in 28"
            :key="index"
          ></el-checkbox>
          <el-checkbox label="每月最后一天"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel" :loading="isLoading"> 
         {{leftbtn}}
         </el-button>
        <el-button type="success" :loading="isLoading" @click="submitForm">{{
          type == "add" ? "发布" : "修改"
        }}</el-button>
      </el-form-item>
    </el-form>
    </el-col>
    <el-col  :span="8">
      <div class="tips">
          <strong style="color: #ff8000">登记薄应用场合:</strong>
          <div>登记薄的使命是快速、高效的代替传统的纸质登记。灵活的自定义表头能满足一切传统纸质登记场景，如门卫登记、消毒登记、常住人口登记等</div>
          <br/> 
          <strong style="color: #ff8000">特点:</strong>
          <div>
            1、<strong>每个登记薄都会生成一个二维码，可下载打印、张贴供别人扫码登记</strong> 
          </div>
          <div>2、<strong>支持微信及吉维尼APP扫码登记</strong> </div>
          <div>
            3、<strong>支持自定义登记薄表头</strong> 
          </div>
          <div>
            4、<strong>登记结果可以导出为excel：</strong>可以在电脑端导出、也可以在APP或者微信小程序中导出，在APP或者微信小程序中导出时，支持打开或者转发给微信好友。
          </div> 
        </div>
         <br/>
         <div class="tips">
          <strong style="color: #ff8000">登记薄功能说明:</strong>
          <div>
             1、<strong>是否公开用户登记情况：</strong> 选择"是"之后，所有人都可以看到登记结果。敏感信息登记、预期登记人员很多时，建议选择"否"，。
            </div> 
            <div>
             2、<strong>在APP或者小程序中展示：</strong> 选择"是"之后，该登记薄将在APP和微信小程序中展示，用户可以点击进入，如果选择"否"，则该登记薄不在APP或者微信小程序中展示，但仍可以使用扫码的方式在APP或者微信小程序中进行登记。
             如小区的门卫登记，就可以选择"否",仅供小区出入人员扫码登记。
            </div> 
            <div>
             3、<strong>要求用户先登记：</strong> 选择"是"之后，用户在登记之前必须先进行登录。
            </div> 
            <div>
             4、<strong>定时登记薄：</strong> 选择"是"之后，平台会在您指定的时间自动创建与本登记薄(正本)同样的登记薄(副本)，用户扫登记薄(正本)的二维码时，可以自动去最新的副本中进行登记，如门卫登记可以创建定时登记薄，每天创建新登记薄，使用一个二维码，这样二维码不需要每天更换，登记薄也可以按天分类。
            </div> 
        </div>
    </el-col>
    </el-row>

    <el-dialog
      title="编辑列"
      :visible.sync="editColumn"
      width="600px"
      :modal="false"
    >
      <div class="addcolumns">
        <div class="addholder">
        <input
          placeholder="新列名"
          maxlength="128"
          focus="ture"
          v-model="current.label"
          class="newname"
          @confirm="addNewName"
        />
        
        <div 
          class="properties"
        >
          <el-checkbox
            v-model="current.required"
            :true-label="1"
            color="#FF8000" 
            label="必填"
         ></el-checkbox>

          <el-checkbox
            v-model="current.type"
            true-label="number"
            color="#FF8000"
            :checked="current.type == 'number'"
            label="数字类型"
          ></el-checkbox>
          <el-checkbox
           v-model="current.action[0]"
            true-label="sum"
            color="#FF8000"
            :checked="current.action[0] == 'sum'"
            label="自动求和"
          ></el-checkbox>
          <el-checkbox
          v-model="current.action[1]"
            true-label="autoincrease"
            color="#FF8000"
            :checked="current.action[1] == 'autoincrease'"
            label="自增(从1开始)"
          ></el-checkbox>
        </div>
        <el-button type="success" @click="addNewName" >添加列<i class="el-icon-plus el-icon--right"></i></el-button>
       </div>
        <div class="tags">
          <div class="tagstitle">已添加的列：</div>
          <div class="tagmain">
            <div class="addedtag" v-for="(item, index) in extras" :key="index">
              <div>{{ item.label }}</div>
              <el-image
                :src="require('@/assets/img/guanbi.png')"
                class="tagclose"
                @click="deleteColumns(index)"
              />
            </div>
          </div>
        </div>
        <div class="tags">
          <div class="tagstitle">快速添加列：</div>
          <div class="tagmain">
            <div
              @click="fastAddNew(index)"
              class="tag"
              v-for="(item, index) in tags"
              :key="index"
            >
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
        <div class="tips">
          <div class="title">
            <el-image :src="require('@/assets/img/tishi.png')" class="tishi" />
            <span>说明:</span>
          </div>
          <div class="appraisetxt">1、勾选必填后，登记时，该列为必填项。</div>
          <div class="appraisetxt">2、自动求和仅对数字类型的列有效。</div>
          <div class="appraisetxt">
            3、自增列在结束登记时，按照登记时间进行编号。
          </div>
        </div>
      </div>
    </el-dialog>
  </main>
</template>

<script>
import { postRecords, getRecords  } from "@/api/record"; 
export default {
  name: "records-edit",
  data() {
    return {
      checkgroups:["必填", "", "", "自增(从1开始)"],
      editColumn: false,
      value: 0,
      leftbtn:"存草稿",
      tableList: [],
      current: {
        label: "",
        type: "string",
        required: 0,
        action: ["", ""], // 从1开始自增
        index: 0,
        checked: [],
      },
      weekdays: [
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期天",
      ],

      columns: [
        {
          label: "序号(自增)",
          type: "string",
          required: 1,
          action: ["", "autoincrease"], // 从1开始自增
        },
        {
          label: "姓名",
          type: "string",
          required: 1,
          action: ["", ""],
        },
        {
          label: "电话",
          type: "string",
          required: 1,
          action: ["", ""],
        },
      ],
      type: "add",
      formData: {
        autorecord:0,
        method: "create",
        title: "",
        category: 0,
        weekdays: [],
        autodays: [],
        time: "00:00",
        autotype: 0,
        switchLimit:0,
        only_owner_export: 1,
        available_appside:1
      },
      isLoading: false,
      rules: {
        title: [{ required: true, message: "请输入登记标题", trigger: "blur" }],
        money: [{ required: true, message: "请输入费用单价", trigger: "blur" }],
        extras: [
          {
            required: true,
            message: "表格至少保证包含一列",
            trigger: "blur",
          },
        ],
      },
      repeatList: [
        {
          name: "每天",
          status: 0,
        },
        {
          name: "每周",
          status: 1,
        },
        {
          name: "每月",
          status: 2,
        },
      ],
      extras: [
        {
          label: "序号(自增)",
          type: "string",
          required: 1,
          action: ["", "autoincrease"], // 从1开始自增
        },{
          label: "姓名",
          type: "string",
          required: 1,
          action: ["", ""],
        },
        {
          label: "电话",
          type: "string",
          required: 1,
          action: ["", ""],
        },
      ],
      tags: [
        {
          label: "序号(自增)",
          type: "string",
          required: 1,
          action: ["", "autoincrease"], // 从1开始自增
        },
        {
          label: "房号",
          type: "string",
          required: 1,
          action: ["", ""],
        },
        {
          label: "姓名",
          type: "string",
          required: 1,
          action: ["", ""],
        },
        {
          label: "联系电话",
          type: "string",
          required: 1,
          action: ["", ""],
        },
        {
          label: "金额",
          type: "number",
          required: 0,
          action: ["sum", ""],
        },
        {
          label: "日期",
          type: "string",
          required: 0,
          action: ["", ""],
        },
        {
          label: "备注",
          type: "string",
          required: 0,
          action: ["", ""],
        },
      ],
      categoryList: [
        {
          name: "只有我",
          status: 1,
        },
        {
          name: "本物业所有员工",
          status: 2,
        },
        {
          name: "所有人",
          status: 0,
        },
      ],
    };
  },
  watch: {
    $route() {
      console.log(11111111111111111)
      if (this.$route.query.uuid) {
        this.type = "put";
        this.queryDetail();
      } else {
        this.type = "add";
        this.formData = {
          method: "create",
          title: "",
          category: 0,
          money: 10,
          unit: "",
          switchLimit:0,
        };
      }
    },
  },
  created() {
      console.log(2222222222222222222)

    if (this.$route.query.uuid) {
      this.type = "put";
      this.queryDetail(); 
    }
  },
  methods: {
    changeLimits(){
      if (this.formData.limits < 1){
        this.$notify({
          type:"error",
          title:"输入错误",
          message:"人数上限不能小于1" 
        })
        this.formData.limits = 1
      }
    },
    deleteColumns(index) {
      this.extras.splice(index, 1);
    },
    checkboxConvert(){
      console.log(this.checkgroups)
       if(this.current.type == "number"){
         this.checkgroups[1] = "数字类型"
       }
       else{
         //Vue.set(this.checkgroups, 1, "")
       }
       if(this.current.action[0] == 'sum'){
         this.checkgroups[2] = "自动求和"
       }
        console.log(this.current)
       
    },
    fastAddNew(index) {
      this.current.label = this.tags[index].label;
      this.current.type = this.tags[index].type;
      this.current.required = this.tags[index].required;
      this.current.action = this.tags[index].action;
      this.checkboxConvert()
    },
   
    addNewName() {
      let tmp = this.current;
      this.extras.push(tmp);
      this.initCurentRecord()
    },
    initCurentRecord(){
      this.current = {
        label: "",
        type: "string",
        required: 1,
        action: ["", ""], //
        index: 0,
      }; 
    },
    handleAddColumn() {
      this.editColumn = true;
    },
    handleDeleteColumn(index) {
      this.extras.splice(index, 1)
    },
    queryDetail() {
      getRecords({
        uuid: this.$route.query.uuid,
        communityuuid: localStorage.getItem("communityuuid"),
      }).then(({ data: { status, msg } }) => {
        if (status === 0) {
          this.formData = { ...msg,switchLimit:0 };
          if (msg.limits >0){
            this.formData.switchLimit = 1
          }
          this.extras = msg.extra
          this.formData["method"] = "put"; 
          if(this.formData.status == 2){
            this.leftbtn =   "重启登记"  
          }
          else{
            this.leftbtn =   "停止登记"  
          }
        }
      });
    },
    submitForm() {
      this.$refs["product-form"].validate((e) => {
        if (!e) {
          return false;
        }
        this.isLoading = true;
        this[`postRecord`]();
      });
    },
    postRecord() {
      console.log(this.formData)
      let data = {
        ...this.formData,
        extra: JSON.stringify(this.extras),
        communityuuid: localStorage.getItem("communityuuid"),
      }
      if (this.formData.switchLimit == 0){
        data['limits'] = 0
      }
      data.autodays = JSON.stringify(this.formData.autodays)
      postRecords(data)
        .then(({ data: { status, msg } }) => {
          if (status == 0) {
            let  message = "发布成功,可到微信小程序，APP中查看"
            if (this.type == "put"){
              message = "已修改"
            }
            this.$notify({
              title: msg,
              message: message,
              type: "success",
            });
          } else {
            let  message = "发布失败"
            if (this.type == "put"){
              message = "修改失败"
            }
            this.$notify({
              title: message,
              message: msg,
              type: "error",
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    cancel() {
      this.isLoading = true;
      this.formData.status = 0 // 草稿
      if (this.type == 'put'){
        if(this.formData.status == 2){
          this.formData.status = 1 // 重启
        }
        else{
          this.formData.status = 2 // 停止登记
        }
        
      }
      this.postRecord()
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~@/styles/variables.scss";
.edit-record { 
  .el-select {
    width: 100%;
  }
  .limits{
    width:170px;
  }
  .flex{
    display: flex;
  }
  .addcolumns { 
    .addholder{
      text-align: center;
       .el-icon--right{
        color:white;
      }
      .btn-add-new { 
      width: 180px;
      display: flex;
      border-radius: 10px;
      background-color: $base-color;
      color: white;
     
    } 
    }
	.properties{
		margin-top:15px;
		margin-bottom: 15px;
	}
    .tags {
		margin-bottom: 30px;
		.tagstitle{
			color:$base-color;
			font-size: 14px;
		}
		.tagmain{
			display: flex; 
			flex-flow: wrap;
		
			.addedtag{
        display: flex; 
				margin: 5px 0px; 
				border: 1px solid $border-color-light;
				border-radius: 15px;
				text-align: center;
        	.tagclose{
            margin-left:10px; 
            margin-right:5px;
            height: 20px;
            width: 20px;
          }
			}
			.tag {
				margin: 5px 0px;
				width: 100px;
				border: 1px solid $border-color-light;
				border-radius: 15px;
				text-align: center;
			}
	    }
    }
    .close {
      position: absolute;
      top: 10px;
      right: 10px;
      height: 50px;
      width: 50px;
    }
    
    .newname {
       border-top:none !important;
       border-left:none !important;
       border-right:none !important;
      border-bottom: 2px solid $base-color; 
      width: 200px;
      font-size: 18px; 
      text-align: center;
      
    }
    .newname:focus {
       outline: none;  
    }
    
  }
  .column {
    margin-right: 15px;
  }
  .el-icon-delete {
    color: #d81e06;
    cursor: pointer;
  }
  .addcolumn {
    color: #ff8000;
     cursor: pointer;
  }
  .el-icon-plus {
    color: #ff8000;
    font-weight: bold;
    cursor: pointer;
  }
  .taskdetail {
    margin-left: 5px;
    color: $base-color; 
  }
  .imgtishi {
    width: 15px;
    height: 15px; 
  }
}
</style>
