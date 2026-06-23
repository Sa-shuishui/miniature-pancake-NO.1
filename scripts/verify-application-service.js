const assert = require('assert')
const service = require('../miniprogram/services/application-service')
const { APPLICATION_STATUS } = require('../miniprogram/utils/constants')

async function run() {
  service.setDataSource('mock')
  service.resetLocalData()

  assert.strictEqual(service.getDataSource(), 'mock')

  const familyId = 'family_001'
  const applicant = { id: 'user_husband', name: '申请方', role: 'applicant' }
  const approver = { id: 'user_wife', name: '审批方', role: 'approver' }

  const initialList = await service.listApplications({ familyId })
  assert.strictEqual(initialList.ok, true)
  assert.strictEqual(initialList.data.total, 3)

  const created = await service.createApplication(
    {
      familyId,
      title: '购买净水器',
      amount: 1599,
      category: '家电',
      reason: '家里饮水频率高，净水器可以减少桶装水购买和搬运。',
      images: ['temp://water-filter.jpg'],
      productLink: 'https://example.com/water-filter',
      expectedPurchaseDate: '2026-07-03'
    },
    applicant
  )
  assert.strictEqual(created.ok, true)
  assert.strictEqual(created.data.status, APPLICATION_STATUS.PENDING)

  const ledger = await service.createLedgerRecord(
    {
      familyId,
      purpose: '买菜',
      amount: 88.5,
      note: '晚饭食材'
    },
    approver
  )
  assert.strictEqual(ledger.ok, true)
  assert.strictEqual(ledger.data.amount, 88.5)

  const ledgerList = await service.listLedgerRecords({ familyId })
  assert.strictEqual(ledgerList.ok, true)
  assert.strictEqual(ledgerList.data.items[0].purpose, '买菜')

  const detail = await service.getApplicationDetail(created.data.id)
  assert.strictEqual(detail.ok, true)
  assert.strictEqual(detail.data.title, '购买净水器')

  const approved = await service.approveApplication(
    {
      applicationId: created.data.id,
      decision: APPLICATION_STATUS.APPROVED,
      approvalComment: '同意，优先选售后好的型号。'
    },
    approver
  )
  assert.strictEqual(approved.ok, true)
  assert.strictEqual(approved.data.status, APPLICATION_STATUS.APPROVED)

  const invalidSource = service.setDataSource('database')
  assert.strictEqual(invalidSource.ok, false)
  assert.strictEqual(service.getDataSource(), 'mock')

  console.log('application-service verification passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
