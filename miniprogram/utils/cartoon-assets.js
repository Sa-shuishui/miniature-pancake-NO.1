function normalizeGender(gender) {
  return gender === 'male' ? 'male' : 'female'
}

function normalizeRole(role) {
  return role === 'applicant' ? 'applicant' : 'approver'
}

function getRoleScene(gender, role) {
  const genderKey = normalizeGender(gender)
  const roleKey = normalizeRole(role)
  const sceneMap = {
    male: {
      applicant: '/assets/illustrations/scene-male-heart-square.jpg',
      approver: '/assets/illustrations/scene-male-approver-square.jpg'
    },
    female: {
      applicant: '/assets/illustrations/scene-female-applicant-square.jpg',
      approver: '/assets/illustrations/scene-female-approver-square.jpg'
    }
  }

  return sceneMap[genderKey][roleKey]
}

function getHomeScene(gender, role) {
  if (role === 'applicant') {
    return normalizeGender(gender) === 'male'
      ? '/assets/illustrations/scene-male-jar-square.jpg'
      : '/assets/illustrations/scene-female-jar-square.jpg'
  }

  return getRoleScene(gender, role)
}

function getApplyScene(gender) {
  return normalizeGender(gender) === 'male'
    ? '/assets/illustrations/scene-male-heart-square.jpg'
    : '/assets/illustrations/scene-female-applicant-square.jpg'
}

function getListScene(gender) {
  return normalizeGender(gender) === 'male'
    ? '/assets/illustrations/scene-male-approver-square.jpg'
    : '/assets/illustrations/scene-female-approver-square.jpg'
}

function getTrustIcons() {
  return [
    {
      image: '/assets/icons/trust-couple.png',
      title: '情侣专属',
      copy: '只为二人设计'
    },
    {
      image: '/assets/icons/trust-private.png',
      title: '隐私安全',
      copy: '数据仅你们可见'
    },
    {
      image: '/assets/icons/trust-growth.png',
      title: '共同成长',
      copy: '一起规划未来'
    }
  ]
}

module.exports = {
  getRoleScene,
  getHomeScene,
  getApplyScene,
  getListScene,
  getTrustIcons
}
