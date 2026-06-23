const { APPLICATION_STATUS } = require('../../utils/constants')
const { getThemeClass } = require('../../utils/theme')
const {
  loadDetailState,
  approveDetailApplication
} = require('../../page-models/detail-page-model')

Page({
  data: {
    applicationId: '',
    loading: false,
    errorMessage: '',
    themeClass: 'theme-female',
    approvalComment: '',
    viewModel: null
  },

  onLoad(options) {
    this.setData({ applicationId: options.id || '' })
    this.loadData()
  },

  async loadData() {
    const app = getApp()
    this.setData({
      loading: true,
      errorMessage: '',
      themeClass: app.globalData.themeClass || getThemeClass(app.globalData.gender)
    })

    const result = await loadDetailState(this.data.applicationId, app.globalData.currentUser)
    if (!result.ok) {
      this.setData({ loading: false, errorMessage: result.error.message })
      return
    }

    this.setData({
      loading: false,
      viewModel: result.data
    })
  },

  onCommentInput(event) {
    this.setData({ approvalComment: event.detail.value })
  },

  approve() {
    this.submitDecision(APPLICATION_STATUS.APPROVED)
  },

  reject() {
    this.submitDecision(APPLICATION_STATUS.REJECTED)
  },

  async submitDecision(decision) {
    const app = getApp()
    const result = await approveDetailApplication(
      this.data.applicationId,
      decision,
      this.data.approvalComment,
      app.globalData.currentUser
    )

    if (!result.ok) {
      wx.showToast({ title: result.error.message, icon: 'none' })
      return
    }

    wx.showToast({
      title: decision === APPLICATION_STATUS.APPROVED ? '已通过' : '已驳回',
      icon: 'success'
    })
    this.loadData()
  }
})
