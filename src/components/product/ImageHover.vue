<template>
  <div id="image-viewer" class="image-viewer"></div>
</template>

<style scoped lang="scss">
.image-viewer {
  position: fixed;
  bottom: 15px;
  right: 15px;
  z-index: 1000;
  visibility: hidden;
  background-color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "image-hover",
  components: {},
  setup() {},
  mounted() {
    const imageViewerScript = document.createElement("script");
    imageViewerScript.innerHTML = `function showImage(src = false) {
      const imageViewer = document.getElementById("image-viewer");
      if (imageViewer) {
        if (!src)
            imageViewer.style.visibility = "hidden";
        else {
            imageViewer.innerHTML = "<img src=" + src + " alt='image' style='max-width: 300px' />";
            imageViewer.style.visibility = "visible";
        }
      }
    };`;
    document.head.appendChild(imageViewerScript);
  },
});
</script>
