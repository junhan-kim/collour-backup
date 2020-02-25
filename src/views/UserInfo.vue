<template>
  <v-layout
    align-content-start
    justify-center
  >
    <v-card class="d-inline-block mx-auto">
      <form style="padding:2em">
        <h2 class="text-center">회원 정보 수정</h2>
        <v-row>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-text-field 
                  @input="$v.email.$touch()"
                  @blur="$v.email.$touch()"
                  :error-messages="emailErrors"
                  label="이메일" 
                  v-model="email"
                  @keyup.enter=submitUserInfoForm
                  required
                  :append-icon="appendIcon"
                  @click:append="showMailAuthenticationDialog"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field label="이름" v-model="name" @keyup.enter=submitUserInfoForm></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field label="전공" v-model="major" @keyup.enter=submitUserInfoForm></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :return-value.sync="birth"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      type="text" 
                      v-model="birth"
                      label="생년월일"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker 
                    v-model="birth" 
                    no-title 
                    scrollable
                    min="1900-01-01"
                    :max="today"
                    locale="kr"
                    year-icon="mdi-calendar-blank">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="menu = false">취소</v-btn>
                    <v-btn color="primary" @click="$refs.menu.save(birth)">확인</v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-container> 
        </v-row>  
        <v-row>
          <small>* 입력한 항목만 수정됩니다.</small>
          <v-spacer></v-spacer>
          <v-btn text small outlined color="primary" @click="redirectToUserPassword">비밀번호 변경</v-btn>
          <v-btn class="ml-3" depressed small color="warning" @click="showUserDeleteDialog">회원 탈퇴</v-btn>
        </v-row>
        <v-row>
          <v-container text-center>
            <v-btn class="ma-5" large color="" @click="closeUserInfoForm">닫기</v-btn>        
            <v-btn class="ma-5" large color="primary" @click="submitUserInfoForm">확인</v-btn>
          </v-container>
        </v-row> 
      </form>
    </v-card>

  <v-dialog v-model="emailAuthenticationDialog" persistent max-width="600">
    <email-authentication-component 
      :email="email" @closeEmailAuthentication="hideMailAuthenticationDialog" @authenticated="successAuthentication"
    ></email-authentication-component>
  </v-dialog>

  <v-dialog v-model="userDeleteDialog" persistent max-width="600">
    <user-delete-component
      @closeUserDelete="hideUserDeleteDialog"
    ></user-delete-component>
  </v-dialog>



  </v-layout>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength, maxLength, sameAs, email } from 'vuelidate/lib/validators';
import axios from 'axios';
import main from '../main';
import EmailAuthenticationComponent from '../components/EmailAuthentication';
import UserDeleteComponent from '../components/UserDelete';

export default {
  mixins: [validationMixin],
  components: {
    'email-authentication-component': EmailAuthenticationComponent,
    'user-delete-component': UserDeleteComponent,
  },
  data() {
    return {
      email: null,   
      name: null,
      major: null,     
      birth: null,
      menu: false,
      today: new Date().toISOString().substr(0, 10),
      errorCode: null,
      emailAuthenticationDialog: false,
      appendIcon: "mdi-email",
      alreadyAuthentication: false,
      originalEmail: null,
      userDeleteDialog: false,
    }
  },
  validations: {
    email: { required, email },
  },
  computed: {
    emailErrors () {
      const errors = []
      if (!this.$v.email.$dirty) return errors
      !this.$v.email.required && errors.push('이메일은 필수 입력 항목입니다.')
      !this.$v.email.email && errors.push('이메일 형식이 맞지 않습니다.')
      return errors
    },
  },
  methods: {
    closeUserInfoForm() {
      this.$v.$reset();
      this.email = null
      this.name = null
      this.major = null
      this.birth = null
      this.$router.push('/').catch(err => {})
    },
    async submitUserInfoForm() {
      this.$v.$touch()
      if (this.$v.$invalid) { return; }

      if(this.originalEmail != this.email){
        await axios.delete(`${main.resourceHost}/mail/authentication`).catch(err=>console.log(err));
      }

      axios.put(`${main.resourceHost}/users/${this.$store.state.user.username}`, {
        "email":this.email, "name":this.name, "major":this.major, "birth":this.birth
      }).then(({res})=>{
        this.closeUserInfoForm();   
      }).catch((err)=>{
        console.log(err);
      });
    },
    redirectToUserPassword() {
      this.$router.push('/userPassword').catch(err=>console.log(err));
    },
    showMailAuthenticationDialog() {
      if(this.alreadyAuthentication) return;
      this.emailAuthenticationDialog = true;
    },
    hideMailAuthenticationDialog() {
      this.emailAuthenticationDialog = false;
      if(this.alreadyAuthentication) {
        axios.put(`${main.resourceHost}/users/${this.$store.state.user.username}`, {
          "email":this.email
        }).then(({res})=>{
          this.closeUserInfoForm();   
        }).catch((err)=>{ console.log(err) });
      }
    },
    successAuthentication() {
      this.alreadyAuthentication = true;
      this.appendIcon = "mdi-check";
    },
    showUserDeleteDialog(){
      this.userDeleteDialog = true;
    },
    hideUserDeleteDialog(){
      this.userDeleteDialog = false;
    },
  },
  mounted() {
    axios.get(`${main.resourceHost}/users/${this.$store.state.user.username}`)
      .then((res)=>{
        this.email = res.data.email;
        this.name = res.data.name;
        this.major = res.data.major;
        this.birth = res.data.birth;
        this.originalEmail = res.data.email;
      })

    axios.get(`${main.resourceHost}/mail/authentication`)
      .then((res)=>{
        const emailValid = res.data; 
        if(emailValid){
          this.successAuthentication();
        }
      }).catch(err=>console.log(err));
  },
}
</script>

