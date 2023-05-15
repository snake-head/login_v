import { createRouter, createWebHashHistory } from 'vue-router'
import HelloWorld from "../components/HelloWorld";

const routerHistorys = createWebHashHistory()
const router = createRouter({
    history: routerHistorys,
    routes: [
        {
            path: '/',
            redirect: '/testLogin',
        },
        {
            path: '/testLogin',
            component: HelloWorld,
            meta: {
                shouldAuth: true,
                title: '开发测试用页面'
            },
            // beforeEnter: (to, from, next) => {
            //     if (to.query.patientUID) {
            //         next()
            //     } else{
            //         // 未传参且不存在cookie
            //         alert('无法读取patientUID！')
            //     }
            // }
        },
    ]
})

// router.beforeEach(((to, from, next) => {
//     if (to.meta.shouldAuth) {
//         next()
//     } else {
//         next()
//     }
// }))
router.afterEach((to, from)=>{
    document.title = to.meta.title || '--欢迎进入--'
})

export default router
