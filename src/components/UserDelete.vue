<template>
  <v-layout justify-center>
    <v-flex xs12 sm12 md12>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>회원 탈퇴</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-row v-show="showAlert">
            <v-col cols="12" sm="12" md="12">
              <v-alert
                prominent
                type="error"
              >
                <v-row align="center">
                  <v-col class="grow">회원을 탈퇴하시면 복구가 불가능합니다.<br>그래도 진행하시겠습니까?</v-col>
                  <v-col class="shrink">
                    <v-btn @click="withdraw">회원 탈퇴</v-btn>
                  </v-col>
                </v-row>
              </v-alert>
            </v-col>
          </v-row>
          <v-row v-show="!showAlert">
            <v-col cols="12" sm="12" md="12">
              <v-alert dense type="warning">
                진행하시려면 비밀번호를 입력해주세요.
              </v-alert>
            </v-col>
            <v-col cols="12" sm="12" md="12">
              <v-text-field 
              type="password" 
              label="비밀번호" 
              v-model="password" 
              required
              :error-messages=errorMessage
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer v-show="!showAlert"></v-spacer>
          <v-btn color="" @click="close">닫기</v-btn>
          <v-btn v-show="!showAlert" color="primary" @click="ok">확인</v-btn>
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
      password: null,
      showAlert: false,
      errorMessage: null,
    }
  },
  methods: {
    close() {
      this.password = null;
      this.showAlert = false;
      this.errorMessage = null;
      this.$emit('closeUserDelete');
    },
    ok() {
      if(this.password != this.$store.state.user.password) {
        this.errorMessage = "비밀번호가 올바르지 않습니다.";
        return;
      }
      this.showAlert = true;
    },
    withdraw() {
      axios.delete(`${main.resourceHost}/users/${this.$store.state.user.username}`)
        .then(res=>{
          this.close();
          this.$store.dispatch('LOGOUT');
        }).catch(err=>console.log(err));
    },
  },
  watch: {
    password(val, oldval) {
      this.errorMessage = null;
    }
  }
}
</script>