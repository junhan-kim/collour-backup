<template>
  <v-layout
    align-content-start
    justify-center
  >
    <v-flex>
      <br>
      <h2 class="text-center">공지사항</h2>
      <br>
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-center">번호</th>
            <th class="text-center">제목</th>
            <th class="text-center">작성자</th>
            <th class="text-center">작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in notice" :key="item.text">
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ item.title }}</td>
            <td class="text-center">{{ item.author }}</td>
            <td class="text-center">{{ item.datetime }}</td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from 'axios';
import main from '../main'

export default {
  data() {
    return {
      notice: [
        {
          title: '환영합니다!',
          author: '관리자',
          datetime: '2019-08-18 19:00',
        },
        {
          title: '테스트 글',
          author: '관리자',
          datetime: '2019-08-18 19:30',
        },
        {
          title: '공지사항 리스트 입니다.',
          author: '관리자',
          datetime: '2019-08-18 20:10',
        },
      ],
    }
  },
  created: () => {
    axios.get(`${main.resourceHost}/notice`).then(res => {
      console.log(res.data)
    }).catch(e => {
      console.log('error')
    })

    console.log('created!')
  },
  mounted: () => (
    console.log('mounted!')
  ),
};
</script>
