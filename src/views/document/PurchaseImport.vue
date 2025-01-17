<template>
  <div class="card">
    <div class="card-body" v-loading="loading">
      <h2 class="fw-bold d-flex align-items-center text-dark">
        Izvēlies importu
      </h2>
      <div class="d-flex flex-wrap justify-content-center">
        <div
          v-for="(item, key) in companies"
          :key="key"
          class="p-5 d-flex flex-column align-items-center"
        >
          <input
            type="radio"
            class="btn-check"
            name="company"
            :value="key"
            v-model="selectedCompany"
            :id="String(key)"
          />
          <label
            class="btn btn-outline btn-outline-dashed btn-outline-default supplier-logo"
            :for="String(key)"
          >
            <img :src="item.logo" :alt="item.name" />
          </label>
        </div>
      </div>

      <template v-if="selectedCompany && companies[selectedCompany].hasImport">
        <Notice
          v-if="comment"
          classes="rounded-3 mb-3"
          color="info"
          :body="comment"
        ></Notice>

        <el-upload
          drag
          :show-file-list="false"
          :http-request="uploadFile()"
          :accept="companies[selectedCompany].fileType"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Ievelc failu vai <em>uzklikšķini, lai izvēlētos</em>
          </div>
        </el-upload>
      </template>

      <div class="d-flex justify-content-center mt-5">
        <button class="btn btn-light-primary" @click="newDocument()">
          Izlaist importu
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.supplier-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  overflow: hidden;
  border-radius: 0.475rem;
  width: 160px;
  height: 160px;
}

.supplier-logo img {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
}
</style>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import ApiService from "@/core/services/ApiService";
import { UploadFilled } from "@element-plus/icons-vue";
import { push } from "@/main";
import Notice from "@/components/core/Notice.vue";
import { useDocumentImportStore } from "@/stores/documentImport";

export default defineComponent({
  components: {
    Notice,
    UploadFilled,
  },
  setup() {
    const loading = ref<boolean>(false);
    const companies = ref();
    const selectedCompany = ref();

    const comment = computed(() => {
      if (!companies.value[selectedCompany.value]) return "";

      const c = companies.value[selectedCompany.value];
      let values = [] as string[];

      if (c.url)
        values.push(
          `<a href="${c.url}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square text-primary"></i> Atvērt</a>`
        );
      if (c.comment)
        values.push(
          c.comment.replace("fa-bars", "<i class='fa-solid fa-bars'></i>")
        );

      return values.join("<br />");
    });

    return {
      loading,
      companies,
      selectedCompany,
      comment,
    };
  },
  mounted() {
    this.loading = true;
    ApiService.get("purchase", "")
      .then((response) => {
        this.companies = response.data;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    newDocument(data = null) {
      const store = useDocumentImportStore();
      store.saveDataToStore(data);

      const selected = this.selectedCompany;

      let query = {};
      if (data) query = { import: 1 };
      else if (selected && this.companies[selected])
        query = { clientId: this.companies[selected].id };

      const timestamp = Date.now();
      this.$router.push({
        name: "document-edit",
        params: { editId: `new_${timestamp}`, type: "in" },
        query: query,
      });
    },
    uploadFile() {
      return (upload) => {
        this.loading = true;

        const data = new FormData();
        data.append("file", upload.file);
        data.append("company", this.selectedCompany);

        ApiService.post("purchase/", data)
          .then((response) => {
            this.newDocument(response.data);
          })
          .catch(() => {
            push.error("Neizdevās");
          })
          .finally(() => {
            this.loading = false;
          });
      };
    },
  },
});
</script>
