const { success, failure } = require('../utils/application-rules')

let dataSource = 'mock'

function setFileDataSource(source) {
  if (!['mock', 'cloud'].includes(source)) {
    return failure('VALIDATION_ERROR', '文件数据源只能是 mock 或 cloud')
  }

  dataSource = source
  return success({ dataSource })
}

function getFileDataSource() {
  return dataSource
}

function getFileName(filePath) {
  if (!filePath) return 'image.jpg'

  const parts = String(filePath).split(/[\\/]/)
  return parts[parts.length - 1] || 'image.jpg'
}

function buildCloudPath({ familyId, applicationId = 'draft', filePath, timestamp = Date.now() }) {
  const fileName = getFileName(filePath).replace(/\s+/g, '-')
  return `families/${familyId}/applications/${applicationId}/${timestamp}-${fileName}`
}

function validateImagePaths(paths) {
  if (!Array.isArray(paths)) {
    return failure('VALIDATION_ERROR', '图片路径必须是数组')
  }

  if (paths.length > 3) {
    return failure('VALIDATION_ERROR', '产品照片最多上传 3 张')
  }

  if (paths.some((path) => !path)) {
    return failure('VALIDATION_ERROR', '图片路径不能为空')
  }

  return success({ paths })
}

function uploadOneCloudImage(path, options) {
  if (typeof wx === 'undefined' || !wx.cloud) {
    return Promise.resolve(
      failure('INTERNAL_ERROR', '当前环境不支持 wx.cloud，请切回 mock 文件数据源')
    )
  }

  return wx.cloud
    .uploadFile({
      cloudPath: buildCloudPath({ ...options, filePath: path }),
      filePath: path
    })
    .then((result) => success(result.fileID))
    .catch((error) => failure('INTERNAL_ERROR', error.message || '图片上传失败'))
}

async function uploadApplicationImages(paths, options = {}) {
  const validation = validateImagePaths(paths)
  if (!validation.ok) return validation

  if (!paths.length) {
    return success([])
  }

  if (!options.familyId) {
    return failure('VALIDATION_ERROR', '家庭 ID 不能为空')
  }

  if (dataSource === 'mock') {
    return success(paths)
  }

  const uploaded = []
  for (const path of paths) {
    const result = await uploadOneCloudImage(path, options)
    if (!result.ok) return result
    uploaded.push(result.data)
  }

  return success(uploaded)
}

module.exports = {
  setFileDataSource,
  getFileDataSource,
  getFileName,
  buildCloudPath,
  validateImagePaths,
  uploadApplicationImages
}
