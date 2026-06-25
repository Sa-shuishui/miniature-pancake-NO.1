const { APPLICATION_STATUS, STATUS_LABELS } = require('../utils/constants')
const { formatAmount } = require('../utils/format')

function canApprove(application, currentUser) {
  if (!application || application.status !== APPLICATION_STATUS.PENDING) return false
  if (!currentUser || !currentUser.id) return true

  if (currentUser.role === 'applicant') return false
  if (application.approverId) return application.approverId === currentUser.id

  return currentUser.role === 'approver'
}

function buildDetailViewModel(application, currentUser) {
  if (!application) {
    return {
      exists: false,
      canApprove: false,
      canReject: false,
      application: null
    }
  }

  const approvalEnabled = canApprove(application, currentUser)

  return {
    exists: true,
    canApprove: approvalEnabled,
    canReject: approvalEnabled,
    application: {
      ...application,
      amountText: formatAmount(application.amount),
      statusLabel: STATUS_LABELS[application.status] || application.status,
      hasImages: Boolean(application.images && application.images.length),
      hasProductLink: Boolean(application.productLink),
      events: application.events || []
    }
  }
}

module.exports = {
  canApprove,
  buildDetailViewModel
}
