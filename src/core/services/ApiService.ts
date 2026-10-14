import type { App } from "vue";
import type { AxiosResponse } from "axios";
import axios from "axios";
import VueAxios from "vue-axios";
import JwtService from "@/core/services/JwtService";
import { push } from "@/main";
import { useConnectionStore } from "@/stores/connection";

/**
 * @description service to call HTTP request via Axios
 */
class ApiService {
  /**
   * @description property to share vue instance
   */
  public static vueInstance: App;

  /**
   * @description initialize vue axios
   */
  public static init(app: App<Element>) {
    ApiService.vueInstance = app;
    ApiService.vueInstance.use(VueAxios, axios);

    // Check environment mode and set the baseURL accordingly
    if (import.meta.env.MODE === "development") {
      ApiService.vueInstance.axios.defaults.baseURL = "http://localhost:8080"; // replace with your local server's URL
    } else {
      ApiService.vueInstance.axios.defaults.baseURL =
        import.meta.env.VITE_APP_API_URL;
    }

    // Server unreachable (restarting or down): show offline overlay
    ApiService.vueInstance.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (ApiService.isOffline(error)) {
          useConnectionStore().setOffline(
            ApiService.vueInstance.axios.defaults.baseURL ?? ""
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description request failed because the server could not be reached
   */
  public static isOffline(error: any): boolean {
    if (axios.isCancel(error)) return false;
    if (!error?.response) return !!error?.request;
    return [502, 503, 504].includes(error.response.status);
  }

  public static getUrl(): string {
    return import.meta.env.VITE_APP_API_URL;
  }

  /**
   * @description set the default HTTP request headers
   */
  public static setHeader(): void {
    ApiService.vueInstance.axios.defaults.headers.common[
      "Authorization"
    ] = `Token ${JwtService.getToken()}`;
    ApiService.vueInstance.axios.defaults.headers.common["Accept"] =
      "application/json";
  }

  /**
   * @description send the GET HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static query(resource: string, params: any): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.get(resource, params);
  }

  /**
   * @description send the GET HTTP request
   * @returns Promise<AxiosResponse>
   * @param resource
   * @param slug
   * @param queryParams
   */
  public static get(
    resource: string,
    slug = "" as string,
    queryParams: Record<string, any> = {},
    settings: Record<string, any> = {}
  ): Promise<AxiosResponse> {
    if (JwtService.getToken()) this.setHeader();

    const url = `${resource}/${slug}`;
    return ApiService.vueInstance.axios.get(url, {
      params: queryParams,
      ...settings,
    });
  }

  /**
   * @description set the POST HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static post(
    resource: string,
    params: any,
    headers: any = {}
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.post(`${resource}`, params, {
      headers,
    });
  }

  /**
   * @description send the UPDATE HTTP request
   * @param resource: string
   * @param slug: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static update(
    resource: string,
    slug: string,
    params: any
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.put(`${resource}/${slug}`, params);
  }

  /**
   * @description Send the PUT HTTP request
   * @param resource: string
   * @param params: AxiosRequestConfig
   * @returns Promise<AxiosResponse>
   */
  public static put(resource: string, params: any): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.put(`${resource}`, params);
  }

  /**
   * @description Send the DELETE HTTP request
   * @param resource: string
   * @returns Promise<AxiosResponse>
   */
  public static delete(
    resource: string,
    params: any = {}
  ): Promise<AxiosResponse> {
    return ApiService.vueInstance.axios.delete(resource, { data: params });
  }

  /**
   * @description Fetch a PDF and return an object URL for it (caller must revoke it)
   */
  public static async pdfUrl(
    resource: string,
    slug = "",
    queryParams = {}
  ): Promise<string> {
    const response = await ApiService.get(resource, slug, queryParams, {
      responseType: "blob",
    });
    const file = new Blob([response.data], { type: "application/pdf" });
    return URL.createObjectURL(file);
  }

  public static pdf(resource, slug = "", queryParams = {}) {
    ApiService.pdfUrl(resource, slug, queryParams)
      .then((fileURL) => {
        window.open(fileURL);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        push.error("Neizdevās izdrukāt");
      })
      .finally(() => {});
  }
}

export default ApiService;
