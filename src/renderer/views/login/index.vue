<!-- 登录 -->
<template>
  <div style="padding:10px">
    <mu-text-field v-model="host"
                   label="host"
                   label-float
                   full-width></mu-text-field>
    <mu-text-field v-model="user"
                   label="user"
                   label-float
                   full-width></mu-text-field>
    <mu-text-field v-model="password"
                   label="password"
                   label-float
                   full-width></mu-text-field>
    <mu-button color="primary"
               @click="connect">connect</mu-button>
  </div>
</template>
<script>
export default {
  name: "login",
  computed: {
    host: {
      get () {
        return this.$store.state.account.host;
      },
      set (v) {
        this.$store.commit('account/SET_HOST', v)
      }
    },
    user: {
      get () {
        return this.$store.state.account.user;
      },
      set (v) {
        this.$store.commit('account/SET_USER', v)
      }
    },
    password: {
      get () {
        return this.$store.state.account.password;
      },
      set (v) {
        this.$store.commit('account/SET_PASSWORD', v)
      }
    },
  },
  methods: {
    connect () {
      this.$store
        .dispatch("account/connect")
        .then(res => {
          this.$router.push("/");
        })
    }
  }
};
</script>
<style lang="scss">
</style>