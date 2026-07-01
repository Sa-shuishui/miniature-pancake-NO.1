const { APPLICATION_STATUS } = require('../../utils/constants')
const { getThemeClass } = require('../../utils/theme')
const {
  loadDetailState,
  approveDetailApplication
} = require('../../page-models/detail-page-model')

const DETAIL_HERO_IMAGES = {
  male: '/assets/illustrations/detail-male-approver-hero.png',
  default: '/assets/icons/common-flower-pot-small.png'
}

function getDetailHero(themeClass) {
  const isMaleTheme = themeClass === 'theme-male'
  return {
    image: isMaleTheme ? DETAIL_HERO_IMAGES.male : DETAIL_HERO_IMAGES.default,
    className: isMaleTheme ? 'detail-icon detail-hero-image' : 'detail-icon'
  }
}

Page({
  data: {
    applicationId: '',
    loading: false,
    errorMessage: '',
    themeClass: 'theme-female',
    detailHeroImage: DETAIL_HERO_IMAGES.default,
    detailHeroClass: 'detail-icon',
    approvalComment: '',
    viewModel: null
  },

  onLoad(options) {
    this.setData({ applicationId: options.id || '' })
    this.loadData()
  },

  async loadData() {
    const app = getApp()
    const themeClass = app.globalData.themeClass || getThemeClass(app.globalData.gender)
    const detailHero = getDetailHero(themeClass)

    this.setData({
      loading: true,
      errorMessage: '',
      themeClass,
      detailHeroImage: detailHero.image,
      detailHeroClass: detailHero.className
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
