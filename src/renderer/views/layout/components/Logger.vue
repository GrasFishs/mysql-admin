<!--  -->
<template>
  <div>
    <div class="logger" ref="logger">
      <div class="log" v-for="(log,i) of logs" :key="i">
        <div class="time">{{log.time}}</div>
        <div class="sql">{{log.sql}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'
export default {
  components: {},
  data() {
    return {};
  },
  watch: {
    logs(nL, oL) {
      if (nL.length > oL.length) {
        setTimeout(() => {
          this.$refs.logger.scrollTop = this.$refs.logger.scrollHeight;
        }, 100);
      }
    }
  },
  computed: {
    logs() {
      return this.$store.state.logs;
    }
  },
  methods: {}
};
</script>
<style scoped lang="scss">
.logger {
  background: rgb(41, 52, 71);
  color: rgb(230, 230, 230);
  font-family: Consolas, "Courier New", monospace;
  height: 200px;
  overflow: auto;
  padding: 10px 8px;
  .log {
    margin-bottom: 10px;
    .time {
      color: rgb(63, 199, 36);
    }
    .sql {
      &::before {
        content: "> ";
      }
      &::after {
        content: " ;";
      }
    }
  }
}
</style>