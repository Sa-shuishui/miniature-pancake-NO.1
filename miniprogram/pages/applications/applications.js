const { loadApplicationsState } = require('../../page-models/applications-page-model')
const {
  loadAccountingState,
  updateAccountingField,
  buildAccountingFormState,
  submitAccountingRecord
} = require('../../page-models/accounting-page-model')
const { getListScene } = require('../../utils/cartoon-assets')
const { getThemeClass } = require('../../utils/theme')
const {
  configureRoleTabBar,
  isApproverRole,
  syncCustomTabBar
} = require('../../utils/role-ui')

Page({
  data: {
    loading: false,
    errorMessage: '',
    themeClass: 'theme-female',
    activeStatus: '',
    viewModel: null,
    heroImage: '/assets/icons/common-flower-pot.png',
    isApprover: true,
    listTitle: '待你回应的共同花',
    listCopyPrefix: '当前有',
    accounting: null,
    accountingSubmitting: false,
    shouldFocusLedger: false
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const app = getApp()
    configureRoleTabBar(app.globalData.role)
    const requestedStatus = app.globalData.applicationStatusFilter
    const shouldFocusLedger = Boolean(app.globalData.showLedgerShortcut)
    const wantsAll = requestedStatus === 'all'
    const isApprover = isApproverRole(app.globalData.role)
    const hasManualFilter = Object.prototype.hasOwnProperty.call(app.globalData, 'applicationStatusFilter')
      && requestedStatus !== undefined
      && requestedStatus !== null
      && requestedStatus !== ''
    const nextStatus = wantsAll ? '' : requestedStatus || this.data.activeStatus
    const statusToLoad = wantsAll || hasManualFilter
      ? nextStatus
      : (isApprover && !nextStatus ? 'pending' : nextStatus)
    const selectedKey = app.globalData.activeTabKey || (statusToLoad === 'pending' && isApprover ? 'pending' : 'applications')
    app.globalData.applicationStatusFilter = ''
    app.globalData.activeTabKey = ''
    app.globalData.showLedgerShortcut = false
    syncCustomTabBar(this, selectedKey, app.globalData.role, app.globalData.gender)
    this.setData({
      loading: true,
      errorMessage: '',
      themeClass: app.globalData.themeClass || getThemeClass(app.globalData.gender),
      heroImage: getListScene(app.globalData.gender),
      activeStatus: statusToLoad,
      isApprover,
      listTitle: isApprover ? '待你回应的共同花' : '每一笔共同资金，都有来有回',
      listCopyPrefix: isApprover ? '需要你认真看看的是' : '当前共有',
      shouldFocusLedger
    })

    const result = await loadApplicationsState(
      app.globalData.currentFamilyId,
      statusToLoad
    )

    if (!result.ok) {
      this.setData({ loading: false, errorMessage: result.error.message })
      return
    }

    this.setData({
      loading: false,
      viewModel: result.data
    })

    if (isApprover) {
      await this.loadAccounting()
      if (shouldFocusLedger) {
        wx.pageScrollTo({ selector: '#ledgerPanel', duration: 260 })
      }
    }
  },

  async loadAccounting() {
    const app = getApp()
    const result = await loadAccountingState(app.globalData.currentFamilyId)
    if (!result.ok) {
      wx.showToast({ title: result.error.message, icon: 'none' })
      return
    }

    this.setData({ accounting: result.data })
  },

  onAccountingInput(event) {
    const { field } = event.currentTarget.dataset
    const value = event.detail.value
    const form = updateAccountingField(this.data.accounting.formState.form, field, value)
    this.setData({
      'accounting.formState': buildAccountingFormState(form)
    })
  },

  async submitAccounting() {
    if (!this.data.accounting) return
    const app = getApp()
    this.setData({ accountingSubmitting: true })
    const result = await submitAccountingRecord(
      this.data.accounting.formState,
      app.globalData.currentFamilyId,
      app.globalData.currentUser
    )
    this.setData({ accountingSubmitting: false })

    if (!result.ok) {
      this.setData({ 'accounting.formState': result.data || this.data.accounting.formState })
      wx.showToast({ title: result.error.message, icon: 'none' })
      return
    }

    wx.showToast({ title: '已记一笔', icon: 'success' })
    this.loadAccounting()
  },

  changeFilter(event) {
    const { status } = event.currentTarget.dataset
    const app = getApp()
    app.globalData.applicationStatusFilter = status || 'all'
    app.globalData.activeTabKey = status === 'pending' && this.data.isApprover ? 'pending' : 'applications'
    this.setData({ activeStatus: status || '' })
    this.loadData()
  },

  openDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
