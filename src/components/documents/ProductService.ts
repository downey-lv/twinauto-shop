import ApiService from "@/core/services/ApiService";
import axios from "axios";

export class ProductService {
  document: any;
  stateRefs: any;
  formRef: any;
  route: any;
  router: any;
  returnDocument: boolean;
  cancelToken: any;

  constructor(
    document,
    stateRefs,
    formRef,
    route,
    router,
    returnDocument = false
  ) {
    this.document = document;
    this.stateRefs = stateRefs;
    this.formRef = formRef;
    this.route = route;
    this.router = router;
    this.returnDocument = returnDocument;
    this.cancelToken = null;
  }

  searchProduct(type, idx, extendedHistory = false) {
    // Cancel the previous request if it exists
    if (this.cancelToken) {
      this.cancelToken.cancel("Canceled due to new request");
    }

    // Create a new cancel token for this request
    this.cancelToken = axios.CancelToken.source();

    const product = this.document.value.products[idx];
    if (!product) return;

    let query = "";
    if (type === "code") {
      query = product.productcode;
      if (query.length < 3) return;
    } else if (type === "id") {
      query = product.productid;
    }
    if (!query) return;
    query = encodeURIComponent(query);

    const queryParams = {
      exact: 1,
    };

    if (this.returnDocument) queryParams["autoshop"] = 1;
    if (extendedHistory) queryParams["extendedHistory"] = 1;

    this.stateRefs.loadingProduct.value[idx] = true;
    ApiService.get("product/find", `${type}/${query}`, queryParams, {
      cancelToken: this.cancelToken.token,
    })
      .then((response) => {
        this.addMatch(product, response.data);
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log(error.message);
        } else {
          console.error("Error fetching data:", error);
        }
      })
      .finally(() => {
        this.stateRefs.loadingProduct.value[idx] = false;
      });
  }

  selectMatch(product, match) {
    // Add full data
    product.data = match;
    product.valid = true;

    if (match.productid == "" && !this.returnDocument) {
      if (this.route.params.type === "in") {
        product.productcode = match.code;

        this.router.push({
          name: "product-edit",
          params: { id: "new" },
          query: {
            purchase: this.route.params.editId,
            productcode: match.code,
            producer: match.producer,
            producerid: match.producerId,
            suppliercode: product.imported?.code ?? "",
          },
        });

        return;
      } else {
        product.comment = match.name;
        product.productid = "00001";
        product.productcode = match.code;
        product.producer = match.producer;
        product.productname = "Neiepirkta prece";
        product.matches = [];
      }
    } else {
      product.productid = match.productid;
      product.productcode = match.productid === "00001" ? "" : match.code;
      product.producer = match.producer;
      product.productname = match.name;
      product.matches = [];
    }

    if (this.returnDocument) {
      product.history = match.history;

      // Auto-select orderid if only one order
      if (product.history.length == 1) {
        const historyElement = product.history[0];
        product.orderid = String(historyElement.orderid);
        product.maxQuantity = historyElement.quantity;
        product.price = Number(historyElement.price);
      }
    } else {
      // Set price
      let matchingSuppliers: any[] = [];
      const currentPrice = product.price;
      if (!currentPrice || currentPrice === 0) {
        let price;
        let priceGross;
        switch (this.route.params.type) {
          case "in":
            // Find supplier
            matchingSuppliers = match.suppliers.filter(
              (supplier) =>
                supplier.supplier_autoshop_id ===
                Number(this.document.value.companyid)
            );

            // Set price
            if (matchingSuppliers.length > 0) {
              const ms = matchingSuppliers[0];
              if (ms.supplier_price_gross) priceGross = ms.supplier_price_gross;
              else price = ms.supplier_price;
            } else {
              priceGross = match.priceBuyGross;
            }
            break;
          case "out":
            price = match.priceSell;
            break;
          case "service":
            price = match.priceService;
            break;
          case "online":
            // TODO: Set price based on user level
            price = match.priceOnline["1"];
            break;
          default:
            price = match.priceBuy;
            break;
        }
        if (priceGross) product.price = priceGross;
        else product.priceVAT = parseFloat(price);
      }
    }

    // Re-validate form
    if (this.formRef.value) this.formRef.value.validate();
  }

  addMatch(product, matches) {
    if (matches.length == 1 && matches[0].productid) {
      const match = matches[0];
      this.selectMatch(product, match);
    } else {
      // Set product as invalid
      product.valid = false;
      product.data = false;

      // Add supplierExists to match if companyid in vide.suppliers[].supplier_id
      matches.forEach((match) => {
        match.supplierExists = match.suppliers.some(
          (supplier) =>
            supplier.supplier_autoshop_id ===
            Number(this.document.value.companyid)
        );
      });

      // Order by exactMatch, then by supplierExists, productid
      matches.sort((a, b) => {
        return (
          b.exactMatch - a.exactMatch ||
          b.supplierExists - a.supplierExists ||
          parseInt(b.productid) - parseInt(a.productid)
        );
      });

      product.matches = matches;
      product.selectedMatch = 0;
    }
  }

  changeMatch(product, increase = true) {
    const matches = product.matches;
    product.selectedMatch = Number(product.selectedMatch);

    // Increase currentMatch
    if (product.selectedMatch < matches.length - 1) {
      if (increase) product.selectedMatch++;
      else product.selectedMatch--;
    } else {
      product.selectedMatch = 0;
    }
  }
}
