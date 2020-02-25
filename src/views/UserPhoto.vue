<template>
  <v-layout
    align-content-start
    justify-center
  >
    <v-card class="mx-auto" width="700" height="1000">
      <v-container>
        <h2 class="text-center mb-10">회원 사진 수정</h2>  
        <v-row>
          <v-container class="justify-center">
            <v-img :src="image" max-height="200" contain></v-img>
          </v-container>
        </v-row>
        <v-row>
          <v-file-input class="mx-10" label="파일 첨부" @change="changeFile" accept="image/*" show-size prepend-icon="mdi-camera"></v-file-input>
        </v-row>
        <v-row>
          <v-container text-center>
            <v-btn class="ma-5" large color="" @click="closeUserPhotoForm">닫기</v-btn>        
            <v-btn class="ma-5" large color="primary" @click="submitUserPhotoForm">확인</v-btn>
          </v-container>
        </v-row>
        <v-row class="justify-center">
          <transition name="fade" @after-enter="afterEnter" @after-leave="afterLeave">
            <v-alert v-show="successAlert" type="success">
              프로필 사진이 변경되었습니다.
            </v-alert>
          </transition>
          <transition name="fade" @after-enter="afterEnter" @after-leave="afterLeave">
            <v-alert v-show="errorAlert" type="error">
              파일을 전송할 수 없습니다.
            </v-alert>
          </transition>
        </v-row>
      </v-container>
    </v-card>
  </v-layout>
</template>

<script>
import axios from 'axios';
import main from '../main';

export default {
  data() {
    return {
      image: "https://miro.medium.com/max/594/0*DqHGYPBA-ANwsma2.gif",
      formData: new FormData(),
      fileReader: new FileReader(),

      successAlert: false,
      errorAlert: false,
    }
  },
  methods: {
    closeUserPhotoForm() {
      this.$router.push('/').catch(err => {})
    },
    submitUserPhotoForm() {
      axios.post(`${main.resourceHost}/users/${this.$store.state.user.username}/photo`, this.formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(({res}) => {
        this.$store.dispatch('STORE_USER_PHOTO_SRC', this.image)
        this.successAlert = true
      }).catch(err => {
        if(err.response.data.code == "COMMON_1") { 
          this.errorAlert = true 
        }
      });
    },
    changeFile(file){
      if(!file) { 
        this.formData.set("file", null) 
        this.image = ''  // image src is empty  (Do not use null in)
        return;
      }
      this.formData.set("file", file) 
      this.fileReader.readAsDataURL(file);  // preview image
    },

    afterEnter(el) {
      this.successAlert = false
      this.errorAlert = false
    },
    afterLeave(el) {
      this.successAlert = false
      this.errorAlert = false
    }
  },
  mounted() {
    axios.get(`${main.resourceHost}/users/${this.$store.state.user.username}/photo`)
      .then((res) => {
        this.image = "data:" + res.headers["content-type"] + ";base64," + res.data
      })
      .catch(err => {
        if(err.response.data.code == "COMMON_1"){
          console.log("user photo not exist");
        }
      })

    this.fileReader.addEventListener("load", () => {
      this.image = this.fileReader.result
    }, false)
  },
}
</script>

<style>
.fade-enter-active, .fade-leave-active {  
  transition: ease-out opacity 1.0s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>