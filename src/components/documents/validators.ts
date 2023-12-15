export const productValidator = (validator, product, idx = null) => {
  return (rule, value, callback) => {
    return validator(rule, value, callback, product, idx);
  };
};

export const validateID = (rule, value, callback, product) => {
  if (value === "" || !product.valid) {
    callback(new Error(""));
  } else {
    callback();
  }
};

export const validateCode = (rule, value, callback, product) => {
  const productid = product.productid;

  if (value === "" && parseInt(productid) === 1) {
    callback(new Error("Jānorāda kods"));
  } else {
    callback();
  }
};

export const validatePrice = (rule, value, callback) => {
  if (value <= 0) {
    callback(new Error(""));
  } else {
    callback();
  }
};
