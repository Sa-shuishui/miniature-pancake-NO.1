# API 契约

本文件描述微信云开发阶段的云函数契约。MVP 本地 mock store 也应尽量模拟这些入参和出参，避免后续替换数据源时大改页面逻辑。

## 1. 通用约定

### 1.1 响应结构

```js
{
  ok: true,
  data: {},
  error: null
}
```

失败时：

```js
{
  ok: false,
  data: null,
  error: {
    code: 'VALIDATION_ERROR',
    message: '申请金额必须大于 0'
  }
}
```

### 1.2 时间字段

- 云端使用 `Date` 存储。
- 页面展示时格式化为 `YYYY-MM-DD HH:mm`。
- 本地 mock 可以先使用字符串，但字段名保持一致。

### 1.3 状态值

| 状态 | 含义 |
| --- | --- |
| pending | 待审批 |
| approved | 已通过 |
| rejected | 已驳回 |
| withdrawn | 已撤回 |

MVP 页面优先实现 `pending`、`approved`、`rejected`。

## 2. createApplication

创建一条资金申请。

### 入参

```js
{
  familyId: 'family_001',
  title: '购买咖啡机',
  amount: 1299,
  category: '家电',
  reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱。',
  images: ['cloud://xxx/coffee-machine.jpg'],
  productLink: 'https://example.com/coffee-machine',
  expectedPurchaseDate: '2026-06-30',
  note: '618 优惠价'
}
```

### 校验

- `familyId` 必填。
- `title` 必填，建议 2 到 30 字。
- `amount` 必填，必须大于 0。
- `reason` 必填，建议不少于 10 字。
- `productLink` 如果填写，必须以 `http://` 或 `https://` 开头。
- `images` 最多 3 张。

### 成功响应

```js
{
  ok: true,
  data: {
    id: 'app_001',
    status: 'pending'
  },
  error: null
}
```

## 3. listApplications

查询家庭内申请列表。

### 入参

```js
{
  familyId: 'family_001',
  status: 'pending',
  page: 1,
  pageSize: 20
}
```

### 说明

- `status` 可选。为空时返回全部状态。
- 默认按 `updatedAt` 倒序。
- 第一版可以不做分页，但接口结构保留分页字段。

### 成功响应

```js
{
  ok: true,
  data: {
    items: [
      {
        id: 'app_001',
        title: '购买咖啡机',
        amount: 1299,
        category: '家电',
        status: 'pending',
        applicantName: '申请方',
        createdAt: '2026-06-22 10:00',
        updatedAt: '2026-06-22 10:00'
      }
    ],
    total: 1
  },
  error: null
}
```

## 4. getApplicationDetail

查询申请详情。

### 入参

```js
{
  applicationId: 'app_001'
}
```

### 成功响应

```js
{
  ok: true,
  data: {
    id: 'app_001',
    familyId: 'family_001',
    title: '购买咖啡机',
    amount: 1299,
    category: '家电',
    reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱。',
    images: ['cloud://xxx/coffee-machine.jpg'],
    productLink: 'https://example.com/coffee-machine',
    expectedPurchaseDate: '2026-06-30',
    note: '618 优惠价',
    status: 'pending',
    applicantName: '申请方',
    approverName: '审批方',
    approvalComment: '',
    createdAt: '2026-06-22 10:00',
    updatedAt: '2026-06-22 10:00',
    approvedAt: '',
    events: [
      {
        action: 'created',
        actorName: '申请方',
        comment: '提交申请',
        createdAt: '2026-06-22 10:00'
      }
    ]
  },
  error: null
}
```

## 5. approveApplication

审批通过或驳回申请。

### 入参

```js
{
  applicationId: 'app_001',
  decision: 'approved',
  approvalComment: '可以买，控制在预算内。'
}
```

### 校验

- `applicationId` 必填。
- `decision` 只能为 `approved` 或 `rejected`。
- 只有审批方可以操作。
- 只有 `pending` 状态可以审批。
- 驳回时建议填写 `approvalComment`。

### 成功响应

```js
{
  ok: true,
  data: {
    id: 'app_001',
    status: 'approved',
    approvalComment: '可以买，控制在预算内。',
    approvedAt: '2026-06-22 10:30'
  },
  error: null
}
```

## 6. withdrawApplication

申请方撤回待审批申请。MVP 可暂缓实现，但接口提前保留。

### 入参

```js
{
  applicationId: 'app_001',
  comment: '暂时不买了'
}
```

### 校验

- 只有申请方可以撤回。
- 只有 `pending` 状态可以撤回。

## 7. 错误码

| 错误码 | 含义 |
| --- | --- |
| VALIDATION_ERROR | 表单或参数校验失败 |
| UNAUTHORIZED | 未登录或无法识别用户 |
| FORBIDDEN | 当前用户无权操作 |
| NOT_FOUND | 申请或家庭不存在 |
| INVALID_STATUS | 当前状态不允许该操作 |
| INTERNAL_ERROR | 未预期的服务端错误 |
