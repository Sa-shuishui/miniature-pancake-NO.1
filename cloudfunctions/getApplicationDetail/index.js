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
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (input) => String(input).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + ' ' + [pad(date.getHours()), pad(date.getMinutes())].join(':')
}

function normalizeEvent(event) {
  return {
    ...event,
    createdAt: formatDateText(event.createdAt)
  }
}

exports.main = async (event) => {
  if (!event || !event.applicationId) {
    return failure('VALIDATION_ERROR', '申请 ID 不能为空')
  }

  try {
    const applicationResult = await db
      .collection('fundApplications')
      .doc(event.applicationId)
      .get()

    const eventsResult = await db
      .collection('applicationEvents')
      .where({ applicationId: event.applicationId })
      .orderBy('createdAt', 'asc')
      .get()

    return success({
      id: applicationResult.data._id,
      ...applicationResult.data,
      createdAt: formatDateText(applicationResult.data.createdAt),
      updatedAt: formatDateText(applicationResult.data.updatedAt),
      approvedAt: formatDateText(applicationResult.data.approvedAt),
      events: eventsResult.data.map(normalizeEvent)
    })
  } catch (error) {
    if (error && error.errCode === -1) {
      return failure('NOT_FOUND', '申请不存在')
    }

    return failure('INTERNAL_ERROR', error.message || '查询申请详情失败')
  }
}
