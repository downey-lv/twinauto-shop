export interface MenuItem {
  heading?: string;
  sectionTitle?: string;
  route?: string;
  pages?: Array<MenuItem>;
  keenthemesIcon?: string;
  bootstrapIcon?: string;
  faIcon?: string;
  sub?: Array<MenuItem>;
}

const MainMenuConfig: Array<MenuItem> = [
  {
    heading: "Sākums",
    route: "/dashboard",
    faIcon: "home",
  },
  {
    heading: "TecDoc",
    route: "/tecdoc",
    faIcon: "garage-car",
  },
  {
    heading: "Katalogs",
    route: "/product/search/",
    faIcon: "shelves",
  },
  {
    heading: "Dokumenti",
    route: "/document/",
    faIcon: "file-invoice",
  },
  {
    heading: "Atgriešana",
    route: "/return-document/",
    faIcon: "boxes-packing",
  },
  {
    heading: "Pārdotais",
    route: "/sold/",
    faIcon: "timeline",
  },
  {
    heading: "Grozi",
    route: "/carts/",
    faIcon: "basket-shopping-simple",
  },
  {
    heading: "Klienti",
    route: "/client/",
    faIcon: "users",
  },
  {
    sectionTitle: "Iestatījumi",
    route: "/settings",
    faIcon: "sliders",
    pages: [
      {
        heading: "Ražotāji",
        route: "/settings/producer",
      },
      {
        heading: "Grupas",
        route: "/settings/group",
      },
      {
        heading: "Novietnes",
        route: "/settings/location",
      },
      {
        heading: "Masveida produktu labošana",
        route: "/settings/editor/",
      },
    ],
  },
];

const devMenu: Array<MenuItem> = [];

if (import.meta.env.MODE === "development") {
  MainMenuConfig.push(...devMenu);
}

export default MainMenuConfig;
