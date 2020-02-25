<template>
  <v-layout align-center justify-center>
    <form>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Collour 가입</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-alert
            dense
            outlined
            type="info"
          >
            Collour에 가입하기 위한 정보를 작성해주시기 바랍니다.
          </v-alert>
          <v-form autocomplete="off" ref="form">
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field 
                    @input="$v.username.$touch()" 
                    @blur="$v.username.$touch()" 
                    :error-messages="usernameErrors" 
                    label="아이디" 
                    v-model="username" 
                    autofocus
                    required
                    @keyup.enter=submitJoinForm
                    :rules="usernameRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field 
                    @input="$v.password.$touch()" 
                    @blur="$v.password.$touch()" 
                    :error-messages="passwordErrors"
                    type="password" 
                    label="비밀번호" 
                    v-model="password" 
                    required
                    @keyup.enter=submitJoinForm
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field 
                    @input="$v.passwordConfirm.$touch()" 
                    @blur="$v.passwordConfirm.$touch()" 
                    :error-messages="passwordConfirmErrors"
                    type="password" 
                    label="비밀번호 재확인" 
                    v-model="passwordConfirm"
                    required
                    @keyup.enter=submitJoinForm
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field 
                    @input="$v.email.$touch()"
                    @blur="$v.email.$touch()"
                    :error-messages="emailErrors"
                    label="이메일" 
                    v-model="email"
                    required
                    @keyup.enter=submitJoinForm
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>  
          </v-form>    
          <small>* 모두 필수 입력 항목입니다.</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="" @click="closeJoinForm">닫기</v-btn>
          <v-btn color="primary" @click="submitJoinForm">확인</v-btn>
        </v-card-actions>
      </v-card>
    </form>
  </v-layout>
</template>

<script>

import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength, sameAs, email } from 'vuelidate/lib/validators'
import axios from 'axios';
import main from '../main';

export default {
  mixins: [validationMixin],
  data() {
    return {
      username: null,
      usernameRules: [v => this.errorCode != "USER_11" || '아이디가 이미 존재합니다.'],
      password: null,
      passwordConfirm: null,
      email: null,     

      errorCode: null,
    }
  },
  validations: {
    username: { 
      required, 
      minLength: minLength(6), 
      maxLength: maxLength(15),
      usernameRegex1(username) {
        return (
          /[a-z]/.test(username) &&
          /[0-9]/.test(username)
        )
      },
      usernameRegex2(username) {
        return (
          /^[^0-9]/.test(username)
        )
      },
    },
    password: { 
      required, 
      minLength: minLength(9), 
      maxLength: maxLength(16),       
      passwordRegex(password) {
        return (
          /[a-zA-Z]/.test(password) &&
          /[0-9]/.test(password) &&
          /[!@#$%^&*()]/.test(password)
        )
      } 
    },
    passwordConfirm: { required, sameAs: sameAs('password') },
    email: { required, email },
  },
  computed: {
    usernameErrors () {
      const errors = []
      if (!this.$v.username.$dirty) { return errors }
      !this.$v.username.required && errors.push('아이디는 필수 입력 항목입니다.')
      !this.$v.username.minLength && errors.push('아이디는 최소 6자 이상이어야 합니다.')
      !this.$v.username.maxLength && errors.push('아이디는 최대 15자 이하여야 합니다.')
      !this.$v.username.usernameRegex1 && errors.push('아이디에는 최소 하나 이상의 영소문자, 숫자가 필요합니다.')
      !this.$v.username.usernameRegex2 && errors.push('아이디는 숫자로 시작할 수 없습니다.')
      return errors
    },
    passwordErrors () {
      const errors = []
      if (!this.$v.password.$dirty) return errors
      !this.$v.password.required && errors.push('비밀번호는 필수 입력 항목입니다.')
      !this.$v.password.minLength && errors.push('비밀번호는 최소 9자 이상이어야 합니다.')
      !this.$v.password.maxLength && errors.push('비밀번호는 최대 16자 이하여야 합니다.')     
      !this.$v.password.passwordRegex && errors.push('비밀번호에는 최소 하나 이상의 영문, 숫자, 특수문자가 필요합니다.')
      return errors
    },
    passwordConfirmErrors () {
      const errors = []
      if (!this.$v.passwordConfirm.$dirty) return errors
      !this.$v.passwordConfirm.required && errors.push('비밀번호 확인은 필수 입력 항목입니다.')
      !this.$v.passwordConfirm.sameAs && errors.push('비밀번호가 일치하지 않습니다.')
      return errors
    },
    emailErrors () {
      const errors = []
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.required && errors.push('이메일은 필수 입력 항목입니다.')
      !this.$v.email.email && errors.push('이메일 형식이 맞지 않습니다.')
      return errors
    },
  },
  methods: {
    closeJoinForm() {
      this.$v.$reset();

      this.username = null
      this.password = null
      this.passwordConfirm = null
      this.email = null

      this.$emit('joinFormClosed');
    },
    submitJoinForm() {
      this.$v.$touch()
      if (this.$v.$invalid) { return; }

      axios.post(`${main.resourceHost}/users`, {
        "username":this.username, "password":this.password, "email":this.email
      })
      .then(({res})=>{
        console.log("submit")
        this.closeJoinForm();   
      })
      .catch((err)=>{
        this.errorCode = err.response.data.code
        this.$refs.form.validate();
        this.errorCode = ''
      });
    }
  },
}
</script>