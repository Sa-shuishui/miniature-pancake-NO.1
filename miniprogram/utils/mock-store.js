const { APPLICATION_STATUS, ERROR_CODES } = require('./constants')
const { nowText } = require('./format')
const {
  success,
  failure,
  clone,
  validateApplicationPayload,
  validateApprovePayload,
  ensurePending,
  ensureApprover,
  buildListItem
} = require('./application-rules')

let nextId = 4
let nextLedgerId = 3

const initialApplications = [
  {
    id: 'app_001',
    familyId: 'family_001',
    title: '购买咖啡机',
    amount: 1299,
    category: '家电',
    reason: '家里每天都会喝咖啡，长期看比外卖咖啡更省钱，也方便周末招待朋友。',
    images: [],
    productLink: 'https://example.com/coffee-machine',
    expectedPurchaseDate: '2026-06-30',
    note: '618 优惠价',
    status: APPLICATION_STATUS.PENDING,
    applicantId: 'user_husband',
    applicantName: '申请者',
    approverId: 'user_wife',
    approverName: '审批者',
    approvalComment: '',
    createdAt: '2026-06-22 10:00',
    updatedAt: '2026-06-22 10:00',
    approvedAt: '',
    events: [
      {
        action: 'created',
        actorName: '申请者',
        comment: '提交申请',
        createdAt: '2026-06-22 10:00'
      }
    ]
  },
  {
    id: 'app_002',
    familyId: 'family_001',
    title: '周末家庭聚餐',
    amount: 420,
    category: '餐饮',
    reason: '本周双方父母来家里，计划一起吃饭。',
    images: [],
    productLink: '',
    expectedPurchaseDate: '2026-06-27',
    note: '',
    status: APPLICATION_STATUS.APPROVED,
    applicantId: 'user_husband',
    applicantName: '申请者',
    approverId: 'user_wife',
    approverName: '审批者',
    approvalComment: '可以，记得控制总额。',
    createdAt: '2026-06-20 09:30',
    updatedAt: '2026-06-20 10:00',
    approvedAt: '2026-06-20 10:00',
    events: []
  },
  {
    id: 'app_003',
    familyId: 'family_001',
    title: '购买游戏主机',
    amount: 2999,
    category: '娱乐',
    reason: '想放在客厅周末一起玩。',
    images: [],
    productLink: 'https://example.com/game-console',
    expectedPurchaseDate: '',
    note: '',
    status: APPLICATION_STATUS.REJECTED,
    applicantId: 'user_husband',
    applicantName: '申请者',
    approverId: 'user_wife',
    approverName: '审批者',
    approvalComment: '这个月预算紧张，下个月再看。',
    createdAt: '2026-06-18 20:00',
    updatedAt: '2026-06-18 21:00',
    approvedAt: '2026-06-18 21:00',
    events: []
  }
]

let applications = clone(initialApplications)

const initialLedgerRecords = [
  {
    id: 'ledger_001',
    familyId: 'family_001',
    purpose: '周末家庭聚餐',
    amount: 420,
    note: '已通过共同花申请',
    recorderId: 'user_wife',
    recorderName: '审批者',
    createdAt: '2026-06-20 10:10'
  },
  {
    id: 'ledger_002',
    familyId: 'family_001',
    purpose: '日用品补货',
    amount: 168,
    note: '纸巾、洗衣液和厨房用品',
    recorderId: 'user_wife',
    recorderName: '审批者',
    createdAt: '2026-06-21 18:20'
  }
]

let ledgerRecords = clone(initialLedgerRecords)

