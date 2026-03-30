// main.js (Entry point)
// Creates the Vue application instance, registers global plugins (Vue Router),
// and mounts the app into the <div id="app"> element in index.html.
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)// Register Vue Router so <router-view> and navigation are available across the app


app.mount('#app')// Mount the SPA to the DOM (index.html -> <div id="app"></div>)
