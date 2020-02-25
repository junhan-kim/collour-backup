import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import main from './main'
import router from './router'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLogin: false,
    user: {
      username: "손님",
      password: null,
      accessToken: null,
      refreshToken: null,
      userPhotoSrc: "https://www.asiatripdeals.com/wp-content/uploads/2019/03/Anonymous-Avatar-550x550.png",
    },
  },
  mutations: {
    LOGIN(state, user) {
      state.isLogin = true;
      state.user.username = user.username;
      state.user.password = user.password;
      state.user.accessToken = user.accessToken;
      state.user.refreshToken = null;
    },
    LOGOUT(state) {
      state.isLogin = false;
      state.user.username = "손님";
      state.user.password = null;
      state.user.accessToken = null;
      state.user.refreshToken = null;
      state.user.userPhotoSrc = "https://www.asiatripdeals.com/wp-content/uploads/2019/03/Anonymous-Avatar-550x550.png";
    },
    STORE_USER_PHOTO_SRC(state, image) {
      state.user.userPhotoSrc = image;
    },
  },
  actions: {
    LOGIN({ commit }, { username, password }) {
      return axios.post(`${main.resourceHost}/users/login`, { username, password })
        .then(({ data }) => { 
          let accessToken = "Bearer " + data;
          console.log(accessToken);
          axios.defaults.headers.common['Authorization'] = accessToken;
          commit('LOGIN', { username, password, accessToken }); 
        })
    },
    LOGOUT({ commit }) {
      delete axios.defaults.headers.common['Authorization'];
      router.push('/').catch(err => {})
      commit('LOGOUT');
    },
    STORE_USER_PHOTO_SRC({ commit }, image) {
      commit('STORE_USER_PHOTO_SRC', image);
    },
  },
});
