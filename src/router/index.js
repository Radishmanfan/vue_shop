import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Login = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
const Home = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
const Welcome = () =>
    import ( /* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
const Users = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
const Rights = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () =>
    import ( /* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
const Cate = () =>
    import ( /* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
const Params = () =>
    import ( /* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

// import GoodsList from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
const GoodsList = () =>
    import ( /* webpackChunkName: "GoodsList_Add" */ '../components/goods/List.vue')
const Add = () =>
    import ( /* webpackChunkName: "GoodsList_Add" */ '../components/goods/Add.vue')

// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'
const Order = () =>
    import ( /* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () =>
    import ( /* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')


Vue.use(VueRouter)

const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        redirect: '/welcome',
        children: [{
                path: '/welcome',
                component: Welcome
            },
            {
                path: '/users',
                component: Users
            },
            {
                path: '/rights',
                component: Rights
            },
            {
                path: '/roles',
                component: Roles
            },
            {
                path: '/categories',
                component: Cate
            },
            {
                path: "/params",
                component: Params
            },
            {
                path: "/goods",
                component: GoodsList
            },
            {
                path: '/goods/add',
                component: Add
            },
            {
                path: '/orders',
                component: Order
            },
            {
                path: '/reports',
                component: Report
            },
        ]
    }
    // {
    //   path: '/about',
    //   name: 'About',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    // }
]

const router = new VueRouter({
    // mode: 'history',
    routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 将要访问的路径
    // from 代表从哪个路径过来
    // next 是一个函数,表示放行
    // next() 放行 next('/login') 强制跳转
    if (to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router