import { createApp } from 'vue'
import stores from '@/stores';
import './style.css'
import App from './components/App.vue'

createApp(App).use(stores).mount('#app')