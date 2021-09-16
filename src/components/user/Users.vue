<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片面板区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisiable=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip content="设置用户权限" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total,sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisiable" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog @close="editDialogClosed" title="修改用户" :visible.sync="editDialogVisible" width="50%">
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
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配用户" :visible.sync="setRoleVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
	export default {
		data() {
			// 验证邮箱的规则
			var checkEmail = (rule, value, cb) => {
				const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+([a-zA-Z0-9_-])+/
				if (regEmail.test(value)) {
					return cb()
				}
				cb(new Error('请输入合法的邮箱'))
			}
			// 验证手机号的规则
			var checkMobile = (rule, value, cb) => {
				const regMobile =
					/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
				if (regMobile.test(value)) {
					return cb()
				}
				cb(new Error('请输入合法的手机号'))
			}
			return {
				queryInfo: {
					query: '',
					pagenum: 1, // 当前page
					pagesize: 2 // 每页显示条数
				},
				userList: [],
				total: 0,
				// 控制添加用户对话框的显示
				addDialogVisiable: false,
				// 添加用户表单数据
				addForm: {
					username: '',
					password: '',
					email: '',
					mobile: ''
				},
				// 添加用户表单规则
				addFormRules: {
					username: [
						{
							required: true,
							message: '请输入用户名',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 10,
							message: '用户名的长度在3~10个字符',
							trigger: 'blur'
						}
					],
					password: [
						{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							min: 6,
							max: 15,
							message: '密码的长度在6~15个字符',
							trigger: 'blur'
						}
					],
					email: [
						{
							required: true,
							message: '请输入邮箱',
							trigger: 'blur'
						},
						{
							validator: checkEmail,
							trigger: 'blur'
						}
					],
					mobile: [
						{
							required: true,
							message: '请输入手机号',
							trigger: 'blur'
						},
						{
							validator: checkMobile,
							trigger: 'blur'
						}
					]
				},
				// 控制修改用户对话框的显示
				editDialogVisible: false,
				// 查询到的用户信息
				editForm: {},
				//  修改表单的验证规则对象
				editFormRules: {
					email: [
						{
							required: true,
							message: '请输入邮箱',
							trigger: 'blur'
						},
						{
							validator: checkEmail,
							trigger: 'blur'
						}
					],
					mobile: [
						{
							required: true,
							message: '请输入手机号',
							trigger: 'blur'
						},
						{
							validator: checkMobile,
							trigger: 'blur'
						}
					]
				},
				// 控制分配角色对话框的显示与隐藏
				setRoleVisible: false,
				// 需要被分配角色的用户信息
				userInfo: {},
				// 所有角色的数据列表
				rolesList: [],
				// 已选中的角色Id值
				selectedRoleId: ''
			}
		},
		created() {
			this.getUserList()
		},
		methods: {
			// 获取用户列表
			async getUserList() {
				const { data: res } = await this.$http.get('users', {
					params: this.queryInfo
				})
				if (res.meta.status !== 200) {
					return this.$message.error('获取用户列表失败！')
				}
				this.userList = res.data.users
				this.total = res.data.total
				// console.log(this.userList)
			},
			// 监听 pagesize改变的事件
			handleSizeChange(pagesize) {
				this.queryInfo.pagesize = pagesize
				this.getUserList()
			},
			// 监听 pagenum页码值改变的事件
			handleCurrentChange(pagenum) {
				this.queryInfo.pagenum = pagenum
				this.getUserList()
			},
			// 改变用户状态
			async userStateChanged(userInfo) {
				const { data: res } = await this.$http.put(
					`users/${userInfo.id}/state/${userInfo.mg_state}`
				)
				if (res.meta.status !== 200) {
					userInfo.mg_state = !userInfo.mg_state
					return this.$message.error('更新用户状态失败！')
				}
				this.$message.success('更新用户状态成功！')
			},
			// 监听 添加用户对话框关闭事件
			addDialogClosed() {
				this.$refs.addFormRef.resetFields()
			},
			// 点击按钮，添加新用户
			addUser() {
				this.$refs.addFormRef.validate(async (valid) => {
					if (!valid) return
					const { data: res } = await this.$http.post('users', this.addForm)
					if (res.meta.status !== 201) {
						this.$message.error('添加用户失败！')
					}
					this.$message.success('添加用户成功！')
					// 隐藏添加用户的对话框
					this.addDialogVisiable = false
					// 重新刷新用户列表
					this.getUserList()
				})
			},
			// 展示编辑用户对话框
			async showEditDialog(id) {
				const { data: res } = await this.$http.get('users/' + id)
				if (res.meta.status !== 200) {
					return this.$message.error('查询用户信息失败！')
				}
				// this.$message.success('查询用户信息成功')
				this.editForm = res.data
				this.editDialogVisible = true
				console.log(this.editForm)
			},
			// 监听修改用户对话框的关闭
			editDialogClosed() {
				this.$refs.editFormRef.resetFields()
			},
			// 修改用户信息并提交
			editUserInfo() {
				this.$refs.editFormRef.validate(async (validate) => {
					if (!validate) return
					// 发起修改用户请求
					const { data: res } = await this.$http.put(
						'users/' + this.editForm.id,
						{
							email: this.editForm.email,
							mobile: this.editForm.mobile
						}
					)
					// 提示更新用户数据失败
					if (res.meta.status !== 200) {
						return this.$message.error('更新用户信息失败！')
					}
					// 关闭对话框
					this.editDialogVisible = false
					// 刷新数据列表
					this.getUserList()
					// 提示更新用户成功
					this.$message.success('更新用户信息成功')
				})
			},
			// 根据Id删除对应的用户信息
			async removeUserById(id) {
				const confirmResult = await this.$confirm(
					'此操作将永久删除该用户, 是否继续?',
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
				const { data: res } = await this.$http.delete('users/' + id)
				if (res.meta.status !== 200) {
					return this.$message.error('删除用户失败！')
				}
				this.queryInfo.pagenum = Math.floor(
					(this.total - 1) / this.queryInfo.pagesize
				)
				this.getUserList()
				this.$message.success('删除用户成功！')
			},
			// 展示分配角色的对话框
			async setRole(userInfo) {
				this.userInfo = userInfo

				// 在展示对话框之前获取所有角色的列表
				const { data: res } = await this.$http.get('roles')
				if (res.meta.status !== 200) {
					return this.$message.error('获取角色列表失败!')
				}
				this.rolesList = res.data
				this.setRoleVisible = true
			},
			// 点击按钮,分配角色
			async saveRoleInfo() {
				if (!this.selectedRoleId) {
					return this.$message.error('请选择要分配的角色!')
				}
				const { data: res } = await this.$http.put(
					`users/${this.userInfo.id}/role`,
					{
						rid: this.selectedRoleId
					}
				)
				console.log(res)
				if (res.meta.status !== 200) {
					return this.$message.error('更新角色失败!')
				}

				this.$message.success('更新角色成功!')
				this.getUserList()
				this.setRoleVisible = false
			},
			// 监听分配角色对话框的关闭事件
			setRoleDialogClosed() {
				;(this.selectedRoleId = ''), (this.userInfo = '')
			}
		}
	}
</script>

<style lang="less">
	.el-table {
		margin-bottom: 10px;
	}
</style>
