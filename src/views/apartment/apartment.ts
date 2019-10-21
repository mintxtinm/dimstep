import vuetify from '@/plugins/vuetify';
import router from './router';
import Apartment from './Apartment.vue';
import { Vue, store } from '@/main';

new Vue({
  store,
  vuetify,
  router,
  render: (h: any) => h(Apartment)
}).$mount('#app');
