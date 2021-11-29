[飞书文档](https://tezign.feishu.cn/docs/doccnk6cpObtI5vjy07hj6oygEg#)

## 使用

- 方式一：yarn 引入 `yarn add sdk-miniapp-vv`
- 方式二：git 拉代码，执行`yarn` `yarn build` 打包到 dist 目录下 , 将 index.js 拷贝到自己项目中使用

### 初始化

```ts
import TezignWxTrack from 'sdk-miniapp-vv';

let sr = new TezignWxTrack();

sr.init({
  appid: 'wx41eb9a217b06f248', // 微信小程序appID，以wx开头
  token: 'bi72f*******', // token是唯一必须配置的参数，对应租户id
});
```

### 用户登录

在用户登录完成回调触发时上报

| 名称      | 类型   | 必填 | 描述                                                                 |
| --------- | ------ | ---- | -------------------------------------------------------------------- |
| open_id   | String | Y    | 微信用户在小程序下的唯一标识符 例 ogN6X0T-ilsH-XmIdzXtuR1f1r3Q       |
| unnion_id | String | Y    | 微信用户在开放平台账号下的唯一标识符 例 o6_bmlsdaXds8d6_sgVt7hM3OPfL |

**请求示例**

```js
let app = getApp();
app.$app.sr.track('Content_wxApp_Login', {
  page_route: 'pages/tabBar/index/index',
  page_title: '首页',
  open_id: 'ogN6X0T-ilsH-XmIdzXtuR1f1r3Q',
  unionid: 'o6_bmlsdaXds8d6_sgVt7hM3OPfL',
  // more...
});
```

### 用户注册

在用户注册完成回调触发时上报。

| 名称     | 类型   | 必填 | 描述                                                                 |
| -------- | ------ | ---- | -------------------------------------------------------------------- |
| union_id | String | Y    | 微信用户在开放平台账号下的唯一标识符 例 o6_bmlsdaXds8d6_sgVt7hM3OPfL |

**请求示例**

```js
let app = getApp();
app.$app.sr.track('Content_wxApp_Register');
```

### 页面分享

在小程序页面生命周期回调 [Page.onShareAppMessage](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object) 触发时上报

**请求示例**

```js
let app = getApp();
app.$app.sr.track('Content_wxApp_Share', {
  from_type: 'button',
  share_title: '女士2019新款连帽中长款羽绒服冬季厚款保暖外套',
  share_path: 'pages/product?sku_id=AOdjf7u',
  share_image_url: 'https://pages/product?sku_id=AOdjf7u.jpg',
  share_to: 'friends',
  // more...
});
```

### 商品下单

小程序调起支付[wx.requestPayment](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_4.shtml)的 success 回调中触发

**数据规范**

| 名称       | 类型   | 必填 | 描述                                                  |
| ---------- | ------ | ---- | ----------------------------------------------------- |
| mchid      | String | Y    | 直连商户的商户号，由微信支付生成并下发。例 1230000109 |
| order_id   | String | Y    | 商户侧订单号，在商户系统内订单的唯一标识符            |
| sub_orders | array  | Y    | 订单的金额等信息，注意为[]结构                        |

**sub_orders**
| 名称 | 类型 | 必填 | 描述 |
| ------------ | ------ | ---- | ----------------------------------------------------- |
| sub_order_id | array | Y | 同 order_id |
| order_amt | array | Y | 填写订单金额，单位默认为元 |
| pay_amt | array | Y | 订单应付金额，单位默认为元 |

**请求示例**

```js
let app = getApp();
app.$app.sr.track('Content_wxApp_Order', {
  mchid: '1230000109', //商户号
  order_id: 'xxxxx', // 商户订单号，商户侧订单号，在商户系统内订单的唯一标识符
  sub_orders: [
    {
      sub_order_id: 'xxxxx',
      order_amt: 30.3,
      pay_amt: 30.3,
    },
  ],
});
```

### 支付成功时间

后端收到[支付成功通知](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_5.shtml)后触发
通过接口上报，上报接口：

- prod: https://tracking.tezign.com/log-content/event
- dev: https://dc-logapi-test.tezign.com/log-content/event

**数据规范**

| 名称   | 类型   | 必填 | 描述                                                              |
| ------ | ------ | ---- | ----------------------------------------------------------------- |
| appid  | String | Y    | 直连商户申请的公众号或移动应用 appid。 示例值：wxd678efh567hg6787 |
| mchid  | String | Y    | 商户的商户号，由微信支付生成并下发。示例值：1230000109            |
| orders | array  | Y    | 订单列表                                                          |

**orders**

| 名称            | 类型   | 必填 | 描述                                                                                                  |
| --------------- | ------ | ---- | ----------------------------------------------------------------------------------------------------- |
| order_id        | String | Y    | 商户系统内部订单号 例 1217752501201407033233368018                                                    |
| pay_status      | String | Y    | 交易状态，枚举值：SUCCESS：支付成功 REFUND：转入退款 NOTPAY：未支付 CLOSED：已关闭 PAYERROR：支付失败 |
| open_id         | String | Y    | 下单人 open_id 例 oUpF8uMuAJO_M2pxb1Q9zNjWeS6o                                                        |
| goods_num_total | number | Y    | 订单商品总数量                                                                                        |
| order_amt       | String | Y    | 订单金额                                                                                              |
| pay_amt         | String | Y    | 订单应付金额                                                                                          |
| currency        | String | Y    | CNY：人民币，境内商户号仅支持人民币 示例值：CNY                                                       |
| payer_currency  | String | Y    | 用户支付币种 示例值：CNY                                                                              |
| goods_info      | array  | Y    | 主订单商品信息，数组类型，每个 sku 存一个数组单位                                                     |

**goods_info:**

| 名称           | 类型   | 必填 | 描述                                                                           |
| -------------- | ------ | ---- | ------------------------------------------------------------------------------ |
| sku_id         | String | Y    | sku 编号                                                                       |
| sku_name       | String | Y    | sku 名称                                                                       |
| goods_amount   | number | Y    | 单件商品原价，单位默认为元                                                     |
| payment_amount | String | Y    | 多件商品实付金额（分摊了优惠的金额）,单位默认为元，注：有数 GMV 计算使用该字段 |
| goods_num      | number | Y    | 商品数量                                                                       |

**请求体示例**

```js
{
  appid: 'wx41eb9a217b06f248', // 微信小程序appID，以wx开头
  mchid:'1230000109',
  orders:[
    {
      "order_id": "34452222",
      "pay_status": "SUCCESS",
      "open_id": "ogN6X0T-ilsH-XmIdzXtuR1f1r3Q", //下单人 open_id
      "goods_num_total": 3,
      "order_amt": 560.00,
      "pay_amt": 560.00,
      "currency":"CNY",
      "payer_currency":"CNY",
      "goods_info": [{
        "sku_id": "cS1cWjrkFbFUA",
        "sku_name": "鞋子蓝色",
        "goods_amount": 60.00, // 不包含件数及不包含均摊优惠的商品金额
        "payment_amount": 110.00, // 包含件数及包含优惠均摊后的金额
        "goods_num": 2,
      }]
    }
  ]
}
```
