<template>
  <div class="page-container">
    <mu-drawer :docked="false"
               :open.sync="dbsVisible">
      <div class="drawer-title"
           @click="refresh">Databases</div>
      <mu-divider></mu-divider>
      <DBList @onSelect="handleSelect" />
    </mu-drawer>
    <div style="overflow:auto">
      <mu-appbar color="primary"
                 :z-depth="0">
        <mu-button slot="left"
                   icon
                   @click="dbsVisible = !dbsVisible">
          <font-icon icon="bars"></font-icon>
        </mu-button>
        MySQL管理系统
        <div slot="right">
          数据库/表:{{currentTable}}
        </div>
      </mu-appbar>
      <TablesNav :currentTable="currentTable"
                 :tables="tables"
                 @onSelect="handleSelect"
                 @onClose="handleClose" />
      <RowTable :drawerShow="dbsVisible" />
      <Logger />
    </div>
  </div>
</template>

<script>
import { DBList, RowTable, Logger, TablesNav } from "./components";
import { mapState } from 'vuex'
export default {
  name: "layout",
  components: { DBList, RowTable, Logger, TablesNav },
  data () {
    return {
      dbsVisible: true
    }
  },
  computed: {
    ...mapState('db', {
      databases: state => state.databases,
      tables: state => Object.keys(state.tables),
      currentTable: state => state.currentTable
    })
  },
  methods: {
    setTable (t) {
      this.$store.commit('db/SET_TABLE', t)
    },
    handleSelect (t) {
      this.$store.commit('db/ADD_TABLE', t)
      this.setTable(t)
    },
    handleClose (t) {
      const index = this.tables.indexOf(t);
      this.$store.commit('db/REMOVE_TABLE', t)
      if (this.tables.length > 0) {
        if (index === 0) {
          this.setTable(this.tables[0]);
        } else {
          this.setTable(this.tables[index - 1]);
        }
      }
    },
    refresh () {
      const loading = this.$loading({
        lock: true,
        background: "hsla(0,0%,100%,.1)",
        text: "获取数据中..."
      });
      this.$store.dispatch("account/connect").then(() => {
        loading.close();
      })
    }
  }
};
</script>

<style lang="scss" scoped>
// Demo purposes only
.drawer-title {
  margin: 10px 15px;
  font-size: 2rem;
  color: #1e88e5;
  cursor: pointer;
}
.mu-drawer {
  width: 300px;
}
</style>