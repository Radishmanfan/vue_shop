<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片列表 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数!" type="warning" :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <!-- options为数据源指定属性 -->
          <el-cascader
            expand-trigger="hover"
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <div class="el-table-expand">
                  <!-- 循环渲染Tag标签 -->
                  <el-tag
                    closable
                    @close="handleClose(index,scope.row)"
                    v-for="(item,index) in scope.row.attr_vals"
                    :key="index"
                  >{{item}}</el-tag>
                  <!-- 输入的文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                  >+ New Tag</el-button>
                </div>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" stripe border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <div class="el-table-expand">
                  <!-- 循环渲染Tag标签 -->
                  <el-tag
                    closable
                    @close="handleClose(index,scope.row)"
                    v-for="(item,index) in scope.row.attr_vals"
                    :key="index"
                  >{{item}}</el-tag>
                  <!-- 输入的文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                  >+ New Tag</el-button>
                </div>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
	export default {
		data() {
			// 商品分类列表
			return {
				cateList: [],
				// 级联选择框的配置对象
				cateProps: {
					value: 'cat_id',
					label: 'cat_name',
					children: 'children'
				},
				// 级联选择框双向绑定的数组
				selectedCateKeys: [],
				// 被激活页签名称
				activeName: 'many',
				// 动态参数的数据
				manyTableData: [],
				//静态参数的数据
				onlyTableData: [],
				// 控制添加对话框的显示与隐藏
				addDialogVisible: false,
				// 添加参数的表单数据对象
				addForm: {
					attr_name: ''
				},
				// 添加表单的验证规则对象
				addFormRules: {
					attr_name: [
						{
							required: true,
							message: '请输入参数名称',
							trigger: 'blur'
						}
					]
				},
				// 控制修改对话框的显示与隐藏
				editDialogVisible: false,
				// 修改参数的表单数据对象
				editForm: {},
				// 修改表单的验证规则对象
				editFormRules: {
					attr_name: [
						{
							required: true,
							message: '请输入参数名称',
							trigger: 'blur'
						}
					]
				}
				// // 控制按钮与文本框的隐藏于显示
				// inputVisible: false,
				// // 文本框中输入的内容
				// inputValue: ''
			}
		},
		created() {
			this.getCateList()
		},
		methods: {
			// 获取所有的商品分类列表
			async getCateList() {
				const { data: res } = await this.$http.get('categories')
				if (res.meta.status !== 200) {
					return this.$message.error('获取商品分类失败！')
				}
				this.cateList = res.data
				// console.log(this.cateList)
			},
			// 级联选择框选中项变化会触发这个函数
			async handleChange() {
				this.getParamsData()
			},
			// tab页签点击事件处理函数
			handleTabClick() {
				this.getParamsData()
			},
			//获取参数的列表数据
			async getParamsData() {
				// 证明选中的不是三级分类
				if (this.selectedCateKeys.length !== 3) {
					this.selectedCateKeys = []
					this.manyTableData = []
					this.onlyTableData = []
					return
				}
				// console.log(this.selectedCateKeys)
				// 根据所选分类的Id和当前所处的面板，获取对应的参数
				const { data: res } = await this.$http.get(
					`categories/${this.cateId}/attributes`,
					{
						params: {
							sel: this.activeName
						}
					}
				)
				if (res.meta.status !== 200) {
					return this.$message.error('获取参数列表失败！')
				}
				res.data.forEach((item) => {
					item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
					// 控制文本框的显示与隐藏
					item.inputVisible = false
					// 文本框中输入的值
					item.inputValue = ''
				})
				console.log(res.data)
				if (this.activeName === 'many') {
					this.manyTableData = res.data
				} else {
					this.onlyTableData = res.data
				}
			},
			// 监听添加参数对话框的关闭
			addDialogClosed() {
				this.$refs.addFormRef.resetFields()
			},
			// 点击按钮，添加参数
			addParams() {
				this.$refs.addFormRef.validate(async (valid) => {
					if (!valid) return
					const { data: res } = await this.$http.post(
						`categories/${this.cateId}/attributes`,
						{
							attr_name: this.addForm.attr_name,
							attr_sel: this.activeName
						}
					)
					if (res.meta.status !== 201) {
						return this.$message.error('添加参数失败！')
					}
					this.$message.success('添加参数成功！')
					this.addDialogVisible = false
					this.getParamsData()
				})
			},
			// 点击按钮，显示修改参数对话框
			async showEditDialog(attr_id) {
				// console.log(attr_id)
				// 根据Id查询对应角色的信息
				const { data: res } = await this.$http.get(
					`categories/${this.cateId}/attributes/${attr_id}`,
					{
						params: {
							attr_sel: this.activeName
						}
					}
				)
				if (res.meta.status !== 200) {
					return this.$message.error('查询商品参数信息失败！')
				}
				// this.$message.success('查询商品参数信息成功！')
				this.editForm = res.data
				this.editDialogVisible = true
			},
			// 监听修改参数对话框的关闭
			editDialogClosed() {
				this.$refs.editFormRef.resetFields()
			},
			// 点击按钮，根据Id修改参数
			editParams() {
				this.$refs.editFormRef.validate(async (valid) => {
					if (!valid) return
					const { data: res } = await this.$http.put(
						`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
						{
							attr_name: this.editForm.attr_name,
							attr_sel: this.activeName
							// attr_vals:this.
						}
					)
					if (res.meta.status !== 200) {
						return this.$message.error('修改参数失败！')
					}
					this.$message.success('修改参数成功！')
					this.getParamsData()
					this.editDialogVisible = false
				})
			},
			// 点击按钮，根据Id 删除参数
			async removeParamsById(attr_id) {
				const confirmResult = await this.$confirm(
					'此操作将永久删除该参数, 是否继续?',
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
				const { data: res } = await this.$http.delete(
					`categories/${this.cateId}/attributes/${attr_id}`
				)
				console.log(res)
				if (res.meta.status !== 200) {
					return this.$message.error('删除参数失败！')
				}
				this.getParamsData()
				this.$message.success('删除参数成功！')
			},
			// 文本框失去焦点或者按下enter触发的事件
			async handleInputConfirm(row) {
				if (row.inputValue.trim().length === 0) {
					row.inputValue = ''
					row.inputVisible = false
					return
				}
				// 如果没有return，则证明输入的内容需要做后续处理
				// console.log(this.inputValue)
				row.attr_vals.push(row.inputValue.trim())
				row.inputValue = ''
				row.inputVisible = false
				// 发起请求保存操作
				this.saveAttrVals(row)
			},
			// 将对attr_vals的操作保存到数据库
			async saveAttrVals(row) {
				const { data: res } = await this.$http.put(
					`categories/${this.cateId}/attributes/${row.attr_id}`,
					{
						attr_name: row.attr_name,
						attr_sel: row.attr_sel,
						attr_vals: row.attr_vals.join(' ')
					}
				)
				console.log(res)
				if (res.meta.status !== 200) {
					return this.$message.error('修改参数项失败！')
				}
				return this.$message.success('修改参数项成功！')
			},
			// 点击按钮，展示文本输入框
			showInput(row) {
				row.inputVisible = true
				// 让文本框自动获得焦点
				//$nextTick当页面上元素被重新渲染之后再执行回调函数
				this.$nextTick((_) => {
					this.$refs.saveTagInput.$refs.input.focus()
				})
			},
			// 删除对应的参数可选项
			handleClose(i, row) {
				row.attr_vals.splice(i, 1)
				this.saveAttrVals(row)
			}
		},
		computed: {
			isBtnDisabled() {
				if (this.selectedCateKeys.length !== 3) {
					return true
				}
				return false
			},
			// 当前选中的三级分类Id
			cateId() {
				if (this.selectedCateKeys.length === 3) {
					return this.selectedCateKeys[2]
				}
				return null
			},
			// 动态计算标题文本
			titleText() {
				if (this.activeName === 'many') {
					return '动态参数'
				}
				return '静态参数'
			}
		}
	}
</script>

<style lang="less" scoped>
	.cat_opt {
		margin: 15px 0px;
	}
	.el-table-expand {
		margin-left: 4%;
	}
	.el-tag {
		margin-left: 10px;
	}

	.input-new-tag {
		margin-left: 10px;
		width: 120px;
	}

	.button-new-tag {
		margin-left: 10px;
	}
</style>