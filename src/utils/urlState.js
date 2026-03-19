/**
 * URL 状态压缩与解压
 * 使用 lz-string 将表单状态压缩到 URL hash 中
 */
import LZString from 'lz-string'

/**
 * 将状态对象编码并写入 URL hash
 */
export function encodeState(state) {
  try {
    const json = JSON.stringify(state)
    const compressed = LZString.compressToEncodedURIComponent(json)
    return compressed
  } catch (e) {
    console.error('Failed to encode state:', e)
    return ''
  }
}

/**
 * 从 URL hash 中读取并解压状态
 */
export function decodeState() {
  try {
    const hash = window.location.hash.slice(1) // 去掉 #
    if (!hash) return null
    const json = LZString.decompressFromEncodedURIComponent(hash)
    if (!json) return null
    return JSON.parse(json)
  } catch (e) {
    console.error('Failed to decode state from URL:', e)
    return null
  }
}

/**
 * 将状态更新到浏览器 URL hash (不触发页面刷新)
 */
export function pushStateToUrl(state) {
  const compressed = encodeState(state)
  if (compressed) {
    window.history.replaceState(null, '', `#${compressed}`)
  }
}

/**
 * 生成包含状态的完整 URL
 */
export function generateShareUrl(state) {
  const compressed = encodeState(state)
  const url = new URL(window.location.href)
  url.hash = compressed
  return url.toString()
}
