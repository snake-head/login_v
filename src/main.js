import { createApp } from 'vue'
import App from './App.vue'
//引入路由器
import router from './router'

const app = createApp(App)
//应用插件
app.use(router)
app.mount('#app')