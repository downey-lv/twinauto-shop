import { Modal } from "bootstrap";

const hideModal = (modalEl: HTMLElement | null): void => {
  if (!modalEl) {
    return;
  }

  const myModal = Modal.getInstance(modalEl);
  myModal?.hide();
};

const removeModalBackdrop = (): void => {
  if (document.querySelectorAll(".modal-backdrop.fade.show").length) {
    document.querySelectorAll(".modal-backdrop.fade.show").forEach((item) => {
      item.remove();
    });
  }
};

const removeTooltip = (): void => {
  if (document.querySelectorAll(".tooltip").length) {
    document.querySelectorAll(".tooltip").forEach((item) => {
      item.remove();
    });
  }
};

export { removeModalBackdrop, hideModal, removeTooltip };
