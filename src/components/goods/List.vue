<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="110px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">{{scope.row.add_time|dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10,15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total,sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 修改商品的对话框 -->
      <!-- <el-dialog
        @close="editDialogClosed"
        title="修改商品"
        :visible.sync="editDialogVisible"
        width="50%"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>-->
    </el-card>
  </div>
</template>

<script>
	export default {
		data() {
			return {
				// 查询对象
				queryInfo: {
					query: '',
					pagenum: 1, // 当前page
					pagesize: 10 // 每页显示条数
				},
				// 商品列表
				goodsList: [],
				// 总数据条数
				total: 0
			}
		},
		created() {
			this.getGoodsList()
		},
		methods: {
			// 根据分页获取对应的商品列表
			async getGoodsList() {
				const { data: res } = await this.$http.get('goods', {
					params: this.queryInfo
				})
				if (res.meta.status !== 200) {
					return this.$message.error('获取商品列表失败！')
				}
				this.goodsList = res.data.goods
				this.total = res.data.total
				// console.log(this.goodsList)
			},

			// 监听 pageSize改变的事件
			handleSizeChange(pagesize) {
				this.queryInfo.pagesize = pagesize
				this.getGoodsList()
			},
			// 监听 pagenum页码值改变的事件
			handleCurrentChange(pagenum) {
				this.queryInfo.pagenum = pagenum
				this.getGoodsList()
			},

			// 根据Id删除对应的商品信息
			async removeGoodById(goods_id) {
				const confirmResult = await this.$confirm(
					'此操作将永久删除该商品, 是否继续?',
					'提示',
					{
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}
				).catch((err) => err)
				// 如果用户确认删除，返回值为字符串 confirm
				// 如果用户取消删除，返回值为字符串 cancel
				if (confirmResult !== 'confirm') {
					return this.$message.info('已取消删除')
				}
				const { data: res } = await this.$http.delete(`goods/${goods_id}`)
				// console.log(res)
				if (res.meta.status !== 200) {
					return this.$message.error('删除商品失败！')
				}
				this.getGoodsList()
				this.$message.success('删除商品成功！')
			},
			// 点击跳转添加商品页面
			goAddpage() {
				this.$router.push('/goods/add')
			}
		}
	}
</script>

<style lang="less" scoped>
	.el-table {
		margin-bottom: 10px;
	}
</style>