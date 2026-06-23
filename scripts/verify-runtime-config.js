const assert = require('assert')
const { getRuntimeConfig } = require('../miniprogram/config/runtime-config')
const applicationService = require('../miniprogram/services/application-service')
const fileService = require('../miniprogram/services/file-service')
const {
  initializeRuntime,
  initCloudIfNeeded
} = require('../miniprogram/services/runtime-service')

const config = getRuntimeConfig()
assert.strictEqual(config.dataSource, 'cloud')
assert.strictEqual(config.fileDataSource, 'cloud')
assert.strictEqual(config.cloudEnvId, 'cloud1-d7gi5ipgg98cc8cc8')
assert.strictEqual(config.currentFamilyId, 'family_001')
assert.strictEqual(config.currentUser.role, 'approver')
assert.strictEqual(config.gender, 'female')
assert.strictEqual(config.themeClass, 'theme-female')

const cloudUnavailable = initCloudIfNeeded({
  dataSource: 'cloud',
  fileDataSource: 'cloud',
  cloudEnvId: 'test-env'
})
assert.strictEqual(cloudUnavailable.ok, false)
assert.strictEqual(cloudUnavailable.error.code, 'INTERNAL_ERROR')

applicationService.setDataSource('mock')
fileService.setFileDataSource('mock')
assert.strictEqual(applicationService.getDataSource(), 'mock')
assert.strictEqual(fileService.getFileDataSource(), 'mock')

const mockInitResult = initCloudIfNeeded({
  dataSource: 'mock',
  fileDataSource: 'mock',
  cloudEnvId: ''
})
assert.strictEqual(mockInitResult.ok, true)
assert.strictEqual(mockInitResult.data.cloudEnabled, false)

console.log('runtime-config verification passed')
