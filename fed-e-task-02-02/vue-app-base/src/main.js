import Vue from 'vue'
import App from './App.vue'

import './style.less'
console.log('enter')
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
