<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div class="routerLink" @click="back">
        <img class="logo" src="../assets/carrot.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主题区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside
        :width="isCollapse ? '64px' : '180px'"
        @mouseenter.native="isCollapse=false"
        @mouseleave.native="isCollapse=true"
      >
        <!-- <div v-if="!isCollapse" class="toggle-button" @click="toggleCollapse">
          <span style="font-size:20px">&lt;</span>
        </div>-->
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="
            #333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse-transition="false"
          :collapse="isCollapse"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="subItem in item.children"
              :key="subItem.id"
              :index="'/' + subItem.path"
              @click="saveNavState('/' + subItem.path)"
            >
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>{{ subItem.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主题 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
	export default {
		data() {
			return {
				menulist: [],
				iconsObj: {
					125: 'iconfont icon-user',
					103: 'iconfont icon-tijikongjian',
					101: 'iconfont icon-shangpin',
					102: 'iconfont icon-danju',
					145: 'iconfont icon-baobiao'
				},
				isCollapse: true,
				activePath: ''
			}
		},
		created() {
			this.getMenuList()
			this.activePath = window.sessionStorage.getItem('activePath')
		},
		methods: {
			logout() {
				window.sessionStorage.clear()
				this.$router.push('/login')
			},
			// 获取所有菜单
			async getMenuList() {
				const { data: res } = await this.$http.get('menus')
				if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
				this.menulist = res.data
			},
			// 侧边栏折叠
			toggleCollapse() {
				this.isCollapse = !this.isCollapse
			},
			// 保存链接的激活状态到sessionStorge
			saveNavState(activePath) {
				window.sessionStorage.setItem('activePath', activePath)
				this.activePath = activePath
			},
			back() {
				this.isCollapse = true
				window.sessionStorage.setItem('activePath', '')
				this.activePath = ''
				this.$router.push('/welcome')
			}
		}
	}
</script>

<style lang="less" scoped>
	.home-container {
		height: 100%;
	}
	.el-header {
		// box-shadow: 0px 1px 3px #eaedf1;
		z-index: 100;
		background-color: #363d40;
		display: flex;
		justify-content: space-between;
		padding-left: 0px;
		align-items: center;
		color: #fff;
		font-size: 20px;
		.routerLink {
			cursor: pointer;
			display: flex;
			align-items: center;
			text-decoration: none;
			span {
				margin-left: 15px;
				color: #fff;
				font-family: '幼圆';
			}
			.logo {
				margin-left: 15px;
				width: 50px;
				height: 50px;
			}
		}
	}
	.el-aside {
		// 侧边栏折叠动画速度
		transition: width 0.4s;
		-webkit-transition: width 0.4s;
		-moz-transition: width 0.4s;
		-webkit-transition: width 0.4s;
		-o-transition: width 0.4s;
	}
	.el-aside {
		background-color: #333744;
		.toggle-button {
			background-color: #495065;
			height: 30px;
			font-size: 10px;
			color: #fff;
			text-align: center;
			letter-spacing: 0.2em;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.el-menu {
			border-right: none;
			&:first-child {
				margin-top: 20px;
			}
		}
	}

	.el-main {
		overflow-y: hidden;
		background-color: #eaedf1;
	}

	.iconfont {
		margin-right: 10px;
	}
</style>
