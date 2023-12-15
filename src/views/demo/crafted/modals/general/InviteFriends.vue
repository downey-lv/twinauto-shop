<template>
  <KTModalCard
    title="Invite Friends Modal Example"
    description="Click on the below buttons
  to launch <br />
  a friend invitation example."
    :image="getIllustrationsPath('1.png')"
    button-text="Invite Friends"
    modal-id="kt_modal_invite_friends"
  ></KTModalCard>

  <KTInviteFriendsModal></KTInviteFriendsModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import KTModalCard from "@/components/demo/cards/Card.vue";
import KTInviteFriendsModal from "@/components/demo/modals/general/InviteFriendsModal.vue";
import { getIllustrationsPath } from "@/core/helpers/assets";

export default defineComponent({
  name: "invite-friends",
  components: {
    KTModalCard,
    KTInviteFriendsModal,
  },
  setup() {
    return {
      getIllustrationsPath,
    };
  },
});
</script>
