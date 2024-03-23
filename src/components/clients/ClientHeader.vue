<template>
  <!--begin::Navbar-->
  <div class="card mb-5 mb-xl-10">
    <div class="card-body pt-9 pb-0 d-flex d-column">
      <!--begin::Navs-->
      <div class="d-flex overflow-auto h-55px flex-grow-1">
        <ul
          class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold flex-nowrap"
        >
          <li class="nav-item" v-for="(item, index) in menu" :key="index">
            <router-link
              :to="`/client/list/${item.path}`"
              class="nav-link text-active-primary me-6"
              active-class="active"
            >
              {{ item.title }}
            </router-link>
          </li>
        </ul>
      </div>
      <!--begin::Navs-->
      <div>
        <button @click="newClient()" class="btn btn-sm btn-info me-3">
          Jauns
        </button>
      </div>
    </div>
  </div>
  <!--end::Navbar-->
  <router-view></router-view>
  <ClientModal ref="editModal" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ClientModal from "@/components/clients/ClientModal.vue";

export default defineComponent({
  name: "kt-account",
  components: { ClientModal },
  setup() {
    const menu = [
      {
        title: "Piegādātāji",
        path: "suppliers",
      },
      {
        title: "Pircēji",
        path: "buyers",
      },
    ];

    return {
      menu,
    };
  },
  methods: {
    newClient() {
      (this.$refs.editModal as any).show();
    },
  },
});
</script>
