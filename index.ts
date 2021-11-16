/**
 * tezign ownership
 * @owner fuxuewei
 * @team N1
 */
import utils from './utils';

// SDK需要先通过init初始化才能正常使用
interface OptionsType {
  appid: string; // 微信小程序appID，以wx开头
  token: string; // token是唯一必须配置的参数，请联系有数数据服务sr_data_service@tencent.com提供
  proxyPage?: boolean; // 是否开启自动代理 Page，默认是：true
  unionid?: string; // 开放平台的唯一标识
}
const originPage = Page;
// 获取当前时间戳
const getTimeStamp = () => {
  let timestamp = Date.parse(new Date().toString());
  return timestamp / 1000;
};

export class Test {
  appid: string;
  token: string;
  unionid: string;
  proxyPage: boolean;
  constructor() {
    // App 事件
    /**
     * 启动
     * https://developers.weixin.qq.com/miniprogram/dev/api/base/app/life-cycle/wx.getLaunchOptionsSync.html
     */
    const dataInfo = wx.getLaunchOptionsSync();
    console.log('dataInfo', dataInfo);

    /**
     * 显示
     * https://developers.weixin.qq.com/miniprogram/dev/api/base/app/app-event/wx.onAppShow.html
     */
    wx.onAppShow((options) => {
      const appid = this.appid;
      // 获取options: appid & scene
      console.log('---------options---------', options);
      // this.localCache().set('options', options);
      setTimeout(() => {
        // 获取参数
        console.log('---------params---------', utils.getParams());
        const queryScene = options?.query?.scene;
        // query.scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
        const scene = queryScene
          ? decodeURIComponent(queryScene)
          : utils.getParam('scene');
        console.log('---------scene---------', scene);
        this.localCache().set('mini_app_scence', scene);
      });
      // 登录 获取js_code
      try {
        wx.login({
          success: function (res) {
            // 获取到登录code
            let js_code = res.code;
            console.log('---------js_code---------', js_code);
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
                console.log('openId', openId);
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
    wx.onAppHide((options) => {
      // console.log('hideData', options);
    });
  }

  init({ appid, token, unionid, proxyPage }: OptionsType) {
    this.appid = appid;
    this.token = token;
    this.unionid = unionid;
    this.proxyPage = proxyPage || true;
    if (proxyPage) {
      /**
       * 重写 Page 生命周期事件
       * https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
       */
      Page = (page) => {
        // 给onShow方法插入埋点
        const originMethodShow = page['onShow'];
        const originMethodHide = page['onHide'];
        const originMethodShare = page['onShareAppMessage'];
        let inTime: any;
        let currentRoute: string;
        page['onShow'] = function () {
          const route = this.route;
          currentRoute = route;
          inTime = getTimeStamp();
          // console.log('page_route', route);
          return originMethodShow();
        };
        page['onHide'] = function () {
          if (currentRoute === this.route) {
            console.log(
              `---------${this.route}停留时间: ${getTimeStamp() - inTime}s`
            );
          }
          return originMethodHide();
        };
        page['onShareAppMessage'] = function (options) {
          console.log('onShareAppMessage', options);
          return originMethodShare();
        };

        return originPage(page);
      };
    }
  }
  track(t: string, data: any) {
    // setContentTrack(data);
    console.log(`埋点上报 ${t}：`, data);
    console.log('catch_options', this.localCache().get('options'));
    // 公共属性
    let props = {
      wx_user: {
        app_id: 'wx9d4f5f22pa099f82',
        open_id: 'ogN6X0T-ilsH-XmIdzXtuR1f1r3Q',
        user_id: '548019854034',
        union_id: 'o6_bmlsdaXds8d6_sgVt7hM3OPfL',
        local_id: '360b8853-64bf-3fba-e9a0-5abb1e4d7721',
        tag: [
          {
            tag_id: '游客',
            tag_name: '游客',
          },
        ],
      },

      chan: {
        // 渠道相关属性
        chan_id: '8_ac3e76c2e5721f5f', // 引流渠道id options.query.scene
        chan_shop_id: '101019', // 门店 id
        chan_wxapp_scene: '1037', // 场景值options.scene
      },
    };
  }
  localCache() {
    return {
      get: function (t: string) {
        let e;
        try {
          e = wx.getStorageSync(t);
        } catch (t) {
          return console.error('CacheManager.get error', t);
        }
        return e;
      },
      set: function (t: string, e: any) {
        try {
          wx.setStorageSync(t, e);
        } catch (t) {
          return console.error('CacheManager.set error', t);
        }
        return !0;
      },
    };
  }
}
