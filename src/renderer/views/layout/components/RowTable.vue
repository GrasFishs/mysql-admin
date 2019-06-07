<!-- 查询表 -->
<template>
  <div v-if="table">
    <div class="ops">
      <Page :total="table ? table.total : 1"
            :size="table ? table.size: 1"
            :currentPage="table ? table.page : 1"
            @onPageChange="onPageChange" />
      <mu-button color="primary"
                 small
                 icon
                 @click="getValues">
        <font-icon icon="sync-alt"></font-icon>
      </mu-button>
      <mu-button color="error"
                 small
                 icon
                 @click="removeRows"
                 :disabled="table && table.rows.length === 0">
        <font-icon icon="minus"></font-icon>
      </mu-button>
      <mu-button color="success"
                 small
                 icon
                 @click="addRow"
                 :disabled="table && table.rows.length === 0">
        <font-icon icon="plus"></font-icon>
      </mu-button>
      <mu-button color="#1565c0"
                 small
                 icon
                 @click="recover"
                 :disabled="table && table.rows.length === 0">
        <font-icon icon="history"></font-icon>
      </mu-button>
      <mu-button color="warning"
                 small
                 icon
                 @click="handle">
        <font-icon icon="cloud-upload-alt"></font-icon>
      </mu-button>
    </div>
    <el-table height="580"
              border
              :loading="loading"
              :data="table.rows"
              ref="table"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection"
                       width="55" />
      <el-table-column type="index" />
      <el-table-column v-for="(column,index) of table.columns"
                       sortable
                       :key="index"
                       :label="column.Field">
        <template slot-scope="scope">
          <input class="prop"
                 :value="scope.row[column.Field]"
                 @change="updateField(scope.row.index,column.Field,$event)">
        </template>
      </el-table-column>
    </el-table>
    <mu-dialog title="提醒"
               width="360"
               :open.sync="isError">
      请选择查询的表和数据库
      <mu-button slot="actions"
                 flat
                 color="primary"
                 @click="isError = false">关闭</mu-button>
    </mu-dialog>
  </div>
  <div class="none"
       v-else>
    没有选中表
  </div>
</template>
<script>
const Colors = {
  add: "#81c784",
  remove: "#f48fb1",
  update: "#90caf9"
}

const Constants = {
  ADD: 'add',
  REMOVE: 'remove',
  UPDATE: 'update'
}

