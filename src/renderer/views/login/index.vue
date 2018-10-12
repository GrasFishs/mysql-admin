<!-- 登录 -->
<template>
  <div style="padding:10px">
    <mu-text-field v-model="option.host" label="host" label-float full-width></mu-text-field>
    <mu-text-field v-model="option.user" label="user" label-float full-width></mu-text-field>
    <mu-text-field v-model="option.password" label="password" type="password" label-float full-width></mu-text-field>
    <mu-button color="primary" @click="connect">connect</mu-button>
  </div>
</template>
<script>
import { mainAPI } from "../../service";
export default {
  name: "login",
  components: {},
  data() {
    return {};
  },
  computed: {
    option() {
      return this.$store.state.option;
    }
  },
  methods: {
    connect() {
      this.$store
        .dispatch("connect")
        .then(res => {
          this.$router.push("/");
        })
        .catch(e => {
          this.$message({
            type: "error",
            message: e
          });
        });
    }
  }
};
</script>
<style lang="scss">
</style>