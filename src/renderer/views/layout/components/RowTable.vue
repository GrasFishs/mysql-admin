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
                       width="55">
      </el-table-column>
      <el-table-column type="index">
      </el-table-column>
      <el-table-column v-for="(column,index) of table.columns"
                       :key="index"
                       sortable
                       :label="column.Field">
        <template slot-scope="scope">
          <input v-if="column.Field !== PK"
                 class="prop"
                 v-model="scope.row[column.Field]"
                 @input="updateField(scope.row)">
          <el-tooltip v-if="column.Field === PK"
                      content="Be carefully update!"
                      placement="top">
            <input class="prop"
                   v-model="scope.row[column.Field]"
                   @input="updateField(scope.row)">
          </el-tooltip>
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
    },
    currentTable: {
      type: String,
      default: ''
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
      handleData: {
        removes: [],
        adds: [],
        updates: []
      }
    };
  },
  computed: {
    table () {
      return this.currentTable ?
        this.$store.state.db.tables[this.currentTable] : null;
    },
    PK () {
      return this.table.columns.filter(col => col["Key"] === "PRI")[0].Field;
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
        this.$store.dispatch("db/getTableRows", { table: this.currentTable }).then(({ total }) => {
          this.loading = false;
          loading.close();
          this.$store.commit('db/SET_TABLE_PAGE', { table: this.currentTable, size: Math.min(total, this.table.size) });
        });
      } else {
        this.isError = true;
      }
    },
    onPageChange (page) {
      this.$store.commit('db/SET_TABLE_PAGE', { table: this.currentTable, page })
      this.getValues();
    },
    recover () {
      this.clearState();
      this.getValues();
    },
    updateField (row) {
      if (row[this.PK]) {
        //this.setSelection(this.rows[row.index]);
        if (
          !this.handleData.updates.includes(row) &&
          !this.handleData.adds.includes(row)
        ) {
          this.changeBackground([row.index], Colors.update);
          this.handleData.updates.push(row);
        }
      }
    },
    removeRows () {
      const selectsIndex = this.selects.map(_ => _.index);
      const selectedPKs = this.table.rows
        .filter((row, index) => selectsIndex.includes(index))
        .map(_ => _[this.PK]);
      this.changeBackground(this.selects.map(_ => _.index), Colors.remove);
      for (const pk of selectedPKs) {
        this.handleData.removes.push({ key: this.PK, value: pk });
      }
    },
    addRow () {
      this.$store.commit("db/ADD_ROW", this.currentTable);
      setTimeout(() => {
        const last = this.table.rows[this.table.rows.length - 1];
        this.changeBackground([last.index], Colors.add);
        //this.setSelection(last);
        this.handleData.adds.push(last);
        this.$refs.table.bodyWrapper.scrollTop =
          this.$refs.table.bodyWrapper.scrollHeight;
      }, 100);
    },
    async handle () {
      for (const obj of this.handleData.removes) {
        await this.$store.dispatch("removeRow", obj);
      }
      const updates = this.handleData.updates.map(value => ({
        key: this.PK,
        value: excludeIndex(value)
      }));
      for (const obj of updates) {
        await this.$store.dispatch("updateRow", obj);
      }
      for (const row of this.handleData.adds) {
        await this.$store.dispatch("db/addRow", { table: this.currentTable, row: excludeIndex(row) });
      }
      this.recover();
    },
    clearState () {
      if (this.$refs.table) {
        this.$refs.table.clearSelection();
        this.selects = [];
        for (const key in this.handleData) {
          this.handleData[key] = [];
        }
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

function excludeIndex (obj) {
  const json = {};
  for (let key of Object.keys(obj)) {
    if (key !== "index") {
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