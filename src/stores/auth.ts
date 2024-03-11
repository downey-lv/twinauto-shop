import { ref } from "vue";
import { defineStore } from "pinia";
import ApiService from "@/core/services/ApiService";
import JwtService from "@/core/services/JwtService";
import router from "@/router";
import { setOption } from "@/core/services/OptionService";

export interface User {
  name: string;
  email: string;
  password: string;
  api_token: string;
  permissions: string[];
}

export const useAuthStore = defineStore("auth", () => {
  const errors = ref({});
  const user = ref<User>({} as User);
  const isAuthenticated = ref(!!JwtService.getToken());

  function setAuth(authUser: User) {
    isAuthenticated.value = true;
    user.value = authUser;
    errors.value = {};
    JwtService.saveToken(user.value.api_token);

    // Grab app settings
    ApiService.get("user", "settings")
      .then((response) => {
        for (const key in response.data) {
          setOption(key, response.data[key]);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function setError(error: any) {
    errors.value = { ...error };
  }

  function purgeAuth(error = false) {
    isAuthenticated.value = false;
    user.value = {} as User;
    errors.value = [];
    JwtService.destroyToken();
    if (error) router.push({ name: "sign-in" });
  }

  function login(credentials: User) {
    return ApiService.post("login", credentials)
      .then(({ data }) => {
        setAuth(data);
      })
      .catch(({ response }) => {
        if (response?.data?.errors) setError(response.data.errors);
        else setError(["Nav savienojuma ar serveri"]);
      });
  }

  function logout() {
    purgeAuth();
  }

  function verifyAuth() {
    if (JwtService.getToken()) {
      ApiService.setHeader();
      ApiService.post("verify_token", { api_token: JwtService.getToken() })
        .then(({ data }) => {
          setAuth(data);
        })
        .catch(({ response }) => {
          if (response?.data?.errors) setError(response.data.errors);
          else setError(["Nav savienojuma ar serveri"]);
          purgeAuth(true);
        });
    } else {
      purgeAuth();
    }
  }

  return {
    errors,
    user,
    isAuthenticated,
    login,
    logout,
    verifyAuth,
  };
});
