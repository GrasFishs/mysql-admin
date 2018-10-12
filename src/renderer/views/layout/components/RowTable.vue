<!-- 查询表 -->
<template>
  <div>
    <mu-button color="primary" icon @click="getValues">
      <font-icon icon="sync-alt"></font-icon>
    </mu-button>
    <mu-button color="error" icon @click="removeRows">
      <font-icon icon="minus"></font-icon>
    </mu-button>
    <mu-button color="success" icon>
      <font-icon icon="plus"></font-icon>
    </mu-button>
     <mu-button color="#1565c0" icon @click="recover">
      <font-icon icon="history"></font-icon>
    </mu-button>
    <mu-button color="warning" icon @click="handle">
      <font-icon icon="cloud-upload-alt"></font-icon>
    </mu-button>
    <el-table
      height="580" 
      border 
      :loading="loading" 
      stripe 
      :data="rows" 
      >
      <el-table-column
        type="index"
        label=" "
        >
      </el-table-column>
      <el-table-column 
        v-for="(column,index) of columns"
        :key="index"
        :label="column.Field"
        :prop="column.Field">
      </el-table-column>
    </el-table>
    <mu-dialog title="提醒" width="360" :open.sync="isError">
      请选择查询的表和数据库
      <mu-button slot="actions" flat color="primary" @click="isError = false">关闭</mu-button>
    </mu-dialog>
  </div>
</template>
<script>
export default {
  name: "rowTable",
  components: {},
  data() {
    return {
      loading: false,
      isError: false,
      selects: [],
      handleData: {
        removes: [],
        adds: [],
        updates: []
      }
    };
  },
  computed: {
    rows() {
      const rs = this.$store.state.rows || [];
      return rs;
    },
    columns() {
      return this.$store.state.columns;
    },
    mdColumns() {
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
    }
  },
  methods: {
    getValues() {
      const database = this.$store.state.database;
      const table = this.$store.state.table;
      if (database && table) {
        this.loading = true;
        setTimeout(() => {
          this.$store.dispatch("getValues").then(() => (this.loading = false));
        }, 100);
      } else {
        this.isError = true;
      }
    },
    recover() {
      this.selects = [];
      this.handleData.removes = [];
      const trs = Array.from(document.querySelectorAll("tr")).slice(1);
      trs.forEach(tr => (tr.style.cssText = ""));
    },
    removeRows() {
      const selectedIds = this.rows
        .filter(row => this.selects.includes(row.index - 1))
        .map(_ => _.id);
      const trs = Array.from(document.querySelectorAll("tr")).slice(1);
      trs.filter((tr, index) => this.selects.includes(index)).forEach(tr => {
        tr.style.background = "#ef9a9a";
      });
      for (const id of selectedIds) {
        this.handleData.removes.push({ id });
      }
    },
    async addRow() {},
    async handle() {
      for (const obj of this.handleData.removes) {
        await this.$store.dispatch("removeRow", obj);
      }
      this.getValues();
      this.recover();
      this.selects = [];
    }
  }
};
</script>
<style lang="scss">
.el-table {
  .cell {
    white-space: nowrap !important;
    max-height: 20px !important;
  }
}
</style>