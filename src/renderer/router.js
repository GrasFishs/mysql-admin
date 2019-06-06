import Vue from 'vue';
import Router from 'vue-router';
import store from './store';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/login')
    },
    {
      path: '/',
      name: 'main',
      component: () => import('./views/layout')
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (store.state.db.databases.length > 0) {
    next();
  } else {
    if (to.path === '/login') {
      next();
    } else {
      next({
        path: '/login'
      });
    }
  }
});

export default router;
