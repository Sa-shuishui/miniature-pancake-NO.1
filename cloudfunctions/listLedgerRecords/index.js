const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function success(data) {
  return { ok: true, data, error: null }
}

function failure(code, message) {
  return { ok: false, data: null, error: { code, message } }
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

function buildLedgerItem(record) {
  const amount = Number(record.amount || 0)
  return {
    id: record._id || record.id,
    familyId: record.familyId,
    purpose: record.purpose,
    amount,
    amountText: `￥${amount.toFixed(2)}`,
    note: record.note || '',
    recorderName: record.recorderName || '审批者',
    createdAt: formatDateText(record.createdAt)
  }
}

exports.main = async (event) => {
  if (!event || !event.familyId) {
    return failure('VALIDATION_ERROR', '家庭 ID 不能为空')
  }

  const page = Math.max(Number(event.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(event.pageSize || 20), 1), 50)

  try {
    const query = db.collection('ledgerRecords').where({
      familyId: event.familyId
    })
    const countResult = await query.count()
    const listResult = await query
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return success({
      items: listResult.data.map(buildLedgerItem),
      total: countResult.total
    })
  } catch (error) {
    return failure('INTERNAL_ERROR', error.message || '查询记账记录失败')
  }
}
