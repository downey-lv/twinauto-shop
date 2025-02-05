<template>
  <div class="card mb-5">
    <div class="card-body">
      <div class="row g-5 g-xl-8">
        <div class="col-md-2">
          <div class="input-group">
            <div class="form-floating">
              <Field
                type="text"
                class="form-control form-control-solid"
                name="id"
                v-model="searchData.id"
                @keyup.enter="search('id')"
                @focus="suggestionsActive = 'id'"
                @blur="suggestionsActive = ''"
                placeholder="ID"
                autocomplete="off"
                enterkeyhint="search"
                inputmode="numeric"
              />
              <label>ID</label>

              <!-- Dropdown with suggestions -->
              <ul
                v-if="suggestions.id?.length && suggestionsActive == 'id'"
                class="suggestions-list"
              >
                <li
                  v-for="(suggestion, index) in suggestions.id"
                  :key="index"
                  @mousedown="selectSuggestion('id', suggestion)"
                >
                  {{ suggestion }}
                </li>
              </ul>
            </div>
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="search('id')"
            >
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>

        <div class="col-md-3">
          <div class="input-group">
            <button
              class="btn btn-outline-secondary d-xl-none"
              type="button"
              @click="openScanner()"
            >
              <i class="fa-solid fa-barcode-scan"></i>
            </button>
            <div class="form-floating">
              <Field
                type="text"
                class="form-control form-control-solid"
                name="code"
                v-model="searchData.code"
                @keyup.enter="search('code')"
                @focus="suggestionsActive = 'code'"
                @blur="suggestionsActive = ''"
                placeholder="Kods"
                autocomplete="off"
                enterkeyhint="search"
              />
              <label>Kods</label>

              <!-- Dropdown with suggestions -->
              <ul
                v-if="suggestions.code?.length && suggestionsActive == 'code'"
                class="suggestions-list"
              >
                <li
                  v-for="(suggestion, index) in suggestions.code"
                  :key="index"
                  @mousedown="selectSuggestion('code', suggestion)"
                >
                  {{ suggestion }}
                </li>
              </ul>
            </div>
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="search('code')"
            >
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>

        <div class="col-md-1 d-none d-xl-flex align-items-center justify-content-center">
          <div
            class="form-check form-switch form-check-custom form-check-solid"
          >
            <input
              class="form-check-input h-20px w-30px"
              type="checkbox"
              v-model="searchData.oe"
              @change="search('code')"
            />
            <label class="form-check-label">
              OE analogi
            </label>
          </div>
        </div>

        <div class="col-md-3">
          <div class="row">
            <div class="col-9">
              <div class="input-group">
                <div class="form-floating">
                  <Field
                    type="text"
                    class="form-control form-control-solid"
                    name="code"
                    v-model="searchData.text"
                    @keyup.enter="search('text')"
                    @focus="suggestionsActive = 'text'"
                    @blur="suggestionsActive = ''"
                    placeholder="Teksts"
                    autocomplete="off"
                    enterkeyhint="search"
                  />
                  <label>Teksts</label>

                  <!-- Dropdown with suggestions -->
                  <ul
                    v-if="
                      suggestions.text?.length && suggestionsActive == 'text'
                    "
                    class="suggestions-list"
                  >
                    <li
                      v-for="(suggestion, index) in suggestions.text"
                      :key="index"
                      @mousedown="selectSuggestion('text', suggestion)"
                    >
                      {{ suggestion }}
                    </li>
                  </ul>
                </div>
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="search('text')"
                >
                  <i class="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
            <div class="col-3 d-flex align-items-center justify-content-center">
              <div
                class="form-check form-switch form-check-custom form-check-solid"
              >
                <input
                  class="form-check-input h-20px w-30px"
                  type="checkbox"
                  v-model="searchData.partialText"
                  @change="search('text')"
                />
                <label class="form-check-label"> Daļējs teksts </label>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3" v-loading="loading" v-if="groups">
          <treeselect
            v-model="searchData.groups"
            :multiple="true"
            :options="groups"
            placeholder="Grupa"
            :key="componentKey"
          />
        </div>
      </div>
    </div>
  </div>

  <CameraScanner
    v-model="barcodeScanned"
    v-model:open-modal="barcodeModalState"
    close-after-decode
  />
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { Field } from "vee-validate";
import { useRoute, useRouter } from "vue-router";
import Treeselect from "@reside-ic/vue3-treeselect";
import "/src/assets/vue3-treeselect.css";
import ApiService from "@/core/services/ApiService";
import type { WatchStopHandle } from "vue";
import CameraScanner from "@/components/stock/CameraScanner.vue";

