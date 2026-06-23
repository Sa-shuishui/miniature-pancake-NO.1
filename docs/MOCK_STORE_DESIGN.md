# 本地 Mock Store 设计

MVP 第一版先用本地 mock store 跑通交互。页面调用方式应尽量接近云函数契约，后续接入微信云开发时只替换数据层。

## 1. 设计目标

- 不依赖后端即可演示完整申请和审批流程。
- 支持创建申请、查询列表、查询详情、审批通过、审批驳回。
- 数据结构与云开发集合保持一致。
- 返回结构与 [API 契约](API_CONTRACTS.md) 保持一致。

## 2. 建议文件

```text
miniprogram/utils/mock-store.js
```

## 3. 初始数据

```js
const mockApplications = [
  {
    id: 'app_001',
    familyId: 'family_001',
    title: '购买咖啡机',
    amount: 1299,
    category: '家电',
    reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱，也方便周末招待朋友。',
    images: [],
    productLink: 'https://example.com/coffee-machine',
    expectedPurchaseDate: '2026-06-30',
    note: '618 优惠价',
    status: 'pending',
    applicantId: 'user_husband',
    applicantName: '申请方',
    approverId: 'user_wife',
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
  {
    id: 'app_002',
    familyId: 'family_001',
    title: '周末家庭聚餐',
    amount: 420,
    category: '餐饮',
    reason: '本周双方父母来家里，计划一起吃饭。',
    images: [],
    productLink: '',
    expectedPurchaseDate: '2026-06-27',
    note: '',
    status: 'approved',
    applicantId: 'user_husband',
    applicantName: '申请方',
    approverId: 'user_wife',
    approverName: '审批方',
    approvalComment: '可以，记得控制总额。',
    createdAt: '2026-06-20 09:30',
    updatedAt: '2026-06-20 10:00',
    approvedAt: '2026-06-20 10:00',
    events: []
  },
  {
    id: 'app_003',
    familyId: 'family_001',
    title: '购买游戏主机',
    amount: 2999,
    category: '娱乐',
    reason: '想放在客厅周末一起玩。',
    images: [],
    productLink: 'https://example.com/game-console',
    expectedPurchaseDate: '',
    note: '',
    status: 'rejected',
    applicantId: 'user_husband',
    applicantName: '申请方',
    approverId: 'user_wife',
    approverName: '审批方',
    approvalComment: '这个月预算紧张，下个月再看。',
    createdAt: '2026-06-18 20:00',
    updatedAt: '2026-06-18 21:00',
    approvedAt: '2026-06-18 21:00',
    events: []
  }
]
```

## 4. 方法设计

### createApplication(payload)

行为：

- 校验必填字段。
- 创建 `pending` 申请。
- 写入 `created` 事件。
- 返回新申请 ID。

### listApplications(query)

行为：

- 根据 `status` 筛选。
- 按 `updatedAt` 倒序。
- 返回列表摘要字段。

### getApplicationDetail(applicationId)

行为：

- 按 ID 查询完整申请。
- 找不到时返回 `NOT_FOUND`。

### approveApplication(payload)

行为：

- 校验申请存在。
- 校验当前状态为 `pending`。
- 根据 `decision` 更新为 `approved` 或 `rejected`。
- 写入审批意见、审批时间和事件记录。

## 5. 页面调用建议

- 页面不要直接修改 `mockApplications`。
- 页面只调用 mock store 暴露的方法。
- mock store 返回 `{ ok, data, error }`。
- 页面根据 `ok` 判断展示成功或错误提示。

## 6. 后续替换云函数

当云开发接入后：

- `createApplication` 替换为 `wx.cloud.callFunction({ name: 'createApplication' })`。
- `listApplications` 替换为 `wx.cloud.callFunction({ name: 'listApplications' })`。
- `getApplicationDetail` 替换为 `wx.cloud.callFunction({ name: 'getApplicationDetail' })`。
- `approveApplication` 替换为 `wx.cloud.callFunction({ name: 'approveApplication' })`。

页面层不应感知数据来自 mock 还是云函数。
