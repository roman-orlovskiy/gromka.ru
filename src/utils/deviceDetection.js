const sanitizeInput = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

const BRAND_PATTERNS = [
  {
    brand: 'Apple',
    patterns: [/apple/i, /iphone/i, /ipad/i, /mac/i]
  },
  {
    brand: 'Samsung',
    patterns: [/samsung/i, /galaxy/i, /^sm-[a-z0-9]+/i, /^gt-[a-z0-9]+/i]
  },
  {
    brand: 'Huawei',
    patterns: [
      /huawei/i,
      /honor/i,
      /^mna-/i,
      /^ana-/i,
      /^lya-/i,
      /^bla-/i,
      /^eva-/i,
      /-lx\d{1,2}/i
    ]
  },
  {
    brand: 'Xiaomi',
    patterns: [/xiaomi/i, /redmi/i, /poco/i, /^mi\s/i, /^mi\d+/i, /^m\d{2}[a-z]/i]
  },
  {
    brand: 'Google',
    patterns: [/pixel/i]
  },
  {
    brand: 'OnePlus',
    patterns: [/oneplus/i, /^gm\d+/i, /^le\d+/i]
  },
  {
    brand: 'Realme',
    patterns: [/realme/i, /^rmx/i]
  },
  {
    brand: 'Oppo',
    patterns: [/oppo/i, /^cph/i]
  },
  {
    brand: 'Vivo',
    patterns: [/vivo/i, /^v\d{3}/i, /^pd\d{4}/i]
  },
  {
    brand: 'Motorola',
    patterns: [/motorola/i, /moto/i, /^xt\d+/i]
  },
  {
    brand: 'Sony',
    patterns: [/sony/i, /xperia/i]
  },
  {
    brand: 'Nokia',
    patterns: [/nokia/i, /^ta-/i]
  },
  {
    brand: 'Asus',
    patterns: [/asus/i, /zenfone/i]
  },
  {
    brand: 'Lenovo',
    patterns: [/lenovo/i]
  },
  {
    brand: 'LG',
    patterns: [/lg/i, /^lg-/i]
  },
  {
    brand: 'Tecno',
    patterns: [/tecno/i, /^ch\d+/i, /^kg\d+/i]
  },
  {
    brand: 'Meizu',
    patterns: [/meizu/i, /^m\d note/i]
  },
  {
    brand: 'ZTE',
    patterns: [/zte/i, /axon/i, /^z\d+/i]
  }
]

const matchesPattern = (value, pattern) => {
  if (pattern instanceof RegExp) {
    return pattern.test(value)
  }

  const lowerValue = value.toLowerCase()
  const lowerPattern = String(pattern).toLowerCase()
  return lowerValue.includes(lowerPattern)
}

export const normalizeBrandName = (brand) => {
  const normalized = sanitizeInput(brand)
  if (!normalized) {
    return null
  }

  const lower = normalized.toLowerCase()

  if (
    lower === 'unknown' ||
    lower === 'generic' ||
    lower.startsWith('not=') ||
    lower === 'not set'
  ) {
    return null
  }

  return normalized
}

export const detectBrandByModel = (model) => {
  const sanitizedModel = sanitizeInput(model)
  if (!sanitizedModel) {
    return null
  }

  for (const { brand, patterns } of BRAND_PATTERNS) {
    if (patterns.some((pattern) => matchesPattern(sanitizedModel, pattern))) {
      return brand
    }
  }

  return null
}

export const resolveDeviceBrand = ({ brandCandidates = [], modelCandidates = [] } = {}) => {
  for (const candidate of brandCandidates) {
    const normalized = normalizeBrandName(candidate)
    if (normalized) {
      return normalized
    }
  }

  for (const model of modelCandidates) {
    const detectedBrand = detectBrandByModel(model)
    if (detectedBrand) {
      return detectedBrand
    }
  }

  return null
}

