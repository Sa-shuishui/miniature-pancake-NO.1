const service = require('../services/application-service')
const { buildDetailViewModel } = require('../view-models/application-detail-model')

async function loadDetailState(applicationId, currentUser) {
  const result = await service.getApplicationDetail(applicationId)
  if (!result.ok) return result

  return {
    ok: true,
    data: buildDetailViewModel(result.data, currentUser),
    error: null
  }
}

async function approveDetailApplication(applicationId, decision, approvalComment, currentUser) {
  return service.approveApplication(
    {
      applicationId,
      decision,
      approvalComment
    },
    currentUser
  )
}

module.exports = {
  loadDetailState,
  approveDetailApplication
}
