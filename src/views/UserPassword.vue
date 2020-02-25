<template>
  <v-layout
    align-content-start
    justify-center
  >
    <v-card class="d-inline-block mx-auto" width="900">
      <v-form ref="form" autocomplete="off" style="padding:2em">
        <h2 class="text-center">비밀번호 변경</h2>
        <v-row>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-text-field 
                @input="$v.originalPassword.$touch()" 
                @blur="$v.originalPassword.$touch()" 
                :error-messages="originalPasswordErrors"
                type="password" 
                label="기존 비밀번호" 
                v-model="originalPassword" 
                required
                @keyup.enter=submitPasswordForm
                :rules="originalPasswordRules"
                autofocus
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field 
                @input="$v.password.$touch()" 
                @blur="$v.password.$touch()" 
                :error-messages="passwordErrors"
                type="password" 
                label="새 비밀번호" 
                v-model="password" 
                required
                @keyup.enter=submitPasswordForm
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field 
                  @input="$v.passwordConfirm.$touch()" 
                  @blur="$v.passwordConfirm.$touch()" 
                  :error-messages="passwordConfirmErrors"
                  type="password" 
                  label="새 비밀번호 재확인" 
                  v-model="passwordConfirm"
                  required
                  @keyup.enter=submitPasswordForm
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container> 
        </v-row>  
        <v-row>
          <v-container text-center>
            <v-btn class="ma-5" large color="" @click="closePasswordForm">닫기</v-btn>        
            <v-btn class="ma-5" large color="primary" @click="submitPasswordForm">확인</v-btn>
          </v-container>
        </v-row> 
      </v-form>
    </v-card>   
  </v-layout>
</template>

<script>

import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength, sameAs } from 'vuelidate/lib/validators'
import axios from 'axios';
import main from '../main';

export default {
  mixins: [validationMixin],
  data() {
    return {
      originalPassword: null,
      originalPasswordRules: [v => !this.isOriginalPasswordError || '기존 비밀번호가 올바르지 않습니다.'],
      isOriginalPasswordError: false,
      password: null,
      passwordConfirm: null,
    }
  },
  validations: {
    originalPassword: { 
      required,  
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
  },
  computed: {
    originalPasswordErrors () {
      const errors = []
      if (!this.$v.originalPassword.$dirty) return errors
      !this.$v.originalPassword.required && errors.push('기존 비밀번호는 필수 입력 항목입니다.')
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
  },
  methods: {
    closePasswordForm() {
      this.$v.$reset();
      this.originalPassword = null;
      this.password = null;
      this.passwordConfirm = null;
      this.$router.push('/').catch(err => {});
    },
    submitPasswordForm() {
      this.$v.$touch()
      if (this.$v.$invalid) { return; }

      if(this.originalPassword != this.$store.state.user.password) {
        this.isOriginalPasswordError = true;
        this.$refs.form.validate();
        this.isOriginalPasswordError = false;
        console.log('diff')
        return;
      }
              
      axios.put(`${main.resourceHost}/users/${this.$store.state.user.username}`, {
        "password":this.password,
      })
      .then(({res})=>{
        this.closePasswordForm();   
        this.$store.dispatch('LOGOUT')
      })
      .catch((err)=>{
        console.log(err);
      });   
    }
  },
}
</script>