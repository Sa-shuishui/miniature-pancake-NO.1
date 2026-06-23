const {
  initApplyState,
  updateApplyField,
  addApplyImage,
  removeApplyImage,
  submitApplication
} = require('../../page-models/apply-page-model')
const { uploadApplicationImages } = require('../../services/file-service')
const { getApplyScene } = require('../../utils/cartoon-assets')
const { getThemeClass } = require('../../utils/theme')
const {
  configureRoleTabBar,
  isApproverRole,
  syncCustomTabBar
} = require('../../utils/role-ui')

Page({
  data: {
    themeClass: 'theme-female',
    formState: null,
    submitting: false,
    heroImage: '/assets/icons/common-flower-pot.png'
  },

  onLoad() {
    const app = getApp()
    configureRoleTabBar(app.globalData.role)
    syncCustomTabBar(this, 'apply', app.globalData.role, app.globalData.gender)
    if (isApproverRole(app.globalData.role)) {
      app.globalData.applicationStatusFilter = 'pending'
      wx.switchTab({ url: '/pages/applications/applications' })
      return
    }
    this.setData({
      themeClass: app.globalData.themeClass || getThemeClass(app.globalData.gender),
      heroImage: getApplyScene(app.globalData.gender),
      formState: initApplyState(app.globalData.currentFamilyId)
    })
  },

  onShow() {
    const app = getApp()
    configureRoleTabBar(app.globalData.role)
    syncCustomTabBar(this, 'apply', app.globalData.role, app.globalData.gender)
    if (isApproverRole(app.globalData.role)) {
      app.globalData.applicationStatusFilter = 'pending'
      wx.switchTab({ url: '/pages/applications/applications' })
      return
    }
    this.setData({
      themeClass: app.globalData.themeClass || getThemeClass(app.globalData.gender),
      heroImage: getApplyScene(app.globalData.gender)
    })
  },

  onFieldInput(event) {
    const app = getApp()
    const { field } = event.currentTarget.dataset
    const value = event.detail.value

    this.setData({
      formState: updateApplyField(
        this.data.formState,
        field,
        value,
        app.globalData.currentFamilyId
      )
    })
  },

  onCategoryChange(event) {
    const app = getApp()
    const index = Number(event.detail.value)
    const category = this.data.formState.categoryOptions[index] || ''
    this.setData({
      formState: updateApplyField(
        this.data.formState,
        'category',
        category,
        app.globalData.currentFamilyId
      )
    })
  },

  chooseImage() {
    const app = getApp()
    const remainCount = 3 - ((this.data.formState.form.images || []).length)
    if (remainCount <= 0) return

    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        let nextState = this.data.formState
        ;(result.tempFilePaths || []).forEach((path) => {
          nextState = addApplyImage(nextState, path, app.globalData.currentFamilyId)
        })
        this.setData({ formState: nextState })
      }
    })
  },

  removeImage(event) {
    const app = getApp()
    const { path } = event.currentTarget.dataset
    this.setData({
      formState: removeApplyImage(this.data.formState, path, app.globalData.currentFamilyId)
    })
  },

  async submit() {
    const app = getApp()
    this.setData({ submitting: true })

    const uploadResult = await uploadApplicationImages(this.data.formState.form.images || [], {
      familyId: app.globalData.currentFamilyId
    })

    if (!uploadResult.ok) {
      this.setData({ submitting: false })
      wx.showToast({ title: uploadResult.error.message, icon: 'none' })
      return
    }

    const submitState = updateApplyField(
      this.data.formState,
      'images',
      uploadResult.data,
      app.globalData.currentFamilyId
    )

    const result = await submitApplication(
      submitState,
      app.globalData.currentFamilyId,
      app.globalData.currentUser
    )

    this.setData({ submitting: false })

    if (!result.ok) {
      wx.showToast({ title: result.error.message, icon: 'none' })
      return
    }

    wx.showToast({ title: '已提交', icon: 'success' })
    wx.switchTab({ url: '/pages/applications/applications' })
  }
})
