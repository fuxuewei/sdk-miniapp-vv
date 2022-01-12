[飞书文档](https://tezign.feishu.cn/docs/doccnx5SYx3rWcWCys9M2F44hXc)

## 接入准备

### 接入指引

- 方式一：yarn 引入 `yarn add sdk-miniapp-vv`
- 方式二：git 拉代码，执行`yarn` `yarn build` 打包到 dist 目录下 , 将 index.js 拷贝到自己项目中使用

## 公共属性

> 公共属性是各个行为数据规范的相同部分，包含行为页面、行为人、行为产生的来源渠道，行为产生的来源页面组件等维度。

**数据规范**

| 名称       | 类型   | 必填 | 描述                                                                      |
| ---------- | ------ | ---- | ------------------------------------------------------------------------- |
| app_id     | String | Y    | 小程序唯一标识 示例值：wx9d4f5f22pa099f82                                 |
| page_title | String |      | 行为发生的小程序页面标题 例商品详情、商城首页                             |
| open_id    | String | Y    | 微信用户在小程序下的唯一标识符 示例值：ogN6X0T-ilsH-XmIdzXtuR1f1r3Q       |
| union_id   | String | Y    | 微信用户在开放平台账号下的唯一标识符 示例值：o6_bmlsdaXds8d6_sgVt7hM3OPfL |

获取 union_id：<https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/union-id.html>

使用 setUser 可以补充用户的（open_id、app_id、union_id）

**setUser 的请求示例**

补充用户信息后，后续接口上报市无需重复传入

```js
let app = getApp();

app.$app.sr.setUser({
  app_id: 'wx9d4f5f22pa099f82',
  open_id: 'ogN6X0T-ilsH-XmIdzXtuR1f1r3Q',
  union_id: 'o6_bmlsdaXds8d6_sgVt7hM3OPfL',
});
```

## 事件类型

### SDK 上报

#### 用户登录

> 在用户登录完成回调触发时上报

**数据规范**

新增属性：无

公共属性

| 名称       | 类型   | 必填 | 描述                                                                      |
| ---------- | ------ | ---- | ------------------------------------------------------------------------- |
| app_id     | String | Y    | 小程序唯一标识 示例值：wx9d4f5f22pa099f82                                 |
| page_title | String |      | 行为发生的小程序页面标题 例商品详情、商城首页                             |
| open_id    | String | Y    | 微信用户在小程序下的唯一标识符 示例值：ogN6X0T-ilsH-XmIdzXtuR1f1r3Q       |
| union_id   | String | Y    | 微信用户在开放平台账号下的唯一标识符 示例值：o6_bmlsdaXds8d6_sgVt7hM3OPfL |

**请求示例**

```js
let app = getApp(); // 使用Taro则是Taro.getApp().$app

app.sr.track('Login', {
  page_route: 'pages/tabBar/index/index',
  page_title: '首页',
  open_id: 'ogN6X0T-ilsH-XmIdzXtuR1f1r3Q',
  union_id: 'o6_bmlsdaXds8d6_sgVt7hM3OPfL',

  // more...
});
```

#### 用户注册

> 在用户注册完成回调触发时上报。

**数据规范**

新增属性：无

**请求示例**

```js
let app = getApp(); // 使用Taro则是Taro.getApp().$app

app.sr.track('Register', {
  page_title: '首页',

  // more...
});
```

#### 页面分享

> 在小程序页面生命周期回调 [Page.onShareAppMessage](https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object) 触发时上报

**数据规范**

**新增属性：**

| 名称            | 类型   | 必填 | 描述                                                       |
| --------------- | ------ | ---- | ---------------------------------------------------------- |
| from_type       | enum   | Y    | 转发事件来源。button：页面内转发按钮；menu：右上角转发菜单 |
| share_title     | String | Y    | 转发标题                                                   |
| share_path      | String |      | 转发页面路径，不填默认是当前页面                           |
| share_image_url | String |      | 转发图片路径                                               |
| share_to        | String |      | 发送目标，friends：好友；timeline：朋友圈                  |

**请求示例**

```js
let app = getApp(); // 使用Taro则是Taro.getApp().$app

app.sr.track('Share', {
  from_type: 'button',
  share_title: '女士2019新款连帽中长款羽绒服冬季厚款保暖外套',
  share_path: 'pages/product?sku_id=AOdjf7u',
  share_image_url: 'https://pages/product?sku_id=AOdjf7u.jpg',
  share_to: 'friends',

  // more...
});
```

####

#### 商品下单

> 在小程序 [JSAPI 下单](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_1.shtml) 获取到预支付交易会话标识（prepay_id）后，
>
> 调用 [wx.requestPayment](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_4.shtml) 前上报

**数据规范**

**新增属性：**

| 名称       | 类型   | 必填 | 描述                                                       |
| ---------- | ------ | ---- | ---------------------------------------------------------- |
| mchid      | String | Y    | 直连商户的商户号，由微信支付生成并下发。示例值：1230000109 |
| order_id   | String | Y    | 商户侧订单号，在商户系统内订单的唯一标识符                 |
| order_line | Array  | Y    | 订单的金额等信息，注意为[]结构                             |

**order_line（Array）**

| 名称         | 类型   | 必填 | 描述                   |
| ------------ | ------ | ---- | ---------------------- |
| sub_order_id | Array  | Y    | 同 order_id            |
| order_amount | number | Y    | 填写订单金额，单位为分 |
| pay_amount   | number | Y    | 订单应付金额，单位为分 |

**请求示例**

```js
let app = getApp(); // 使用Taro则是Taro.getApp().$app

app.sr.track('Order', {
  mchid: '1230000109', //商户号
  order_id: 'xxxxx', // 商户订单号，商户侧订单号，在商户系统内订单的唯一标识符
  order_line: [
    {
      sub_order_id: 'xxxxx',
      order_amount: 30, //订单金额 单位为分
      pay_amount: 30, //订单金额 单位为分
    },
  ],
});
```

###

### 接口上报

#### 支付

> 后端收到[支付成功通知](https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_5.shtml)后触发 通过接口上报

**请求接口**

- dev: <https://test-track-api.tezign.com/trackEvent>

<!---->

- prod: <https://track-api.tezign.com/trackEvent>

**请求方法：POST**

**数据规范**

| 名称             | 类型                                                        | 必填 | 描述                                         |
| ---------------- | ----------------------------------------------------------- | ---- | -------------------------------------------- |
| event_type_code  | String                                                      | Y    | 填 'Content_WXapp_Pay' 埋点标识              |
| tenant_id        | String                                                      | Y    | 您在特赞的 token，由特赞生成提供             |
| user_agent       | String                                                      | Y    | 填 'undefined' 字符串                        |
| event_time       | Date(Date 类型需转为“YYYY-MM-DD HH:mm:ss.SSS”格式的 String) | Y    | 事件发生时间 示例值：2021-12-13 10:13:07.685 |
| source_from      | String                                                      | Y    | 终端来源，填写“server”                       |
| event_properties | Object                                                      | Y    | 支付相关信息对象                             |

**event_properties（Object）**

| 名称           | 类型   | 必填 | 描述                                                               |
| -------------- | ------ | ---- | ------------------------------------------------------------------ |
| app_id         | String | Y    | 直连商户申请的公众号或移动应用 app_id。 示例值：wxd678efh567hg6787 |
| tenant_key     | String | Y    | 填 “content-wx-sdk” 用来标识埋点特征                               |
| mchid          | String | Y    | 商户的商户号，由微信支付生成并下发。示例值：1230000109             |
| order_id       | String | Y    | 主订单 id                                                          |
| transaction_id | String |      | 微信支付系统生成的订单号。 示例值：1217752501201407033233368018    |
| currency       | String | Y    | CNY：人民币，境内商户号仅支持人民币 示例值：CNY                    |
| payer_currency | String | Y    | 用户支付币种 示例值：CNY                                           |
| open_id        | String | Y    | 下单人 open_id 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o                |
| order_line     | Array  | Y    | 订单列表，注意为[]结构                                             |

**order_line（Array）**

| 名称           | 类型   | 必填 | 描述                                                                                                  |
| -------------- | ------ | ---- | ----------------------------------------------------------------------------------------------------- |
| sub_order_id   | String | Y    | 商户系统内部订单号 示例值：1217752501201407033233368018                                               |
| pay_status     | enum   | Y    | 交易状态，枚举值：SUCCESS：支付成功 REFUND：转入退款 NOTPAY：未支付 CLOSED：已关闭 PAYERROR：支付失败 |
| sku_id         | String | Y    | sku 编号                                                                                              |
| sku_name       | String | Y    | sku 名称                                                                                              |
| spu_id         | String |      | sku 所属 spu 编号                                                                                     |
| spu_name       | String |      | spu 名称                                                                                              |
| goods_amount   | number | Y    | 不包含件数及不包含均摊优惠的商品金额 单位为分                                                         |
| payment_amount | number | Y    | 包含件数及包含优惠均摊后的金额 单位为分                                                               |
| goods_num      | number | Y    | 商品数量                                                                                              |

**请求参数示例**

```js
{
  event_type_code: 'Content_WXapp_Pay', //必填 固定值 埋点标识
  tenant_id: 'bi72f*******', // 必填 您在特赞的token，由特赞生成提供，对应 sdk上报 的token字段
  user_agent: 'undefined', // 必填 固定值
  event_time: getNowDate(), // 必填 事件发生时间 YYYY-MM-DD HH:mm:ss.SSS
  source_from: 'server', // 必填 固定值 标识终端来源
  event_properties: {
    tenant_key: 'content-wx-sdk',
    app_id: 'wx41eb9a217b06f248', // 微信小程序appID，以wx开头
    mchid: '1230000109', // 微信支付生成的商户的商户号，由微信支付生成并下发。示例值：1230000109
    order_id: 'xxxxxxxx', // 主订单id
    open_id: 'ogN6X0T-ilsH-XmIdzXtuR1f1r3Q', // 下单人 open_id
    transaction_id: '1217752501201407033233368018', // 微信支付订单号
    currency: 'CNY', // CNY：人民币，境内商户号仅支持人民币
    payer_currency: 'CNY', // 用户支付币种
    order_line: [
      {
        /**订单信息**/
        sub_order_id: 'xxxx', // 商户系统内部订单号
        pay_status: 'SUCCESS', // 交易状态 枚举值

        /**商品信息**/
        sku_id: 'cS1cWjrkFbFUA', // sku 编号
        sku_name: '鞋子蓝色', // sku 名称
        spu_id: 'F-306233', // sku 所属 spu 编号
        spu_name: '鞋子', // spu 名称
        goods_amount: 90, // 不包含件数及不包含均摊优惠的商品金额 单位为分
        payment_amount: 110, // 包含件数及包含优惠均摊后的金额 单位为分
        goods_num: 2, // 商品数量
      },
    ],
  },
}
```
