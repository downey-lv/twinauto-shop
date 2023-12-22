<template>
  <!--begin::Product drawer-->
  <div
    id="product_drawer"
    class="bg-body"
    data-kt-drawer="true"
    data-kt-drawer-name="help"
    data-kt-drawer-activate="true"
    data-kt-drawer-overlay="true"
    data-kt-drawer-width="{default:'350px', 'md': '525px', 'lg': '800px'}"
    data-kt-drawer-direction="end"
    data-kt-drawer-toggle="#product_drawer__toggle"
    data-kt-drawer-close="#product_drawer__close"
  >
    <!--begin::Card-->
    <div class="card shadow-none rounded-0 w-100">
      <!--begin::Header-->
      <div class="card-header" id="product_drawer__header">
        <h5 class="card-title fw-semobold text-gray-600">
          {{ title }}
          <Copy
            v-if="p && p.productid"
            :value="p.productid"
            buttonClass="ms-2"
            trim-spaces
          />
        </h5>

        <div class="card-toolbar">
          <button
            type="button"
            class="btn btn-sm btn-icon explore-btn-dismiss me-n5"
            id="product_drawer__close"
          >
            <KTIcon icon-name="cross" icon-class="fs-2" />
          </button>
        </div>
      </div>
      <!--end::Header-->

      <!--begin::Body-->
      <div class="card-body" id="product_drawer__body" v-loading="loading">
        <!--begin::Content-->
        <div
          id="product_drawer__scroll"
          class="hover-scroll-overlay-y"
          data-kt-scroll="true"
          data-kt-scroll-height="auto"
          data-kt-scroll-wrappers="#product_drawer__body"
          data-kt-scroll-dependencies="#product_drawer__header"
          data-kt-scroll-offset="5px"
          v-if="p"
        >
          <!--begin::Details-->
          <div class="d-flex flex-wrap flex-sm-nowrap mb-3">
            <!--begin: Pic-->
            <div class="me-7 mb-4">
              <template v-if="p['images']">
                <div class="product-image product-image-full">
                  <el-image
                    class="image"
                    v-if="p['images'][0]"
                    :src="p['images'][0]"
                    :preview-src-list="p['images']"
                    :hide-on-click-modal="true"
                  >
                  </el-image>
                </div>
              </template>

              <!-- Thumbnails -->
              <div
                class="d-flex align-content-center flex-wrap"
                style="width: 160px"
              >
                <div
                  v-for="(item, idx) in thumbnails"
                  :key="idx"
                  class="product-image product-image-thumbnail me-1 mt-1"
                >
                  <el-image
                    class="image"
                    :src="item"
                    :initial-index="idx + 1"
                    :preview-src-list="p['images']"
                    :hide-on-click-modal="true"
                  >
                  </el-image>
                </div>
              </div>
            </div>
            <!--end::Pic-->

            <!--begin::Info-->
            <div class="flex-grow-1">
              <!--begin::Title-->
              <div
                class="d-flex justify-content-between align-items-start flex-wrap mb-2"
              >
                <!--begin::Product-->
                <div class="d-flex flex-column">
                  <!--begin::Name-->
                  <div class="d-flex align-items-center mb-2">
                    <span
                      class="text-gray-800 text-hover-primary fs-2 fw-bold me-1 text-"
                      >{{ p["code"] }}</span
                    >

                    <Copy :value="p.code" trim-spaces />
                    <Search :value="p.code" />
                  </div>
                  <!--end::Name-->

                  <!--begin::Info-->
                  <div class="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                    <span
                      class="d-flex align-items-center text-gray-800 text-hover-primary me-5 mb-2"
                    >
                      {{ p["producer"] }}
                    </span>
                  </div>

                  <!--end::Info-->
                </div>
                <!--end::Product-->

                <!--begin::Actions-->
                <div class="d-flex my-4" v-if="p['productid'] != ''">
                  <button
                    type="button"
                    title="Nosūtīt uz telefonu"
                    v-tooltip
                    class="btn btn-sm btn-light btn-icon me-1"
                    @click="toPhone($event)"
                  >
                    <i class="fa-solid fa-mobile-signal-out"></i>
                  </button>

                  <div class="btn-group me-1">
                    <button
                      type="button"
                      title="Drukāt uzlīmi"
                      v-tooltip
                      class="btn btn-sm btn-light btn-icon"
                      @click="printLabel($event)"
                    >
                      <i class="fa-solid fa-note-sticky"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-light dropdown-toggle dropdown-toggle-split"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="printLabel($event, false)"
                          >Ar cenu</a
                        >
                      </li>
                      <li>
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="printLabel($event, true, true)"
                          >Bez koda</a
                        >
                      </li>
                      <li>
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="printLabel($event, false, true)"
                          >Ar cenu, bez koda</a
                        >
                      </li>
                    </ul>
                  </div>

                  <div class="btn-group me-1">
                    <button
                      type="button"
                      title="Labot"
                      v-tooltip
                      class="btn btn-sm btn-info btn-icon"
                      @click="
                        $router.push({
                          name: `product-edit`,
                          params: { id: p.productid },
                        })
                      "
                    >
                      <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-info dropdown-toggle dropdown-toggle-split"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="
                            $router.push({
                              name: `product-edit`,
                              params: { id: 'new' },
                              query: { copy: p.productid },
                            })
                          "
                          >Kopēt</a
                        >
                      </li>
                    </ul>
                  </div>

                  <a href="#" class="btn btn-sm btn-primary me-3">Pārdot</a>
                </div>
                <!--end::Actions-->
              </div>
              <!--end::Title-->

              <!--begin::Product name-->
              <div class="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                <span
                  class="d-flex align-items-center text-gray-800 text-hover-primary me-5 mb-2"
                  v-html="p.name"
                >
                </span>
              </div>
              <div
                class="d-flex flex-wrap fs-6 mb-4 pe-2"
                v-if="p.tecdoc && p.tecdoc.articleState"
              >
                <Notice
                  classes="rounded-3"
                  color="warning"
                  :body="p.tecdoc.articleState"
                ></Notice>
              </div>
              <!--end::Product name-->

              <!--begin::Stats-->
              <div class="d-flex flex-wrap flex-stack">
                <!--begin::Wrapper-->
                <div class="d-flex flex-column flex-grow-1 pe-8">
                  <!--begin::Stats-->
                  <div class="d-flex flex-wrap">
                    <!--begin::Stat-->
                    <div
                      v-for="(item, index) in stats"
                      :key="index"
                      class="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3"
                    >
                      <!--begin::Number-->
                      <div
                        class="d-flex align-items-center"
                        :class="item.class"
                      >
                        <div class="fs-2 fw-bold">{{ item.value }}</div>
                      </div>
                      <!--end::Number-->

                      <!--begin::Label-->
                      <div class="fw-semobold fs-6 text-gray-400">
                        {{ item.title }}
                      </div>
                      <!--end::Label-->
                    </div>
                    <!--end::Stat-->
                  </div>
                  <!--end::Stats-->
                </div>
                <!--end::Wrapper-->
              </div>
              <!--end::Stats-->
            </div>
            <!--end::Info-->
          </div>
          <!--end::Details-->

          <ul class="nav nav-tabs nav-line-tabs mb-5 fs-6" :key="tabsKey">
            <li class="nav-item">
              <a
                class="nav-link active"
                data-bs-toggle="tab"
                href="#tab_shop"
                v-if="p.shop"
                >Informācija</a
              >
            </li>

            <!-- Tecdoc tabs -->
            <template v-if="p.tecdoc">
              <li class="nav-item" v-if="p.tecdoc.details">
                <a
                  class="nav-link"
                  :class="{ active: !p.shop }"
                  data-bs-toggle="tab"
                  href="#tab_tecdoc"
                  >Parametri</a
                >
              </li>
              <li
                class="nav-item"
                v-if="p.tecdoc.oemNumbers && p.tecdoc.oemNumbers.length > 0"
              >
                <a class="nav-link" data-bs-toggle="tab" href="#tab_oe"
                  >OE kodi</a
                >
              </li>
              <li
                class="nav-item"
                v-if="p.tecdoc.partsList && p.tecdoc.partsList.length > 0"
              >
                <a
                  class="nav-link"
                  data-bs-toggle="tab"
                  href="#tab_replacements"
                  >Aizvietotāji</a
                >
              </li>
            </template>

            <li class="nav-item">
              <a
                class="nav-link"
                data-bs-toggle="tab"
                href="#tab_analogues"
                v-if="p.vide?.cross?.length > 0"
                :class="{ active: !p.shop && !p.tecdoc }"
                >Analogi</a
              >
            </li>

            <li class="nav-item" v-if="suppliers && suppliers.length > 0">
              <a
                class="nav-link"
                data-bs-toggle="tab"
                href="#tab_suppliers"
                :class="{
                  active: !p.shop && !p.tecdoc && !(p.vide?.cross?.length > 0),
                }"
                >Piegādātāji</a
              >
            </li>
            <li class="nav-item" v-if="p.prices && p.prices.length > 0">
              <a class="nav-link" data-bs-toggle="tab" href="#tab_prices"
                >Cenas</a
              >
            </li>
            <li class="nav-item" v-if="p.productid != ``">
              <a class="nav-link" data-bs-toggle="tab" href="#tab_history"
                >Vēsture</a
              >
            </li>
          </ul>

          <div class="tab-content" :key="tabsKey">
            <div
              class="tab-pane fade show active"
              id="tab_shop"
              role="tabpanel"
              v-if="p.shop"
            >
              <Notice
                classes="rounded-3 mb-3"
                color="primary"
                :body="p.shop.message"
                v-if="p.shop.message"
              ></Notice>

              <div class="row mb-3" v-if="p.shop.productgroupid">
                <label class="col-lg-4 fw-light">Grupa</label>
                <label class="col-lg-8 fs-6 text-dark">
                  <router-link
                    :to="{
                      name: `search-parts`,
                      params: { type: `all` },
                      query: { groups: p.shop.productgroupid },
                    }"
                  >
                    {{ p.shop.productgroupname }}
                  </router-link>
                </label>
              </div>

              <div
                class="row mb-3"
                v-for="(item, index) in p.shop.details"
                :key="index"
              >
                <label class="col-lg-4 fw-light">{{ item.label }}</label>
                <label class="col-lg-8 fs-6 text-dark" v-if="item.value">
                  <span
                    v-for="(line, lineNumber) of item.value.split('\n')"
                    v-bind:key="lineNumber"
                  >
                    {{ line }}<br />
                  </span>
                </label>
              </div>
            </div>

            <!-- TecDoc tabs -->
            <template v-if="p.tecdoc">
              <div
                class="tab-pane fade p-3"
                :class="{ 'active show': !p.shop }"
                id="tab_tecdoc"
                role="tabpanel"
              >
                <div
                  class="row mb-3"
                  v-for="(item, key) in p.tecdoc.details"
                  :key="key"
                >
                  <label class="col-lg-4 fw-light">{{ item.label }}</label>
                  <label class="col-lg-8 fw-bold fs-6 text-dark">{{
                    item.value
                  }}</label>
                </div>
              </div>

              <div class="tab-pane fade p-3" id="tab_oe" role="tabpanel">
                <div
                  class="row mb-3"
                  v-for="(item, index) in p.tecdoc.oemNumbers"
                  :key="index"
                >
                  <label class="col-lg-4 fw-light">{{
                    (item[1] as any).join(", ")
                  }}</label>
                  <label class="col-lg-8 fw-bold fs-6 text-dark">
                    {{ item[0] }}
                    <Copy :value="String(item[0])" font-size="3" trim-spaces />
                    <Search :value="String(item[0])" font-size="3" />
                  </label>
                </div>
              </div>
              <div
                class="tab-pane fade p-3"
                id="tab_replacements"
                role="tabpanel"
              >
                <div
                  class="row mb-3"
                  v-for="(item, index) in p.tecdoc.partsList"
                  :key="index"
                >
                  <label class="col-lg-3 fw-bold fs-6 text-dark">
                    {{ item.code }}
                    <Copy :value="item.code" font-size="3" trim-spaces />
                    <Search :value="item.code" font-size="3" />
                  </label>
                  <label class="col-lg-4 fs-6 text-dark">
                    {{ item.name }}
                  </label>
                  <label class="col-lg-5 fs-6 text-dark">
                    {{ item.description }}
                  </label>
                </div>
              </div>
            </template>

            <!-- VIDe tabs -->
            <div
              class="tab-pane fade p-3"
              id="tab_suppliers"
              role="tabpanel"
              :class="{
                'active show':
                  !p.shop && !p.tecdoc && !(p.vide?.cross?.length > 0),
              }"
            >
              <div class="row mb-3 fw-bold">
                <label class="col-lg-3">Piegādātājs</label>
                <label class="col-lg-5">Kods</label>
                <label class="col-lg-2">Atlikums</label>
                <label class="col-lg-2">Cena</label>
              </div>
              <div
                class="row mb-3"
                v-for="(item, index) in suppliers"
                :key="index"
              >
                <label class="col-lg-3">{{ item.supplier_name }}</label>
                <label class="col-lg-5">
                  {{ item.code_supplier }}
                  <a
                    :href="item.search_url"
                    target="_blank"
                    v-if="item.search_url"
                  >
                    <KTIcon icon-name="magnifier" icon-class="fs-5 text-info" />
                  </a>
                  <Copy
                    :value="item.code_supplier"
                    font-size="6"
                    trim-spaces
                    button-class="ms-1"
                  />
                </label>
                <label
                  class="col-lg-2"
                  :class="item.supplier_rest == 0 ? `text-danger` : ``"
                  >{{ item.supplier_rest }}</label
                >
                <label class="col-lg-2">{{ item.supplier_price }} €</label>
              </div>
            </div>
            <div class="tab-pane fade p-3" id="tab_prices" role="tabpanel">
              <div
                class="row mb-3"
                v-for="(item, index) in p.prices"
                :key="index"
              >
                <label class="col-lg-4 fw-light">{{ item.label }}</label>
                <label class="col-lg-8 fw-bold fs-6 text-dark"
                  >{{ item.value }} €</label
                >
              </div>
            </div>
            <div
              class="tab-pane fade p-3"
              id="tab_analogues"
              role="tabpanel"
              :class="{ 'active show': !p.shop && !p.tecdoc }"
              v-if="p.vide?.cross?.length > 0"
            >
              <div class="row mb-3 fw-bold">
                <label class="col-lg-3">Kods</label>
                <label class="col-lg-4">Ražotājs</label>
                <label class="col-lg-5">Nosaukums</label>
              </div>

              <div
                class="row mb-3"
                v-for="(item, index) in p.vide.cross"
                :key="index"
              >
                <label class="col-lg-3 fw-bold fs-6 text-dark">
                  {{ item.code }}
                  <Copy :value="item.code" font-size="3" trim-spaces />
                  <Search :value="item.code" font-size="3" />
                </label>
                <label class="col-lg-4 fs-6 text-dark">
                  {{ item.nextis_name }}
                </label>
                <label class="col-lg-5 fs-6 text-dark">
                  {{ item.title }}<br />
                  {{ item.subtitle }}
                </label>
              </div>
            </div>
            <div class="tab-pane fade" id="tab_history" role="tabpanel">
              <DataTable
                id="history"
                :columns="dt.history.columns"
                :data="historyData"
                :options="dtOptions"
                @select="onSelect"
                @deselect="onSelect"
                class="table table-hover table-row-bordered table-sm gy-5 align-middle fs-8"
              >
                <thead>
                  <tr class="fw-bolder text-dark p-4">
                    <th
                      v-for="(header, index) in dt.history.headers"
                      :key="index"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
              </DataTable>
            </div>
          </div>
        </div>
        <!--end::Content-->
      </div>
      <!--end::Body-->
    </div>
    <!--end::Card-->
  </div>
  <!--end::Help drawer-->
