import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'
//  导入弹窗提示组件并挂载在VUE上

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
