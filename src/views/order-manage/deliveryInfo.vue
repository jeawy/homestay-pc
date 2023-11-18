<template>
	<div id="deliveryInfo">
		<!-- 订单列表 -->

		<el-row type="flex" justify="space-between">
			<el-form inline>
				<el-form-item>
					<el-select
						v-model="queryForm.status"
						placeholder="请选择"
						filterable
					>
						<el-option
							v-for="(item, index) in columnSelect"
							:key="index"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button-group>
						<el-button type="primary" @click="getOrders()"
							>查询</el-button
						>
						<el-button type="primary" plain @click="resetQuery()"
							>重置</el-button
						>
					</el-button-group>
				</el-form-item>
			</el-form>
			<el-form inline>
				<el-form-item>
					<el-button
						type="danger"
						icon="el-icon-delete"
						:disabled="!multipleSelection.length"
						plain
						@click="handleDelete(multipleSelection)"
						>删除</el-button
					>
				</el-form-item>
			</el-form>
		</el-row>

		<el-table
			v-loading="isLoading"
			:data="orderList"
			:stripe="true"
			highlight-current-row
			row-class-name="hover"
			@select-all="handleSelectionChange"
			@select="handleSelectionChange"
		>
			>
			<el-table-column type="expand">
				<template slot-scope="{ row }">
					<el-form
						v-for="item of row.rules"
						:key="item.aunty_id"
						inline
						label-position="left"
						class="detail-form"
					>
						<el-form-item>
							<el-avatar
								:size="40"
								:src="baseUrl + item.thumbnail_portait"
							>
								<el-image
									:src="require('@/assets/img/dft.png')"
								></el-image>
							</el-avatar>
						</el-form-item>
						<el-form-item label="产品名称">
							<span>{{ item.product_title }}</span>
						</el-form-item>
						<el-form-item label="规格名称">
							<span>{{ item.rule_title }}</span>
						</el-form-item>
						<el-form-item label="单价">
							<span>{{
								moneyFomat(null, null, item.price)
							}}</span>
						</el-form-item>
						<el-form-item label="数量">
							<span>{{ item.num }}</span>
						</el-form-item>
						<el-form-item label="阿姨名字">
							<span>{{ item.username }}</span>
						</el-form-item>
						<el-form-item label="性别">
							<span>{{ item.sex }}</span>
						</el-form-item>
						<el-form-item label="年龄">
							<span>{{ item.age }}</span>
						</el-form-item>
					</el-form>
				</template>
			</el-table-column>
			<el-table-column type="selection" align="center" width="56">
			</el-table-column>
			<el-table-column prop="no" label="订单号"></el-table-column>
			<el-table-column
				prop="money"
				label="订单金额"
				:formatter="moneyFomat"
			></el-table-column>
			<el-table-column
				prop="payed_money"
				label="支付金额"
				:formatter="moneyFomat"
			></el-table-column>
			<el-table-column prop="pay_way" label="支付方式"></el-table-column>
			<el-table-column
				prop="status"
				label="订单状态"
				:formatter="statusFomat"
			></el-table-column>
			<el-table-column
				prop="owner.username"
				label="订单归属人"
			></el-table-column>
			<el-table-column
				prop="date"
				:formatter="dateForm"
				label="订单产生日期"
			></el-table-column>
			<el-table-column width="80" align="center" label="操作">
				<template slot-scope="{ row }">
					<el-tooltip effect="dark" content="删除" placement="top">
						<el-link
							:underline="false"
							icon="el-icon-delete"
							type="danger"
							@click="handleDelete(row.id)"
						></el-link>
					</el-tooltip>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
import { queryOrderList, deleteOrder } from "@/api/order";
import dayjs from "dayjs";
export default {
	data() {
		return {
			queryForm: {},
			isLoading: false,
			baseUrl: process.env.VUE_APP_BASE_API.replace("/api", ""),
			columnSelect: [
				{
					label: "已提交，未支付",
					value: 0
				},
				{
					label: "已支付/进行中",
					value: 1
				},
				{
					label: "已完成",
					value: 3
				},
				{
					label: "已评价",
					value: 6
				}
			],
			orderList: [],

			dialogShow: false,
			multipleSelection: []
		};
	},
	created() {
		this.getOrders();
	},
	methods: {
		// 删除和批量删除
		async handleDelete(ids) {
			await this.$confirm("确定删除?", {
				type: "warning"
			});
			if (Array.isArray(ids)) {
				ids = ids.join();
			}
			deleteOrder({ method: "delete", ids }).then(
				({ data: { status, msg } }) => {
					this.$message(msg);
					if (status === 0) {
						this.getOrders();
					}
				}
			);
		},
		//  table选择
		handleSelectionChange(selection) {
			this.multipleSelection = selection.map(({ id }) => id);
		},
		moneyFomat(row, col, val) {
			if (val == null) {
				return "";
			}
			return val.toLocaleString(undefined, "currency");
		},
		statusFomat(row, col, val) {
			const res = this.columnSelect.find(e=>e.value==val)
            return res?res.label : null
			//return this.columnSelect.find(e => e.value == val)?.label;
		},
		dateForm(row, col, val) {
			return dayjs(val * 1000).format("YYYY-MM-DD HH:ss");
		},
		getOrders() {
			this.isLoading = true;
			queryOrderList(this.queryForm)
				.then(({ data: { status, msg } }) => {
					if (status === 0) {
						this.orderList = msg;
					}
				})
				.finally(() => {
					this.isLoading = false;
				});
		},
		resetQuery() {
			this.queryForm = {};
			this.getOrders();
		}
	}
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
