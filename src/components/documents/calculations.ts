import { Decimal } from "decimal.js";
import { computed } from "vue";

function customRounding(value) {
  const rounded = value.toFixed(3); // Round to 3 decimal places first
  return new Decimal(rounded).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export const calculateTotalPrice = (products, deliveryCost: number | undefined = undefined) => {
  const total = products.reduce((sum, product) => {
    const productTotal = new Decimal(product.price || 0).times(
      product.quantity ?? 0
    );
    return sum.plus(productTotal);
  }, new Decimal(0));

  if (deliveryCost) {
    return total.plus(deliveryCost);
  }
  return total;
};

export const calculateTotalPriceVAT = (
  totalPrice: Decimal,
  vatDecimal: Decimal
) => {
  return customRounding(totalPrice.times(vatDecimal));
};

export const calculateTotalVAT = (
  totalPriceVAT: Decimal,
  totalPrice: Decimal
) => {
  return totalPriceVAT.minus(totalPrice.toDecimalPlaces(2));
};

export const calculatePriceVAT = (product, vatDecimal) => {
  return computed({
    get: () => {
      return customRounding(
        new Decimal(product.price || 0).times(vatDecimal.value)
      ).toNumber();
    },
    set: (newValue) => {
      product.price = new Decimal(newValue || 0)
        .dividedBy(vatDecimal.value)
        .toDecimalPlaces(4)
        .toNumber();
    },
  });
};

export const calculateTotal = (product, vatDecimal) => {
  return computed({
    get: () => {
      return customRounding(
        new Decimal(product.price || 0)
          .times(vatDecimal.value)
          .times(product.quantity)
      ).toNumber();
    },
    set: (newValue) => {
      if (product.quantity !== 0) {
        product.price = new Decimal(newValue || 0)
          .dividedBy(product.quantity)
          .dividedBy(vatDecimal.value)
          .toDecimalPlaces(4)
          .toNumber();
      } else {
        product.price = 0;
      }
    },
  });
};