</template>

<style scoped>
.product-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  overflow: hidden;
  border-radius: 0.475rem;
}

.product-image-full {
  width: 160px;
  height: 160px;
}

.product-image-thumbnail {
  width: 50px;
  height: 50px;
}

.product-image img {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
}
</style>

<script lang="ts">
import { useProductStore } from "@/stores/product";
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import Copy from "@/components/core/buttons/Copy.vue";
import Search from "@/components/core/buttons/Search.vue";
import Notice from "@/components/core/Notice.vue";
import {
  getDtOptions,
  handleSelect,
  transformDtSource,
} from "@/assets/ts/layout/dtOptions";
import { labelService } from "@/core/services/LabelService";
import { push } from "@/main";
import ApiService from "@/core/services/ApiService";
import type { Product } from "@/types/Product";

export default defineComponent({
  components: {
    Notice,
    Copy,
    Search,
  },
  setup() {
    const productStore = useProductStore();
    const p = ref<Product | null>(productStore.productData);
    const tabsKey = ref(0);
    const loading = ref(false);
    const stats = ref();
    const title = ref();
    const suppliers = ref();
    const historyData = ref();

    const updateValues = (p) => {
      // Force to render tabs again
      tabsKey.value += 1;

      type Stat = {
        title: string;
        value: string;
        class?: string;
      };

      let newStats: Stat[] = [];

      // Set stats
      if (p.priceSell !== "")
        newStats.push({
          title: "Pārdošanas cena",
          value: String(p.priceSell) + " €",
        });

      if (p.shop) {
        if (typeof p.shop.rest === "number") {
          let restClass = "";
          if (p.shop.rest <= 0) restClass = "text-danger";

          newStats.push({
            title: "Veikalā",
            value: p.shop.rest,
            class: restClass,
          });
        }
        if (p.shop.locations)
          newStats.push({ title: "Novietne", value: p.shop.locations });

        loadHistoryData(p.productid);
      }

      stats.value = newStats;

      // Set title
      if (p.productid) title.value = `ID: ${p.productid}`;
      else title.value = "TecDoc produkts";

      // Load supplier data
      if (p.producer.startsWith("OE "))
        loadSupplierData(p.suppliers, p.codeAlphanum);
      else setSuppliers(p.suppliers);

      // Load partslist
      if (p.tecdoc && p.tecdoc.partsList && p.tecdoc.partsList.length > 0) {
        ApiService.get(
          `tecdoc/article`,
          `${p.tecdocId}/${p.codeAlphanum}/partslist`
        ).then((response) => {
          p.tecdoc.partsList = response.data;
        });
      }
    };

    // Watching the productData for changes
    const pWatcher = watch(
      () => productStore.productData,
      (data) => {
        if (data) data = data[0];
        p.value = data;
        if (data) {
          if (
            !data.tecdoc &&
            data.tecdocId &&
            data.codeAlphanum &&
            !data.producer.startsWith("OE ")
          ) {
            reloadProduct(data);
          } else updateValues(data);
        }
      }
    );

    function reloadProduct(data) {
      loading.value = true;
      ApiService.get(`tecdoc/article`, `${data.tecdocId}/${data.codeAlphanum}`)
        .then((response) => {
          const d = response.data[0];
          if (d) {
            p.value = d;
            updateValues(d);
          } else {
            updateValues(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function loadSupplierData(suppliersData, code) {
      loading.value = true;
      ApiService.get(`api/suppliers`, code)
        .then((response) => {
          const api_suppliers = response.data;
          if (api_suppliers)
            suppliersData = [...suppliersData, ...api_suppliers];
          setSuppliers(suppliersData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function setSuppliers(suppliersData) {
      // Sort suppliers by price
      suppliersData.sort((a, b) => {
        return parseFloat(a.supplier_price) - parseFloat(b.supplier_price);
      });

      suppliers.value = suppliersData;
    }

    // Load history data
    function loadHistoryData(id) {
      loading.value = true;
      ApiService.get(`product`, `history/${id}`)
        .then((response) => {
          historyData.value = response.data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          loading.value = false;
        });
    }

    // Define datatable
    let dtOptions = getDtOptions();
    dtOptions["select"] = true;
    dtOptions["order"] = [[0, "desc"]];
    dtOptions.pageLength = 10;

    let dtSource = {
      history: {
        orderdate: "Datums",
        companyname: "Klients",
        ordertypename: "Tips",
        quantity: "Skaits",
        pricewithvat: "Cena",
        comment: "Komentārs",
        workstation: "Darba vieta",
      },
    };

    const columnOptions = {
      history: {
        orderdate: {
          width: "100px",
        },
      },
    };

    const dt = transformDtSource(dtSource, columnOptions);

    onBeforeUnmount(() => {
      pWatcher();
    });

    return {
      p,
      stats,
      title,
      tabsKey,
      loading,
      suppliers,
      dtSource,
      dtOptions,
      dt,
      historyData,
    };
  },
  computed: {
    thumbnails() {
      let thumbnails = [] as string[];
      if (this.p && this.p.images && this.p.images.length > 1)
        thumbnails = this.p.images.slice(1);
      return thumbnails;
    },
  },
  data() {
    return {
      index: null as number | null,
    };
  },
  methods: {
    toggleButtonState(el, isLoading) {
      if (isLoading) {
        el.innerHTML = `<i class="fa-solid fa-spinner-third fa-spin"></i>`;
      } else {
        el.innerHTML = el.getAttribute("data-original-content");
      }
    },
    async printLabel(event, hidePrice = true, hideCode = false) {
      if (!this.p || !this.p.shop) return push.error("Nav veikala prece");

      // Format button
      const el = event.target;
      el.setAttribute("data-original-content", el.innerHTML); // Store original content
      this.toggleButtonState(el, true); // Set to loading state

      // Set params
      let params = {
        hidePrice: hidePrice,
        hideCode: hideCode,
      };

      try {
        await labelService.print("product", [this.p.shop], params);
      } finally {
        this.toggleButtonState(el, false);
      }
    },
    onSelect(e, dt, type, indexes) {
      const rowData = handleSelect(dt, indexes);
      const { grouping, orderid, return_id } = rowData[0];
      if (!orderid || !grouping) return;
      if (return_id) {
        this.$router.push({
          name: "return-view",
          params: { returnId: return_id, documentId: orderid },
        });
      } else {
        this.$router.push({
          name: `document-view`,
          params: { type: grouping, documentId: orderid },
          query: { enableBack: 1 },
        });
      }
    },
    toPhone(event) {
      if (!this.p) return;

      // Format button
      const el = event.target;
      el.setAttribute("data-original-content", el.innerHTML); // Store original content
      this.toggleButtonState(el, true); // Set to loading state

      const id = this.p.shop.productid;
      if (!id) return;
      ApiService.get(`data`, `cart/${id}`)
        .then(() => {
          push.info("Nosūtīts");
        })
        .catch((error) => {
          push.error("Neizdevās nosūtīt");
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          this.toggleButtonState(el, false);
        });
    },
  },
});
</script>
