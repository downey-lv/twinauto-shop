<template>
  <div class="card mb-5">
    <div class="card-body ps-9 p-5">
      <div class="row">
        <div class="col-8 row">
          <div class="col-3">
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
          <div class="col-3" v-if="showUserFilter">
            <SelectComponent
              v-loading="loadingUsers"
              class="me-2"
              element-class="mb-0"
              placeholder="Lietotājs"
              :options="users"
              v-model="filterUser"
              size="large"
              @change="updateParent"
              clearable
            />
          </div>
          <div class="col-3" v-if="showRecipientFilter">
            <SelectComponent
              v-loading="loadingRecipients"
              class="me-2"
              element-class="mb-0"
              placeholder="Darba vieta"
              :options="paymentRecipients"
              v-model="filterRecipient"
              size="large"
              @change="updateParent"
              clearable
            />
          </div>
          <div class="col-3" v-if="showPaymentFilter">
            <SelectComponent
              class="me-2"
              element-class="mb-0"
              placeholder="Apmaksas veids"
              :options="paymentTypes"
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
import { DateTime } from "luxon";

export default defineComponent({
  name: "document-header",
  components: { SelectComponent },
  emits: ["updateFilters"],
  props: {
    showUserFilter: {
      type: Boolean,
      default: true,
    },
    showRecipientFilter: {
      type: Boolean,
      default: true,
    },
    showPaymentFilter: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    // Get name
    const getName = (id: string, list: any) => {
      if (!id || !list.length) return "";
      return list.find((item: any) => item.id == id)?.name ?? "";
    };

    // Emit selection
    const updateParent = () => {
      const data = {
        date: filterDate.value,
      };

      if (props.showUserFilter) {
        data["user"] = filterUser.value;
      }

      if (props.showRecipientFilter) {
        data["recipient"] = filterRecipient.value;
        data["recipientName"] = getName(
          filterRecipient.value,
          paymentRecipients.value
        );
      }

      if (props.showPaymentFilter) {
        data["payment"] = filterPayment.value;
        data["paymentName"] = getName(filterPayment.value, paymentTypes.value);
      }

      emit("updateFilters", data);
    };

    // Date selection
    const filterDate = ref("");
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
    const loadingUsers = ref(false);
    const filterUser = ref("");
    const users = ref([]);

    const fetchUsers = async () => {
      loadingUsers.value = true;
      await ApiService.get("user", "list")
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

    // Recipient selection
    const loadingRecipients = ref(false);
    const paymentRecipients = ref<any>([]);
    const filterRecipient = ref("");
    const fetchRecipients = async () => {
      loadingRecipients.value = true;
      await ApiService.get("payment", "recipients")
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

    // Payment type selection
    const filterPayment = ref("");
    const paymentTypes = ref([
      { id: "1", name: "Skaidra nauda" },
      { id: "2", name: "Kase" },
      { id: "3", name: "Bankas karte" },
    ]);

    // Default values
    const setDefaults = () => {
      const authStore = useAuthStore();
      const currentUser = String(authStore.user.user_id);
      const currentDate = DateTime.local().toISODate();
      const defaultRecipient = getOption("default_payment_recipient");

      filterDate.value = currentDate;
      filterRecipient.value = defaultRecipient;
      filterUser.value = "";
      filterPayment.value = "";
    };

    onMounted(async () => {
      await fetchUsers();
      await fetchRecipients();
      setDefaults();
      updateParent();
    });

    return {
      filterDate,
      filterRecipient,
      filterUser,
      filterPayment,
      disabledDate,
      shortcuts,
      users,
      paymentRecipients,
      paymentTypes,
      loadingUsers,
      loadingRecipients,
      updateParent,
    };
  },
});
</script>
