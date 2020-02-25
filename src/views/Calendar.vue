<template>
  <v-layout
    align-content-start
    justify-center
  >
    <v-card class="d-inline-block mx-auto" style="padding:2em" width="900">
      <h2 class="text-center pb-4">일정 관리</h2>
      <v-row class="fill-height">
        <v-col>
          <v-sheet height="64">
            <v-toolbar flat color="white">
              <v-btn fab text small color="grey darken-2" @click="prev">
                <v-icon small>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn fab text small color="grey darken-2" @click="next">
                <v-icon small>mdi-chevron-right</v-icon>
              </v-btn>
              <v-toolbar-title>{{ title }}</v-toolbar-title>
              <v-btn class="ml-4" outlined color="grey darken-2" @click="setToday" ref="todayRef">
                오늘
              </v-btn>
              <v-spacer></v-spacer>
              <v-menu bottom right>
                <template v-slot:activator="{ on }">
                  <v-btn
                    outlined
                    color="grey darken-2"
                    v-on="on"
                  >
                    <span>{{ typeToLabel[type] }}</span>
                    <v-icon right>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="type = 'day'">
                    <v-list-item-title>일</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'week'">
                    <v-list-item-title>주</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'month'">
                    <v-list-item-title>월</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = '4day'">
                    <v-list-item-title>4일</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn outlined class="ml-4" @click="showCalendarDialog('create')">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-toolbar>
          </v-sheet>
          <v-sheet height="600">
            <v-calendar
              ref="calendar"
              v-model="focus"
              color="primary"
              :events="events"
              :event-color="getEventColor"
              :type="type"
              event-overlap-mode="stack"
              @click:event="showEvent"
              @click:more="viewDay"
              @click:date="viewDay"
              @change="changeCalendar"
              locale="ko-kr"
              :event-height=eventHeight
            ></v-calendar>
            <v-menu
              v-model="selectedOpen"
              :close-on-content-click="false"
              :activator="selectedElement"
              offset-x
            >
              <v-card
                color="grey lighten-4"
                min-width="350px"
                flat
              >
                <v-toolbar
                  :color="selectedEvent.color"
                  dark
                >
                  <v-btn icon @click="showCalendarDialog('update')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-icon @click="selectedOpen = false">
                    mdi-close
                  </v-icon>
                </v-toolbar>
                <v-card-text>
                  <span>{{ startDateTime }} ~ {{ endDateTime }}</span>
                  <v-divider class="mx-2 my-4"></v-divider>
                  <span>{{ detail }}</span>
                  <v-divider class="mx-2 my-4"></v-divider>
                  <span v-show="userShow">연관 유저<br></span>
                  <li v-for="user in users" :key="user.id">{{ user.name }}</li>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    text
                    color="secondary"
                    @click="deleteCalendar"
                  >
                    삭제
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>   

    <v-dialog v-model="calendarDialog" persistent max-width="600">
      <calendar-component @calendarFormClosed="closeCalendarDialog" :mode="mode" :nowEventInfoForUpdate="nowEventInfoForUpdate" :isOpened="calendarDialog"></calendar-component>
    </v-dialog>

  </v-layout>
</template>

<script>

import axios from 'axios';
import main from '../main';
import CalendarComponent from '../components/CalendarForm'
import moment from 'moment'

