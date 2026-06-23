const mockStore = require('../utils/mock-store')
const { failure } = require('../utils/application-rules')

let dataSource = 'mock'

function setDataSource(source) {
  if (!['mock', 'cloud'].includes(source)) {
    return failure('VALIDATION_ERROR', '数据源只能是 mock 或 cloud')
  }

  dataSource = source
  return { ok: true, data: { dataSource }, error: null }
}

function getDataSource() {
  return dataSource
}

function callCloudFunction(name, data) {
  if (typeof wx === 'undefined' || !wx.cloud) {
    return Promise.resolve(
      failure('INTERNAL_ERROR', '当前环境不支持 wx.cloud，请切回 mock 数据源')
    )
  }

  return wx.cloud
    .callFunction({ name, data })
    .then((result) => result.result)
    .catch((error) => failure('INTERNAL_ERROR', error.message || '云函数调用失败'))
}

function normalizeAsync(result) {
  return result && typeof result.then === 'function' ? result : Promise.resolve(result)
}

function createApplication(payload, currentUser) {
  if (dataSource === 'cloud') {
    return callCloudFunction('createApplication', {
      ...payload,
      currentUser
    })
  }

  return normalizeAsync(mockStore.createApplication(payload, currentUser))
}

function listApplications(query) {
  if (dataSource === 'cloud') {
    return callCloudFunction('listApplications', query)
  }

  return normalizeAsync(mockStore.listApplications(query))
}

function getApplicationDetail(applicationId) {
  if (dataSource === 'cloud') {
    return callCloudFunction('getApplicationDetail', { applicationId })
  }

  return normalizeAsync(mockStore.getApplicationDetail(applicationId))
}

function approveApplication(payload, currentUser) {
  if (dataSource === 'cloud') {
    return callCloudFunction('approveApplication', {
      ...payload,
      currentUser
    })
  }

  return normalizeAsync(mockStore.approveApplication(payload, currentUser))
}

function createLedgerRecord(payload, currentUser) {
  if (dataSource === 'cloud') {
    return callCloudFunction('createLedgerRecord', {
      ...payload,
      currentUser
    })
  }

  return normalizeAsync(mockStore.createLedgerRecord(payload, currentUser))
}

function listLedgerRecords(query) {
  if (dataSource === 'cloud') {
    return callCloudFunction('listLedgerRecords', query)
  }

  return normalizeAsync(mockStore.listLedgerRecords(query))
}

function resetLocalData() {
  mockStore.resetMockStore()
  return { ok: true, data: null, error: null }
}

module.exports = {
  setDataSource,
  getDataSource,
  createApplication,
  listApplications,
  getApplicationDetail,
  approveApplication,
  createLedgerRecord,
  listLedgerRecords,
  resetLocalData
}
