<template>
  <span>
    <span @click="setPage(1)"
          :class="{icon:true, disable:currentPage===1}">
      |&lt;
    </span>
    <span @click="prev"
          :class="{icon:true, disable:currentPage===1}">
      &lt;
    </span>
    <span>
      {{range[0]}}-{{range[1]}} of {{total}}
    </span>
    <span @click="next"
          :class="{icon:true, disable:currentPage===maxPage}">
      &gt;
    </span>
    <span @click="setPage(maxPage)"
          :class="{icon:true, disable:currentPage===maxPage}">
      &gt;|
    </span>
  </span>
</template>
<script>
export default {
  props: {
    total: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 500
    },
    currentPage: {
      type: Number,
      default: 1
    }
  },
  computed: {
    maxPage () {
      return this.size > this.total ? 1 : Math.ceil(this.total / this.size);
    },
    range () {
      return [(this.currentPage - 1) * this.size + 1,
      this.currentPage === this.maxPage ?
        this.total :
        (this.currentPage) * this.size]
    }
  },
  methods: {
    setPage (page) {
      this.$emit('onPageChange', page)
    },
    next () {
      if (this.currentPage < this.maxPage) {
        this.setPage(this.currentPage + 1)

      }
    },
    prev () {
      if (this.currentPage > 1) {
        this.setPage(this.currentPage - 1)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.icon {
  margin: 2px;
  color: black;
  cursor: pointer;
  transition: 0.2s;
  &.disable {
    cursor: not-allowed;
    color: lightgray;
  }
}
</style>
