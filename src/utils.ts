export default {
  //获取路由
  getCurrentPage() {
    //@ts-ignore
    const pages = getCurrentPages();
    return pages[pages.length - 1].route;
  },
  // 获取带参数路由
  getCurrentPageUrlWithArgs() {
    //@ts-ignore
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const url = currentPage.route;
    const options = currentPage.options;
    let urlWithArgs = `/${url}?`;
    for (let key in options) {
      const value = options[key];
      urlWithArgs += `${key}=${value}&`;
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);
    return urlWithArgs;
  },
  // 获取所有参数
  getParams() {
    const url = this.getCurrentPageUrlWithArgs();
    let pattern = /(\w+)=(\w+)/gi;
    let parames = {}; // 定义Object
    url.replace(pattern, function (a: string, b: string, c: string) {
      parames[b] = c;
    });
    return parames; // 返回这个Object.
  },
  // 获取小程序地址参数
  getParam(name: string) {
    let params = this.getParams();
    return params[name];
  },
};
