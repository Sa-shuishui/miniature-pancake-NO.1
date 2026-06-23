# 家庭内部财政审批小程序

这是一个面向夫妻双方家庭共同资金管理的微信小程序项目。核心场景是：不直接管理家庭资金的一方，可以提交资金使用申请；管钱的一方可以查看、审批、驳回，并留下处理意见。

## MVP 目标

- 申请方提交共同资金使用申请。
- 申请内容包含用途、金额、必要性说明、产品照片、产品链接等。
- 审批方查看待审批申请，并选择通过或驳回。
- 双方都能查看申请状态和历史记录。
- 第一版先使用微信小程序原生框架与本地模拟数据，跑通完整交互后再接入云开发数据库。

## 主要角色

- 申请方：创建申请、查看自己的申请、补充说明。
- 审批方：查看待审批申请、审批通过、驳回、填写审批意见。

## 核心页面

- 首页：展示待处理数量、最近申请、快捷入口。
- 新建申请：填写用途、金额、必要性、上传照片、填写链接。
- 申请列表：按状态筛选全部、待审批、已通过、已驳回。
- 申请详情：展示申请完整信息、审批记录、操作按钮。
- 我的：家庭成员、角色说明、预算偏好入口。

## 当前文档

- [产品需求文档](docs/PRD.md)
- [技术设计与数据模型](docs/TECHNICAL_DESIGN.md)
- [API 契约](docs/API_CONTRACTS.md)
- [申请状态流转](docs/STATE_MACHINE.md)
- [本地 Mock Store 设计](docs/MOCK_STORE_DESIGN.md)
- [微信云开发设置](docs/CLOUD_DEVELOPMENT_SETUP.md)
- [开发与验证命令](docs/DEVELOPMENT_COMMANDS.md)
- [页面绑定计划](docs/UI_BINDING_PLAN.md)
- [视觉方向备选](docs/VISUAL_DIRECTIONS.md)
- [开发路线图](docs/ROADMAP.md)
- [测试计划](docs/TEST_PLAN.md)
- [上线检查清单](docs/LAUNCH_CHECKLIST.md)

## 建议开发顺序

1. 搭建微信小程序原生项目结构。
2. 实现本地模拟数据与申请状态流转。
3. 完成首页、申请表、列表、详情页。
4. 在微信开发者工具中完成交互验证。
5. 接入微信云开发：用户、家庭、申请、审批记录集合。
6. 增加通知、预算规则、月度统计等进阶功能。

## 当前实现进度

- 已创建 `miniprogram/utils/mock-store.js`，支持创建申请、查询列表、查询详情、审批通过和审批驳回。
- 已创建 `miniprogram/utils/constants.js` 和 `miniprogram/utils/format.js`。
- 已创建 `miniprogram/utils/application-rules.js`，统一申请校验、审批校验、状态和权限判断。
- 已创建 `miniprogram/config/runtime-config.js` 和 `miniprogram/services/runtime-service.js`，统一 mock/cloud 运行配置。
- 已创建 `miniprogram/services/application-service.js`，统一页面未来调用的数据服务，并支持 mock/cloud 数据源切换。
- 已创建 `miniprogram/services/file-service.js`，统一产品照片的 mock/cloud 上传路径。
- 已创建 `miniprogram/view-models/`，用于申请表单、申请列表和申请详情页的数据派生。
- 已创建 `miniprogram/page-models/` 和页面 JS 控制器，准备承接后续 WXML/WXSS 页面。
- 已创建性别选择、角色选择、首页、申请、列表、详情、我的页面 WXML/WXSS。
- 已创建页面级 JSON 配置与 [页面绑定计划](docs/UI_BINDING_PLAN.md)。
- 已创建 `scripts/verify-mock-store.js`、`scripts/verify-application-rules.js`、`scripts/verify-application-service.js`、`scripts/verify-file-service.js`、`scripts/verify-runtime-config.js`、`scripts/verify-view-models.js`、`scripts/verify-page-models.js` 和 `scripts/audit-goal-coverage.js`，用于验证本地数据层、共享业务规则、服务层、文件服务、运行配置、视图模型、页面逻辑和目标覆盖。
- 已创建 `scripts/check-project-structure.js`，用于检查当前结构并确认视觉页面文件仍待方向确认。
- 已创建 `project.config.json`，可作为微信开发者工具导入项目的基础配置。
- 已创建云函数骨架：`createApplication`、`listApplications`、`getApplicationDetail`、`approveApplication`。
