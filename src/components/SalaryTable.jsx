import InfoTooltip from './InfoTooltip'
import { ITEM_KEYS, ITEM_INFO } from '../data/constants'

const fmt = (n) => {
  if (n === undefined || n === null || isNaN(n)) return '—'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function SalaryTable({
  grossSalary,
  paymentBase,
  config,
  result,
  onGrossChange,
  onBaseChange,
  onRateChange,
}) {
  if (!config || !config.items) return null

  // 公积金滑块范围
  const fundRange = config.fundRatioRange || [5, 12]
  const fundMin = fundRange[0] || 5
  const fundMax = fundRange[fundRange.length - 1] || 12

  return (
    <div className="salary-table-container">
      {/* 第一行: 应发工资 / 缴纳基数 / 实发工资 */}
      <div className="salary-row salary-header-row">
        <div className="salary-cell">
          <label className="cell-label">
            应发工资 (元)
            <InfoTooltip text="应发工资即劳动合同中约定的税前月薪总额，也是HR口中的'月薪'" />
          </label>
          <input
            id="gross-salary"
            type="number"
            className="cell-input cell-input-primary"
            value={grossSalary || ''}
            onChange={(e) => onGrossChange(parseFloat(e.target.value) || 0)}
            placeholder="输入应发工资"
            min="0"
            step="100"
          />
        </div>
        <div className="salary-cell">
          <label className="cell-label">
            缴纳基数 (元)
            <InfoTooltip text="缴纳基数通常应等于应发工资，但有些企业为降低成本会按最低基数缴纳。拖动滑块调整基数" />
          </label>
          <div className="base-slider-group">
            <input
              id="payment-base"
              type="range"
              className="base-slider"
              min={config.socialBase?.min || 0}
              max={grossSalary || config.socialBase?.max || 50000}
              step="1"
              value={Math.min(paymentBase || grossSalary || 0, grossSalary || 0)}
              onChange={(e) => onBaseChange(parseFloat(e.target.value) || 0)}
            />
            <input
              type="number"
              className="slider-number-input"
              value={paymentBase || grossSalary || 0}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0
                const max = grossSalary || config.socialBase?.max || 50000
                onBaseChange(Math.min(Math.max(v, config.socialBase?.min || 0), max))
              }}
              min={config.socialBase?.min || 0}
              max={grossSalary || config.socialBase?.max || 50000}
              step="1"
            />
          </div>
        </div>
        <div className="salary-cell">
          <label className="cell-label">
            实发工资 (元)
            <InfoTooltip text="实发工资=应发工资-个人五险一金缴纳合计（此处未扣除个人所得税）" />
          </label>
          <div className="cell-result">
            {result ? `¥${fmt(result.netSalary)}` : '—'}
          </div>
        </div>
      </div>

      {/* 五险一金明细表 */}
      <table className="detail-table">
        <thead>
          <tr>
            <th className="col-name">项目</th>
            <th className="col-amount">个人应缴</th>
            <th className="col-rate">缴纳比例 (%)</th>
            <th className="col-amount">企业应缴</th>
            <th className="col-rate">缴纳比例 (%)</th>
          </tr>
        </thead>
        <tbody>
          {ITEM_KEYS.map((key) => {
            const item = config.items[key]
            if (!item) return null
            const bd = result?.breakdown?.[key]
            const isHousingFund = key === 'housingFund'

            return (
              <tr key={key}>
                <td className="col-name">
                  <span className="item-label">{ITEM_INFO[key].label}</span>
                  <InfoTooltip text={ITEM_INFO[key].tooltip} />
                </td>
                <td className="col-amount mono">
                  {bd ? `¥${fmt(bd.individualAmount)}` : '—'}
                </td>
                <td className="col-rate">
                  {isHousingFund ? (
                    <div className="slider-group">
                      <input
                        type="range"
                        className="fund-slider"
                        min={fundMin}
                        max={fundMax}
                        step="1"
                        value={item.individualRate}
                        onChange={(e) => {
                          const v = parseInt(e.target.value)
                          onRateChange(key, 'individualRate', v)
                          onRateChange(key, 'companyRate', v)
                        }}
                      />
                      <span className="slider-value">{item.individualRate}%</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      className="rate-input"
                      value={item.individualRate}
                      onChange={(e) => onRateChange(key, 'individualRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  )}
                </td>
                <td className="col-amount mono">
                  {bd ? `¥${fmt(bd.companyAmount)}` : '—'}
                </td>
                <td className="col-rate">
                  {isHousingFund ? (
                    <div className="slider-group">
                      <input
                        type="range"
                        className="fund-slider"
                        min={fundMin}
                        max={fundMax}
                        step="1"
                        value={item.companyRate}
                        onChange={(e) => {
                          const v = parseInt(e.target.value)
                          onRateChange(key, 'companyRate', v)
                          onRateChange(key, 'individualRate', v)
                        }}
                      />
                      <span className="slider-value">{item.companyRate}%</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      className="rate-input"
                      value={item.companyRate}
                      onChange={(e) => onRateChange(key, 'companyRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td className="col-name"><strong>合计</strong></td>
            <td className="col-amount mono"><strong>{result ? `¥${fmt(result.totalIndividual)}` : '—'}</strong></td>
            <td className="col-rate"></td>
            <td className="col-amount mono"><strong>{result ? `¥${fmt(result.totalCompany)}` : '—'}</strong></td>
            <td className="col-rate"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