function createApplication(payload, currentUser) {
  const validation = validateApplicationPayload(payload)
  if (!validation.ok) return validation

  const createdAt = nowText()
  const id = `app_${String(nextId).padStart(3, '0')}`
  nextId += 1

  const applicantName = currentUser && currentUser.name ? currentUser.name : '申请者'
  const application = {
    id,
    familyId: payload.familyId,
    title: payload.title.trim(),
    amount: validation.data.amount,
    category: payload.category || '',
    reason: payload.reason.trim(),
    images: payload.images || [],
    productLink: payload.productLink || '',
    expectedPurchaseDate: payload.expectedPurchaseDate || '',
    note: payload.note || '',
    status: APPLICATION_STATUS.PENDING,
    applicantId: currentUser && currentUser.id ? currentUser.id : 'user_husband',
    applicantName,
    approverId: payload.approverId || 'user_wife',
    approverName: payload.approverName || '审批者',
    approvalComment: '',
    createdAt,
    updatedAt: createdAt,
    approvedAt: '',
    events: [
      {
        action: 'created',
        actorName: applicantName,
        comment: '提交申请',
        createdAt
      }
    ]
  }

  applications.unshift(application)

  return success({ id, status: application.status })
}

function listApplications(query = {}) {
  const { familyId, status } = query

  if (!familyId) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '家庭 ID 不能为空')
  }

  const items = applications
    .filter((application) => application.familyId === familyId)
    .filter((application) => !status || application.status === status)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .map(buildListItem)

  return success({ items, total: items.length })
}

function getApplicationDetail(applicationId) {
  const application = applications.find((item) => item.id === applicationId)
  if (!application) {
    return failure(ERROR_CODES.NOT_FOUND, '申请不存在')
  }

  return success(clone(application))
}

function approveApplication(payload, currentUser) {
  const { applicationId, decision, approvalComment = '' } = payload
  const validation = validateApprovePayload(payload)
  if (!validation.ok) return validation

  const application = applications.find((item) => item.id === applicationId)

  if (!application) {
    return failure(ERROR_CODES.NOT_FOUND, '申请不存在')
  }

  const pending = ensurePending(application)
  if (!pending.ok) return pending

  const approver = ensureApprover(application, currentUser)
  if (!approver.ok) return approver

  const approvedAt = nowText()
  const previousStatus = application.status

  application.status = decision
  application.approvalComment = approvalComment
  application.updatedAt = approvedAt
  application.approvedAt = approvedAt
  application.events.push({
    action: decision,
    actorName: currentUser && currentUser.name ? currentUser.name : application.approverName,
    fromStatus: previousStatus,
    toStatus: decision,
    comment: approvalComment,
    createdAt: approvedAt
  })

  return success({
    id: application.id,
    status: application.status,
    approvalComment: application.approvalComment,
    approvedAt: application.approvedAt
  })
}

function createLedgerRecord(payload, currentUser) {
  if (!payload || !payload.familyId) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '家庭 ID 不能为空')
  }

  if (!payload.purpose || payload.purpose.trim().length < 2) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '用途至少需要 2 个字')
  }

  const amount = Number(payload.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '金额必须大于 0')
  }

  const createdAt = nowText()
  const record = {
    id: `ledger_${String(nextLedgerId).padStart(3, '0')}`,
    familyId: payload.familyId,
    purpose: payload.purpose.trim(),
    amount,
    note: payload.note || '',
    recorderId: currentUser && currentUser.id ? currentUser.id : 'user_wife',
    recorderName: currentUser && currentUser.name ? currentUser.name : '审批者',
    createdAt
  }
  nextLedgerId += 1
  ledgerRecords.unshift(record)

  return success(clone(record))
}

function listLedgerRecords(query = {}) {
  const { familyId } = query

  if (!familyId) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '家庭 ID 不能为空')
  }

  const items = ledgerRecords
    .filter((record) => record.familyId === familyId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map((record) => ({
      ...record,
      amountText: `￥${Number(record.amount || 0).toFixed(2)}`
    }))

  return success({ items, total: items.length })
}

function resetMockStore() {
  nextId = 4
  nextLedgerId = 3
  applications = clone(initialApplications)
  ledgerRecords = clone(initialLedgerRecords)
}

module.exports = {
  createApplication,
  listApplications,
  getApplicationDetail,
  approveApplication,
  createLedgerRecord,
  listLedgerRecords,
  resetMockStore
}
