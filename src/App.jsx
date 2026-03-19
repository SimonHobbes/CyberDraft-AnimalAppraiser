import { useState, useEffect, useMemo, useCallback } from 'react'
import Toolbar from './components/Toolbar'
import SalaryTable from './components/SalaryTable'
import PieChart from './components/PieChart'
import ConfigModal from './components/ConfigModal'
import InfoTooltip from './components/InfoTooltip'
import { calculate } from './utils/calculator'
import { decodeState, pushStateToUrl, generateShareUrl } from './utils/urlState'
import {
  loadBuiltinConfigs,
  getSavedConfigs,
  saveConfig,
  getActiveConfigKey,
  setActiveConfigKey,
  exportConfig,
  importConfig,
} from './data/configManager'

function App() {
  const [configs, setConfigs] = useState({})
  const [activeKey, setActiveKey] = useState('default')
  const [activeConfig, setActiveConfig] = useState(null)
  const [grossSalary, setGrossSalary] = useState(0)
  const [paymentBase, setPaymentBase] = useState(0)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState('')

  // 从 URL 恢复状态
  const restored = useMemo(() => decodeState(), [])

  // 加载配置
  useEffect(() => {
    async function init() {
      const builtins = await loadBuiltinConfigs()
      const saved = getSavedConfigs()
      const all = { ...builtins, ...saved }
      setConfigs(all)

      // 恢复状态
      if (restored) {
        if (restored.config) {
          const rkey = 'url_restored'
          all[rkey] = restored.config
          setConfigs({ ...all })
          setActiveKey(rkey)
          setActiveConfig(JSON.parse(JSON.stringify(restored.config)))
        }
        if (restored.grossSalary) setGrossSalary(restored.grossSalary)
        if (restored.paymentBase) setPaymentBase(restored.paymentBase)
      } else {
        const savedKey = getActiveConfigKey()
        const key = all[savedKey] ? savedKey : 'default'
        setActiveKey(key)
        if (all[key]) {
          setActiveConfig(JSON.parse(JSON.stringify(all[key])))
        }
      }

      setLoading(false)
    }
    init()
  }, [])

  // 切换配置
  const handleSelectConfig = useCallback((key) => {
    setActiveKey(key)
    setActiveConfigKey(key)
    if (configs[key]) {
      setActiveConfig(JSON.parse(JSON.stringify(configs[key])))
    }
  }, [configs])

  // 修改比例（在主表格中直接修改）
  const handleRateChange = useCallback((itemKey, field, value) => {
    setActiveConfig((prev) => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev))
      if (next.items[itemKey]) {
        next.items[itemKey][field] = value
      }
      return next
    })
  }, [])

  // 配置保存
  const handleSaveConfig = useCallback((newConfig) => {
    const key = `custom_${Date.now()}`
    saveConfig(key, newConfig)
    setConfigs((prev) => ({ ...prev, [key]: newConfig }))
    setActiveKey(key)
    setActiveConfigKey(key)
    setActiveConfig(JSON.parse(JSON.stringify(newConfig)))
    showToast('配置已保存 ✓')
  }, [])

  // 导入
  const handleImport = useCallback(async () => {
    try {
      const cfg = await importConfig()
      const key = `import_${Date.now()}`
      saveConfig(key, cfg)
      setConfigs((prev) => ({ ...prev, [key]: cfg }))
      setActiveKey(key)
      setActiveConfigKey(key)
      setActiveConfig(JSON.parse(JSON.stringify(cfg)))
      showToast(`已导入配置: ${cfg.name}`)
    } catch (e) {
      showToast(`导入失败: ${e.message}`)
    }
  }, [])

  // 导出
  const handleExport = useCallback(() => {
    if (activeConfig) {
      exportConfig(activeConfig)
      showToast('配置已导出 ✓')
    }
  }, [activeConfig])

  // 分享
  const handleShare = useCallback(async () => {
    const state = {
      config: activeConfig,
      grossSalary,
      paymentBase,
    }
    const url = generateShareUrl(state)
    try {
      await navigator.clipboard.writeText(url)
      showToast('分享链接已复制到剪贴板 ✓')
    } catch {
      showToast('复制失败，请手动复制地址栏链接')
    }
  }, [activeConfig, grossSalary, paymentBase])

  // Toast
  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // 同步到 URL
  useEffect(() => {
    if (grossSalary > 0 && activeConfig) {
      pushStateToUrl({ config: activeConfig, grossSalary, paymentBase })
    }
  }, [activeConfig, grossSalary, paymentBase])

  // 计算
  const result = useMemo(() => {
    if (!activeConfig || grossSalary <= 0) return null
    return calculate(grossSalary, paymentBase || grossSalary, activeConfig)
  }, [grossSalary, paymentBase, activeConfig])

  const fmt = (n) => n?.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '—'

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>🐴 牛马的自我养成</h1>
          <p className="app-subtitle">跨地区薪资与五险一金推演工具 — 打破信息差，明明白白做牛马</p>
        </div>
        <div className="header-right">
          <span className="header-hint">如有问题请反馈 / 分享牛马经历 ➔</span>
          <a
            className="header-github"
            href="https://github.com/SimonHobbes/CyberDraft-AnimalAppraiser/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 反馈 / Issues
          </a>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        configs={configs}
        activeKey={activeKey}
        onSelectConfig={handleSelectConfig}
        onOpenSettings={() => setShowConfigModal(true)}
        onImport={handleImport}
        onExport={handleExport}
        onShare={handleShare}
      />

      {/* Main Content */}
      <div className="main-layout">
        {/* Left: Salary Detail Table + Summary */}
        <div className="panel panel-left">
          <SalaryTable
            grossSalary={grossSalary}
            paymentBase={paymentBase || grossSalary}
            config={activeConfig}
            result={result}
            onGrossChange={(v) => {
              setGrossSalary(v)
              if (!paymentBase || paymentBase === 0) {
                // 默认基数跟随应发
              }
            }}
            onBaseChange={setPaymentBase}
            onRateChange={handleRateChange}
          />

          {result && (
            <div className="summary-row">
              <div className="summary-card card-company">
                <div className="card-title">
                  企业总支出
                  <InfoTooltip text="企业实际为你支出的总金额=应发工资+企业缴纳的五险一金" />
                </div>
                <div className="card-value">¥{fmt(result.totalCompanyCost)}</div>
              </div>

              <div className="summary-card card-savings">
                <div className="card-title">
                  低基数缴费差额
                  <InfoTooltip text="企业按低基数而非应发工资缴纳五险一金时少支出的总金额。如遇此情况，离职时可向社保局提出让企业补缴的要求" />
                </div>
                <div className="card-value card-value-warn">
                  {result.companySavings > 0 ? `¥${fmt(result.companySavings)}` : '¥0.00'}
                </div>
                {result.companySavings > 0 && (
                  <div className="card-desc">
                    若按应发缴费: ¥{fmt(result.totalCompanyCostFull)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Charts */}
        <div className="panel panel-right">
          {result ? (
            <PieChart result={result} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🐴</div>
              <p>输入应发工资开始计算</p>
              <p className="empty-hint">在左侧填入你的月薪，牛马！</p>
            </div>
          )}
        </div>
      </div>



      {/* Config Modal */}
      {showConfigModal && (
        <ConfigModal
          config={activeConfig}
          onSave={handleSaveConfig}
          onClose={() => setShowConfigModal(false)}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="toast">{toastMsg}</div>
      )}
    </div>
  )
}

export default App
