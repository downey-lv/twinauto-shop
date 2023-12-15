import type LayoutConfigTypes from "@/core/config/LayoutConfigTypes";

const config: LayoutConfigTypes = {
  general: {
    mode: "system",
    iconsType: "duotone",
  },
  main: {
    type: "default",
    primaryColor: "#009EF7",
    logo: {
      dark: "media/logos/logo_white.svg",
      light: "media/logos/logo.svg",
    },
  },
  illustrations: {
    set: "sketchy-1",
  },
  scrollTop: {
    display: true,
  },
  header: {
    display: true,
    menuIcon: "keenthemes",
    width: "fluid",
    fixed: {
      desktop: true,
      tabletAndMobile: true,
    },
  },
  toolbar: {
    display: true,
    width: "fluid",
    fixed: {
      desktop: false,
      tabletAndMobile: false,
    },
  },
  pageTitle: {
    display: true,
    breadcrumb: true,
    direction: "row",
  },
  aside: {
    display: true,
    theme: "dark",
    fixed: true,
    menuIcon: "fontawesome",
    minimized: false,
    minimize: true,
    hoverable: true,
  },
  content: {
    width: "fluid",
  },
  footer: {
    width: "fluid",
  },
};

export default config;
