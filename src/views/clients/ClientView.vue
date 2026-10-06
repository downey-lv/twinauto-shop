<template>
  <div class="row gx-2">
    <div class="col-lg-10 pb-5">
      <div class="card h-100">
        <div class="card-header border-0 pt-5">
          <h3 class="card-title">{{ client.companyname }}</h3>
          <div class="card-toolbar">
            <button @click="editClient()" class="btn btn-sm btn-info me-2">
              <i class="fa-solid fa-pencil"></i> Labot
            </button>

            <button @click="$router.back()" class="btn btn-sm btn-light me-3">
              Aizvērt
            </button>
          </div>
        </div>
        <div class="card-body" v-loading="loading">
          <div class="row">
            <div class="col-lg">
              <div class="row">
                <div class="col-5 fw-bold">Reģistrācijas numurs</div>
                <div class="col">{{ client.nmrno }}</div>
              </div>
              <div class="row">
                <div class="col-5 fw-bold">PVN numurs</div>
                <div class="col">
                  {{ client.pvnno }}
                  <template v-if="client.vat_validated">
                    <i
                      class="fa-solid fa-check text-success ms-2"
                      :title="`PVN numurs ir derīgs (pārbaudīts ${
                        String(client.vat_validated).split('T')[0]
                      })`"
                      v-tooltip
                    ></i>
                  </template>
                  <i
                    v-if="client.vat_excluded"
                    class="fa-solid fa-money-bill-transfer text-warning ms-2"
                    :title="
                      client.vat_validated ? 'Bez PVN' : 'Bez PVN (eksports)'
                    "
                    v-tooltip
                  ></i>
                </div>
              </div>
              <div class="row">
                <div class="col-5 fw-bold">Tips</div>
                <div class="col">
                  {{ client.is_supplier ? "Piegādātājs" : "Pircējs" }}
                </div>
              </div>
            </div>
            <div class="col-lg">
              <div class="row">
                <div class="col-5 fw-bold">Adrese</div>
                <div class="col">{{ client.address }}</div>
              </div>
              <div class="row">
                <div class="col-5 fw-bold">Valsts</div>
                <div class="col">
                  <img
                    alt="Karogs"
                    v-if="client.country"
                    style="height: 10px"
                    :src="`https://purecatamphetamine.github.io/country-flag-icons/3x2/${client.country}.svg`"
                  />
                  {{ client.countryName }}
                </div>
              </div>
              <div class="row">
                <div class="col-5 fw-bold">Komentārs</div>
                <div class="col">{{ client.comment }}</div>
              </div>
            </div>
            <div class="col-lg">
              <div class="row">
                <div class="col-5 fw-bold">Kontaktpersona</div>
                <div class="col">{{ client.person }}</div>
              </div>
              <div class="row">
                <div class="col-5 fw-bold">Telefons</div>
                <div class="col">{{ client.telno }}</div>
              </div>
              <div class="row">
                <div class="col-5 fw-bold">E-pasts</div>
                <div class="col">
                  <a :href="`mailto:${client.email}`">{{ client.email }}</a>
                </div>
              </div>
            </div>
            <div class="col-lg">
              <div class="row">
                <div class="col-5 fw-bold">Bankas konts</div>
                <div class="col">{{ client.account }}</div>
              </div>
              <div class="row">
                <div class="col-5 fw-bold">Apmaksas termiņš</div>
                <div class="col" v-if="client.default_payterm">
                  {{ client.default_payterm }} dienas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-2 pb-5">
      <div class="card h-100">
        <div class="card-body" v-loading="loading">
          <div class="row" v-if="client.status">
            <div class="col-5 fw-bold">Statuss</div>
            <div class="col">
              <ClientStatusTag
                v-if="client.status"
                :blocked-reasons="client.status.blocked_reasons"
                :credit-left="client.status.credit_left"
                :blocked="client.status.blocked"
              />
            </div>
          </div>

          <div class="row fs-2" v-if="client.status?.balance && client.credit">
            <div class="col-5 fw-bold">Parāds</div>
            <div
              class="col"
              :class="
                (client.status.balance ?? 0) > client.credit
                  ? `text-danger`
                  : ``
              "
            >
              {{ client.status.balance.toFixed(2) }} €
            </div>
          </div>

          <div class="row" v-if="client.credit">
            <div class="col-5 fw-bold">Kredītlimits</div>
            <div class="col">{{ client.credit }} €</div>
          </div>

          <template
            v-if="client.status?.debts && client.status.debts.length > 0"
          >
            <div class="separator separator-dashed my-6"></div>
            <template v-for="(debt, index) in client.status.debts" :key="index">
              <div class="row">
                <div class="col-5 fw-bold">{{ debt.label }}</div>
                <div class="col">
                  <span
                    :class="
                      debt.days > 30
                        ? `text-danger`
                        : debt.days > 14
                        ? `text-warning`
                        : ``
                    "
                    >{{ debt.amount.toFixed(2) }} €</span
                  >
                  ({{ debt.days }} dienas)
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
  <DocumentTable type="all" :client-id="clientId" />
  <ClientModal
    ref="editModal"
    :company-id="clientId"
    @refresh="fetchClient()"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import type { Client } from "@/types/Client";
import DocumentTable from "@/components/documents/DocumentTable.vue";
import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import ClientModal from "@/components/clients/ClientModal.vue";
import ClientStatusTag from "@/components/clients/ClientStatusTag.vue";

export default defineComponent({
  components: { ClientStatusTag, DocumentTable, ClientModal },
  setup: function () {
    const loading = ref<boolean>(false);

    const route = useRoute();
    const clientId = String(route.params.clientId);

    const blankClient: Client = {
      companyid: clientId,
      companyname: "",
      nmrno: "",
      pvnno: "",
      address: "",
      country: "",
      countryName: "",
      person: "",
      telno: "",
      email: "",
      account: "",
      comment: "",
      default_payterm: 0,
      vat_validated: undefined,
      vat_excluded: false,
      is_supplier: false,
      credit: null,
    };
    const client = ref({ ...blankClient });

    // Data load
    const fetchClient = async () => {
      loading.value = true;
      await ApiService.get("company", clientId)
        .then((response) => {
          client.value = response.data[0];
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          push.error("Neizdevās ielādēt klientu");
        })
        .finally(() => {
          loading.value = false;
        });
    };

    return { clientId, loading, client, fetchClient };
  },
  async mounted() {
    // Load client
    await this.fetchClient();
  },
  methods: {
    editClient() {
      (this.$refs.editModal as any).show();
    },
  },
});
</script>
