<template>
  <v-layout justify-center>
    <v-flex xs12 sm12 md12>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>이메일 인증</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="12" md="12">
              <v-text-field 
              label="인증 번호 입력" 
              v-model="inputNumber" 
              autofocus
              :error-messages="errorMessage"
              @keyup.enter=checkAuthenticationNumber
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn v-show="!isProgress" color="primary" @click="sendEmail">메일 전송</v-btn>
          <v-progress-circular v-show="isProgress" indeterminate color="primary"></v-progress-circular> 
          <v-spacer></v-spacer>
          <v-btn color="" @click="emailAuthenticationClose">닫기</v-btn>
          <v-btn color="primary" @click="checkAuthenticationNumber">인증 번호 확인</v-btn>
        </v-card-actions>
        <transition name="fade" @after-enter="afterEnter">
          <v-alert type="success" v-show="isVisibleSuccessAlert">
            메일이 발송되었습니다.
          </v-alert> 
        </transition>
      </v-card>
    </v-flex>
  </v-layout>
</template>


<script>
import axios from 'axios';
import main from '../main';

export default {
  props: ['email'],
  data() {
    return {
      inputNumber: null,
      authenticationNumber: null,
      isProgress: false,
      errorMessage: null,
      isVisibleSuccessAlert: false,
    }
  },
  
  methods: {
    emailAuthenticationClose() {
      this.inputNumber = null;
      this.authenticationNumber = null;
      this.isProgress = false;
      this.errorMessage = null;
      this.isVisibleSuccessAlert = false;
      this.$emit('closeEmailAuthentication');
    },
    sendEmail() {
      this.isProgress = true
      this.authenticationNumber = Math.floor(Math.random() * 899999) + 100000;  // 100000~999999
      axios.post(`${main.resourceHost}/mail/send`, {
        "mailTo":this.email, 
        "authenticationNumber":this.authenticationNumber, 
      })
        .then(res=>{ 
          this.isProgress = false;
          this.isVisibleSuccessAlert = true;
        })
        .catch(err=>console.log(err));
    },
    checkAuthenticationNumber() {
      if(!!this.inputNumber && this.inputNumber == this.authenticationNumber){
        axios.post(`${main.resourceHost}/mail/authentication`, this.$store.state.user.username)
          .then(res=>{ 
            this.$emit('authenticated').then(this.emailAuthenticationClose())  // very important ordering
          })
          .catch(err=>console.log(err));
      }
      else{
        this.errorMessage = "인증 번호가 틀립니다.";
      }
    },
    afterEnter(el) {
      this.isVisibleSuccessAlert = false
    },
  },
  watch:{
    inputNumber(val, oldval){
      this.errorMessage = null;
    }
  },
}
</script>

<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 1s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>