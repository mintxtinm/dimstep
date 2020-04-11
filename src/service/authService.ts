import basicService from '@/service/basicService';
import store from '@/store/store';
import { Authorization } from '@/types/user';
import Vue from 'vue';

const vue = new Vue();

class AuthService {
  static getCoordinates() {
    const options = {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000
    };
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  static async getUserLocation() {
    const position = (await this.getCoordinates()) as any;
    return [position.coords.latitude, position.coords.longitude];
  }

  static async wechatLogin(code: string, userID: string) {
    let position = [];
    if ('geolocation' in navigator) {
      try {
        position = await this.getUserLocation();
      } catch {
        vue.$snack('无法获取地理位置信息🤔');
      }
    }
    const rsp = await basicService.postRequest('/wechat/login', {
      code,
      position,
      userID
    });
    if (rsp.msg === 'success') {
      store.commit('user/updateUserAuth', rsp.authorization);
      return Promise.resolve(rsp.authorization as Authorization);
    } else {
      window.location.href = '/login';
      return Promise.reject('error');
    }
  }

  static async standardLogin(username: string, password: string) {
    let position = [];
    if ('geolocation' in navigator) {
      try {
        position = await this.getUserLocation();
      } catch {
        vue.$snack('无法获取地理位置信息🤔');
      }
    }
    const rsp = await basicService.postRequest('/user/login', {
      username,
      password,
      position
    });
    if (rsp.msg === 'success') {
      store.commit('user/updateUserAuth', rsp.authorization);
      return Promise.resolve(rsp.authorization as Authorization);
    } else {
      vue.$snack('登录失败');
      window.location.href = '/login';
      return Promise.reject('error');
    }
  }

  static async getCode(phoneNumber: string) {
    const rsp = await basicService.getRequest('/sms/code', {
      phoneNumber
    });
    if (rsp.msg === 'success') return Promise.resolve(rsp.code as string);
    else if (rsp.error === 'overflow') return Promise.reject('overflow');
    return Promise.reject(rsp);
  }

  static async loginWithCode(phoneNumber: string, code: string) {
    const rsp = await basicService.postRequest('/sms/login', {
      phoneNumber,
      code
    });
    if (rsp.msg === 'success') {
      store.commit('user/updateUserAuth', rsp.authorization);
      return Promise.resolve(rsp.authorization as Authorization);
    }
    return Promise.reject(rsp);
  }
}

export default AuthService;
