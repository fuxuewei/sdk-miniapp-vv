/**
 * tezign ownership
 * @owner fuxuewei
 * @team N1
 */
import utils from './utils';
//@ts-ignore
import TezignTracer from './main';

// SDK需要先通过init初始化才能正常使用
interface OptionsType {
  app_id: string; // 微信小程序app_id，以wx开头
  token: string; // token是唯一必须配置的参数，对应租户id
  proxyPage?: boolean; // 是否开启自动代理 Page，默认是：true
  env?: 'dev' | 'prod';
}
const tracer = new TezignTracer();
//@ts-ignore
const originPage = Page;
// 获取当前时间戳
const getTimeStamp = () => {
  let timestamp = Date.parse(new Date().toString());
  return timestamp;
};

const STORAGEHEAD = 'content_wxapp_';
const TRACKCODE = 'tezign_trace_id';
export default class TezignWxTrack {
  app_id: string;
  tenant_id: string;
  union_id: string;
  open_id: string;
  showOptions: any; // 分享参数
  constructor() {
    // App 事件
    /**
     * 启动
     * https://developers.weixin.qq.com/miniprogram/dev/api/base/app/life-cycle/wx.getLaunchOptionsSync.html
     */
    //@ts-ignore

    const dataInfo = wx.getLaunchOptionsSync();
    console.log('dataInfo', dataInfo);

    /**
     * 显示
     * https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onAppShow.html
     */
    //@ts-ignore
    wx.onAppShow((options) => {
      // 获取options: app_id & scene
      console.log('---------options---------', options);
      this.showOptions = options;
      setTimeout(() => {
        const queryScene = options?.query?.[TRACKCODE];
        // query.scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 渠道号
        const trace_id = queryScene
          ? decodeURIComponent(queryScene)
          : utils.getParam(TRACKCODE);
        console.log('---------scene---------', trace_id);
        this.localCache().set('sale_scene_id', trace_id);
      });
    });
    /**
     * 隐藏
     * https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onAppHide.html
     */
    //@ts-ignore

    wx.onAppHide((options) => {
      console.log('hideData', options);
    });
  }

  init({ app_id, token, proxyPage = true, env }: OptionsType) {
    this.app_id = app_id;
    this.tenant_id = token;
    let _that = this;
    tracer.init({
      // 'development' | 'production', 默认'development'
      env: env === 'prod' ? 'production' : 'development',
      tenant_id: this.tenant_id,
    });
    if (proxyPage) {
      /**
       * 重写 Page 生命周期事件
       * https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
       */
      //@ts-ignore

      Page = (page) => {
        // 给onShow方法插入埋点
        const originMethodShow = page['onShow'];
        const originMethodHide = page['onHide'];
        const originMethodShare = page['onShareAppMessage'];
        let inTime: any;
        let currentRoute: string;
        if (originMethodShow && originMethodHide && originMethodShare) {
          page['onShow'] = function () {
            const route = this.route;
            currentRoute = route;
            inTime = getTimeStamp();
            _that.track('Content_wxApp_PageShow', {
              page_route: route,
              page_title: '',
            });
            return originMethodShow();
          };
          page['onHide'] = function () {
            if (currentRoute === this.route) {
              _that.track('Content_wxApp_PageHide', {
                page_route: currentRoute,
                page_title: '',
                stay_time: getTimeStamp() - inTime, // 当前页面停留耗时（毫秒）
              });
              console.log(
                `---------${this.route}停留时间: ${getTimeStamp() - inTime}ms`
              );
            }
            return originMethodHide();
          };
          page['onShareAppMessage'] = function (share_options) {
            console.log('----------onShareAppMessage------', share_options);
            _that.localCache().set('share_options', {
              share_from: share_options.from,
              page_route: currentRoute,
            });
            return originMethodShare(share_options);
          };
        }
        return originPage(page);
      };
    }
  }
  track(t: string, data: any) {
    console.log(`埋点上报-------- ${t}：`, data);
    const showOptions = this.showOptions;
    // 公共属性
    let commonProps = {
      page_route: utils.getCurrentPage(),
      app_id: this.app_id,
      wxapp_scence: showOptions.scene.toString(),
      sale_scene_id: this.localCache().get('sale_scene_id'),
      tenant_key: 'content-wx-sdk',
      sdk_version: '1.0.0',
      tenant_id: this.tenant_id,
    };
    if (t === 'Content_wxApp_Share') {
      commonProps = {
        ...commonProps,
        ...this.localCache().get('share_options'),
      };
    }
    if (t === 'Content_wxApp_Login') {
      this.setUser(data);
      delete data.union_id;
      delete data.open_id;
    }
    const localUserInfo = this.localCache().get('user_info');

    tracer.track({
      event_type_code: t,
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
        let e;
        try {
          //@ts-ignore

          e = wx.getStorageSync(STORAGEHEAD + t);
        } catch (t) {
          return console.error('CacheManager.get error', t);
        }
        return e;
      },
      set: function (t: string, e: any) {
        try {
          //@ts-ignore
          wx.setStorageSync(STORAGEHEAD + t, e);
        } catch (t) {
          return console.error('CacheManager.set error', t);
        }
        return !0;
      },
    };
  }
  setUser(userInfo: { [key: string]: string }) {
    const currentUserInfo = this.localCache().get('user_info');
    this.localCache().set('user_info', { ...currentUserInfo, ...userInfo });
    console.log('userInfo', userInfo);
    Object.keys(userInfo).forEach((key) => {
      if (this.hasOwnProperty(key)) {
        this[key] = userInfo[key];
      }
    });
  }
}
