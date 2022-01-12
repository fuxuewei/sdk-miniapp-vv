export enum EPlatform {
  web = 1,
  wx,
  tt,
}
export default {
  //获取路由
  getCurrentPage() {
    const platform = this.getPlatform();
    const isWx = platform === EPlatform.wx;
    if (!isWx) {
      return window.location.href;
    }
    const pages = getCurrentPages();
    return pages[pages.length - 1]?.route;
  },
  // 获取小程序路由参数
  getParams() {
    const platform = this.getPlatform();
    const isWx = platform === EPlatform.wx;
    if (!isWx) {
      return window.location.href;
    }
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    return options;
  },
  // 根据url获取参数
  getParamsWithUrl(url: string) {
    const pattern = /([^&?=]+)=([^&?=]+)/g;
    let parames: { [key: string]: string } = {}; // 定义Object
    url.replace(pattern, (a: string, b: string, c: string) => {
      parames[b] = c;
      return a;
    });
    return parames; // 返回这个Object
  },
  getPlatform() {
    if (typeof window !== 'undefined' && typeof XMLHttpRequest === 'function') {
      return EPlatform.web;
    }
    if (typeof wx !== 'undefined' && wx.getSystemInfo) {
      return EPlatform.wx;
    }
    if (typeof tt !== 'undefined' && tt.getSystemInfo) {
      return EPlatform.tt;
    }
    return null;
  },
  // 判断是否为Object
  isObject(obj: any) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  },
};
