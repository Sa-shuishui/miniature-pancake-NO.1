# 微信云开发设置

本文件说明从本地 mock store 迁移到微信云开发时需要创建的集合、索引、权限和云函数。

## 1. 开通云开发

1. 使用微信开发者工具打开项目根目录。
2. 确认 `project.config.json` 中 `miniprogramRoot` 为 `miniprogram/`。
3. 点击“云开发”。
4. 创建一个云环境。
5. 记录环境 ID，后续可在 `miniprogram/app.js` 中初始化云开发。

后续页面接入云函数时，先修改 `miniprogram/config/runtime-config.js`：

```js
dataSource: 'cloud',
fileDataSource: 'cloud',
cloudEnvId: '你的云环境 ID'
```

`app.js` 会通过 `miniprogram/services/runtime-service.js` 初始化 `wx.cloud` 和数据源。

如果需要跟随当前环境，可在云函数里继续使用：

```js
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
```

## 2. 数据库集合

### 2.1 families

家庭信息集合。

示例记录：

```js
{
  name: '我们的家',
  ownerOpenId: 'openid_xxx',
  createdAt: new Date()
}
```

建议索引：

- `ownerOpenId`

### 2.2 familyMembers

家庭成员集合，用于判断用户属于哪个家庭，以及是申请方还是审批方。

示例记录：

```js
{
  familyId: 'family_001',
  openId: 'openid_xxx',
  nickname: '申请方',
  role: 'applicant',
  createdAt: new Date()
}
```

建议索引：

- `familyId`
- `openId`
- `familyId + openId`

### 2.3 fundApplications

资金申请集合。

示例记录：

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
  note: '618 优惠价',
  status: 'pending',
  applicantOpenId: 'openid_applicant',
  applicantName: '申请方',
  approverOpenId: 'openid_approver',
  approverName: '审批方',
  approvalComment: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  approvedAt: null
}
```

建议索引：

- `familyId`
- `familyId + status`
- `familyId + updatedAt`
- `applicantOpenId`
- `approverOpenId`

### 2.4 applicationEvents

申请事件集合，用于记录创建、通过、驳回、撤回等动作。

示例记录：

```js
{
  applicationId: 'app_001',
  actorOpenId: 'openid_xxx',
  actorName: '审批方',
  action: 'approved',
  fromStatus: 'pending',
  toStatus: 'approved',
  comment: '可以买，控制在预算内。',
  createdAt: new Date()
}
```

建议索引：

- `applicationId`
- `actorOpenId`
- `createdAt`

## 3. 数据库权限建议

第一版建议数据库集合权限设置为“仅云函数可读写”。页面所有读写都通过云函数完成。

原因：

- 权限规则集中在云函数里，便于控制家庭数据隔离。
- 避免客户端直接读写其他家庭申请。
- 后续要增加审批权限、撤回规则、预算规则时更稳。

建议：

| 集合 | 权限 |
| --- | --- |
| families | 仅云函数可读写 |
| familyMembers | 仅云函数可读写 |
| fundApplications | 仅云函数可读写 |
| applicationEvents | 仅云函数可读写 |

## 4. 云函数

当前项目已包含以下云函数骨架：

- `cloudfunctions/createApplication`
- `cloudfunctions/listApplications`
- `cloudfunctions/getApplicationDetail`
- `cloudfunctions/approveApplication`

建议上传顺序：

1. `createApplication`
2. `listApplications`
3. `getApplicationDetail`
4. `approveApplication`

上传方式：

1. 在微信开发者工具中展开 `cloudfunctions`。
2. 右键云函数目录。
3. 选择“上传并部署：云端安装依赖”。
4. 在云开发控制台查看日志，确认函数初始化成功。

## 5. 云存储

产品照片建议走云存储。

推荐路径格式：

```text
families/{familyId}/applications/{applicationId}/{timestamp}-{filename}
```

页面流程：

1. 申请方选择图片。
2. 调用 `miniprogram/services/file-service.js` 上传图片。
3. 将返回的 `fileID` 放入 `images`。
4. 调用 `createApplication` 创建申请。

MVP 也可以先使用本地临时图片路径演示，等接云开发时再替换为 `fileID`。

## 6. 接入顺序

建议按这个顺序从本地 mock 切到云端：

1. 保持页面调用方法名不变。
2. 使用 `miniprogram/services/application-service.js`。
3. 在 service 内部决定调用 mock store 还是 `wx.cloud.callFunction`。
4. 先替换查询列表和详情。
5. 再替换创建申请。
6. 最后替换审批通过和驳回。

这样页面层不会感知数据来自本地还是云端。

## 7. 发布前安全检查

- 非家庭成员不能读取申请。
- 申请方不能审批自己的申请，除非家庭规则明确允许。
- 已通过或已驳回申请不能重复审批。
- 图片 fileID 不应暴露给无关家庭成员。
- 云函数错误需要返回 `{ ok: false, error }`，页面展示友好提示。

## 8. 当前版本真实数据接入状态

截至当前版本，页面侧已经通过 `miniprogram/services/application-service.js` 支持 `mock` / `cloud` 两种数据源切换。真实上线前需要在微信开发者工具中完成以下步骤：

### 8.1 需要创建的云数据库集合

- `fundApplications`：共同资金申请。
- `applicationEvents`：申请创建、通过、驳回等事件。
- `ledgerRecords`：审批者记账记录。

建议集合权限先设置为“仅云函数可读写”，页面所有读写都通过云函数完成。

### 8.2 需要上传并部署的云函数

当前项目已经包含以下云函数目录：

- `cloudfunctions/createApplication`
- `cloudfunctions/listApplications`
- `cloudfunctions/getApplicationDetail`
- `cloudfunctions/approveApplication`
- `cloudfunctions/createLedgerRecord`
- `cloudfunctions/listLedgerRecords`

在微信开发者工具中，逐个右键这些目录，选择“上传并部署：云端安装依赖”。

### 8.3 切换到云端数据源

部署云函数并创建集合后，修改 `miniprogram/config/runtime-config.js`：

```js
dataSource: 'cloud',
fileDataSource: 'cloud',
cloudEnvId: '你的云环境 ID'
```

如果只想先验证云数据库、不上传图片，可以暂时保持：

```js
dataSource: 'cloud',
fileDataSource: 'mock'
```

### 8.4 当前云端权限规则

- 创建申请时，云函数会使用当前微信用户的 `OPENID` 作为 `applicantOpenId`。
- 审批申请时，云函数会阻止申请者审批自己的申请。
- 如果申请记录已有 `approverOpenId`，则只有该审批者可以审批。
- 如果申请记录还没有 `approverOpenId`，第一次审批时会绑定当前审批者的 `OPENID`。
- 记账功能要求前端当前角色为 `approver`，并由云函数写入 `ledgerRecords`。

### 8.5 仍建议上线前人工验证

- 申请者账号提交一条申请。
- 审批者账号能看到待审批申请。
- 申请者账号不能审批自己的申请。
- 审批者账号可以通过/驳回申请。
- 审批者账号可以新增记账记录，并刷新后仍然存在。
- 商品链接字段可以填写淘宝口令、店铺口令或普通文本。