export default defineComponent({
  name: "search-box",
  components: {
    CameraScanner,
    Field,
    Treeselect,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const componentKey = ref(0);
    const groups = ref();
    const loading = ref(false);
    const watcherHandles: WatchStopHandle[] = [];

    const barcodeScanned = ref("");
    const barcodeModalState = ref(false);

    const suggestionsActive = ref("");
    const suggestions = ref(
      JSON.parse(localStorage.getItem("suggestions") || "{}")
    );

    const searchData = reactive({
      id: "",
      code: "",
      text: "",
      analogues: false,
      oe: false,
      groups: null,
      partialText: false,
    });

    const setParams = () => {
      const query = route.query;
      const params = route.params;

      for (const key in searchData) {
        if (["id", "code", "text"].includes(key)) {
          searchData[key] =
            params.type && params.type.toString() === key
              ? params.query?.toString() || ""
              : "";
        } else if (["analogues", "oe", "partialText"].includes(key)) {
          searchData[key] = Boolean(query[key]);
        } else if (["groups"].includes(key)) {
          const groupsFromQuery = query[key];
          if (groupsFromQuery) {
            // Transform the query parameter into an array of numbers (IDs)
            searchData[key] = groupsFromQuery.toString().split(",");
          } else {
            searchData[key] = [];
          }
          componentKey.value++;
        }
      }
    };

    onMounted(() => setParams());
    const rWatcher = watch(route, () => setParams(), { deep: true });
    watcherHandles.push(rWatcher);

    const openGroup = (newValue, oldValue) => {
      if (newValue === oldValue) return;

      let updatedQuery = { ...route.query };
      if (newValue && newValue.length > 0) {
        updatedQuery.groups = Object.values(newValue)
          .filter((n) => n)
          .join(",");
      } else {
        delete updatedQuery.groups;
      }

      let updatedParams = { ...route.params };
      if (!updatedParams.type) {
        updatedParams.type = "all";
      }

      if (route.name) {
        router.push({
          name: route.name,
          params: updatedParams,
          query: updatedQuery,
        });
      }
    };

    const gWatcher = watch(() => searchData.groups, openGroup);
    watcherHandles.push(gWatcher);

    onBeforeUnmount(() => {
      watcherHandles.forEach((stop) => stop());
    });

    return {
      searchData,
      groups,
      loading,
      componentKey,
      suggestions,
      suggestionsActive,
      barcodeScanned,
      barcodeModalState,
    };
  },
  mounted() {
    this.loadGroups();
  },
  watch: {
    barcodeScanned(value) {
      if (value) {
        let barcodeType = "code";
        if (value.length <= 5) {
          barcodeType = "id";
        }

        this.searchData[barcodeType] = value;
        this.search(barcodeType);
        this.barcodeScanned = "";
      }
    },
  },
  methods: {
    openScanner() {
      this.barcodeModalState = true;
    },
    search(field: string) {
      if (this.searchData[field]) {
        let route = {
          name: "search-parts",
          params: {
            type: field,
            query: this.searchData[field],
          },
        };

        this.addSuggestion(field, this.searchData[field]);

        let query = {};
        if (field === "code") {
          if (this.searchData.analogues) query["analogues"] = 1;
          if (this.searchData.oe) query["oe"] = 1;
        } else if (field === "text") {
          if (this.searchData.partialText) query["partialText"] = 1;
        }

        if (
          this.searchData.groups &&
          Object.keys(this.searchData.groups).length > 0
        )
          query["groups"] = Object.values(this.searchData.groups)
            .filter((n) => n)
            .join(",");

        route["query"] = query;

        this.$router.push(route);
      }
    },
    loadGroups() {
      this.loading = true;
      ApiService.get(`group/tree`)
        .then((response) => {
          this.groups = response.data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addSuggestion(field, suggestion) {
      let suggestions = this.suggestions[field];

      // Check if the suggestions object exists
      if (!suggestions) suggestions = [];

      // Remove suggestion if it already exists
      if (suggestions.includes(suggestion))
        suggestions.splice(suggestions.indexOf(suggestion), 1);

      // Add suggestion to the beginning of the list
      suggestions.unshift(suggestion);

      // Limit the list to 20 suggestions
      if (suggestions.length > 20) suggestions.pop();

      // Save the suggestions to the component data
      this.suggestions[field] = suggestions;

      // Save the suggestions to the localStorage
      try {
        localStorage.setItem("suggestions", JSON.stringify(this.suggestions));
      } catch (e) {
        console.error("Error saving suggestions to localStorage:", e);
      }
    },
    selectSuggestion(field, suggestion) {
      console.log(field, suggestion);
      this.searchData[field] = suggestion;
      this.search(field);
    },
  },
});
</script>

<style>
.suggestions-list {
  position: absolute;
  color: var(--bs-gray-700);
  background-color: var(--bs-gray-100);
  border-color: var(--bs-gray-100);
  border-radius: 0.475rem;
  border: 0px solid;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  list-style-type: none;
  padding: 0;
  margin-top: 5px;
  z-index: 999;
}

.suggestions-list li {
  padding: 8px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: var(--bs-gray-200);
}
</style>
