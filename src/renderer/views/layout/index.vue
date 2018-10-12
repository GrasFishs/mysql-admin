<template>
  <div class="page-container">
    <mu-drawer :docked="false" :open.sync="dbsVisible">
      <div class="drawer-title">Databases</div>
      <mu-divider></mu-divider>
      <DBList />
    </mu-drawer>
    <div style="overflow:auto">
      <mu-appbar color="primary">
        <mu-button slot="left" icon @click="dbsVisible = !dbsVisible">
          <font-icon icon="bars"></font-icon>
        </mu-button>
        MySQL管理系统
        <div slot="right">
          数据库/表:{{database}}/{{table}}
        </div>
      </mu-appbar>
      <row-table/>
    </div>
    <div class="logger">
      <div class="log" v-for="(log,i) of logs" :key="i">
        {{log}}
      </div>
    </div>
  </div>
</template>

<script>
import { DBList, RowTable } from "./components";
export default {
  name: "layout",
  components: { DBList, RowTable },
  name: "PersistentFull",
  data: () => ({
    dbsVisible: true
  }),
  computed: {
    database() {
      return this.$store.state.database;
    },
    table() {
      return this.$store.state.table;
    },
    logs() {
      return this.$store.state.logs;
    }
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
// Demo purposes only
.drawer-title {
  margin: 10px 15px;
  font-size: 2rem;
  color: #1e88e5;
}
.mu-drawer {
  width: 300px;
}
.logger {
  height: 200px;
  overflow: auto;
  padding: 10px 8px;
  .log {
    margin-bottom: 10px;
  }
}
</style>