export default {
  data() {
    return {
      focus: '',
      type: 'month',
      typeToLabel: {
        month: '월',
        week: '주',
        day: '일',
        '4day': '4일',
      },
      start: null,
      end: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1', 'light-blue', 'teal', 'brown', 'blue-grey', 'lime', 'light-green', 'pink'],
      calendars: [],
      today: new Date().toISOString().substring(0,10),
      detail: null,
      users: [],
      calendarDialog: false,
      startDateTime: null,
      endDateTime: null,
      eventHeight: 15,
      userShow: false,
      mode: null,
      nowEventInfoForUpdate: {
        no: null,
        title: null,
        startDate: null,
        endDate: null,
        content: null,
        relatedUsernameList: [],
      },
      event: null,
    }
  },
  components: {
    'calendar-component': CalendarComponent,
  },
  computed: {
    title () {
      const { start, end } = this
      if (!start || !end) {
        return ''
      }

      const startMonth = this.monthFormatter(start)
      const endMonth = this.monthFormatter(end)
      const suffixMonth = startMonth === endMonth ? '' : endMonth

      const startYear = start.year
      const endYear = end.year
      const suffixYear = startYear === endYear ? '' : endYear

      const startDay = start.day + '일'
      const endDay = end.day + '일'

      switch (this.type) {
        case 'month':
          return `${startMonth} ${startYear}`
        case 'week':
        case '4day':
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
        case 'day':
          return `${startMonth} ${startDay} ${startYear}`
      }
      return ''
    },
    monthFormatter () {
      return this.$refs.calendar.getFormatter({
        timeZone: 'UTC', month: 'long',
      })
    },
  },
  mounted () {
    this.$refs.calendar.checkChange()
  },
  methods: {
    viewDay ({ date }) {
      this.focus = date
      this.type = 'day'
    },
    getEventColor (event) {
      return event.color
    },
    setToday () {
      this.focus = new Date().toUTCString()
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        setTimeout(() => this.selectedOpen = true, 10)
      }
      if (this.selectedOpen) {
        this.selectedOpen = false
        setTimeout(open, 10)
      } else {
        open()
      }
      nativeEvent.stopPropagation()

      this.readCalendar(event)
    },
    getAllCalendar(){
      return axios.get(`${main.resourceHost}/calendars?username=${this.$store.state.user.username}`)
        .then(res=>{
          let calendars = []
          for(let i=0; i<res.data.length; i++){
            let calendar = {
              no: res.data[i].no,
              title: res.data[i].title,
              startDate: this.getLocalTime(res.data[i].startDate),
              endDate: this.getLocalTime(res.data[i].endDate),
            }
            calendars.push(calendar)
          }
          this.calendars = calendars
        })
        .catch(err=>console.log(err))
    },
    async changeCalendar ({ start, end }) {   // read all calendar (brief info)
      await this.getAllCalendar();
      const events = []

      for(let i=0; i<this.calendars.length; i++){
        let startDate = new Date(this.calendars[i].startDate)
        let endDate = new Date(this.calendars[i].endDate)
        let allday = ((endDate.getDate() != startDate.getDate()))? true:false

        events.push({   // you can add custom fields to event object.
          no: this.calendars[i].no,
          name: this.calendars[i].title,
          start: this.formatDate(startDate, !allday), 
          end: this.formatDate(endDate, !allday),
          color: this.colors[this.rnd(0, this.colors.length - 1)],  // "#" + Math.round(Math.random()*0xFFFFFF).toString(16)  // random color code
          startDate: startDate,  // not formatting date
          endDate: endDate,
        })
      }
      this.start = start  // when event is emitted, start is changed in parameter of this function. register this parameter to data.
      this.end = end
      this.events = events   
    },
    rnd (a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a
    },
    formatDate (a, withTime) {
      return withTime
        ? `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()} ${a.getHours()}:${a.getMinutes()}`
        : `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()}`
    },

    readCalendar(event){
      axios.get(`${main.resourceHost}/calendars/${event.no}`)
        .then(res=>{
          this.detail = res.data.content
          this.startDateTime = this.formatDate(event.startDate, true)
          this.endDateTime = this.formatDate(event.endDate, true)
          this.users = []
          for(let idx=0; idx<res.data.relatedUsernameList.length; idx++){
            this.users.push({id: idx, name: res.data.relatedUsernameList[idx]})
          }   
          return res
        })
        .then((res)=> {
          if(res.data.relatedUsernameList.length == 0){ this.userShow = false }
          else { this.userShow = true }
  
          this.propInfoToChildForUpdate(event, res)
          this.no = event.no  // set now event's no
        })
        .catch(err=>console.log(err))
    },
    propInfoToChildForUpdate(event, res){
      this.nowEventInfoForUpdate = {
        no: event.no,
        title: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        content: res.data.content,
        relatedUsernameList: res.data.relatedUsernameList,
      }
    },

    deleteCalendar(){ 
      axios.delete(`${main.resourceHost}/calendars/${this.no}`)
        .then(res=>{
          this.selectedOpen = false
          this.refreshCalendar()
        })
        .catch(err=>console.log(err))
    },     

    showCalendarDialog(mode){  // mode : create or update
      this.calendarDialog = true
      this.mode = mode  // propagate mode to child component
    },
    closeCalendarDialog(){
      this.calendarDialog = false
      this.refreshCalendar()
    },

    getLocalTime(date){
      return moment.utc(date).local().format()
    },
    refreshCalendar(){
      this.$refs.todayRef.$emit('click')  // for force change
      this.$refs.calendar.checkChange()
    },
  },
}
</script>