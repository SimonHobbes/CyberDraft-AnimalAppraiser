/**
 * SVG 饼状图组件
 * 四大色系：实发工资(绿), 个人缴纳(蓝), 企业缴纳(橙红), 低基数差额(灰)
 */
import { ITEM_KEYS, ITEM_INFO } from '../data/constants'

// 实发工资 — 绿色系
const NET_COLOR = '#10b981'

// 个人缴纳 — 蓝色系 (由浅入深)
const INDIVIDUAL_COLORS = {
  pension:     '#60a5fa', // blue-400
  medical:     '#3b82f6', // blue-500
  unemployment:'#2563eb', // blue-600
  workInjury:  '#1d4ed8', // blue-700
  maternity:   '#1e40af', // blue-800
  housingFund: '#93c5fd', // blue-300
}

// 企业缴纳 — 橙红色系 (由浅入深)
const COMPANY_COLORS = {
  pension:     '#fb923c', // orange-400
  medical:     '#f97316', // orange-500
  unemployment:'#ea580c', // orange-600
  workInjury:  '#c2410c', // orange-700
  maternity:   '#9a3412', // orange-800
  housingFund: '#fdba74', // orange-300
}

// 低基数差额 — 灰色系
const SAVINGS_COLORS = {
  pension:     '#9ca3af', // gray-400
  medical:     '#6b7280', // gray-500
  unemployment:'#4b5563', // gray-600
  workInjury:  '#374151', // gray-700
  maternity:   '#1f2937', // gray-800
  housingFund: '#d1d5db', // gray-300
}

function PieSlice({ startAngle, endAngle, color, value, total, cx, cy, r }) {
  if (value <= 0) return null

  const start = (startAngle - 90) * (Math.PI / 180)
  const end = (endAngle - 90) * (Math.PI / 180)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)

  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`

  const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180)
  const labelR = r * 0.65
  const lx = cx + labelR * Math.cos(midAngle)
  const ly = cy + labelR * Math.sin(midAngle)
  const pct = ((value / total) * 100).toFixed(1)

  return (
    <g>
      <path d={d} fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="1" className="pie-slice" />
      {endAngle - startAngle > 15 && (
        <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="9" fontWeight="600">
          {pct}%
        </text>
      )}
    </g>
  )
}

export default function PieChart({ result }) {
  if (!result) return null

  const { netSalary, breakdown } = result
  const segments = []

  // 实发工资
  segments.push({ label: '实发工资', value: netSalary, color: NET_COLOR, group: 'net' })

  // 个人各项
  for (const key of ITEM_KEYS) {
    const item = breakdown[key]
    if (item && item.individualAmount > 0) {
      segments.push({
        label: `${ITEM_INFO[key].label}(个人)`,
        value: item.individualAmount,
        color: INDIVIDUAL_COLORS[key],
        group: 'individual',
      })
    }
  }

  // 企业各项
  for (const key of ITEM_KEYS) {
    const item = breakdown[key]
    if (item && item.companyAmount > 0) {
      segments.push({
        label: `${ITEM_INFO[key].label}(企业)`,
        value: item.companyAmount,
        color: COMPANY_COLORS[key],
        group: 'company',
      })
    }
  }

  // 低基数差额 — 按项细分
  for (const key of ITEM_KEYS) {
    const item = breakdown[key]
    if (item && item.companySavings > 0) {
      segments.push({
        label: `${ITEM_INFO[key].label}(差额)`,
        value: item.companySavings,
        color: SAVINGS_COLORS[key],
        group: 'savings',
      })
    }
  }

  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total <= 0) return null

  const cx = 140, cy = 140, r = 120
  let currentAngle = 0

  // Group segments for legend
  const netSegs = segments.filter((s) => s.group === 'net')
  const indivSegs = segments.filter((s) => s.group === 'individual')
  const compSegs = segments.filter((s) => s.group === 'company')
  const savingsSegs = segments.filter((s) => s.group === 'savings')

  const renderGroup = (titleClass, titleText, segs) => {
    if (segs.length === 0) return null
    return (
      <div className="legend-group">
        <div className={`legend-group-title ${titleClass}`}>{titleText}</div>
        {segs.map((seg, i) => (
          <div key={i} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: seg.color }}></span>
            <span className="legend-label">{seg.label}</span>
            <span className="legend-value">¥{seg.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="pie-container">
      <svg viewBox="0 0 280 280" className="pie-svg">
        {segments.map((seg, i) => {
          const angle = (seg.value / total) * 360
          const slice = (
            <PieSlice
              key={i}
              startAngle={currentAngle}
              endAngle={currentAngle + angle}
              color={seg.color}
              value={seg.value}
              total={total}
              cx={cx} cy={cy} r={r}
            />
          )
          currentAngle += angle
          return slice
        })}
      </svg>

      {/* Row 1: 实发工资 + 个人缴纳 */}
      <div className="pie-legend-row">
        {renderGroup('legend-title-net', '● 实发工资', netSegs)}
        {renderGroup('legend-title-individual', '● 个人缴纳', indivSegs)}
      </div>

      {/* Row 2: 企业缴纳 + 低基数差额 */}
      <div className="pie-legend-row">
        {renderGroup('legend-title-company', '● 企业缴纳', compSegs)}
        {savingsSegs.length > 0 && renderGroup('legend-title-savings', '● 低基数差额', savingsSegs)}
      </div>
    </div>
  )
}
