const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function success(data) {
  return { ok: true, data, error: null }
}

function failure(code, message) {
  return { ok: false, data: null, error: { code, message } }
}

function validateLedgerPayload(payload) {
  if (!payload || !payload.familyId) {
    return failure('VALIDATION_ERROR', '家庭 ID 不能为空')
  }

  if (!payload.purpose || payload.purpose.trim().length < 2) {
    return failure('VALIDATION_ERROR', '用途至少需要 2 个字')
  }

  const amount = Number(payload.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return failure('VALIDATION_ERROR', '金额必须大于 0')
  }

  return success({ amount })
}

function formatDateText(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (input) => String(input).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + ' ' + [pad(date.getHours()), pad(date.getMinutes())].join(':')
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const currentUser = event.currentUser || {}

  if (currentUser.role && currentUser.role !== 'approver') {
    return failure('FORBIDDEN', '当前用户不是审批者')
  }

  const validation = validateLedgerPayload(event)
  if (!validation.ok) return validation

  const now = new Date()
  const record = {
    familyId: event.familyId,
    purpose: event.purpose.trim(),
    amount: validation.data.amount,
    note: event.note || '',
    recorderOpenId: wxContext.OPENID,
    recorderName: currentUser.name || event.recorderName || '审批者',
    createdAt: now
  }

  try {
    const result = await db.collection('ledgerRecords').add({
      data: record
    })

    return success({
      id: result._id,
      ...record,
      createdAt: formatDateText(now),
      amountText: `￥${record.amount.toFixed(2)}`
    })
  } catch (error) {
    return failure('INTERNAL_ERROR', error.message || '创建记账记录失败')
  }
}
