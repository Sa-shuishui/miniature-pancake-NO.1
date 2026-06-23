const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const APPLICATION_STATUS = {
  PENDING: 'pending'
}

function success(data) {
  return { ok: true, data, error: null }
}

function failure(code, message) {
  return { ok: false, data: null, error: { code, message } }
}

function validateApplicationPayload(payload) {
  if (!payload || !payload.familyId) {
    return failure('VALIDATION_ERROR', '家庭 ID 不能为空')
  }

  if (!payload.title || payload.title.trim().length < 2) {
    return failure('VALIDATION_ERROR', '用途标题至少需要 2 个字')
  }

  if (payload.title.trim().length > 30) {
    return failure('VALIDATION_ERROR', '用途标题不能超过 30 个字')
  }

  const amount = Number(payload.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return failure('VALIDATION_ERROR', '申请金额必须大于 0')
  }

  if (!payload.reason || payload.reason.trim().length < 10) {
    return failure('VALIDATION_ERROR', '必要性说明至少需要 10 个字')
  }

  if (payload.images && payload.images.length > 3) {
    return failure('VALIDATION_ERROR', '产品照片最多上传 3 张')
  }

  return success({ amount })
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const validation = validateApplicationPayload(event)
  if (!validation.ok) return validation
  const currentUser = event.currentUser || {}

  const now = new Date()
  const application = {
    familyId: event.familyId,
    title: event.title.trim(),
    amount: validation.data.amount,
    category: event.category || '',
    reason: event.reason.trim(),
    images: event.images || [],
    productLink: event.productLink || '',
    expectedPurchaseDate: event.expectedPurchaseDate || '',
    note: event.note || '',
    status: APPLICATION_STATUS.PENDING,
    applicantOpenId: wxContext.OPENID,
    applicantName: currentUser.name || event.applicantName || '申请方',
    approverOpenId: event.approverOpenId || '',
    approverName: event.approverName || '审批方',
    approvalComment: '',
    createdAt: now,
    updatedAt: now,
    approvedAt: null
  }

  try {
    const result = await db.collection('fundApplications').add({
      data: application
    })

    await db.collection('applicationEvents').add({
      data: {
        applicationId: result._id,
        actorOpenId: wxContext.OPENID,
        actorName: application.applicantName,
        action: 'created',
        fromStatus: '',
        toStatus: APPLICATION_STATUS.PENDING,
        comment: '提交申请',
        createdAt: now
      }
    })

    return success({
      id: result._id,
      status: APPLICATION_STATUS.PENDING
    })
  } catch (error) {
    return failure('INTERNAL_ERROR', error.message || '创建申请失败')
  }
}
