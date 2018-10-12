import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import MuseUI from "muse-ui";
import "muse-ui/dist/muse-ui.css";
import 'element-ui/lib/theme-chalk/index.css';

import ElementUI from "element-ui";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

Vue.use(MuseUI);
Vue.use(ElementUI);


if (process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.config.productionTip = false;
library.add(far);
library.add(fas);

Vue.component("font-icon", FontAwesomeIcon);

/* eslint-disable no-new */
new Vue({
  name: "vue",
  components: { App },
  router,
  store,
  render: h => h(App)
}).$mount("#app");
