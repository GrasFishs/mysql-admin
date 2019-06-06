<!-- 数据库列表 -->
<template>
  <div>
    <mu-list toggle-nested>
      <mu-list-item v-for="(db,index) of databases"
                    button
                    :ripple="false"
                    @toggle-nested="toggleTable(index)"
                    nested
                    :open="tableOpen === index"
                    :key="db.name">
        <mu-list-item-action>
          <font-icon icon="database"></font-icon>
        </mu-list-item-action>
        <mu-list-item-title>{{db.name}}</mu-list-item-title>
        <mu-list-item-action>
          <font-icon icon="angle-down"></font-icon>
        </mu-list-item-action>
        <mu-list-item v-for="(table,i) of db.tables"
                      :key="table.name"
                      button
                      nested
                      :ripple="false"
                      @toggle-nested="toggleCol(i)"
                      :open="colOpen === i"
                      slot="nested"
                      @click="setTable(db.name,table.name)">
          <mu-list-item-action>
            <font-icon icon="table"></font-icon>
          </mu-list-item-action>
          <mu-list-item-title>
            {{table.name | omit}}
          </mu-list-item-title>
          <mu-list-item-action>
            <font-icon icon="angle-down"></font-icon>
          </mu-list-item-action>
          <mu-list-item v-for="col of table.cols"
                        :key="col.Field"
                        button
                        :ripple="false"
                        slot="nested">
            <mu-list-item-action>
              <font-icon :icon="col.Key==='PRI'?'key':'align-right'"></font-icon>
            </mu-list-item-action>
            <mu-list-item-title class="col">
              {{col.Field | omit}}<span class="type">({{col.Type}})</span>
            </mu-list-item-title>
          </mu-list-item>
        </mu-list-item>
      </mu-list-item>
    </mu-list>
  </div>
</template>
<script>
export default {
  name: "dbList",
  components: {},
  data () {
    return {
      tableOpen: -1,
      colOpen: -1
    };
  },
  filters: {
    omit (value, len = 15) {
      return value.length > len ? `${value.slice(0, len - 1)}...` : value;
    }
  },
  computed: {
    databases () {
      return this.$store.state.db.databases;
    }
  },
  methods: {
    toggleTable (index) {
      this.tableOpen = index;
    },
    toggleCol (index) {
      this.colOpen = index;
    },
    setTable (database, table) {
      //this.$store.state.database = database;
      const t = `${database}.${table}`;
      this.$emit('onSelect', t)
      //this.$store.commit("setColumns");
    }
  }
};
</script>
<style lang="scss">
.mu-item {
  height: 30px;
  &-action {
    min-width: 20px;
  }
  .col {
    font-size: 0.8rem;
    font-weight: 600;
    .type {
      font-weight: 500;
      color: darkred;
    }
  }
}
</style>