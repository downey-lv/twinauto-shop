<template>
  <div class="card" v-loading="loading">
    <div class="card-header border-0 pt-5">
      <h3 class="card-title">{{ title }}</h3>
      <div class="card-toolbar">
        <button class="btn btn-light-info" @click="openModal(null)">
          <i class="fa-solid fa-plus"></i> Jauns
        </button>
      </div>
    </div>
    <div class="card-body" v-if="ready">
      <template v-if="type == 'group'">
        <el-input
          v-model="filterText"
          placeholder="Filtrēt"
          class="mb-2"
          clearable
        />post
        <el-tree
          :data="settings"
          node-key="id"
          @node-expand="treeUpdate"
          @node-collapse="treeUpdate"
          :filter-node-method="filterNode"
          ref="treeRef"
        >
          <template #default="{ node, data }">
            <span
              class="custom-tree-node"
              @dblclick.stop="openModal(data.data)"
            >
              <span>
                <span
                  :class="{
                    'fw-bold text-decoration-underline': data.id == currentNode,
                  }"
                  >{{ node.label }} ({{ data.data.products ?? 0 }})</span
                >
                <i
                  v-if="!data.data.upload_to_web"
                  class="fa-kit fa-solid-globe-slash ms-2 text-warning"
                  title="Grupa un apakšgrupas netiek rādītas web"
                  v-tooltip
                ></i
              ></span>
              <span>
                <router-link
                  v-if="data.data.products > 0"
                  :to="{
                    name: 'settings-product-editor',
                    query: { productgroupid: data.id },
                  }"
                  class="me-2"
                >
                  Labot produktus
                </router-link>
                <a class="text-primary" @click.stop="openModal(data.data)">
                  Labot grupu
                </a>
              </span>
            </span>
          </template>
        </el-tree>
      </template>

      <DataTable
        v-else-if="settings"
        ref="table"
        :columns="dt[type].columns"
        :data="settings"
        :options="dtOptions"
        class="table table-hover table-row-bordered gy-5 align-middle"
        @select="onSelect"
        @deselect="onSelect"
        :key="tabsKey"
      >
        <thead>
          <tr class="fw-bolder text-dark p-4">
            <th v-for="(header, index) in dt[type].headers" :key="index">
              {{ header }}
            </th>
          </tr>
        </thead>
      </DataTable>
    </div>
  </div>

  <EditSettingsModal
    ref="modalComponent"
    :pData="editData"
    @refresh="loadData(true)"
  />
</template>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import {
  getDtOptions,
  handleSelect,
  transformDtSource,
} from "@/assets/ts/layout/dtOptions";
import { useRoute } from "vue-router";
import ApiService from "@/core/services/ApiService";
import EditSettingsModal from "@/components/settings/EditSettingsModal.vue";
import type { WatchStopHandle } from "vue";

export default defineComponent({
  components: {
    EditSettingsModal,
  },
  setup() {
    const loading = ref<boolean>(false);
    const settings = ref();
    const route = useRoute();
    const tabsKey = ref(0);
    const type = ref();
    const settingData = ref({});
    const editData = reactive({ settingData, type });
    const watcherHandles: WatchStopHandle[] = [];

    // Tree setup
    const treeRef = ref();
    const currentNode = ref();
    const filterText = ref("");

    const tWatcher = watch(filterText, (val) => {
      treeRef.value!.filter(val);
    });
    watcherHandles.push(tWatcher);

    const filterNode = (value: string, data: any) => {
      if (!value) return true;
      // Remove accents
      const cleanString = (s: string) =>
        s
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      return cleanString(data.label).includes(cleanString(value));
    };

    // Set title
    const titles = {
      location: "Novietnes",
      group: "Grupas",
      producer: "Ražotāji",
    };

    const title = computed(() => {
      return titles[type.value] ?? "";
    });

    // Setup data load
    const loadData = async (keepState = false) => {
      // Destroy tooltips
      const tooltips = document.querySelectorAll(".tooltip");
      tooltips.forEach((tooltip) => {
        tooltip.remove();
      });

      if (!((route.params.type as string) in titles)) {
        return;
      }

      loading.value = true;
      type.value = route.params.type;

      const slug = type.value == "group" ? "tree" : "";

      ApiService.get(type.value, slug + "?extended")
        .then((response) => {
          settings.value = response.data;

          if (!keepState) {
            tabsKey.value += 1;
          } else if (type.value == "group") {
            nextTick(() => {
              if (treeRef.value && currentNode.value) {
                const node = treeRef.value.getNode(currentNode.value);
                if (node) treeRef.value.setCurrentNode(node.data as Node, true);
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          loading.value = false;
          ready.value = true;
        });
    };

    // Fetch data when the component is first loaded
    onMounted(loadData);

    // React to changes in URL
    const ready = ref(false);
    const uWatcher = watch(
      () => [route.params.type], // watching the URL prop
      (newType, oldType) => {
        ready.value = false;
        if (newType !== oldType) {
          loadData();
        }
      }
    );
    watcherHandles.push(uWatcher);

    // Define datatable
    let dtOptions = getDtOptions(1);
    dtOptions["select"] = true;
    dtOptions["order"] = [0, "desc"];

    let dtSource = {
      producer: {
        id: "ID",
        name: "Nosaukums",
        tecdoc_name: "E-veikala / TecDoc Ražotājs",
        products: "Produkti",
        image: "Logo",
      },
      location: {
        id: "ID",
        name: "Nosaukums",
        products: "Produkti",
      },
      group: {
        id: "ID",
        name: "Nosaukums",
        path: "Virsgrupa",
        products: "Produkti",
      },
    };

    const columnOptions = {
      producer: {
        image: {
          width: "80px",
          searchable: false,
          sortable: false,
          render: function (data, type, row) {
            if (data) {
              return `<img src="${data}" style="max-width: 80px; max-height: 40px" />`;
            }
            // Otherwise, just return the manufacturer data
            return data;
          },
        },
      },
      location: {},
      group: {},
    };

    const dt = transformDtSource(dtSource, columnOptions);

    onBeforeUnmount(() => {
      watcherHandles.forEach((stop) => stop());
    });

    return {
      settings,
      dtSource,
      dtOptions,
      dt,
      loading,
      tabsKey,
      type,
      title,
      settingData,
      editData,
      loadData,
      ready,
      treeRef,
      currentNode,
      filterNode,
      filterText,
    };
  },
  methods: {
    onSelect(e, dt, type, indexes) {
      const rowData = handleSelect(dt, indexes);
      this.openModal(rowData[0]);
    },
    openModal(inputData = null as any) {
      let data = {};
      if (inputData) {
        this.currentNode = inputData.id;
        data = inputData;
      } else {
        data = {
          id: "",
          name: "",
          tecdoc_name: "",
          image: "",
          parentid: "",
          upload_to_web: true,
        };
      }

      this.settingData = { ...data };
      (this.$refs.modalComponent as any).show();
    },
    treeUpdate(nodeData) {
      this.currentNode = nodeData.id;
    },
  },
});
</script>
