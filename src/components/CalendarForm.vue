<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm12 md12>
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>일정 작성</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-form autocomplete="off" ref="form">
            <v-container>
              <v-row>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field 
                    label="제목" 
                    v-model="title" 
                    autofocus
                    required
                    :error-messages="titleErrorMessage"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                    <datetime-picker-component :label="startLabel" @startDateInput="getStartDate" @endDateInput="getEndDate" :datetime="startDatetime" :datetimeErrorMessage="datetimeErrorMessage">
                    </datetime-picker-component>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                    <datetime-picker-component :label="endLabel" @startDateInput="getStartDate" @endDateInput="getEndDate" :datetime="endDatetime">
                    </datetime-picker-component>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field 
                    label="내용" 
                    v-model="content" 
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12">
                  <v-text-field 
                    label="연관 유저 목록" 
                    v-model="relatedUsername" 
                    @keyup.enter="addRelatedUser"
                    :error-messages="relatedUsernameErrorMessage"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="12" class="pt-0">
                  <v-list class="pt-0">
                    <v-list-item v-for="(user, idx) in relatedUsernameList" :key="user.id" class="pt-0">
                        <v-list-item-icon>
                          <v-icon>mdi-account</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title v-text="user"></v-list-item-title>
                        <v-list-item-icon>
                          <v-icon @click="removeElemInUsers(idx)">mdi-close</v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-container>  
          </v-form>    
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="" @click="closeCalendar">닫기</v-btn>
          <v-btn color="primary" @click="submitCalendar">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from 'axios'
import main from '../main'
import DateTimePickerComponent from './DateTimePicker'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

export default {
  props: {
    mode: {
      type: String,
      default: null,
    },
    nowEventInfoForUpdate: {
      type: Object,
      default: null,
    },
    isOpened: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    'datetime-picker-component': DateTimePickerComponent,
  },
  data() {
    return {
      no: null,
      title: null,
      startDate: new Date(),  // date in parent
      endDate: new Date(),
      startDatetime: new Date(),  // date in child
      endDatetime: new Date(),
      content: null,
      relatedUsername: null,
      relatedUsernameList: [],
      startLabel: "시작일",
      endLabel: "종료일",
      datetimeErrorMessage: null,
      titleErrorMessage: null,
      relatedUsernameErrorMessage: null,
    }
  },
  methods: {
    closeCalendar() {
      this.title = null
      this.startDate = new Date()
      this.endDate = new Date()
      this.startDatetime = new Date()
      this.endDatetime = new Date()
      this.content = null
      this.relatedUsername = null
      this.relatedUsernameList = []
      this.datetimeErrorMessage = null
      this.titleErrorMessage = null
      this.relatedUsernameErrorMessage = null
      this.$emit('calendarFormClosed')
    },
    submitCalendar() {
      if(!this.endDate) this.endDate = this.startDate
      if(!this.title){
        this.titleErrorMessage = "제목은 필수 항목입니다."
        return
      }
      if(!this.startDate){
        this.datetimeErrorMessage = "시작일은 필수 항목입니다."
        return
      }
      if(this.startDate > this.endDate){
        this.datetimeErrorMessage = "시작일은 종료일보다 이전이어야 합니다."
        return
      }

      if(this.mode=="create"){  // TODO: remove redundant 
        axios.post(`${main.resourceHost}/calendars`, {
          "title": this.title, 
          "authorName": this.$store.state.user.username,
          "startDate": this.startDate,
          "endDate": this.endDate,
          "content": this.content,
          "relatedUsernameList": this.relatedUsernameList,
        })
        .then(({res})=>{
          this.closeCalendar()
        })
        .catch((err)=>{
          if(err.response.data.code == "USER_10"){
              this.relatedUsernameErrorMessage = "유저가 존재하지 않습니다.";
              this.relatedUsernameList = []
          }
        })
      }  
      else if(this.mode=="update"){
        axios.put(`${main.resourceHost}/calendars/${this.no}`, {
          "title": this.title, 
          "startDate": this.startDate,
          "endDate": this.endDate,
          "content": this.content,
          "relatedUsernameList": this.relatedUsernameList,
        })
        .then(({res})=>{
          this.closeCalendar()
        })
        .catch((err)=>{
          if(err.response.data.code == "USER_10"){
              this.relatedUsernameErrorMessage = "유저가 존재하지 않습니다.";
              this.relatedUsernameList = []
          }
        })
      } 
    },
    getStartDate(startDate){   // startDate and endDate are sync in parent(caledarForm) and child(datetimepicker) 
      this.startDate = startDate
    },
    getEndDate(endDate){
      this.endDate = endDate
    },

    addRelatedUser(){
      this.relatedUsernameList.push(this.relatedUsername)
      this.relatedUsername = null
    },
    removeElemInUsers(index) {
      this.relatedUsernameList.splice(index, 1);
    }
  },
  watch: {
    title(val, oldVal){
      this.titleErrorMessage = null
    },
    startDate(val, oldVal) {
      if(this.startDate <= this.endDate) this.datetimeErrorMessage = null
    },
    endDate(val, oldVal) {
      if(this.startDate <= this.endDate) this.datetimeErrorMessage = null
    },
    relatedUsername(val, oldVal){
      this.relatedUsernameErrorMessage = null
    },
    isOpened(val, oldVal){
      if(val && this.mode=="update"){
        let info = this.nowEventInfoForUpdate  // TODO: set object to object
        this.no = info.no
        this.title = info.title
        this.startDate = info.startDate
        this.endDate = info.endDate
        this.startDatetime = info.startDate
        this.endDatetime = info.endDate
        this.content = info.content
        this.relatedUsernameList = info.relatedUsernameList
      }
    }
  },
  mounted(){
    if(this.mode=="update"){
      let info = this.nowEventInfoForUpdate
      this.no = info.no
      this.title = info.title
      this.startDate = info.startDate
      this.endDate = info.endDate
      this.startDatetime = info.startDate
      this.endDatetime = info.endDate
      this.content = info.content
      this.relatedUsernameList = info.relatedUsernameList
    }
  }
}
</script>