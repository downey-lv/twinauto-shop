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

    <div class="menu-item px-3">
      <router-link
        :to="{
          name: 'document-edit',
          params: { editId: 'new', type: 'daily' },
        }"
        class="menu-link px-3"
      >
        <i class="fa-solid fa-cash-register fa-fw me-3"></i> Dienas pārdotais
      </router-link>
    </div>

    <div class="separator opacity-75"></div>

    <div class="menu-item px-3">
      <router-link
        :to="{
          name: 'document-edit',
          params: { editId: 'new', type: getOption('default_document_type') },
        }"
        class="menu-link px-3"
      >
        <i class="fa-solid fa-star fa-fw me-3"></i>
        {{ getOptionLabel("default_document_type") }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getOption, getOptionLabel } from "@/core/services/OptionService";

export default defineComponent({
  name: "quick-action",
  methods: { getOptionLabel, getOption },
});
</script>
