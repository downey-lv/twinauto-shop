<template>
  <!--begin::Navbar-->
  <div class="card mb-5 mb-xl-10">
    <div class="card-body pt-9 pb-0">
      <!--begin::Navs-->
      <div class="d-flex overflow-auto h-55px">
        <ul
          class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold flex-nowrap"
        >
          <li class="nav-item" v-for="(item, index) in menu" :key="index">
            <router-link
              :to="item.path"
              class="nav-link text-active-primary me-6"
              active-class="active"
            >
              {{ item.title }}
            </router-link>
          </li>
        </ul>
      </div>
      <!--begin::Navs-->
    </div>
  </div>
  <!--end::Navbar-->
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "kt-account",
  components: {},
  setup() {
    const menu = [
      {
        title: "Piegādātāji",
        path: "/clients/suppliers",
      },
      {
        title: "Pircēji",
        path: "/clients/buyers",
      },
    ];

    return {
      menu,
    };
  },
});
</script>
