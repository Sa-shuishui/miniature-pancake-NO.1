const assert = require('assert')
const store = require('../miniprogram/utils/mock-store')
const { APPLICATION_STATUS } = require('../miniprogram/utils/constants')

store.resetMockStore()

const familyId = 'family_001'
const applicant = { id: 'user_husband', name: '申请方', role: 'applicant' }
const approver = { id: 'user_wife', name: '审批方', role: 'approver' }

const initialPending = store.listApplications({
  familyId,
  status: APPLICATION_STATUS.PENDING
})
assert.strictEqual(initialPending.ok, true)
assert.strictEqual(initialPending.data.total, 1)

const created = store.createApplication(
  {
    familyId,
    title: '购买空气炸锅',
    amount: 399,
    category: '家电',
    reason: '做饭更方便，减少点外卖的次数，家里也更容易准备晚餐。',
    images: ['temp://air-fryer.jpg'],
    productLink: 'https://example.com/air-fryer',
    expectedPurchaseDate: '2026-07-01',
    note: '先买入门款'
  },
  applicant
)
assert.strictEqual(created.ok, true)
assert.strictEqual(created.data.status, APPLICATION_STATUS.PENDING)

const detail = store.getApplicationDetail(created.data.id)
assert.strictEqual(detail.ok, true)
assert.strictEqual(detail.data.title, '购买空气炸锅')
assert.strictEqual(detail.data.amount, 399)
assert.strictEqual(detail.data.productLink, 'https://example.com/air-fryer')

const approved = store.approveApplication(
  {
    applicationId: created.data.id,
    decision: APPLICATION_STATUS.APPROVED,
    approvalComment: '可以买，控制在预算内。'
  },
  approver
)
assert.strictEqual(approved.ok, true)
assert.strictEqual(approved.data.status, APPLICATION_STATUS.APPROVED)

const approveAgain = store.approveApplication(
  {
    applicationId: created.data.id,
    decision: APPLICATION_STATUS.REJECTED,
    approvalComment: '重复审批'
  },
  approver
)
assert.strictEqual(approveAgain.ok, false)
assert.strictEqual(approveAgain.error.code, 'INVALID_STATUS')

const tokenLink = store.createApplication(
  {
    familyId,
    title: '淘宝口令申请',
    amount: 10,
    reason: '这个申请用于验证淘宝口令和非 http 文本也可以保存。',
    productLink: 'abc123'
  },
  applicant
)
assert.strictEqual(tokenLink.ok, true)
const tokenLinkDetail = store.getApplicationDetail(tokenLink.data.id)
assert.strictEqual(tokenLinkDetail.ok, true)
assert.strictEqual(tokenLinkDetail.data.productLink, 'abc123')

const ledger = store.createLedgerRecord(
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

const ledgerList = store.listLedgerRecords({ familyId })
assert.strictEqual(ledgerList.ok, true)
assert.strictEqual(ledgerList.data.items[0].purpose, '买菜')
assert.strictEqual(ledgerList.data.items[0].amountText, '￥88.50')

console.log('mock-store verification passed')
