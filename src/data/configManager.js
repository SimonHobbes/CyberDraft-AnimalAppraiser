/**
 * 配置管理器
 * 管理五险一金配置的加载、保存、导入、导出
 */

const CONFIG_STORAGE_KEY = 'niuma_configs'
const ACTIVE_CONFIG_KEY = 'niuma_active_config'

/**
 * 获取内置配置列表（从 public/configs/ 目录加载）
 */
export async function loadBuiltinConfigs() {
  try {
    // 使用 import.meta.env.BASE_URL 确保在 GitHub Pages 下能正确拼接仓库路径
    const baseUrl = import.meta.env.BASE_URL
    const res = await fetch(`${baseUrl}configs/default.json`)
    if (!res.ok) throw new Error('Failed to load default config')
    const config = await res.json()
    return { default: config }
  } catch (e) {
    console.error('Error loading builtin configs:', e)
    return {}
  }
}

/**
 * 从 localStorage 获取所有已保存的自定义配置
 */
export function getSavedConfigs() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * 保存配置到 localStorage
 */
export function saveConfig(key, config) {
  const all = getSavedConfigs()
  all[key] = config
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(all))
}

/**
 * 删除配置
 */
export function deleteConfig(key) {
  const all = getSavedConfigs()
  delete all[key]
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(all))
}

/**
 * 获取当前活跃的配置 key
 */
export function getActiveConfigKey() {
  return localStorage.getItem(ACTIVE_CONFIG_KEY) || 'default'
}

/**
 * 设置当前活跃配置
 */
export function setActiveConfigKey(key) {
  localStorage.setItem(ACTIVE_CONFIG_KEY, key)
}

/**
 * 导出配置为 JSON 文件下载
 */
export function exportConfig(config, filename) {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `config_${config.city || 'custom'}_${config.year || ''}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 从文件导入配置 (返回 Promise)
 */
export function importConfig() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return reject(new Error('No file selected'))
      try {
        const text = await file.text()
        const config = JSON.parse(text)
        // 基本验证
        if (!config.items || !config.name) {
          throw new Error('Invalid config format: missing items or name')
        }
        resolve(config)
      } catch (err) {
        reject(err)
      }
    }
    input.click()
  })
}

/**
 * 创建空白配置模板
 */
export function createBlankConfig() {
  return {
    name: 'custom',
    year: new Date().getFullYear(),
    city: 'custom',
    socialBase: { min: 0, max: 0 },
    fundBase: { min: 0, max: 0 },
    fundRatioRange: [5, 7, 12],
    items: {
      pension: { individualRate: 8, companyRate: 16 },
      medical: { individualRate: 2, companyRate: 9.5 },
      unemployment: { individualRate: 0.5, companyRate: 0.5 },
      workInjury: { individualRate: 0, companyRate: 0.4 },
      maternity: { individualRate: 0, companyRate: 0.8 },
      housingFund: { individualRate: 12, companyRate: 12 },
    },
  }
}
