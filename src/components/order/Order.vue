<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片面板区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row>
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time|dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <!-- 物流按钮 -->
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="40%" @close="addressDialogCloesd">
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.adddress1"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="40%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity,index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
	import cityData from './citydata.js'

	export default {
		data() {
			return {
				queryInfo: {
					query: '',
					pagenum: 1, // 当前page
					pagesize: 10 // 每页显示条数
				},
				// 订单列表
				orderlist: [],
				total: 0,

				//修改地址对话框数据
				addressVisible: false,
				addressForm: {
					address1: [],
					address2: ''
				},
				addressFormRules: {
					address1: [
						{
							required: true,
							message: '请选择省市区/县'
						}
					],
					address2: [
						{
							required: true,
							message: '请填写详细地址'
						}
					]
				},
				cityData,

				// 物流进度对话框数据
				progressVisible: false,
				progressInfo: {}
			}
		},
		created() {
			this.getOrderList()
		},
		methods: {
			// 获取订单列表
			async getOrderList() {
				const { data: res } = await this.$http.get('orders', {
					params: this.queryInfo
				})
				// console.log(res)
				if (res.meta.status !== 200) {
					return this.$message.error('获取订单列表失败！')
				}
				this.orderlist = res.data.goods
				this.total = res.data.total
			},
			// 监听 pageSize改变的事件
			handleSizeChange(pagesize) {
				this.queryInfo.pagesize = pagesize
				this.getOrderList()
			},
			// 监听 pagenum页码值改变的事件
			handleCurrentChange(pagenum) {
				this.queryInfo.pagenum = pagenum
				this.getOrderList()
			},
			// 展示修改地址对话框
			showBox() {
				this.addressVisible = true
			},
			// 监听修改位置对话框关闭
			addressDialogCloesd() {
				this.$refs.addressFormRef.resetFields()
			},
			// 点击显示物流进度
			async showProgressBox() {
				const { data: res } = await this.$http.get('kuaidi/1106975712662')
				console.log(res)
				if (res.meta.status != 200) {
					return this.$message.error('获取物流信息失败！')
				}
				this.progressInfo = res.data
				// console.log(this.progressInfo)
				this.progressVisible = true
			}
		}
	}
</script>

<style lang="less" scoped>
	.el-table {
		margin-bottom: 10px;
	}
</style>