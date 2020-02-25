import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
    {
      path: '/notice',
      name: 'notice',
      component: () => import('./views/Notice.vue'),
    },
    {
      path: '/chatRoom/:chatRoomId',
      name: 'chatRoom',
      component: () => import('./views/ChatRoom.vue'),
    },
    {
      path: '/userInfo',
      name: 'userInfo',
      component: () => import('./views/UserInfo.vue'),
    },
    {
      path: '/userPhoto',
      name: 'userPhoto',
      component: () => import('./views/UserPhoto.vue'),
    },
    {
      path: '/userPassword',
      name: 'userPassword',
      component: () => import('./views/UserPassword.vue'),
    },

    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('./views/Calendar.vue'),
    }
  ],
});
