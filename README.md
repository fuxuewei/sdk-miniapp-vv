[飞书文档](https://tezign.feishu.cn/docs/doccnk6cpObtI5vjy07hj6oygEg#)

## 使用

引入 `yarn add sdk-miniapp-vv`

初始化

```ts
import TezignWxTrack from 'sdk-miniapp-vv';

let sr = new TezignWxTrack();

sr.init({
  appid: 'wx41eb9a217b06f248', // 微信小程序appID，以wx开头
  token: 'bi72f*******', // token是唯一必须配置的参数，请联系有数数据服务sr_data_service@tencent.com提供
  proxyPage: true, // 是否开启自动代理 Page，默认是：true
  unionid: '******',
});
```
