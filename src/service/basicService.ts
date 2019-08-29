import axios from "axios";

import router from "@/router/router";
import store from "@/store/store";

class BasicService {
  public static async getData(rsp: any) {
    let rspData = rsp;
    if (rsp.data) {
      rspData = rsp.data;
    }
    if (rsp.response) {
      console.log(rsp.response.status);
      if (rsp.response.status === 402) {
        store.commit("user/clearAuthorization");
        store.commit("system/toggleFullScreenLoading", false);
        router.push({ path: "/login" });
      }
    }
    // err => no data
    return rspData;
  }

  public static async getRequest(url: string, params: any) {
    store.commit("system/toggleLoading", true);
    try {
      const rsp = await axios.get("/api" + url, {
        params
      });
      const json = rsp.data;
      const msg = { url, params, rsp: json };
      console.log(msg);

      store.commit("system/toggleLoading", false);
      return await this.getData(rsp);
    } catch (err) {
      store.commit("system/toggleLoading", false);
      return await this.getData(err);
    }
  }

  public static async postRequest(url: string, params: any) {
    store.commit("system/toggleLoading", true);
    try {
      const config = {
        onUploadProgress: (progressEvent: any) => {
          const complete =
            ((progressEvent.loaded / progressEvent.total) * 100 || 0) + "%";
          store.commit("system/updateUploadPercent", complete);
        }
      };
      const rsp = await axios.post("/api" + url, params, config);
      const json = rsp.data;
      const msg = { url, params, rsp: json };
      console.log(msg);
      store.commit("system/toggleLoading", false);
      return await this.getData(rsp);
    } catch (err) {
      store.commit("system/toggleLoading", false);
      return await this.getData(err);
    }
  }

  public static async putRequest(url: string, params: any) {
    store.commit("system/toggleLoading", true);
    try {
      const rsp = await axios.put("/api" + url, params);
      const json = rsp.data;
      const msg = { url, params, rsp: json };
      console.log(msg);
      store.commit("system/toggleLoading", false);
      return this.getData(rsp);
    } catch (err) {
      store.commit("system/toggleLoading", false);
      return await this.getData(err);
    }
  }

  public static async deleteRequest(url: string, params: any) {
    store.commit("system/toggleLoading", true);
    try {
      const rsp = await axios.delete("/api" + url, {
        params
      });
      const json = rsp.data;
      const msg = { url, params, rsp: json };
      store.commit("system/toggleLoading", false);
      console.log(msg);

      return this.getData(rsp);
    } catch (err) {
      store.commit("system/toggleLoading", false);
      return await this.getData(err);
    }
  }
}

export default BasicService;
