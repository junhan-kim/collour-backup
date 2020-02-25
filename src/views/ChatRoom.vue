<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >
      <v-flex mb-4>
        <h3 class="display-2 font-weight-bold mb-3">
          채팅방이에요.
        </h3>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from 'axios';
import main from '../main';

export default {
  created() {
    axios.get(`${main.resourceHost}/chats/chatrooms/${this.$route.params.chatRoomId}/messages`).then(res => {
      console.log(res.data)
    }).catch(e => {
      console.log('error')
    })
  },
  mounted() {

  },
}
</script>