const RUNTIME_CONFIG = {
  dataSource: 'cloud',
  fileDataSource: 'cloud',
  cloudEnvId: 'cloud1-d7gi5ipgg98cc8cc8',
  currentFamilyId: 'family_001',
  gender: 'female',
  role: 'approver',
  themeClass: 'theme-female',
  currentUser: {
    id: 'user_wife',
    name: '审批者',
    role: 'approver',
    gender: 'female',
    avatar: '/assets/avatars/female-approver.jpg'
  }
}

function getRuntimeConfig() {
  return {
    ...RUNTIME_CONFIG,
    currentUser: { ...RUNTIME_CONFIG.currentUser }
  }
}

module.exports = {
  getRuntimeConfig
}
