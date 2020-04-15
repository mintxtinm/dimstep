import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      component: () => import('@/views/flow/FlowMenu.vue'),
      children: [
        { path: '/todo', component: () => import('@/views/flow/Todo.vue') },
        {
          path: '/todo/:instanceID',
          component: () => import('@/views/flow/Timeline.vue'),
          children: [
            {
              path: '/todo/:instanceID/:taskID',
              component: () => import('@/views/flow/InstanceTaskInfo.vue')
            }
          ]
        },
        { path: '/bind', component: () => import('@/views/flow/Bind.vue') },
        {
          path: '/action',
          component: () => import('@/views/flow/Action.vue'),
          children: [
            {
              path: '/action/:actionID',
              component: () =>
                import('@/components/flow/action/FindActionDefine.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/instance',
      component: () => import('@/views/flow/ActionInstance.vue')
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next({ path: '/todo' });
  }
  next();
});

export default router;
