import ApiService from "@/core/services/ApiService";
import { push } from "@/main";
import { cloneDeep } from "lodash";

const shop_template = `
N
ZB
q464
Q320,16
GG50,0,"twin"
A85,60,0,c,1,1,N,"Ropažu iela 59 T.20033383 T.20044494"
A15,93,0,a,1,1,N,"{productcode}"
A15,145,0,e,1,1,N,"{productTitle}"
A15,184,0,e,1,1,N,"{productSubtitle}"
A15,222,0,a,1,1,N,"{saleprice}"
A15,275,0,e,1,1,N,"{unitprice}{locations}"
B290,240,0,1,2,6,42,B,"{productidstr}"
`;

const revenue_template = `
N
ZB
q464
Q320,16
A15,5,0,a,1,1,N,"{workstation}"
A15,60,0,e,1,1,N,"{date}"
A15,95,0,e,1,1,N,"Kase: {official}"
A15,130,0,e,1,1,N,"-Skaidra: {kase}"
A15,165,0,e,1,1,N,"-Karte: {karte}"
A15,200,0,e,1,1,N,"Atlikums: {cash}"
A15,235,0,a,1,1,N,"{total}"
`;

export const labelService = {
  print: async function (type, data, params = {}) {
    let label;
    let labelsPerRow = 1;
    // Set label
    switch (type) {
      case "product":
        label = await this.labelProduct(data, params);
        break;
      case "revenue":
        label = await this.labelRevenue(data);
        labelsPerRow = 2;
        break;
      default:
        throw new Error("Unknown label type.");
    }

    const count = label.length * labelsPerRow;

    // Send to print server
    await ApiService.post("api/print", { data: label })
      .then(() => {
        push.info(`Izdrukātas ${count} uzlīmes`);
      })
      .catch((error) => {
        console.error(error);
        push.error("Neizdevās izdrukāt uzlīmes");
      });

    // Print
    // return qzInstance.print(config, label);
  },
  labelRevenue: async function (data) {
    const replacePlaceholders = (template, data) => {
      // Use a regular expression to find placeholders in the format {key}
      return template.replace(/{([^}]+)}/g, function (match, key) {
        return key in data ? data[key] : match;
      });
    };

    let result = replacePlaceholders(revenue_template, data);
    result += "\nP2,1\n "; // Print - number of label sets, number of copies
    return [result];
  },
  labelProduct: async function (data, params) {
    const hidePrice = params.hidePrice || false;
    const hideCode = params.hideCode || false;

    const replacePlaceholders = (template, data) => {
      // Use a regular expression to find placeholders in the format {key}
      return template.replace(/{([^}]+)}/g, function (match, key) {
        if (key === "productcode" && hideCode) {
          key = "productidstr";
        }
        if (key === "saleprice") {
          if (hidePrice) return "";
          return data.priceSell + " €";
        }
        if (key === "unitprice") {
          if (
            !hidePrice &&
            data.volume &&
            data.volume !== "1" &&
            data.unitname
          ) {
            const unit_price = (data.priceSell / data.volume).toFixed(2);
            return `${unit_price} €/${data.unitname} - `;
          }
          return "";
        }
        return key in data ? data[key] : match;
      });
    };

    let dataSorted = cloneDeep(data);
    // Sort labels
    try {
      if (hideCode) {
        dataSorted = dataSorted.sort((a, b) => parseInt(a.productid) - parseInt(b.productid));
      } else {
        dataSorted = dataSorted.sort((a, b) => a.code.localeCompare(b.code));
      }
    } catch (error) {
      console.error(error);
    }

    // Prepare labels
    const labels: object[] = [];
    for (const item of dataSorted) {
      const product = item.shop;
      product.priceSell = item.priceSell;

      let result = replacePlaceholders(shop_template, product);

      result += "\nP1,1\n "; // Print - number of label sets, number of copies
      labels.push(result);
    }

    return labels;
  },
};
