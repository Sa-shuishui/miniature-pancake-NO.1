# 技术设计与数据模型

## 1. 技术选型

MVP 建议使用微信小程序原生框架：

- WXML：页面结构。
- WXSS：页面样式。
- JavaScript：页面逻辑。
- 本地 mock store：第一版模拟申请数据。
- 微信云开发：第二阶段接入数据库、云函数和文件存储。

选择原生小程序的原因：

- 微信开发者工具直接支持。
- 项目体积小，适合家庭内部小工具。
- 后续接入云开发成本低。

## 2. 目录结构建议

```text
miniprogram/
  app.js
  app.json
  app.wxss
  pages/
    home/
    apply/
    applications/
    detail/
    profile/
  components/
    status-pill/
    amount-card/
    application-card/
  utils/
    mock-store.js
    format.js
  assets/
    icons/
cloudfunctions/
  approveApplication/
  createApplication/
  listApplications/
docs/
```

## 3. 页面职责

### 3.1 home

- 展示家庭共同资金审批概览。
- 展示待审批数量。
- 展示最近申请。
- 提供“新建申请”和“去审批”入口。

### 3.2 apply

- 申请表单。
- 表单校验。
- 图片选择与预览。
- 提交申请。

### 3.3 applications

- 申请列表。
- 状态筛选。
- 按更新时间排序。

### 3.4 detail

- 申请详情。
- 审批意见输入。
- 通过、驳回操作。
- 申请状态历史。

### 3.5 profile

- 当前家庭与成员信息。
- 当前用户角色。
- 后续预算规则入口。

## 4. 本地 Mock 数据结构

```js
const applications = [
  {
    id: 'app_001',
    title: '购买咖啡机',
    amount: 1299,
    category: '家电',
    reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱，也方便周末招待朋友。',
    images: [],
    productLink: 'https://example.com/coffee-machine',
    expectedPurchaseDate: '2026-06-30',
    status: 'pending',
    applicantId: 'user_husband',
    applicantName: '申请方',
    approverId: 'user_wife',
    approverName: '审批方',
    approvalComment: '',
    createdAt: '2026-06-22 10:00:00',
    updatedAt: '2026-06-22 10:00:00',
    approvedAt: ''
  }
]
```

## 5. 云开发集合设计

### 5.1 families

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 家庭 ID |
| name | string | 家庭名称 |
| ownerOpenId | string | 创建者 openid |
| createdAt | date | 创建时间 |

### 5.2 familyMembers

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 成员记录 ID |
| familyId | string | 家庭 ID |
| openId | string | 微信 openid |
| nickname | string | 昵称 |
| role | string | applicant 或 approver |
| createdAt | date | 加入时间 |

### 5.3 fundApplications

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 申请 ID |
| familyId | string | 家庭 ID |
| title | string | 用途标题 |
| amount | number | 金额 |
| category | string | 分类 |
| reason | string | 必要性说明 |
| images | array | 云存储 fileID 数组 |
| productLink | string | 产品链接 |
| expectedPurchaseDate | string | 期望购买时间 |
| status | string | pending, approved, rejected, withdrawn |
| applicantOpenId | string | 申请人 |
| approverOpenId | string | 审批人 |
| approvalComment | string | 审批意见 |
| createdAt | date | 创建时间 |
| updatedAt | date | 更新时间 |
| approvedAt | date | 审批时间 |

### 5.4 applicationEvents

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 事件 ID |
| applicationId | string | 申请 ID |
| actorOpenId | string | 操作者 |
| action | string | created, approved, rejected, withdrawn |
| comment | string | 备注 |
| createdAt | date | 事件时间 |

## 6. 权限规则

- 家庭成员只能访问自己所在家庭的数据。
- 申请方可以创建申请并查看本家庭申请。
- 审批方可以审批本家庭待审批申请。
- 已审批申请默认不允许直接修改审批结果，后续可增加“重新打开”流程。

## 7. 表单校验

- 用途标题不能为空，建议 2 到 30 字。
- 金额必须大于 0。
- 必要性说明不能为空，建议不少于 10 字。
- 产品链接如果填写，应以 http 或 https 开头。
- 图片数量 MVP 可限制为最多 3 张。

## 8. 后续云函数

- createApplication：创建申请。
- listApplications：按家庭与状态查询申请。
- getApplicationDetail：查询申请详情。
- approveApplication：通过或驳回申请。
- withdrawApplication：撤回待审批申请。
- uploadApplicationImage：上传图片并绑定申请。

云函数的详细入参、出参和错误码见 [API 契约](API_CONTRACTS.md)。状态流转规则见 [申请状态流转](STATE_MACHINE.md)。第一版本地数据层见 [本地 Mock Store 设计](MOCK_STORE_DESIGN.md)。云开发集合、权限和部署步骤见 [微信云开发设置](CLOUD_DEVELOPMENT_SETUP.md)。

## 9. 第一版测试清单

- 新建申请必填项校验。
- 新建申请成功后列表出现新记录。
- 列表筛选状态正确。
- 详情页能读取完整字段。
- 通过后状态变为 approved。
- 驳回后状态变为 rejected。
- 审批意见被保存并显示。
