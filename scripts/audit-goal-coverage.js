const assert = require('assert')
const fs = require('fs')
const path = require('path')
const service = require('../miniprogram/services/application-service')
const fileService = require('../miniprogram/services/file-service')
const { APPLICATION_STATUS } = require('../miniprogram/utils/constants')
const { buildDetailViewModel } = require('../miniprogram/view-models/application-detail-model')

const root = path.resolve(__dirname, '..')

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath))
}

async function run() {
  service.setDataSource('mock')
  service.resetLocalData()
  fileService.setFileDataSource('mock')

  const familyId = 'family_001'
  const applicant = { id: 'user_husband', name: '申请方', role: 'applicant' }
  const approver = { id: 'user_wife', name: '审批方', role: 'approver' }

  const imageUpload = await fileService.uploadApplicationImages(
    ['temp://coffee-machine.jpg'],
    { familyId, applicationId: 'draft' }
  )
  assert.strictEqual(imageUpload.ok, true)
  assert.deepStrictEqual(imageUpload.data, ['temp://coffee-machine.jpg'])

  const created = await service.createApplication(
    {
      familyId,
      title: '购买咖啡机',
      amount: 1299,
      category: '家电',
      reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱。',
      images: imageUpload.data,
      productLink: 'https://example.com/coffee-machine',
      expectedPurchaseDate: '2026-06-30',
      note: '618 优惠价'
    },
    applicant
  )
  assert.strictEqual(created.ok, true)
  assert.strictEqual(created.data.status, APPLICATION_STATUS.PENDING)

  const listAfterCreate = await service.listApplications({ familyId })
  assert.strictEqual(listAfterCreate.ok, true)
  assert.ok(
    listAfterCreate.data.items.some((item) => item.id === created.data.id),
    'created application should appear in list'
  )

  const detail = await service.getApplicationDetail(created.data.id)
  assert.strictEqual(detail.ok, true)
  assert.strictEqual(detail.data.title, '购买咖啡机')
  assert.strictEqual(detail.data.amount, 1299)
  assert.strictEqual(detail.data.reason.includes('外卖咖啡'), true)
  assert.deepStrictEqual(detail.data.images, ['temp://coffee-machine.jpg'])
  assert.strictEqual(detail.data.productLink, 'https://example.com/coffee-machine')

  const detailView = buildDetailViewModel(detail.data, approver)
  assert.strictEqual(detailView.canApprove, true)
  assert.strictEqual(detailView.application.hasImages, true)
  assert.strictEqual(detailView.application.hasProductLink, true)

  const approved = await service.approveApplication(
    {
      applicationId: created.data.id,
      decision: APPLICATION_STATUS.APPROVED,
      approvalComment: '可以买，控制在预算内。'
    },
    approver
  )
  assert.strictEqual(approved.ok, true)
  assert.strictEqual(approved.data.status, APPLICATION_STATUS.APPROVED)

  const approvedDetail = await service.getApplicationDetail(created.data.id)
  assert.strictEqual(approvedDetail.ok, true)
  assert.strictEqual(approvedDetail.data.status, APPLICATION_STATUS.APPROVED)
  assert.strictEqual(approvedDetail.data.approvalComment, '可以买，控制在预算内。')

  const rejectedSeed = await service.approveApplication(
    {
      applicationId: 'app_001',
      decision: APPLICATION_STATUS.REJECTED,
      approvalComment: '这个月预算紧张，下个月再考虑。'
    },
    approver
  )
  assert.strictEqual(rejectedSeed.ok, true)
  assert.strictEqual(rejectedSeed.data.status, APPLICATION_STATUS.REJECTED)

  const visualFiles = [
    'miniprogram/pages/onboarding/gender/gender.wxml',
    'miniprogram/pages/onboarding/gender/gender.wxss',
    'miniprogram/pages/onboarding/role/role.wxml',
    'miniprogram/pages/onboarding/role/role.wxss',
    'miniprogram/pages/home/home.wxml',
    'miniprogram/pages/home/home.wxss',
    'miniprogram/pages/apply/apply.wxml',
    'miniprogram/pages/apply/apply.wxss',
    'miniprogram/pages/applications/applications.wxml',
    'miniprogram/pages/applications/applications.wxss',
    'miniprogram/pages/detail/detail.wxml',
    'miniprogram/pages/detail/detail.wxss',
    'miniprogram/pages/profile/profile.wxml',
    'miniprogram/pages/profile/profile.wxss'
  ]
  const missingVisualFiles = visualFiles.filter((file) => !fileExists(file))

  const report = {
    passed: [
      'create application with purpose, amount, reason, image, and product link',
      'created application appears in list',
      'detail data contains full application fields',
      'pending application can be approved',
      'pending application can be rejected',
      'status changes are reflected in detail data',
      'mock data supports full logic demonstration'
    ],
    pending: missingVisualFiles.map((file) => `visual page file pending: ${file}`)
  }

  assert.strictEqual(report.pending.length, 0)

  console.log('goal-coverage audit passed for implemented logic')
  console.log('visual files ready')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
