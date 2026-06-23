# 开发与验证命令

本项目当前没有依赖系统级 Node，而是使用 Codex 桌面内置 Node 进行本地验证。

## 1. 验证共享业务规则

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\verify-application-rules.js
```

预期输出：

```text
application-rules verification passed
```

## 2. 验证本地 Mock Store

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\verify-mock-store.js
```

预期输出：

```text
mock-store verification passed
```

## 3. 验证应用服务层

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\verify-application-service.js
```

预期输出：

```text
application-service verification passed
```

## 4. 验证文件服务

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\verify-file-service.js
```

预期输出：

```text
file-service verification passed
```

## 5. 验证运行配置

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\verify-runtime-config.js
```

预期输出：

```text
runtime-config verification passed
```

## 6. 验证视图模型

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\verify-view-models.js
```

预期输出：

```text
view-models verification passed
```

## 7. 验证页面逻辑模型

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\verify-page-models.js
```

预期输出：

```text
page-models verification passed
```

## 8. 检查项目结构

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\check-project-structure.js
```

预期输出：

```text
project-structure verification passed
visual files ready
```

## 9. 审计目标覆盖

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts\audit-goal-coverage.js
```

预期输出：

```text
goal-coverage audit passed for implemented logic
visual files ready
```

该审计证明当前业务逻辑已覆盖原始目标中的创建申请、图片、链接、详情、通过、驳回和状态更新，并且页面 WXML/WXSS 文件已补齐。

## 10. 检查云函数语法

```powershell
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check cloudfunctions\createApplication\index.js
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check cloudfunctions\listApplications\index.js
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check cloudfunctions\getApplicationDetail\index.js
& 'C:\Users\ZhuanZ\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check cloudfunctions\approveApplication\index.js
```

预期结果：

- 命令退出码为 0。
- 没有语法错误输出。

## 11. 微信开发者工具

导入项目时选择当前项目根目录：

```text
C:\Users\ZhuanZ\Documents\家庭内部财政审批小程序开发
```

当前 `project.config.json` 使用：

```json
{
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "appid": "touristappid"
}
```

如果已有真实小程序 AppID，需要把 `appid` 从 `touristappid` 改成真实 AppID。
