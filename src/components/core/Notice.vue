<template>
  <!--begin::Notice-->
  <div
    :class="
      `notice
      bg-light-${color}
      rounded
      border-${color}
      border
      border-dashed
      ${classes}
     ${padding} ` + (icon ? 'd-flex' : '')
    "
  >
    <!--begin::Icon-->
    <i
      v-if="icon"
      class="fs-2x me-4 ms-4 fa-solid fa-spinner-third"
      :class="`fa-${icon} text-${color}`"
    ></i>

    <!--end::Icon-->

    <!--begin::Wrapper-->
    <div v-if="$slots.default">
      <div class="fs-6 text-gray-700 pe-7"><slot></slot></div>
    </div>
    <div v-else class="d-flex flex-stack flex-grow-1">
      <!--begin::Content-->
      <div v-if="body || title" :class="`fw-semobold ${button}`">
        <h4 v-if="title" class="text-gray-900 fw-bold">{{ title }}</h4>

        <div v-if="body" v-html="body" :class="`fs-6 text-gray-700 pe-7`"></div>
      </div>
      <!--end::Content-->

      <!--begin::Action-->
      <a
        v-if="button"
        :href="buttonUrl"
        :class="`btn btn-${color} px-6 align-self-center text-nowrap`"
        :data-bs-toggle="buttonModalId ? 'modal' : false"
        :data-bs-target="buttonModalId ? buttonModalId : false"
      >
        {{ buttonLabel }}
      </a>
      <!--end::Action-->
    </div>
    <!--end::Wrapper-->
  </div>
  <!--end::Notice-->
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "kt-notify",
  props: {
    classes: { type: String },
    icon: { type: String },
    title: { type: String },
    body: { type: String },
    button: { type: String },
    buttonLabel: { type: String, default: "Button" },
    buttonUrl: { type: String, default: "#" },
    buttonModalId: { type: String },
    color: { type: String, default: "primary" },
    padding: { type: String, default: "p-6" },
  },
  components: {},
});
</script>