import Page from './Page'
// TODO: sort column by sql
// TODO: show by rows
const defaultSize = 100;
export default {
  name: "rowTable",
  components: { Page },
  props: {
    drawerShow: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    drawerShow (newValue) {
      if (newValue === false && this.currentTable) {
        this.getValues();
      }
    },
    currentTable (v) {
      if (v && this.table.rows.length === 0) {
        this.getValues();
      }
    }
  },
  data () {
    return {
      loading: false,
      isError: false,
      selects: [],
      page: 1,
      size: defaultSize,
      handleRows: {}
    };
  },
  computed: {
    currentTable () {
      return this.$store.state.db.currentTable;
    },
    table () {
      return this.currentTable ?
        this.$store.state.db.tables[this.currentTable] : null;
    },
    PK () {
      // TODO: think about the way without primary key
      return this.table.columns.find(col => col["Key"] === "PRI").Field;
    }
  },
  methods: {
    handleSelectionChange (selection) {
      this.selects = selection;
    },
    getValues () {
      this.clearState();
      if (this.currentTable) {
        console.log(this.table.columns.map(col => col.Field))
        this.loading = true;
        const loading = this.$loading({
          lock: true,
          background: "hsla(0,0%,100%,.1)",
          text: "获取数据中..."
        });
        this.$store.dispatch("db/getTableRows").then(({ total }) => {
          this.loading = false;
          loading.close();
          this.$store.commit('db/SET_TABLE_PAGE', { size: Math.min(total, this.table.size) });
        });
      } else {
        this.isError = true;
      }
    },
    onPageChange (page) {
      this.$store.commit('db/SET_TABLE_PAGE', { page })
      this.getValues();
    },
    recover () {
      this.clearState();
      this.getValues();
    },
    updateField (index, field, e) {
      let rowInState = { ...this.table.rows[index] };
      const { type } = rowInState;
      let newType = type;
      rowInState[field] = e.target.value;
      if (type === Constants.REMOVE || !type) {
        // 移除转化为更新，或者没有类型的就新增更新
        rowInState = {
          type: Constants.UPDATE,
          key: this.PK,
          values: exclude(rowInState)
        }
        newType = Constants.UPDATE;
        this.changeBackground([index], Colors.update);
      }
      this.$store.commit('db/SET_ROW',
        {
          index,
          row: {
            ...rowInState,
            type: newType
          }
        });
      this.handleRows[index] = rowInState;

    },
    removeRows () {
      const selectsIndex = this.selects.map(_ => _.index);
      const selectedPKs = this.table.rows
        .filter((row, index) => selectsIndex.includes(index))
        .map(row => ({
          pk: row[this.PK],
          index: row.index
        }));
      this.changeBackground(this.selects.map(_ => _.index), Colors.remove);
      for (const { pk, index } of selectedPKs) {
        this.handleRows[index] = { type: Constants.REMOVE, key: this.PK, value: pk };
      }
    },
    addRow () {
      this.$store.commit("db/ADD_ROW");
      setTimeout(() => {
        const last = this.table.rows[this.table.rows.length - 1];
        this.changeBackground([last.index], Colors.add);
        //this.setSelection(last);
        last.type = Constants.ADD;
        this.handleRows[last.index] = last;
        this.$refs.table.bodyWrapper.scrollTop =
          this.$refs.table.bodyWrapper.scrollHeight;
      }, 100)
    },
    async handle () {
      for (const index in this.handleRows) {
        const row = this.handleRows[index];
        switch (row.type) {
          case Constants.ADD:
            await this.$store.dispatch("db/addRow", { row: exclude(row) });
            break;
          case Constants.UPDATE:
            await this.$store.dispatch("db/updateRow", { key: row.key, values: exclude(row.values) });
            break;
          case Constants.REMOVE:
            await this.$store.dispatch("db/removeRow", { key: row.key, value: row.value });
            break;
        }
      }
      this.recover();
    },
    clearState () {
      if (this.$refs.table) {
        this.$refs.table.clearSelection();
        this.selects = [];
        this.handleRows = {};
        this.changeBackground();
      }
    },
    setSelection (add) {
      [...this.selects, add].forEach(row =>
        this.$refs.table.toggleRowSelection(row, true)
      );
    },
    changeBackground (selection, color) {
      if (color) {
        const trs = Array.from(document.querySelectorAll("tr")).slice(1);
        trs.filter((tr, index) => selection.includes(index)).forEach(tr => {
          tr.style.background = color;
        });
      } else {
        const trs = Array.from(document.querySelectorAll("tr")).slice(1);
        trs.forEach(tr => (tr.style.cssText = ""));
      }
    },
    keyupEvent (e) {
      if (e.keyCode === 13) {
        console.log("handle");
        this.handle();
      }
    }
  }
  // created() {
  //   document.addEventListener("keyup", this.keyupEvent);
  // },
  // beforeDestroy() {
  //   document.removeEventListener("keyup", this.keyupEvent);
  // }
};

function exclude (obj, excepts = ['index', 'type']) {
  const json = {};
  for (let key of Object.keys(obj)) {
    if (!excepts.includes(key)) {
      json[key] = obj[key];
    }
  }
  return json;
}
</script>
<style lang="scss">
.el-table {
  .cell {
    white-space: nowrap !important;
  }
}
.ops {
  display: flex;
  align-items: center;
  margin: 5px;
}
input.prop {
  outline: none;
  border: none;
  background: transparent;
  width: 100%;
}
.none {
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>