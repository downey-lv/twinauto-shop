<template>
  <MenuComponent menu-selector="#history-menu">
    <template v-slot:toggle>
      <div
        class="btn btn-icon btn-active-light-primary position-relative w-30px h-30px w-md-40px h-md-40px"
        data-kt-menu-target="#history-menu"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
        data-kt-menu-flip="bottom"
        ref="button"
      >
        <i class="fa-solid fa-clock-rotate-left fs-2"></i>
      </div>
    </template>
    <template v-slot:content>
      <!--begin::Menu-->
      <div
        class="menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px"
        data-kt-menu="true"
        id="history-menu"
        ref="menu"
      >
        <!--begin::Heading-->
        <div class="d-flex flex-column bgi-no-repeat rounded-top">
          <!--begin::Title-->
          <h3 class="text-white fw-semobold px-9 mt-10 mb-6">Vēsture</h3>
          <!--end::Title-->

          <!--begin::Tabs-->
          <ul
            class="nav nav-line-tabs nav-line-tabs-2x nav-stretch fw-semobold px-9"
          >
            <li class="nav-item" v-for="(row, idx) in data" :key="idx">
              <a
                class="nav-link text-white opacity-75 opacity-state-100 pb-4"
                :class="idx === 'documents' ? 'active' : ''"
                data-bs-toggle="tab"
                :href="`#history_tab_${idx}`"
                >{{ row.title }}</a
              >
            </li>
          </ul>
          <!--end::Tabs-->
        </div>
        <!--end::Heading-->

        <!--begin::Tab content-->
        <div class="tab-content">
          <!--begin::Tab panel-->
          <template v-for="(row, idx) in data" :key="idx">
            <div
              class="tab-pane fade"
              :class="idx === 'documents' ? 'show active' : ''"
              :id="`history_tab_${idx}`"
              role="tabpanel"
            >
              <!--begin::Wrapper-->
              <div class="d-flex flex-column px-9 pt-2">
                <div
                  style="max-height: 300px"
                  ref="history-scroll"
                  class="scroll-y"
                >
                  <template v-for="(entry, i) in row.data" :key="i">
                    <div class="d-flex align-items-sm-center mb-5">
                      <div
                        class="d-flex align-items-center flex-row-fluid flex-wrap"
                      >
                        <div class="flex-grow-1 me-2">
                          <router-link
                            @click="hideMenu()"
                            :to="entry.path"
                            class="text-gray-800 text-hover-primary fs-6 fw-bold"
                            >{{ entry.title }}</router-link
                          >

                          <span class="text-muted fw-semobold d-block fs-7">
                            {{ entry.comment }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <!--end::Wrapper-->
            </div>
          </template>
          <!--end::Tab panel-->
        </div>
        <!--end::Tab content-->
      </div>
      <!--end::Menu-->
    </template>
  </MenuComponent>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useViewHistoryStore } from "@/stores/viewHistory";
import { useRouter } from "vue-router";
import MenuComponent from "@/components/core/menu/MenuComponent.vue";

export default defineComponent({
  name: "view-history",
  components: { MenuComponent },
  setup() {
    const menu = ref(null);
    const data = ref({
      documents: {
        title: "Dokumenti",
        data: [] as any[],
      },
    });

    const historyStore = useViewHistoryStore();
    const loadHistory = () => {
      const history = historyStore.getHistory();
      // Loop through the data and add it to the data object
      for (const key in history) {
        data.value[key].data = history[key].reverse();
      }
    };

    // Load the history on mount
    onMounted(() => {
      loadHistory();
    });

    // Listen for route changes
    const router = useRouter();
    router.beforeEach(() => {
      loadHistory();
    });

    return {
      data,
      menu,
    };
  },
  methods: {
    hideMenu() {
      // Reset scroll
      const scroll = this.$refs["history-scroll"] as HTMLElement;
      for (const s in scroll) {
        scroll[s].scrollTop = 0;
      }

      // Hide the menu
      const menu = this.$refs.menu as HTMLElement;
      const button = this.$refs.button as HTMLElement;
      if (menu) menu.classList.remove("show");
      if (button) button.classList.remove("show");
    },
  },
});
</script>
