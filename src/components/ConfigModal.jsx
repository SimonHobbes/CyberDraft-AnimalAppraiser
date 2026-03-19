import { useState, useEffect } from 'react'
import InfoTooltip from './InfoTooltip'
import { ITEM_KEYS, ITEM_INFO } from '../data/constants'

export default function ConfigModal({ config, onSave, onClose }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (config) {
      setForm(JSON.parse(JSON.stringify(config)))
    }
  }, [config])

  if (!form) return null

  const update = (path, value) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ 配置设置</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* 基本信息 */}
          <div className="config-section">
            <h3>基本信息</h3>
            <div className="config-grid">
              <div className="config-field">
                <label>
                  配置名称
                  <InfoTooltip text="用于在配置选择器中显示的名称，方便区分不同城市或年份的配置" />
                </label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => update('name', e.target.value)}
                />
              </div>
              <div className="config-field">
                <label>
                  城市名称
                  <InfoTooltip text="此配置对应的城市，不同城市的五险一金比例和基数上下限不同" />
                </label>
                <input
                  type="text"
                  value={form.city || ''}
                  onChange={(e) => update('city', e.target.value)}
                />
              </div>
              <div className="config-field">
                <label>
                  生效年份
                  <InfoTooltip text="配置对应的年份，五险一金的基数上下限通常每年7月调整" />
                </label>
                <input
                  type="number"
                  value={form.year || ''}
                  onChange={(e) => update('year', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* 基数限制 */}
          <div className="config-section">
            <h3>缴费基数上下限</h3>
            <div className="config-grid">
              <div className="config-field">
                <label>
                  社保基数 下限
                  <InfoTooltip text="社保缴费基数的最低限额，通常为当地上年度社会平均工资的60%" />
                </label>
                <input
                  type="number"
                  value={form.socialBase?.min || ''}
                  onChange={(e) => update('socialBase.min', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="config-field">
                <label>
                  社保基数 上限
                  <InfoTooltip text="社保缴费基数的最高限额，通常为当地上年度社会平均工资的300%" />
                </label>
                <input
                  type="number"
                  value={form.socialBase?.max || ''}
                  onChange={(e) => update('socialBase.max', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="config-field">
                <label>
                  公积金基数 下限
                  <InfoTooltip text="住房公积金缴存基数的最低限额，通常为当地最低工资标准" />
                </label>
                <input
                  type="number"
                  value={form.fundBase?.min || ''}
                  onChange={(e) => update('fundBase.min', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="config-field">
                <label>
                  公积金基数 上限
                  <InfoTooltip text="住房公积金缴存基数的最高限额，通常为当地上年度社会平均工资的300%" />
                </label>
                <input
                  type="number"
                  value={form.fundBase?.max || ''}
                  onChange={(e) => update('fundBase.max', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* 公积金比例区间 */}
          <div className="config-section">
            <h3>公积金比例选项 (%)</h3>
            <div className="config-field">
              <label>
                比例范围
                <InfoTooltip text="设置公积金比例滑块的最小值和最大值。各地公积金比例一般在5%~12%之间，由企业在范围内自行确定" />
              </label>
              <div className="config-grid">
                <div className="config-field">
                  <label>最小比例 (%)</label>
                  <input
                    type="number"
                    value={form.fundRatioRange?.[0] || 5}
                    onChange={(e) => {
                      const min = parseFloat(e.target.value) || 5
                      const range = form.fundRatioRange || [5, 12]
                      update('fundRatioRange', [min, range[range.length - 1] || 12])
                    }}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div className="config-field">
                  <label>最大比例 (%)</label>
                  <input
                    type="number"
                    value={form.fundRatioRange?.[form.fundRatioRange.length - 1] || 12}
                    onChange={(e) => {
                      const max = parseFloat(e.target.value) || 12
                      const range = form.fundRatioRange || [5, 12]
                      update('fundRatioRange', [range[0] || 5, max])
                    }}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 五险一金比例 */}
          <div className="config-section">
            <h3>五险一金缴纳比例 (%)</h3>
            <table className="config-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>个人比例 (%)</th>
                  <th>企业比例 (%)</th>
                </tr>
              </thead>
              <tbody>
                {ITEM_KEYS.map((key) => {
                  const item = form.items?.[key]
                  if (!item) return null
                  return (
                    <tr key={key}>
                      <td>
                        {ITEM_INFO[key].label}
                        <InfoTooltip text={ITEM_INFO[key].tooltip} />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.individualRate}
                          onChange={(e) => update(`items.${key}.individualRate`, parseFloat(e.target.value) || 0)}
                          step="0.1"
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.companyRate}
                          onChange={(e) => update(`items.${key}.companyRate`, parseFloat(e.target.value) || 0)}
                          step="0.1"
                          min="0"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-save" onClick={handleSave}>💾 保存配置</button>
        </div>
      </div>
    </div>
  )
}
