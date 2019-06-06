<!-- 查询表 -->
<template>
  <div>
    <div class="ops">
      <Page :total="total"
            :size="size"
            :currentPage="page"
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
                 :disabled="rows.length === 0">
        <font-icon icon="minus"></font-icon>
      </mu-button>
      <mu-button color="success"
                 small
                 icon
                 @click="addRow"
                 :disabled="rows.length === 0">
        <font-icon icon="plus"></font-icon>
      </mu-button>
      <mu-button color="#1565c0"
                 small
                 icon
                 @click="recover"
                 :disabled="rows.length === 0">
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
              :data="rows"
              ref="table"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection"
                       width="55">
      </el-table-column>
      <el-table-column type="index">
      </el-table-column>
      <el-table-column v-for="(column,index) of columns"
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
</template>
<script>
import Page from './Page'

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
      if (newValue === false) {
        const { database, table } = this.$store.state;
        if (database && table) {
          const loading = this.$loading({
            lock: true,
            background: "hsla(0,0%,100%,.1)",
            text: "获取数据中..."
          });
          this.page = 1;
          this.size = defaultSize;
          this.$store.dispatch("getValues", { page: this.page, size: this.size }).then(() => {
            loading.close();
            this.size = Math.min(this.total, this.size);
          });
        }
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
    rows () {
      const rs = this.$store.state.rows || [];
      return rs.map((item, index) => ({ ...item, index }));
    },
    columns () {
      return this.$store.state.columns;
    },
    total () {
      return this.$store.state.total;
    },
    mdColumns () {
      if (this.$store.state.columns.length > 0) {
        const cols = this.$store.state.columns.map(obj => {
          const matches = obj.Type.match(/\(.+\)/g);
          const reg = matches ? matches[0].replace(/\(|\)/g, "") : "20";
          const len = reg.includes(",")
            ? reg
              .split(",")
              .map(Number)
              .reduce((a, b) => a + b)
            : Number(reg);
          return {
            title: obj.Field,
            name: obj.Field,
            width: 80 + len * 5,
            align: "center"
          };
        });
        cols.unshift({
          title: "index",
          name: "index",
          width: 80,
          align: "center"
        });
        return cols;
      } else {
        return [];
      }
    },
    PK () {
      return this.columns.filter(col => col["Key"] === "PRI")[0].Field;
    }
  },
  methods: {
    handleSelectionChange (selection) {
      this.selects = selection;
    },
    getValues () {
      const { database, table } = this.$store.state;
      this.clearState();
      if (database && table) {
        this.loading = true;
        const loading = this.$loading({
          lock: true,
          background: "hsla(0,0%,100%,.1)",
          text: "获取数据中..."
        });
        setTimeout(() => {
          this.$store.dispatch("getValues", { size: this.size, page: this.page }).then(() => {
            this.loading = false;
            loading.close();
          });
        }, 100);
      } else {
        this.isError = true;
      }
    },
    onPageChange (page) {
      this.page = page;
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
          this.changeBackground([row.index], "#90caf9");
          this.handleData.updates.push(row);
        }
      }
    },
    removeRows () {
      const selectsIndex = this.selects.map(_ => _.index);
      const selectedPKs = this.rows
        .filter((row, index) => selectsIndex.includes(index))
        .map(_ => _[this.PK]);
      this.changeBackground(this.selects.map(_ => _.index), "#f48fb1");
      for (const pk of selectedPKs) {
        this.handleData.removes.push({ key: this.PK, value: pk });
      }
    },
    addRow () {
      this.$store.commit("addRow");
      setTimeout(() => {
        const last = this.rows[this.rows.length - 1];
        this.changeBackground([last.index], "#81c784");
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
      const adds = this.handleData.adds.map(value => ({
        key: this.PK,
        value: excludeIndex(value)
      }));
      for (const obj of adds) {
        await this.$store.dispatch("addRow", obj);
      }
      this.recover();
    },
    clearState () {
      this.$refs.table.clearSelection();
      this.selects = [];
      for (const key in this.handleData) {
        this.handleData[key] = [];
      }
      this.changeBackground();
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
</style>