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
  appid: string; // 微信小程序appID，以wx开头
  token: string; // token是唯一必须配置的参数，对应租户id
  proxyPage?: boolean; // 是否开启自动代理 Page，默认是：true
  unionid?: string; // 开放平台的唯一标识
  open_id?: string; // 微信用户在小程序下的唯一标识符
}
const tracer = new TezignTracer();
//@ts-ignore
const originPage = Page;
// 获取当前时间戳
const getTimeStamp = () => {
  let timestamp = Date.parse(new Date().toString());
  return timestamp / 1000;
};

const STORAGEHEAD = 'content_wxapp_';
export default class TezignWxTrack {
  appid: string;
  tenant_id: string;
  unionid: string;
  open_id: string;
  proxyPage: boolean;
  showOptions: any;
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
      // 获取options: appid & scene
      console.log('---------options---------', options);
      this.showOptions = options;
      setTimeout(() => {
        const queryScene = options?.query?.scene;
        // query.scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 渠道号
        const scene = queryScene
          ? decodeURIComponent(queryScene)
          : utils.getParam('scene');
        console.log('---------scene---------', scene);
        this.localCache().set('sale_scene_id', scene);
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

  init({ appid, token, unionid, proxyPage }: OptionsType) {
    this.appid = appid;
    this.tenant_id = token;
    this.unionid = unionid;
    this.proxyPage = proxyPage || true;
    let _that = this;
    tracer.init({
      env: 'development',
      tenant_id: this.tenant_id,
    });
    if (this.proxyPage) {
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
              });
              console.log(
                `---------${this.route}停留时间: ${getTimeStamp() - inTime}s`
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
      app_id: this.appid,
      wxapp_scence: showOptions.scene.toString(),
      sale_scene_id: this.localCache().get('sale_scene_id'),
      tenant_key: 'content-wx-sdk',
      sdk_version: '1.0.0',
      tenant_id: this.tenant_id,
      open_id: 'obFsv******',
    };
    if (t === 'Content_wxApp_Share') {
      commonProps = {
        ...commonProps,
        ...this.localCache().get('share_options'),
      };
    }
    if (t === 'Content_wxApp_Login' && data?.unionid && data?.open_id) {
      this.unionid = data.unionid;
      this.open_id = data.open_id;
    }
    tracer.track({
      event_type_code: t,
      unionid: data?.unionid || this.unionid,
      open_id: data?.open_id || this.open_id,
      event_properties: {
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
}
