import Home from './home.vue'
import Detail from './detail.vue'
import Help from './help.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/detail/:hash', component: Detail },
  { path: '/help', component: Help }
]

const router = new VueRouter({
  routes
})

const app = new Vue({
  router
}).$mount('#app')