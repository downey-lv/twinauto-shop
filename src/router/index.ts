import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useConfigStore } from "@/stores/config";
import { getOption } from "@/core/services/OptionService";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard",
    component: () => import("@/layouts/main-layout/MainLayout.vue"),
    meta: {
      middleware: "auth",
    },
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: {
          pageTitle: "Sākums",
        },
      },
      {
        path: "/tecdoc",
        name: "tecdoc",
        redirect: { name: "tecdoc-car" },
        children: [
          {
            path: "car/:makeId?/:modelId?",
            name: "tecdoc-car",
            component: () => import("@/views/tecdoc/Car.vue"),
            meta: {
              pageTitle: "Automašīna",
              breadcrumbStore: "tecdoc",
            },
          },
          {
            path: "groups/:makeId/:modelId/:carId",
            name: "tecdoc-groups",
            component: () => import("@/views/tecdoc/Categories.vue"),
            meta: {
              pageTitle: "Produktu kategorijas",
              breadcrumbStore: "tecdoc",
            },
          },
          {
            path: "parts/:makeId/:modelId/:carId/:groupId",
            name: "tecdoc-parts",
            component: () => import("@/views/tecdoc/Catalogue.vue"),
            meta: {
              pageTitle: "Produkti",
              breadcrumbStore: "tecdoc",
            },
          },
        ],
      },
      {
        path: "/product/search/:type?/:query?",
        name: "search-parts",
        component: () => import("@/views/product/ProductList.vue"),
        meta: {
          pageTitle: "Katalogs",
          breadcrumbs: [],
        },
      },
      {
        path: "/product/edit/:id",
        name: "product-edit",
        component: () => import("@/views/product/ProductEdit.vue"),
        meta: {
          pageTitle: "Labot preci",
          breadcrumbs: [],
        },
      },
      {
        path: "/report/sold/:type?",
        name: "report-sold-products",
        component: () => import("@/views/reports/SoldProducts.vue"),
        meta: {
          pageTitle: "Pārdotā prece",
          breadcrumbs: [],
        },
      },
      {
        path: "/report/ordered/",
        name: "report-ordered-products",
        component: () => import("@/views/product/PreorderedProducts.vue"),
        meta: {
          pageTitle: "Pasūtītā prece",
          breadcrumbs: [],
        },
      },
      {
        path: "/document",
        name: "document",
        redirect: () => {
          const defaultType = getOption("default_document_type");
          return { name: "document-list", params: { type: defaultType } };
        },
        meta: {
          breadcrumbStore: "document",
        },
        children: [
          {
            path: "list/:type",
            name: "document-list",
            component: () => import("@/views/document/DocumentList.vue"),
            meta: {
              pageTitle: "Dokumenti",
              breadcrumbStore: "document",
            },
          },
          {
            path: "edit/:type/:editId",
            name: "document-edit",
            component: () => import("@/views/document/DocumentEdit.vue"),
            meta: {
              pageTitle: "Labot dokumentu",
              breadcrumbStore: "document",
            },
          },
          {
            path: "view/:type/:documentId",
            name: "document-view",
            component: () => import("@/views/document/DocumentView.vue"),
            meta: {
              pageTitle: "Dokuments",
              breadcrumbStore: "document",
            },
          },
        ],
      },
      {
        path: "/return-document",
        name: "return",
        redirect: { name: "return-list" },
        children: [
          {
            path: "list",
            name: "return-list",
            component: () => import("@/views/return/ReturnList.vue"),
            meta: {
              pageTitle: "Atgriešanas dokumenti",
              breadcrumbs: [],
            },
          },
          {
            path: "view/:returnId/:documentId?",
            name: "return-view",
            component: () => import("@/views/return/ReturnView.vue"),
            meta: {
              pageTitle: "Atgriešana",
              breadcrumbs: [],
            },
          },
          {
            path: "edit/:returnId",
            name: "return-edit",
            component: () => import("@/views/return/ReturnEdit.vue"),
            meta: {
              pageTitle: "Labot atgriešanu",
              breadcrumbs: [],
            },
          },
        ],
      },
      {
        path: "/settings/editor/",
        name: "settings-product-editor",
        component: () => import("@/views/settings/ProductEditor.vue"),
        meta: {
          pageTitle: "Masveida produktu labošana",
          breadcrumbs: [],
        },
      },
      {
        path: "/settings/:type",
        name: "settings",
        component: () => import("@/views/settings/Settings.vue"),
        meta: {
          pageTitle: "Iestatījumi",
          breadcrumbs: [],
        },
      },
      {
        path: "/client",
        name: "client",
        redirect: { name: "client-list", params: { clientType: "suppliers" } },
        children: [
          {
            path: "list/:clientType?",
            name: "client-list",
            component: () => import("@/views/clients/ClientList.vue"),
            meta: {
              pageTitle: "Klienti",
              breadcrumbs: [],
            },
          },
          {
            path: ":clientId",
            name: "client-view",
            component: () => import("@/views/clients/ClientView.vue"),
            meta: {
              pageTitle: "Klienti",
              breadcrumbs: [],
            },
          },
        ],
      },
      {
        path: "/purchase/",
        name: "purchase-import",
        component: () => import("@/views/document/PurchaseImport.vue"),
        meta: {
          pageTitle: "Jauns iepirkums",
          breadcrumbs: [],
        },
      },
      {
        path: "/carts/",
        name: "cart-list",
        component: () => import("@/views/cart/CartList.vue"),
        meta: {
          pageTitle: "Grozi",
          breadcrumbs: [],
        },
      },
      {
        path: "/report/",
        name: "daily-sold",
        component: () => import("@/views/reports/DailySold.vue"),
        meta: {
          pageTitle: "Ietirgotais",
          breadcrumbs: [],
        },
      },
      {
        path: "/stock/scan/:scanId?",
        name: "stock-scan",
        component: () => import("@/views/stock/StockScan.vue"),
        meta: {
          pageTitle: "Preču skaitīšana",
          breadcrumbs: [],
        },
      },
      {
        path: "/stock/locations",
        name: "stock-locations",
        component: () => import("@/views/stock/StockLocations.vue"),
        meta: {
          pageTitle: "Saskaitītās novietnes",
          breadcrumbs: [],
        },
      },
      {
        path: "/stock/control",
        name: "stock-control",
        component: () => import("@/views/stock/StockControl.vue"),
        meta: {
          pageTitle: "Atlikumu pārbaude",
          breadcrumbs: [],
        },
      },
      {
        path: "/stock/result/:stocktakeId",
        name: "stock-result",
        component: () => import("@/views/stock/StockResult.vue"),
        meta: {
          pageTitle: "Inventarizācijas rezultāts",
          breadcrumbs: [],
        },
      },
      {
        path: "/stock/",
        name: "stock-dashboard",
        component: () => import("@/views/stock/StockDashboard.vue"),
        meta: {
          pageTitle: "Inventarizācija",
          breadcrumbs: [],
        },
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "/sign-in",
        name: "sign-in",
        component: () => import("@/views/authentication/SignIn.vue"),
        meta: {
          pageTitle: "Pieslēgties",
        },
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/SystemLayout.vue"),
    children: [
      {
        // the 404 route, when none of the above matches
        path: "/404",
        name: "404",
        component: () => import("@/views/authentication/Error404.vue"),
        meta: {
          pageTitle: "Error 404",
        },
      },
      {
        path: "/500",
        name: "500",
        component: () => import("@/views/authentication/Error500.vue"),
        meta: {
          pageTitle: "Error 500",
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const configStore = useConfigStore();

  // current page view title
  document.title = `${to.meta.pageTitle} - ${import.meta.env.VITE_APP_NAME}`;

  // reset config to initial state
  configStore.resetLayoutConfig();

  // verify auth token before each page change
  authStore.verifyAuth();

  // before page access check if page requires authentication
  if (to.meta.middleware == "auth") {
    if (authStore.isAuthenticated) {
      next();
    } else {
      next({ name: "sign-in" });
    }
  } else {
    next();
  }

  // Scroll page to top on every route change
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});

export default router;
