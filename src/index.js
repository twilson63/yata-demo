import 'tachyons'
import App from './app.svelte'
import store from './bundles'

const target = document.body.appendChild(document.createElement('div'))

let app = new App({
  target
})

store.subscribe(function() {
  app.set(store.getState())
})

store.doFetchTasks()
