import {
    createRouter,
    createWebHistory
} from 'vue-router'

const Login = () => import('../components/Login/index.vue')
const Home = () => import('../components/Home/index.vue')

const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: {
            requiresAuth: true
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')

    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/login')
    } else if (to.path === '/login' && isLoggedIn) {
        next('/home')
    } else {
        next()
    }
})

export default router