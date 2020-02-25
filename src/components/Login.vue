<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm12 md12>
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Collour 로그인</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text style="padding-bottom:0rem">
          <v-alert
            dense
            outlined
            type="info"
          >
            Collour는 로그인이 필요한 서비스 입니다.<br>등록된 계정으로 로그인 하시기 바랍니다.
          </v-alert>
          <v-form ref="form" autocomplete="off">
            <v-text-field
              id="username"
              label="아이디"
              v-model="username"
              name="username"
              prepend-icon="mdi-account-circle"
              type="text"
              @keyup.enter=login(username,password)  
              :rules="usernameRules"
              autofocus
            ></v-text-field>
            <v-text-field
              id="password"
              label="비밀번호"
              v-model="password"
              name="password"
              prepend-icon="mdi-lock"
              type="password"
              @keyup.enter=login(username,password)  
              :rules="passwordRules"
              ref="password"
              :error-messages="capslockPressedMessage"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-checkbox v-model="usernameRememberCheckbox" label="아이디 기억"></v-checkbox>
          <v-spacer></v-spacer>
          <v-btn color="indigo" outlined class="mr-3" @click="showFindPassword">비밀번호 찾기</v-btn>
          <v-btn color="" @click="showjoinForm">가입</v-btn>
          <v-btn color="primary" @click="login(username, password)">로그인</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>

    <v-dialog v-model="joinDialog" persistent max-width="600">
      <join-component @joinFormClosed="hideJoinForm"></join-component>
    </v-dialog>

    <v-dialog v-model="findPasswordDialog" persistent max-width="600">
      <find-password-component @findPasswordClose="hideFindPassword"></find-password-component>
    </v-dialog>


  </v-layout>
</template>

<script>
import JoinComponent from './Join';
import FindPasswordComponent from './FindPassword'
import axios from 'axios';
import main from '../main';
import cookie from 'vue-cookie';

export default {
  components: {
    'join-component': JoinComponent,
    'find-password-component': FindPasswordComponent
  },
  data() {
    return {
      username: null,
      usernameRules: [(v => this.errorCode != "USER_2" || '아이디 또는 패스워드가 일치하지 않습니다.'),],  // errorCode validation
      password: null,
      passwordRules: [v => this.errorCode != "USER_2" || ''],
      joinDialog: false,
      errorCode: null,
      usernameRememberCheckbox: false,
      capslockPressedMessage: null,
      findPasswordDialog: false,
    };
  },
  computed: {
    isLogin() {
      return this.$store.state.isLogin;
    },
  },
  methods: {
    login(username, password) {
      this.$store.dispatch('LOGIN', { username, password })
        .then(() => {
          cookie.set("username", username, "30*24*60*60*1000");
          this.$refs.form.resetValidation();         
          this.$refs.form.reset();
        })
        .catch((err) => { // errorCode validation
          this.errorCode = err.response.data.code
          this.$refs.form.validate()
          this.errorCode = ''
        });
    },

    showjoinForm() {
      this.joinDialog = true;
    },
    hideJoinForm() {
      this.joinDialog = false;
    },
    showFindPassword() {
      this.findPasswordDialog = true;
    },
    hideFindPassword(){
      this.findPasswordDialog = false;
    },
  },
  watch: {  // manually reset validation
    username(val, oldVal){
      this.$refs.form.resetValidation()
    },
    password(val, oldVal){
      this.$refs.form.resetValidation()
    },
    isLogin(val, oldval){
      if(!val && this.usernameRememberCheckbox){
        this.username = cookie.get("username")
      }
    },
  },
  mounted() {
    this.$refs.password.$el.addEventListener("keyup", (event) => {
      if (event.getModifierState("CapsLock")) {
        this.capslockPressedMessage = "Caps Lock이 켜져 있습니다."
      } 
      else {
        this.capslockPressedMessage = null
      }
    })
  },
};
</script>
