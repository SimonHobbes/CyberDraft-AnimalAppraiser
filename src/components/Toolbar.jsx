const CONFIG_DISPLAY = {
  default: '通用模板',
  custom: '自定义配置',
}

export default function Toolbar({
  configs,
  activeKey,
  onSelectConfig,
  onOpenSettings,
  onImport,
  onExport,
  onShare,
}) {
  const displayName = (cfg, key) => {
    const isUrl = key.startsWith('url_restored_')
    const name = CONFIG_DISPLAY[cfg.name] || cfg.name || key
    return `${isUrl ? '🔗 [URL获取] ' : ''}${name} [${cfg.year || ''}]`
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="config-select">配置：</label>
        <select
          id="config-select"
          className="toolbar-select"
          value={activeKey}
          onChange={(e) => onSelectConfig(e.target.value)}
        >
          {Object.entries(configs).map(([key, cfg]) => (
            <option key={key} value={key}>
              {displayName(cfg, key)}
            </option>
          ))}
        </select>
      </div>
      <div className="toolbar-actions">
        <button className="toolbar-btn" onClick={onOpenSettings} title="设置配置">
          ⚙️ 设置
        </button>
        <button className="toolbar-btn" onClick={onImport} title="导入配置">
          📥 导入
        </button>
        <button className="toolbar-btn" onClick={onExport} title="导出配置">
          📤 导出
        </button>
        <button className="toolbar-btn toolbar-btn-accent" onClick={onShare} title="URL分享">
          🔗 分享
        </button>
      </div>
    </div>
  )
}
