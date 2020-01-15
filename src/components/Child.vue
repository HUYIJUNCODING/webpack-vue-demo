<template>
  <div class="child-container">
    <img class="avatar" src="../assets/logo.jpg" alt="" />
    {{ title }}
  </div>
</template>

<script>
export default {
  name: "Child",
  props: {},
  components: {},
  data() {
    return {
      title: "一起学习 vue2.0 中配置 webapck4.0 嘿嘿嘿188"
    };
  },
  methods: {},
  computed: {},
  watch: {},
  mounted() {
    //测试 babel
    setTimeout(() => {
      return new Promise(resolve => {
        console.log("babel ok");
        resolve(true);
      }, 1000);
    });
  }
};
</script>

<style scoped lang="scss">
  @import "../styles/child.scss";
</style>