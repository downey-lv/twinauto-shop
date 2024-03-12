<template>
  <div class="card mb-5 mb-xl-10">
    <div class="card-body ps-9 pt-9 p-3">
      <div class="row">
        <div class="col-5 row">
          <div class="col">
            <el-date-picker
              class="me-2 w-100"
              v-model="filterDate"
              type="date"
              placeholder="Datums"
              :disabled-date="disabledDate"
              :shortcuts="shortcuts"
              size="large"
              @change="updateParent"
              value-format="YYYY-MM-DD"
            />
          </div>
          <div class="col">
            <SelectComponent
              v-loading="loadingUsers"
              class="me-2"
              placeholder="Lietotājs"
              :options="users"
              v-model="filterUser"
              size="large"
              @change="updateParent"
              clearable
            />
          </div>
          <div class="col">
            <SelectComponent
              v-loading="loadingRecipients"
              class="me-2"
              placeholder="Saņēmējs"
              :options="paymentRecipients"
              v-model="filterPayment"
              size="large"
              @change="updateParent"
              clearable
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import SelectComponent from "@/components/core/form/SelectComponent.vue";
import ApiService from "@/core/services/ApiService";
import { useAuthStore } from "@/stores/auth";
import { getOption } from "@/core/services/OptionService";

export default defineComponent({
  name: "document-header",
  components: { SelectComponent },
  emits: ["updateFilters"],
  setup(_, { emit }) {
    // Emit selection
    const updateParent = () => {
      emit("updateFilters", { date: filterDate.value, user: filterUser.value, payment: filterPayment.value });
    };

    // Date selection
    const filterDate = ref(new Date().toISOString());
    const shortcuts = [
      {
        text: "Šodien",
        value: new Date(),
      },
      {
        text: "Vakar",
        value: () => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24);
          return date;
        },
      },
    ];

    const disabledDate = (time: Date) => {
      return time.getTime() > Date.now();
    };

    // User selection
    const authStore = useAuthStore();
    const currentUser = String(authStore.user.user_id);
    const loadingUsers = ref(false);
    const filterUser = ref("");
    const users = ref([]);

    const fetchUsers = async () => {
      loadingUsers.value = true;
      ApiService.get("user", "list")
        .then((response) => {
          users.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching users`, error);
        })
        .finally(() => {
          loadingUsers.value = false;
        });
    };

    // Payment selection
    const loadingRecipients = ref(false);
    const paymentRecipients = ref<any>([]);
    const filterPayment = ref(getOption("default_payment_recipient"));
    const fetchRecipients = async () => {
      loadingRecipients.value = true;
      ApiService.get("payment", "recipients")
        .then((response) => {
          paymentRecipients.value = response.data;
        })
        .catch((error) => {
          console.error(`Error fetching data from recipients:`, error);
        })
        .finally(() => {
          loadingRecipients.value = false;
        });
    };

    onMounted(() => {
      fetchUsers();
      updateParent();
      fetchRecipients();
    });

    return {
      filterDate,
      filterPayment,
      filterUser,
      disabledDate,
      shortcuts,
      users,
      paymentRecipients,
      loadingUsers,
      loadingRecipients,
      updateParent,
    };
  },
});
</script>
