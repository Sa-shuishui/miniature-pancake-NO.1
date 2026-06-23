Component({
  methods: {
    goBack() {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length > 1) {
        wx.navigateBack({ delta: 1 })
        return
      }

      const currentRoute = pages[0] && pages[0].route
      if (currentRoute && currentRoute !== 'pages/onboarding/gender/gender') {
        wx.reLaunch({ url: '/pages/onboarding/gender/gender' })
        return
      }

      wx.showToast({ title: '已经是第一页', icon: 'none' })
    }
  }
})
