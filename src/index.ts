/**
 * tezign ownership
 * @owner fuxuewei
 * @team N1
 */
import utils, { EPlatform } from './utils';
import TezignTracer from './main';
//dev test rebase

// SDK需要先通过init初始化才能正常使用
interface OptionsType {
  app_id: string; // 微信小程序app_id，以wx开头
  token: string; // token是唯一必须配置的参数，对应租户id
  proxyPage?: boolean; // 是否开启自动代理 Page，默认是：true
  env?: 'dev' | 'prod';
}
const tracer = new TezignTracer();
const platform = utils.getPlatform();
const isWx = platform === EPlatform.wx;
// 获取当前时间戳
const getTimeStamp = () => {
  let timestamp = Date.parse(new Date().toString());
  return timestamp;
};

const PREFIX = 'Content_WXapp_';
const TRACKCODE = 'tezign_trace_id';
/**
 * 代理原始方法，并执行回调函数
 * @param {*} fn 需要代理的方法
 * @param {*} cb 需要执行的回调
 */
function _proxyHooks(fn = function () {}, cb: any) {
  return function () {
    // 如果回调存在
    if (cb) {
      // eslint-disable-next-line @typescript-eslint/no-invalid-this
      cb.apply(this, arguments);
    }
    // 执行原函数
    // eslint-disable-next-line @typescript-eslint/no-invalid-this
    fn.apply(this, arguments);
  };
}
export default class TezignWxTrack {
  [key: string]: any;
  app_id: string;
  tenant_id: string;
  union_id: string;
  open_id: string;
  showOptions: any; // 分享参数
  trace_id: string; // 渠道号
  isShare = false; // 用于过滤分享触发的 pageShow pageHide 事件
  wx_scene: string; // 微信渠道号
  constructor() {
    const _that = this;
    if (!isWx) {
      return;
    }
    /**
     * App 启动
     * https://developers.weixin.qq.com/miniprogram/dev/api/base/app/life-cycle/wx.getLaunchOptionsSync.html
     */
    /**
     * App 显示
     * https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onAppShow.html
     */
    wx.onAppShow(() => {
      const dataInfo = wx.getLaunchOptionsSync();
      this.getTrackIdByQueryScene(dataInfo);
      if (_that.isShare) {
        return;
      }
      setTimeout(() => {
        _that.track('AppShow');
      });
    });
    /**
     * App 隐藏
     * https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onAppHide.html
     */
    //  wx.onAppHide((options) => {
    //    console.log('hideData', options);
    // });
  }

  init({ app_id, token, proxyPage = true, env }: OptionsType) {
    this.app_id = app_id;
    this.tenant_id = token;
    const _that = this;
    tracer.init({
      // 'development' | 'production', 默认'development'
      env: env === 'prod' ? 'production' : 'development',
      tenant_id: this.tenant_id,
    });

    if (proxyPage && isWx && Page) {
      const originPage = Page;
      // @ts-ignore
      Page = (options: any) => originPage(_that.proxyPageOptions(options));
    }
  }

  /**
   * 重写App中的options参数
   * @param {*} options 原始的options参数
   * @returns 新的options参数
   */
  proxyPageOptions(options: any) {
    const _that = this;
    let inTime: number;
    const usePageShow = function () {
      if (_that.isShare) {
        _that.isShare = false;
        return;
      }
      inTime = getTimeStamp();
      _that.track('PageShow', {
        page_route: options.route,
      });
    };

    const usePageHide = function () {
      if (_that.isShare) {
        return;
      }
      _that.track('PageHide', {
        page_route: this.route,
        stay_time: getTimeStamp() - inTime, // 当前页面停留耗时（毫秒）
      });
    };

    const userShareApp = function (share_options: any) {
      _that.isShare = true;
      _that.localCache().set('share_options', {
        share_from: share_options.from,
        page_route: this.route,
      });
    };
    // onShow 事件监听
    options.onShow = _proxyHooks(options.onShow, usePageShow);
    // onHide 事件监听
    options.onHide = _proxyHooks(options.onHide, usePageHide);
    // onShareAppMessage 事件监听
    options.onShareAppMessage = _proxyHooks(
      options.onShareAppMessage,
      userShareApp
    );
    return options;
  }
  // 二维码模式获取参数
  getTrackIdByQueryScene(options) {
    this.wx_scene = options?.scene.toString();
    const queryScene = options?.query?.scene;
    // query.scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 渠道号
    let trace_id: string;
    if (queryScene) {
      let scene = decodeURIComponent(queryScene);
      trace_id = utils.getParamsWithUrl(scene)?.[TRACKCODE];
      this.trace_id = trace_id;
    }
  }
  // 埋点上报
  track(t: string, data?: { [key: string]: any }) {
    if (data && !utils.isObject(data)) {
      return;
    }
    const tezign_trace_id =
      this?.trace_id ||
      utils.getParams()?.[TRACKCODE] ||
      this.localCache().get('trace_id');
    this.localCache().set('trace_id', tezign_trace_id);

    // 公共属性
    let commonProps = {
      page_route: utils.getCurrentPage(),
      app_id: this.app_id,
      wxapp_scence: this.wx_scene,
      tezign_trace_id: tezign_trace_id,
      tenant_key: 'content-wx-sdk',
      sdk_version: process.env.SDK_VERSION,
      tenant_id: this.tenant_id,
      page_title: '',
    };
    if (t === 'Share') {
      commonProps = {
        ...commonProps,
        ...this.localCache().get('share_options'),
      };
    }
    if (t === 'Login') {
      this.setUser(data);
      delete data.union_id;
      delete data.open_id;
    }
    const localUserInfo = this.localCache().get('user_info');
    tracer.track({
      event_type_code: PREFIX + t,
      user_id: this.open_id || localUserInfo?.open_id,
      event_properties: {
        unionid: this.union_id || localUserInfo.union_id,
        open_id: this.open_id || localUserInfo.open_id,
        ...commonProps,
        ...data,
      },
    });
  }
  localCache() {
    return {
      get: function (t: string) {
        const storageName = PREFIX + t;
        let e;
        try {
          e = isWx
            ? wx.getStorageSync(storageName)
            : localStorage.getItem(storageName);
        } catch (t) {
          return console.error('CacheManager.get error', t);
        }
        return e;
      },
      set: function (t: string, e: any) {
        const storageName = PREFIX + t;
        try {
          isWx
            ? wx.setStorageSync(storageName, e)
            : localStorage.setItem(storageName, e);
        } catch (t) {
          return console.error('CacheManager.set error', t);
        }
        return !0;
      },
    };
  }
  // 设置用户信息
  setUser(userInfo?: { [key: string]: string }) {
    if (!userInfo || !utils.isObject(userInfo)) {
      return;
    }
    const currentUserInfo = this.localCache().get('user_info');
    this.localCache().set('user_info', { ...currentUserInfo, ...userInfo });
    Object.keys(userInfo).forEach((key) => {
      if (this.hasOwnProperty(key)) {
        this[key] = userInfo[key];
      }
    });
  }
}
