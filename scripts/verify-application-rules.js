const assert = require('assert')
const {
  APPLICATION_STATUS
} = require('../miniprogram/utils/constants')
const {
  validateApplicationPayload,
  validateApprovePayload,
  ensurePending,
  ensureApprover,
  buildListItem
} = require('../miniprogram/utils/application-rules')

const validApplication = validateApplicationPayload({
  familyId: 'family_001',
  title: '购买咖啡机',
  amount: 1299,
  reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱。',
  productLink: 'https://example.com/coffee-machine',
  images: ['a.jpg', 'b.jpg']
})
assert.strictEqual(validApplication.ok, true)
assert.strictEqual(validApplication.data.amount, 1299)

const taobaoTokenApplication = validateApplicationPayload({
  familyId: 'family_001',
  title: '购买咖啡机',
  amount: 1299,
  reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱。',
  productLink: '复制淘宝口令后打开淘宝查看商品'
})
assert.strictEqual(taobaoTokenApplication.ok, true)

const invalidAmount = validateApplicationPayload({
  familyId: 'family_001',
  title: '购买咖啡机',
  amount: 0,
  reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱。'
})
assert.strictEqual(invalidAmount.ok, false)
assert.strictEqual(invalidAmount.error.code, 'VALIDATION_ERROR')

const invalidImages = validateApplicationPayload({
  familyId: 'family_001',
  title: '购买咖啡机',
  amount: 1299,
  reason: '家里每天都喝咖啡，长期看比外卖咖啡更省钱。',
  images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg']
})
assert.strictEqual(invalidImages.ok, false)

const approve = validateApprovePayload({
  applicationId: 'app_001',
  decision: APPLICATION_STATUS.APPROVED
})
assert.strictEqual(approve.ok, true)

const badDecision = validateApprovePayload({
  applicationId: 'app_001',
  decision: 'maybe'
})
assert.strictEqual(badDecision.ok, false)

assert.strictEqual(ensurePending({ status: APPLICATION_STATUS.PENDING }).ok, true)
assert.strictEqual(ensurePending({ status: APPLICATION_STATUS.APPROVED }).ok, false)

assert.strictEqual(
  ensureApprover({ approverId: 'user_wife' }, { id: 'user_wife' }).ok,
  true
)
assert.strictEqual(
  ensureApprover({ approverId: 'user_wife' }, { id: 'user_husband' }).ok,
  false
)

const listItem = buildListItem({
  id: 'app_001',
  title: '购买咖啡机',
  amount: 1299,
  category: '家电',
  status: APPLICATION_STATUS.PENDING,
  applicantName: '申请方',
  createdAt: '2026-06-22 10:00',
  updatedAt: '2026-06-22 10:00',
  reason: '详情字段不应进入列表摘要'
})
assert.deepStrictEqual(Object.keys(listItem), [
  'id',
  'title',
  'amount',
  'category',
  'status',
  'applicantName',
  'createdAt',
  'updatedAt'
])

console.log('application-rules verification passed')
