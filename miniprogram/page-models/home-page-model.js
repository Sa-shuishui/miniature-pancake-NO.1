const service = require('../services/application-service')
const { buildListViewModel } = require('../view-models/application-list-model')

async function loadHomeState(familyId) {
  const result = await service.listApplications({ familyId })
  if (!result.ok) return result

  const viewModel = buildListViewModel(result.data.items)
  return {
    ok: true,
    data: {
      summary: viewModel.summary,
      recentApplications: viewModel.items.slice(0, 3),
      pendingCount: viewModel.summary.pending
    },
    error: null
  }
}

module.exports = {
  loadHomeState
}
