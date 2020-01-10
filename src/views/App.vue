<template>
  <div id="app">
    <Child></Child>
  </div>
</template>

<script>
import Child from "@/components/child";
export default {
  name: "App",
  data() {
    return {};
  },
  components: {
    Child
  }
};
</script>

<style scoped></style>
