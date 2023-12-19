import qz from "qz-tray";
import axios from "axios";

let qzInstance: typeof qz;
const API_URL = import.meta.env.VITE_APP_API_URL;

const shop_template = `
N
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
  connect: function () {
    if (!qzInstance) {
      // Set signing
      qz.security.setCertificatePromise(function (resolve, reject) {
        axios
          .get(API_URL + "/qz/certificate")
          .then(function (response) {
            resolve(response.data);
          })
          .catch(function (error) {
            reject(error);
          });
      });

      qz.security.setSignatureAlgorithm("SHA512"); // Since 2.1
      qz.security.setSignaturePromise(function (toSign) {
        return function (resolve, reject) {
          fetch(API_URL + "/qz/sign?request=" + toSign, {
            cache: "no-store",
            headers: { "Content-Type": "text/plain" },
          }).then(function (data) {
            data.ok ? resolve(data.text()) : reject(data.text());
          });
        };
      });

      return qz.websocket.connect().then(() => {
        qzInstance = qz; // Storing the connected instance
        return qzInstance;
      });
    } else {
      return Promise.resolve(qzInstance); // If already connected, use the existing instance
    }
  },
  getPrinter: function (printerName) {
    return this.connect().then(() => {
      if (qzInstance) {
        return qzInstance.printers.find(printerName);
      } else {
        throw new Error("Failed to establish connection with QZ.");
      }
    });
  },
  print: async function (type, data, params = {}) {
    // Set printer
    const printerName = "ZDesigner ZD420";
    const printer = await this.getPrinter(printerName);

    // Check if QZ is connected
    if (!qzInstance) throw new Error("QZ is not connected.");

    // Create print config
    const config = qzInstance.configs.create(printer);

    let label;
    // Set label
    switch (type) {
      case "product":
        label = await this.labelProduct(data, params);
        break;
      case "revenue":
        label = await this.labelRevenue(data);
        break;
      default:
        throw new Error("Unknown label type.");
    }

    // Print
    return qzInstance.print(config, label);
  },
  labelRevenue: async function (data) {
    const replacePlaceholders = (template, data) => {
      // Use a regular expression to find placeholders in the format {key}
      return template.replace(/{([^}]+)}/g, function (match, key) {
        return key in data ? data[key] : match;
      });
    };

    let result = replacePlaceholders(revenue_template, data);
    result += "\nP1,2\n "; // Print - number of label sets, number of copies
    return [result];
  },
  labelProduct: async function (data, params) {
    const replacePlaceholders = (template, data) => {
      const hidePrice = params.hidePrice || false;
      const hideCode = params.hideCode || false;

      // Use a regular expression to find placeholders in the format {key}
      return template.replace(/{([^}]+)}/g, function (match, key) {
        if (key === "productcode" && hideCode) {
          key = "productidstr";
        }
        if (key === "saleprice") {
          if (hidePrice) return "";
          return data.saleprice + " €";
        }
        if (key === "unitprice") {
          if (!hidePrice && data.volume && data.unitname) {
            const unit_price = (data.saleprice / data.volume).toFixed(2);
            return `${unit_price} €/${data.unitname} - `;
          }
          return "";
        }
        return key in data ? data[key] : match;
      });
    };

    // Prepare labels
    const labels: object[] = [];
    for (const item of data) {
      let result = replacePlaceholders(shop_template, item);

      result += "\nP1,1\n "; // Print - number of label sets, number of copies
      labels.push(result);
    }

    return labels;
  },
};
