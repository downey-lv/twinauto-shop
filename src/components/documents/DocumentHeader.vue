<template>
  <!--begin::Navbar-->
  <div class="card mb-5 mb-xl-10">
    <div class="card-body pt-9 pb-0 d-flex d-column">
      <!--begin::Navs-->
      <div class="d-flex overflow-auto h-55px flex-grow-1">
        <ul
          class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold flex-nowrap"
          id="documentHeaderSelector"
        >
          <li class="nav-item" v-for="(item, index) in menu" :key="index">
            <router-link
              :to="{ params: { type: item.type } }"
              class="nav-link text-active-primary me-6"
              active-class="active"
            >
              {{ item.title }}
            </router-link>
          </li>
        </ul>
      </div>
      <!--begin::Navs-->
      <div v-if="$route.name === 'document-list'">
        <router-link
          :to="{
            name: 'document-edit',
            params: { editId: 'new', type: $route.params.documentType },
          }"
          class="btn btn-sm btn-info me-3"
        >
          Jauns
        </router-link>
      </div>
    </div>
  </div>
  <!--end::Navbar-->
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
export default defineComponent({
  name: "document-header",
  emits: ["menu-data"],
  setup(_, { emit }) {
    const menu = [
      {
        title: "Pārdošana",
        type: "out",
      },
      {
        title: "Iepirkums",
        type: "in",
      },
      {
        title: "Serviss",
        type: "service",
      },
      {
        title: "Atgriešana",
        type: "return",
      },
      {
        title: "Internets",
        type: "online",
      },
    ];

    onMounted(() => {
      emit("menu-data", menu);
    });

    return {
      menu,
    };
  },
});
</script>
