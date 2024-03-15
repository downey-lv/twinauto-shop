const options = {
  default_document_type: {
    title: "Dokumenti",
    default: "daily",
    values: {
      daily: "Dienas pārdotais",
      out: "Pārdošana",
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
  default_price: {
    title: "Cena",
    default: "priceSell",
    values: {
      priceSell: "Veikals",
      priceService: "Serviss",
      priceOnlineDefault: "Internets",
    },
  },
  search_speed: {
    title: "Meklēšanas ātrums",
    default: 1000,
    values: {
      700: "Ātri",
      1000: "Standarta",
      1300: "Lēni",
      1600: "Ļoti lēni",
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

export const getOptionLabel = (key: string) => {
  const value = getOption(key);
  return options[key].values[value];
};

export const setOption = (key: string, value: string) => {
  localStorage.setItem(`option_${key}`, value);
};

export { options };
