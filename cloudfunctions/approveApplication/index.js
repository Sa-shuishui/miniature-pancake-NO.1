const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

function success(data) {
  return { ok: true, data, error: null }
}

function failure(code, message) {
  return { ok: false, data: null, error: { code, message } }
}

function validateApprovePayload(payload) {
  if (!payload || !payload.applicationId) {
    return failure('VALIDATION_ERROR', '申请 ID 不能为空')
  }

  if (!['approved', 'rejected'].includes(payload.decision)) {
    return failure('VALIDATION_ERROR', '审批结果只能是通过或驳回')
  }

  return success({})
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const validation = validateApprovePayload(event)
  if (!validation.ok) return validation
  const currentUser = event.currentUser || {}

  if (currentUser.role && currentUser.role !== 'approver') {
    return failure('FORBIDDEN', '当前用户不是审批者')
  }

  try {
    const applicationResult = await db
      .collection('fundApplications')
      .doc(event.applicationId)
      .get()
    const application = applicationResult.data

    if (application.status !== 'pending') {
      return failure('INVALID_STATUS', '只有待审批申请可以审批')
    }

    if (application.applicantOpenId === wxContext.OPENID) {
      return failure('FORBIDDEN', '申请者不能审批自己的申请')
    }

    if (application.approverOpenId && application.approverOpenId !== wxContext.OPENID) {
      return failure('FORBIDDEN', '当前用户没有审批权限')
    }

    const now = new Date()
    await db
      .collection('fundApplications')
      .doc(event.applicationId)
      .update({
        data: {
          status: event.decision,
          approvalComment: event.approvalComment || '',
          approverOpenId: application.approverOpenId || wxContext.OPENID,
          approverName: currentUser.name || event.approverName || application.approverName || '审批方',
          updatedAt: now,
          approvedAt: now
        }
      })

    await db.collection('applicationEvents').add({
      data: {
        applicationId: event.applicationId,
        actorOpenId: wxContext.OPENID,
        actorName: currentUser.name || event.approverName || application.approverName || '审批方',
        action: event.decision,
        fromStatus: 'pending',
        toStatus: event.decision,
        comment: event.approvalComment || '',
        createdAt: now
      }
    })

    return success({
      id: event.applicationId,
      status: event.decision,
      approvalComment: event.approvalComment || '',
      approvedAt: now
    })
  } catch (error) {
    return failure('INTERNAL_ERROR', error.message || '审批申请失败')
  }
}
