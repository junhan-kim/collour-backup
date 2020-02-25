<template>
  <v-app>
    <v-navigation-drawer permanent bottom dark app>
      <template v-slot:prepend>     
        <v-list-item two-line id="userListItem">
          <router-link to="/userPhoto">
            <v-list-item-avatar>
              <img :src="userPhotoSrc">
            </v-list-item-avatar>
          </router-link>
          <router-link to="/userInfo" class="usernameRouterLink">
            <v-list-item-content class="usernameRouterLink">    
              <v-list-item-title>{{ username }}</v-list-item-title>
              <v-list-item-subtitle v-if="loginDialog">로그인이 필요합니다.</v-list-item-subtitle>         
            </v-list-item-content>
          </router-link>
        </v-list-item>       
      </template>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.path"
          active-class="white--text"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item
          v-for="chatroom in chatrooms"
          :key="chatroom.id"
          :to="chatroom.path"
          active-class="white--text"
        >
          <v-list-item-icon>
            <v-icon>mdi-message</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ chatroom.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item
          v-for="calendar in calendars"
          :key="calendar.id"
          :to="calendar.path"
          active-class="white--text"
        >
          <v-list-item-icon>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ calendar.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar elevate-on-scroll app>
      <v-toolbar-title class="headline">
        <span>Collour </span>
        <span class="font-weight-light">for GVR Lab @ Sejong University</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-sync</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-settings</v-icon>
      </v-btn>
      <v-btn @click="logout" icon>
        <v-icon>mdi-exit-to-app</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container fluid fill-height>
        <router-view></router-view>
      </v-container>
    </v-content>

    <v-footer class="font-weight-small" app>
      <v-flex
        text-center
        xs12
        class="caption"
      >
        Copyrights &copy; {{ new Date().getFullYear() }} <strong><a href="http://gvrlab.sejong.ac.kr/" target="_blank">GVR Lab</a></strong> @ <a href="http://www.sejong.ac.kr/" target="_blank">Sejong University</a>. All rights reserved.
      </v-flex>
    </v-footer>

    <v-dialog v-model="loginDialog" persistent max-width="600">
      <login-component></login-component>
    </v-dialog>

  </v-app>
</template>

<script>
import axios from 'axios';
import main from './main';
import LoginComponent from './components/Login';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export default {
  name: 'App',
  components: {
    'login-component': LoginComponent,
  },
  data() {
    return {
      sockjs: null,
      ws: null,

      items: [
        { title: '대시보드', icon: 'mdi-view-dashboard', path: '/' },
        { title: '공지사항', icon: 'mdi-newspaper', path: '/notice' },
        { title: 'Collour에 관하여', icon: 'mdi-help-box', path: '/about' },
      ],
      chatrooms: [ { id: "1", title: "테스트", path: '/chatRoom/1' } ],
      calendars: [
        { title: '일정', icon: 'mdi-calendar', path: '/calendar' },
      ],
      right: null,
    }
  },
  computed: {
    isLogin() {
      return this.$store.state.isLogin;
    },
    loginDialog() {
      return !this.$store.state.isLogin;
    },
    username() {
      return this.$store.state.user.username;
    },
    userPhotoSrc() {
      return this.$store.state.user.userPhotoSrc;
    },
  },
  methods: {
    notify(title, body) {
      new Notification(title, { body, });
    },
    logout() {
      this.$store.dispatch('LOGOUT')
    },
    connectChatService() {
      this.sockjs = new SockJS(`${main.resourceHost}/ws-stomp`),
      this.ws = Stomp.over(this.sockjs),

      this.ws.connect({"token": this.$store.state.user.accessToken}, (frame) => {
        this.ws.subscribe(`/sub/chat/1`, (message) => {
          const notification = new Notification('새로운 메세지', {
            body: JSON.parse(message.body).message,
          });
        })

        this.ws.send(`/pub/chat/message`, {"token": this.$store.state.user.accessToken}, JSON.stringify({type: 'SYSTEM', chatRoomId: "1", sender: "1", message: "새로운 사용자가 대화에 참여합니다!"}));
      })
    },
    disconnectChatService() {
      if (this.ws != null) {
        this.ws.disconnect();
      }
    },
    findAllChatRoom() {
      
    },
  },
  created() {
    this.$router.push('/').catch(err => {})

    // when token expires, logout user
    axios.interceptors.response.use(function (res) {
        return res;
      }, error => {
        if(error.response.headers["expires"] != 0) {
          console.log('401 error');
          this.$store.dispatch('LOGOUT');
        }
        return Promise.reject(error);
      });
  },
  watch: {  // login, logout process in App.vue
    isLogin(val, oldval){
      if(val){
        axios.get(`${main.resourceHost}/users/${this.$store.state.user.username}/photo`)
          .then((res) => {
            let image = "data:" + res.headers["content-type"] + ";base64," + res.data;
            this.$store.dispatch('STORE_USER_PHOTO_SRC', image);
          })
          .catch(err => {
            if(err.response.data.code == "COMMON_1"){
              console.log("user photo not exist");
            }
          });
        this.connectChatService();
      }
      else{
        this.notify("로그아웃", "로그아웃 되었습니다.");
        this.disconnectChatService();
      }
    },
  },
};
</script>

<style>
  .usernameRouterLink{
    text-decoration: none;
    color: white;
  }
</style>