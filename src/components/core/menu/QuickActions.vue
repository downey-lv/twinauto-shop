<template>
  <div
    class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary w-200px pb-3"
    data-kt-menu="true"
  >
    <div class="menu-item px-3">
      <div class="menu-content text-dark fw-bold px-3 py-4">Jauns</div>
    </div>

    <div class="separator mb-3 opacity-75"></div>

    <div class="menu-item px-3">
      <router-link
        :to="{ name: 'product-edit', params: { id: 'new' } }"
        class="menu-link px-3"
      >
        <i class="fa-solid fa-boxes-stacked fa-fw me-3"></i> Produkts
      </router-link>
    </div>

    <div class="separator opacity-75"></div>

    <div class="menu-item px-3">
      <router-link
        :to="{ name: 'return-edit', params: { returnId: 'new' } }"
        class="menu-link px-3"
      >
        <i class="fa-solid fa-arrow-rotate-left fa-fw me-3"></i> Atgriešana
      </router-link>
    </div>

    <div class="menu-item px-3">
      <router-link
        :to="{
          name: 'document-edit',
          params: { editId: 'new', type: 'out' },
        }"
        class="menu-link px-3"
      >
        <i class="fa-solid fa-inbox-out fa-fw me-3"></i> Pārdošana
      </router-link>
    </div>

    <div class="menu-item px-3">
      <router-link :to="{ name: 'purchase-import' }" class="menu-link px-3">
        <i class="fa-solid fa-truck fa-fw me-3"></i> Iepirkums
      </router-link>
    </div>

    <!--    &lt;!&ndash;begin::Menu item&ndash;&gt;-->
    <!--    <div-->
    <!--      class="menu-item px-3"-->
    <!--      data-kt-menu-trigger="hover"-->
    <!--      data-kt-menu-placement="right-start"-->
    <!--      data-kt-menu-flip="left-start, top"-->
    <!--    >-->
    <!--      &lt;!&ndash;begin::Menu item&ndash;&gt;-->
    <!--      <a href="#" class="menu-link px-3">-->
    <!--        <span class="menu-title">Jauns dokuments</span>-->
    <!--        <span class="menu-arrow"></span>-->
    <!--      </a>-->
    <!--      &lt;!&ndash;end::Menu item&ndash;&gt;-->

    <!--      &lt;!&ndash;begin::Menu sub&ndash;&gt;-->
    <!--      <div class="menu-sub menu-sub-dropdown w-175px py-4 px-3">-->
    <!--        <router-link :to="{ name: 'purchase-import' }" class="menu-link px-3">-->
    <!--          Iepirkums-->
    <!--        </router-link>-->
    <!--        <router-link-->
    <!--          :to="{-->
    <!--            name: 'document-edit',-->
    <!--            params: { editId: 'new', type: 'out' },-->
    <!--          }"-->
    <!--          class="menu-link px-3"-->
    <!--        >-->
    <!--          Pārdošana-->
    <!--        </router-link>-->
    <!--      </div>-->
    <!--      &lt;!&ndash;end::Menu sub&ndash;&gt;-->
    <!--    </div>-->
    <!--    &lt;!&ndash;end::Menu item&ndash;&gt;-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "quick-action",
});
</script>
