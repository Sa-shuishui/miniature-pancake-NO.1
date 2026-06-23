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

function buildListItem(application) {
  return {
    id: application.id,
    title: application.title,
    amount: application.amount,
    category: application.category,
    status: application.status,
    applicantName: application.applicantName,
    createdAt: formatDateText(application.createdAt),
    updatedAt: formatDateText(application.updatedAt)
  }
}

exports.main = async (event) => {
  if (!event || !event.familyId) {
    return failure('VALIDATION_ERROR', '家庭 ID 不能为空')
  }

  const page = Math.max(Number(event.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(event.pageSize || 20), 1), 50)
  const where = {
    familyId: event.familyId
  }

  if (event.status) {
    where.status = event.status
  }

  try {
    const query = db.collection('fundApplications').where(where)
    const countResult = await query.count()
    const listResult = await query
      .orderBy('updatedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    const items = listResult.data.map((item) =>
      buildListItem({
        id: item._id,
        title: item.title,
        amount: item.amount,
        category: item.category,
        status: item.status,
        applicantName: item.applicantName,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })
    )

    return success({
      items,
      total: countResult.total
    })
  } catch (error) {
    return failure('INTERNAL_ERROR', error.message || '查询申请失败')
  }
}
