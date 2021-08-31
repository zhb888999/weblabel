import { createApp } from 'vue'
import App from './App.vue'

import { create, 
         NButton, 
         NSelect, 
         NSpace, 
         NButtonGroup, 
         NPagination, 
         NGrid, 
         NGridItem, 
         NCard, 
         NModal, 
         NConfigProvider, 
         NGlobalStyle 
        } from 'naive-ui'

const naive = create({
  components: [
    NButton, 
    NSelect, 
    NSpace, 
    NButtonGroup, 
    NPagination, 
    NGrid, 
    NGridItem, 
    NCard, 
    NModal, 
    NConfigProvider, 
    NGlobalStyle
  ]
})

createApp(App)
.use(naive)
.mount('#app')
