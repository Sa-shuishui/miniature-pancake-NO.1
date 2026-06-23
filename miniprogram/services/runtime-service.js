const applicationService = require('./application-service')
const fileService = require('./file-service')
const { getRuntimeConfig } = require('../config/runtime-config')

function initCloudIfNeeded(config) {
  if (config.dataSource !== 'cloud' && config.fileDataSource !== 'cloud') {
    return { ok: true, data: { cloudEnabled: false }, error: null }
  }

  if (typeof wx === 'undefined' || !wx.cloud) {
    return {
      ok: false,
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: '当前环境不支持 wx.cloud，请使用 mock 数据源或在微信开发者工具中运行'
      }
    }
  }

  wx.cloud.init({
    env: config.cloudEnvId || undefined
  })

  return { ok: true, data: { cloudEnabled: true }, error: null }
}

function initializeRuntime() {
  const config = getRuntimeConfig()
  const cloudInit = initCloudIfNeeded(config)
  if (!cloudInit.ok) return cloudInit

  const appSource = applicationService.setDataSource(config.dataSource)
  if (!appSource.ok) return appSource

  const fileSource = fileService.setFileDataSource(config.fileDataSource)
  if (!fileSource.ok) return fileSource

  return {
    ok: true,
    data: {
      config,
      applicationDataSource: applicationService.getDataSource(),
      fileDataSource: fileService.getFileDataSource(),
      cloudEnabled: cloudInit.data.cloudEnabled
    },
    error: null
  }
}

module.exports = {
  initializeRuntime,
  initCloudIfNeeded
}
