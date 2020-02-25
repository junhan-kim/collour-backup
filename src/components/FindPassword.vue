<template>
  <v-layout justify-center>
    <v-flex xs12 sm12 md12>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>비밀번호 찾기</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="12" md="12">
              <v-text-field 
              label="아이디 입력" 
              v-model="username" 
              autofocus
              :error-messages="errorMessage"
              @keyup.enter=ok
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
              <small class="ml-3">* 확인 버튼을 누르면 변경된 임시 비밀번호가 메일로 전송됩니다.</small>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-show="!isProgress" color="" @click="close">닫기</v-btn>
          <v-btn v-show="!isProgress" color="primary" @click="ok">확인</v-btn>
          <v-progress-circular v-show="isProgress" indeterminate color="primary"></v-progress-circular> 
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>


<script>
import axios from 'axios';
import main from '../main';

export default {
  data() {
    return {
        username: null,
        errorMessage: null,
        isProgress: false,
    }
  },
  
  methods: {
    close() {
      this.username = null;
      this.errorMessage = null;
      this.isProgress = false;
      this.$emit('findPasswordClose');
    },
    ok() {
      this.isProgress = true;
      axios.post(`${main.resourceHost}/users/find/password`, {
        "username":this.username
      })
        .then(res=>{
          this.isProgress = false;
          this.close();
        })
        .catch(err=>{
          this.isProgress = false;
          if(err.response.data.code == "USER_10"){
            this.errorMessage = "유저가 존재하지 않습니다.";
          }
          if(err.response.data.code == "USER_14"){
            this.errorMessage = "이메일 인증되지 않은 유저입니다. 관리자에게 문의해 주십시오.";
          }
        });
    },
  },
  watch:{
    username(val, oldval){
      this.errorMessage = null;
    }
  },
}
</script>