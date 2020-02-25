<template>
  <v-layout align-center justify-center>
    <v-flex text-center>
      <h1>Collour</h1>
      <h3>Ver. 0.0.1 (for developer)</h3>
      <br />
      <p>제품 인증 여부: 인증되지 않음.</p>
      <v-alert prominent type="error">
        <v-row align="center">
          <v-col class="grow">
            아직 제품 인증이 되지 않았습니다.
            <br />제품 라이선스를 구입하신 후 인증을 완료해주시기 바랍니다.
          </v-col>
          <v-col class="shrink">
            <v-btn @click.stop="dialog = true">제품 인증하기</v-btn>
            <v-dialog v-model="dialog" max-width="400">
              <v-card>
                <v-card-title class="headline">제품 인증하기</v-card-title>
                <v-card-text>개발자 버전으로 라이선스 인증이 필요 없습니다.</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="dialog = false">닫기</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
      </v-alert>
      <br />
      <v-divider></v-divider>
      <br />
      <v-alert
        border="left"
        colored-border
        type="info"
        elevation="2">
          Collour는 사용권 계약이 필요한 상업용 소프트웨어 입니다.
          <br />제품의 라이선스 구입과 인증 과정을 통하여 모든 기능을 정당하게 이용할 수 있습니다.
          <br />비정상적인 방법을 통해 제품을 이용하는 경우에는 관련법에 의해 처벌받을 수 있음을 고지하여 드립니다.
      </v-alert>
      <v-alert
        border="left"
        colored-border
        type="info"
        elevation="2"
      >
        제품 이용 중에 발생하신 문제는 Collour 개발팀으로 문의하여 주시기 바랍니다.
      </v-alert>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
    }
  },
};
</script>
