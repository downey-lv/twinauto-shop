const options = {
  default_document_type: {
    title: "Dokumenti",
    default: "daily",
    values: {
      daily: "Dienas pārdotais",
      in: "Iepirkums",
      service: "Serviss",
    },
  },
  default_payment_recipient: {
    title: "Maksājumi",
    default: "1",
    values: {
      "1": "V1",
      "2": "V2",
      "3": "Ofiss",
    },
  },
};

export const getOption = (key: string) => {
  let value = localStorage.getItem(`option_${key}`);
  if (!value) {
    value = String(options[key].default);
    localStorage.setItem(`option_${key}`, value);
  }
  return value;
};

export const setOption = (key: string, value: string) => {
  localStorage.setItem(`option_${key}`, value);
};

export { options };
