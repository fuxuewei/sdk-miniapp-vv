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
  token: string; // token是唯一必须配置的参数，请联系有数数据服务sr_data_service@tencent.com提供
  proxyPage?: boolean; // 是否开启自动代理 Page，默认是：true
  unionid?: string; // 开放平台的唯一标识
}
const tracer = new TezignTracer();
//@ts-ignore
const originPage = Page;
// 获取当前时间戳
const getTimeStamp = () => {
  let timestamp = Date.parse(new Date().toString());
  return timestamp / 1000;
};

// 引入tezignTracker
const initTezignTracker = () => {
  tracer.init({
    env: 'development',
    tenant_id: 'dDM=',
  });
};

export default class TezignWxTrack {
  appid: string;
  token: string;
  unionid?: string;
  proxyPage: boolean;
  constructor() {
    let _that = this;
    initTezignTracker();
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
      const appid = this.appid;
      // 获取options: appid & scene
      console.log('---------options---------', options);
      this.localCache().set('wx_options', options);
      setTimeout(() => {
        // 获取参数
        console.log('---------params---------', utils.getParams());
        const queryScene = options?.query?.scene;
        // query.scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 渠道号
        const scene = queryScene
          ? decodeURIComponent(queryScene)
          : utils.getParam('scene');
        console.log('---------scene---------', scene);
        this.localCache().set('sale_scene_id', scene);
      });
      // 登录 获取js_code
      try {
        //@ts-ignore

        wx.login({
          success: function (res) {
            // 获取到登录code
            let js_code = res.code;
            console.log('---------js_code---------', js_code);
            //@ts-ignore

            wx.request({
              // url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=d9364010e2bba6379799ed8621d4091b&js_code=${js_code}&grant_type=authorization_code`,
              url:
                'https://zhls.qq.com/wxlogin/getOpenId?appid=' +
                appid +
                '&js_code=' +
                js_code,
              data: {},
              header: { 'content-type': 'json' },
              success: function (t: any) {
                let openId = t.data?.openId;
                _that.localCache().set('open_id', openId);
              },
            });
          },
        });
      } catch (error) {}
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
    this.token = token;
    this.unionid = unionid;
    this.proxyPage = proxyPage || true;
    let _that = this;
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

        const options = this.localCache().get('wx_options');
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
            _that.track('Content_wxApp_Share', {
              share_from: share_options.from,
              page_route: currentRoute,
              page_title: '',
            });
            return originMethodShare(options);
          };
        }
        return originPage(page);
      };
    }
  }
  track(t: string, data: any) {
    console.log(`埋点上报 ${t}：`, data);
    const options = this.localCache().get('wx_options');
    // 公共属性
    let commonProps = {
      app_id: this.appid,
      wxapp_scence: options.scene,
      open_id: this.localCache().get('open_id') || '',
      sale_scene_id: this.localCache().get('sale_scene_id'),
      unionid: this.unionid,
      tenant_key: 'content-wx-sdk',
      sdk_version: '1.0.0',
    };
    tracer.track({
      event_type_code: t,
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

          e = wx.getStorageSync(t);
        } catch (t) {
          return console.error('CacheManager.get error', t);
        }
        return e;
      },
      set: function (t: string, e: any) {
        try {
          //@ts-ignore

          wx.setStorageSync(t, e);
        } catch (t) {
          return console.error('CacheManager.set error', t);
        }
        return !0;
      },
    };
  }
}
