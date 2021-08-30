import { createApp } from 'vue'
import App from './App.vue'

import { create, NButton, NSelect, NSpace, NButtonGroup } from 'naive-ui'

const naive = create({
  components: [NButton, NSelect, NSpace, NButtonGroup]
})

createApp(App)
.use(naive)
.mount('#app')
