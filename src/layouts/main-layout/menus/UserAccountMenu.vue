<template>
  <!--begin::Menu-->
  <div
    class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semobold py-4 fs-6 w-275px"
    data-kt-menu="true"
  >
    <!--begin::Menu item-->
    <div class="menu-item px-3">
      <div class="menu-content d-flex align-items-center px-3">
        <!--begin::Avatar-->
        <div class="symbol symbol-50px me-5">
          <span class="symbol-label bg-primary text-inverse-primary fw-bold">{{
            user.name?.substring(0, 2)
          }}</span>
        </div>
        <!--end::Avatar-->

        <!--begin::Username-->
        <div class="d-flex flex-column">
          <div class="fw-bold d-flex align-items-center fs-5">
            {{ user.name }}
          </div>
        </div>
        <!--end::Username-->
      </div>
    </div>
    <!--end::Menu item-->

    <div class="separator m-3 opacity-75"></div>

    <template v-if="user.permissions?.includes(`profits`)">
      <div class="menu-item px-5">
        <router-link :to="{ name: 'daily-sold' }" class="menu-link px-5"
          >Dienā ietirgotais</router-link
        >
      </div>

      <div class="separator m-3 opacity-75"></div>
    </template>

    <!--begin::Menu item-->
    <div
      v-for="(item, key) in options"
      :key="key"
      class="menu-item px-5"
      data-kt-menu-trigger="hover"
      data-kt-menu-placement="left-start"
      data-kt-menu-flip="center, top"
    >
      <a href="#" @click.prevent class="menu-link px-5">
        <span class="menu-title position-relative">
          {{ item.title }}
          <span
            class="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0"
          >
            {{ item.values[optionValues[key]] }}
          </span>
        </span>
      </a>

      <!--begin::Menu sub-->
      <div class="menu-sub menu-sub-dropdown w-175px py-4">
        <template v-for="(label, value) in item.values" :key="value">
          <!--begin::Menu item-->
          <div class="menu-item px-3">
            <a
              @click.prevent="saveOption(key, value)"
              href="#"
              class="menu-link d-flex px-5"
              :class="{ active: optionValues[key] === value }"
            >
              {{ label }}
            </a>
          </div>
          <!--end::Menu item-->
        </template>
      </div>
      <!--end::Menu sub-->
    </div>
    <!--end::Menu item-->

    <div class="separator m-3 opacity-75"></div>

    <!--begin::Menu item-->
    <div class="menu-item px-5">
      <a @click="signOut()" class="menu-link px-5">Iziet</a>
    </div>
    <!--end::Menu item-->
  </div>
  <!--end::Menu-->
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import ApiService from "@/core/services/ApiService";
import { options, getOption, setOption } from "@/core/services/OptionService";

export default defineComponent({
  name: "kt-user-menu",
  components: {},
  setup() {
    const router = useRouter();
    const store = useAuthStore();

    const signOut = () => {
      store.logout();
      router.push({ name: "sign-in" });
    };

    // Options
    const optionValues = ref({});
    Object.keys(options).forEach((key) => {
      optionValues.value[key] = getOption(key);
    });

    const saveOption = (key: string, value: string) => {
      setOption(key, value);
      optionValues.value[key] = value;
      updateDatabase(key, value);
    };

    const updateDatabase = (key: string, value: string) => {
      const data = {
        key: key,
        value: value,
      };

      ApiService.post("user/settings", data).catch((err) => {
        console.error(err);
      });
    };

    return {
      signOut,
      saveOption,
      optionValues,
      options,
      user: storeToRefs(store).user,
    };
  },
});
</script>
