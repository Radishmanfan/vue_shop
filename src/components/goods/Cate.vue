<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-success" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total,sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      @close="addCateDialogClosed"
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            clearable
            change-on-select
            :collapse-tags="true"
            v-model="selectedKeys"
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改商品分类信息的对话框 -->
    <el-dialog @close="editDialogClosed" title="修改分类" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" ref="editFormRef" label-width="80px" :rules="editFormRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
	export default {
		data() {
			return {
				// 查询条件
				querInfo: {
					type: 3,
					pagenum: 1, //当前页码
					pagesize: 5 //每页显示显示条数
				},
				// 商品分类的数据列表,默认为空
				catelist: [],
				// 总数据条数
				total: 0,
				// 为table指定列的定义
				columns: [
					{
						label: '分类名称',
						prop: 'cat_name'
					},
					{
						label: '是否有效',
						// 表示将当前列定义为模板列
						type: 'template',
						// 表示当前这一列使用的模板名称
						template: 'isok'
					},
					{
						label: '排序',
						type: 'template',
						// 表示当前这一列使用的模板名称
						template: 'order'
					},
					{
						label: '操作',
						type: 'template',
						// 表示当前这一列使用的模板名称
						template: 'opt'
					}
				],
				// 控制添加分类对话框的显示与隐藏
				addCateDialogVisible: false,
				// 添加分类的表单数据对象
				addCateForm: {
					// 将要添加的分类名称
					cat_name: '',
					// 父级分类的Id
					cat_pid: 0,
					// 分类层级 ,默认添加1级分类
					cat_level: 0
				},
				// 添加分类表单的验证规则
				addCateFormRules: {
					cat_name: [
						{
							required: true,
							message: '请输入分类名称',
							trigger: 'blur'
						}
					]
				},
				// 父级分类的数据列表
				parentCateList: [],
				// 指定级联选择器的配置对象
				cascaderProps: {
					value: 'cat_id',
					label: 'cat_name',
					children: 'children'
				},
				// 选中的父级分类的Id数组
				selectedKeys: [],
				// 控制修改商品分类信息对话框的显示
				editDialogVisible: false,
				editForm: {},
				// 编辑分类信息规则
				editFormRules: {
					cat_name: [
						{
							required: true,
							message: '请输入分类信息名称',
							trigger: 'blur'
						}
					]
				}
			}
		},
		created() {
			this.getCateList()
		},
		methods: {
			// 获取商品分类信息
			async getCateList() {
				const { data: res } = await this.$http.get('categories', {
					params: this.querInfo
				})
				if (res.meta.status !== 200) {
					return this.$message.error('获取商品分类失败!')
				}
				// 把数据列表赋值给catelist
				this.catelist = res.data.result
				// 为总数居条数赋值
				this.total = res.data.total
				// console.log(res.data)
			},
			// 监听pagesize改变
			handleSizeChange(newSize) {
				this.querInfo.pagesize = newSize
				this.getCateList()
			},
			// 监听pagenum改变
			handleCurrentChange(newPage) {
				this.querInfo.pagenum = newPage
				this.getCateList()
			},
			// 点击按钮,展示添加分类对话框
			showAddCateDialog() {
				// 先获取父级分类的数据列表
				this.getParentCateList()
				// 再展示处对话框
				this.addCateDialogVisible = true
			},
			// 获取父级分类的数据列表
			async getParentCateList() {
				const { data: res } = await this.$http.get('categories', {
					params: {
						type: 2
					}
				})
				if (res.meta.status !== 200) {
					return this.$message.error('获取父级分类数据失败!')
				}
				// console.log(res.data)
				this.parentCateList = res.data
			},
			// 选择项发生变化触发的函数
			parentCateChange() {
				console.log(this.selectedKeys)
				// 如果selectedKeys.length>0,说明选中父级分类
				// 反之没有选中任何父级分类
				if (this.selectedKeys.length > 0) {
					// 父级分类的Id
					this.addCateForm.cat_pid =
						this.selectedKeys[this.selectedKeys.length - 1]
					// 为当前分类的等级赋值
					this.addCateForm.cat_level = this.selectedKeys.length
					return
				} else {
					// 父级分类的Id
					this.addCateForm.cat_pid = 0
					// 为当前分类的等级赋值
					this.addCateForm.cat_level = 0
					return
				}
			},
			// 点击按钮,添加分类
			addCate() {
				this.$refs.addCateFormRef.validate(async (valid) => {
					if (!valid) return
					const { data: res } = await this.$http.post(
						'categories',
						this.addCateForm
					)

					if (res.meta.status !== 201) {
						return this.$message.error('添加分类失败!')
					}
					this.$message.success('添加分类成功!')
					this.getCateList()
					this.addCateDialogVisible = false
				})
			},
			// 监听添加分类对话框的关闭
			addCateDialogClosed() {
				this.$refs.addCateFormRef.resetFields()
				this.selectedKeys = []
				this.addCateForm.cat_level = 0
				this.addCateForm.cat_pid = 0
			},
			// 展示编辑商品分类名称对话框
			async showEditDialog(cat_id) {
				// 根据Id查询对应类别的信息
				// console.log(cat_id)
				const { data: res } = await this.$http.get('categories/' + cat_id)
				if (res.meta.status !== 200) {
					return this.$message.error('查询商品类别失败！')
				}
				// this.$message.success('查询商品类别信息成功')
				this.editForm = res.data
				this.editDialogVisible = true
			},
			// 监听修改商品分类信息对话框的关闭
			editDialogClosed() {
				this.$refs.editFormRef.resetFields()
			},
			// 修改商品分类信息并提交
			editCateInfo() {
				this.$refs.editFormRef.validate(async (validate) => {
					if (!validate) return
					// 发起修改分类信息请求
					const { data: res } = await this.$http.put(
						'categories/' + this.editForm.cat_id,
						{
							cat_name: this.editForm.cat_name
						}
					)
					// console.log(res)
					// 提示更新角色数据失败
					if (res.meta.status !== 200) {
						return this.$message.error('更新角色信息失败！')
					}
					// 关闭对话框
					this.editDialogVisible = false
					// 刷新数据列表
					this.getCateList()
					// 提示更新角色成功
					this.$message.success('更新角色信息成功')
				})
			},
			//更具Id删除对应分类信息
			async removeCateById(cat_id) {
				const confirmResult = await this.$confirm(
					'此操作将永久删除该分类, 是否继续?',
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
				const { data: res } = await this.$http.delete('categories/' + cat_id)
				if (res.meta.status !== 200) {
					return this.$message.error('删除分类失败！')
				}
				this.getCateList()
				this.$message.success('删除分类成功！')
			}
		}
	}
</script>

<style lang="less" scoped>
	.treeTable {
		margin-top: 15px;
	}

	// .el-cascader {
	// 	width: 100%;
	// }
</style>