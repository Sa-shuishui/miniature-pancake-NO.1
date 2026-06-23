const { APPLICATION_STATUS, ERROR_CODES } = require('./constants')

function success(data) {
  return { ok: true, data, error: null }
}

function failure(code, message) {
  return {
    ok: false,
    data: null,
    error: { code, message }
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function validateApplicationPayload(payload) {
  if (!payload || !payload.familyId) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '家庭 ID 不能为空')
  }

  if (!payload.title || payload.title.trim().length < 2) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '用途标题至少需要 2 个字')
  }

  if (payload.title.trim().length > 30) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '用途标题不能超过 30 个字')
  }

  const amount = Number(payload.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '申请金额必须大于 0')
  }

  if (!payload.reason || payload.reason.trim().length < 10) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '必要性说明至少需要 10 个字')
  }

  if (payload.images && payload.images.length > 3) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '产品照片最多上传 3 张')
  }

  return success({ amount })
}

function validateApprovePayload(payload) {
  if (!payload || !payload.applicationId) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '申请 ID 不能为空')
  }

  if (![APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.REJECTED].includes(payload.decision)) {
    return failure(ERROR_CODES.VALIDATION_ERROR, '审批结果只能是通过或驳回')
  }

  return success({})
}

function ensurePending(application) {
  if (application.status !== APPLICATION_STATUS.PENDING) {
    return failure(ERROR_CODES.INVALID_STATUS, '只有待审批申请可以审批')
  }

  return success({})
}

function ensureApprover(application, currentUser) {
  const approverId = currentUser && currentUser.id
  if (approverId && application.approverId !== approverId) {
    return failure(ERROR_CODES.FORBIDDEN, '当前用户没有审批权限')
  }

  return success({})
}

function buildListItem(application) {
  return {
    id: application.id,
    title: application.title,
    amount: application.amount,
    category: application.category,
    status: application.status,
    applicantName: application.applicantName,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt
  }
}

module.exports = {
  success,
  failure,
  clone,
  validateApplicationPayload,
  validateApprovePayload,
  ensurePending,
  ensureApprover,
  buildListItem
}
