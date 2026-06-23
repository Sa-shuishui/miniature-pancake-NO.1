# 页面绑定计划

本文件说明 WXML/WXSS 实现时需要绑定的数据、事件和页面状态。当前尚未选择视觉方向，因此这里不定义布局、色彩、间距或组件样式。

## 1. 首页 home

数据来源：

- `page-models/home-page-model.js`
- `loadHomeState(familyId)`

页面数据：

- `summary.total`：全部申请数。
- `summary.pending`：待审批数量。
- `summary.approved`：已通过数量。
- `summary.rejected`：已驳回数量。
- `pendingCount`：首页重点展示的待审批数量。
- `recentApplications`：最近三条申请。
- `loading`：加载中状态。
- `errorMessage`：错误提示。

事件：

- `goApply`：跳转申请页。
- `goApplications`：跳转申请列表。
- `openDetail`：打开申请详情。

## 2. 新建申请 apply

数据来源：

- `page-models/apply-page-model.js`
- `view-models/application-form-model.js`

页面数据：

- `formState.form.title`：用途标题。
- `formState.form.amount`：申请金额。
- `formState.form.category`：支出分类。
- `formState.form.reason`：必要性说明。
- `formState.form.images`：产品照片。
- `formState.form.productLink`：产品链接。
- `formState.form.expectedPurchaseDate`：期望购买时间。
- `formState.form.note`：备注。
- `formState.categoryOptions`：分类选项。
- `formState.canSubmit`：提交按钮是否可用。
- `formState.fieldErrors`：字段级错误。
- `formState.firstError`：首个错误提示。
- `submitting`：提交中状态。

事件：

- `onFieldInput`：字段输入。
- `addImage`：添加图片。
- `removeImage`：删除图片。
- `submit`：提交申请。

## 3. 申请列表 applications

数据来源：

- `page-models/applications-page-model.js`
- `view-models/application-list-model.js`

页面数据：

- `viewModel.filters`：全部、待审批、已通过、已驳回。
- `viewModel.summary`：状态统计。
- `viewModel.items`：申请列表。
- `viewModel.empty`：空状态。
- `activeStatus`：当前筛选状态。
- `loading`：加载中状态。
- `errorMessage`：错误提示。

事件：

- `changeFilter`：切换筛选。
- `openDetail`：打开详情页。

## 4. 申请详情 detail

数据来源：

- `page-models/detail-page-model.js`
- `view-models/application-detail-model.js`

页面数据：

- `viewModel.application.title`：用途标题。
- `viewModel.application.amountText`：金额文本。
- `viewModel.application.category`：分类。
- `viewModel.application.reason`：必要性说明。
- `viewModel.application.images`：产品照片。
- `viewModel.application.productLink`：产品链接。
- `viewModel.application.statusLabel`：状态文本。
- `viewModel.application.approvalComment`：审批意见。
- `viewModel.application.events`：事件记录。
- `viewModel.canApprove`：是否能通过。
- `viewModel.canReject`：是否能驳回。
- `approvalComment`：审批意见输入。

事件：

- `onCommentInput`：填写审批意见。
- `approve`：审批通过。
- `reject`：审批驳回。

## 5. 我的 profile

数据来源：

- `page-models/profile-page-model.js`

页面数据：

- `profile.familyId`：当前家庭 ID。
- `profile.currentUser.name`：当前用户名。
- `profile.currentUser.role`：当前用户角色。
- `profile.roleLabel`：角色中文名。

## 6. 待视觉方向确认后再做

视觉方向已确认为：卡通、温馨、有爱、年轻情侣夫妻向；产品名为“共同花”；男生淡蓝主题，女生淡粉主题。

以下页面已进入实现范围：

- 性别选择页。
- 角色选择页。
- 首页。
- 新建申请。
- 申请列表。
- 申请详情。
- 我的。

## 7. 后续可继续精修

- 响应式适配和真机视觉检查。
