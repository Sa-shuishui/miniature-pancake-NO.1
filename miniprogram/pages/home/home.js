const { loadHomeState } = require('../../page-models/home-page-model')
const { getHomeScene } = require('../../utils/cartoon-assets')
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
    summary: null,
    recentApplications: [],
    pendingCount: 0,
    heroImage: '/assets/icons/common-flower-pot.png',
    role: 'approver',
    isApprover: true,
    heroTitle: '今天也好好回应共同花',
    heroCopy: '看看对方认真提交的需求，把共同资金用在两个人都认可的生活里。',
    primaryActionText: '查看待审批',
    secondaryActionText: '查看全部'
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const app = getApp()
    const isApprover = isApproverRole(app.globalData.role)
    configureRoleTabBar(app.globalData.role)
    syncCustomTabBar(this, 'home', app.globalData.role, app.globalData.gender)
    this.setData({
      loading: true,
      errorMessage: '',
      themeClass: app.globalData.themeClass || getThemeClass(app.globalData.gender),
      heroImage: getHomeScene(app.globalData.gender, app.globalData.role),
      role: app.globalData.role || 'approver',
      isApprover,
      heroTitle: !isApprover
        ? '今天也好好商量花钱'
        : '今天也好好回应共同花',
      heroCopy: !isApprover
        ? '把想买的东西认真说清楚，把共同资金花在两个人都认可的生活里。'
        : '对方提交的每一笔共同资金，都可以在这里查看、审批和留下建议。',
      primaryActionText: !isApprover ? '提交申请' : '查看待审批',
      secondaryActionText: !isApprover ? '查看列表' : '记账'
    })

    const result = await loadHomeState(app.globalData.currentFamilyId)
    if (!result.ok) {
      this.setData({ loading: false, errorMessage: result.error.message })
      return
    }

    this.setData({
      loading: false,
      summary: result.data.summary,
      recentApplications: result.data.recentApplications,
      pendingCount: result.data.pendingCount
    })
  },

  goApply() {
    if (this.data.isApprover) {
      const app = getApp()
      app.globalData.applicationStatusFilter = 'pending'
      wx.switchTab({ url: '/pages/applications/applications' })
      return
    }
    wx.switchTab({ url: '/pages/apply/apply' })
  },

  goApplications() {
    const app = getApp()
    app.globalData.applicationStatusFilter = 'all'
    app.globalData.activeTabKey = 'applications'
    wx.switchTab({ url: '/pages/applications/applications' })
  },

  goSecondaryAction() {
    if (this.data.isApprover) {
      const app = getApp()
      app.globalData.applicationStatusFilter = 'all'
      app.globalData.activeTabKey = 'applications'
      app.globalData.showLedgerShortcut = true
      wx.switchTab({ url: '/pages/applications/applications' })
      return
    }

    this.goApplications()
  },

  openDetail(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
