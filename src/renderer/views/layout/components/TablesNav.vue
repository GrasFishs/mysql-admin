<template>
  <div class="tables"
       v-if="tables.length > 0">
    <div v-for="(table,index) in tables"
         :class="{table:true,selected: currentTable === table}"
         :key="index"
         @click="selectTable(table)">
      {{table}}
      <i @click="closeTable(table,$event)"
         class="el-icon-close icon">
      </i>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    currentTable: {
      type: String,
      default: ''
    },
    tables: {
      type: Array,
      default: []
    }
  },
  methods: {
    selectTable (table) {
      this.$emit('onSelect', table)
    },
    closeTable (table,e) {
      // wtf , why add this stopPropagation can work?
      e.stopPropagation();
      this.$emit('onClose', table)
    }
  }
}
</script>
<style lang="scss" scoped>
.tables {
  display: flex;
  align-items: center;
  .table {
    padding: 5px 8px;
    background: lightgray;
    color: gray;
    transition: 0.2s;
    display: flex;
    align-items: center;
    margin-right: 1px;
    cursor: pointer;
    &.selected {
      background: white;
      color: black;
    }
    .icon {
      margin-left: 10px;
      color: gray;
      transition: 0.2s;
      &:hover {
        color: black;
      }
    }
  }
}
</style>
