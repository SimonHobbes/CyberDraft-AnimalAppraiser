/**
 * 薪资计算引擎
 * 不含个税，只计算五险一金
 * 实发工资 = 应发工资 - 个人五险一金合计
 */

/**
 * 夹取缴费基数
 */
function clampBase(value, min, max) {
  if (min > 0 && max > 0) {
    return Math.min(Math.max(value, min), max)
  }
  return value
}

/**
 * 计算五险一金明细
 * @param {number} grossSalary - 应发工资
 * @param {number} paymentBase - 缴纳基数（用户输入）
 * @param {object} config - 配置对象
 * @returns {object} 计算结果
 */
export function calculate(grossSalary, paymentBase, config) {
  if (!config || !config.items || grossSalary <= 0) return null

  const items = config.items
  const socialBase = paymentBase
  const fundBase = paymentBase

  // 用应发工资作为基数时的计算 (用于对比少缴金额)
  const fullBase = grossSalary

  const breakdown = {}
  let totalIndividual = 0
  let totalCompany = 0
  let totalIndividualFull = 0
  let totalCompanyFull = 0

  const itemKeys = ['pension', 'medical', 'unemployment', 'workInjury', 'maternity', 'housingFund']

  for (const key of itemKeys) {
    const item = items[key]
    if (!item) continue

    const indivRate = (item.individualRate || 0) / 100
    const compRate = (item.companyRate || 0) / 100

    const base = key === 'housingFund' ? fundBase : socialBase
    const baseFull = key === 'housingFund' ? fullBase : fullBase

    const individualAmount = Math.round(base * indivRate * 100) / 100
    const companyAmount = Math.round(base * compRate * 100) / 100

    const individualAmountFull = Math.round(baseFull * indivRate * 100) / 100
    const companyAmountFull = Math.round(baseFull * compRate * 100) / 100

    const companySavings = Math.round((companyAmountFull - companyAmount) * 100) / 100

    breakdown[key] = {
      individualRate: item.individualRate,
      companyRate: item.companyRate,
      individualAmount,
      companyAmount,
      individualAmountFull,
      companyAmountFull,
      companySavings,
    }

    totalIndividual += individualAmount
    totalCompany += companyAmount
    totalIndividualFull += individualAmountFull
    totalCompanyFull += companyAmountFull
  }

  const netSalary = Math.round((grossSalary - totalIndividual) * 100) / 100
  const totalCompanyCost = Math.round((grossSalary + totalCompany) * 100) / 100
  const totalCompanyCostFull = Math.round((grossSalary + totalCompanyFull) * 100) / 100

  // 企业按低基数少缴金额
  const companySavings = Math.round((totalCompanyFull - totalCompany) * 100) / 100

  return {
    grossSalary,
    paymentBase: socialBase,
    netSalary,
    totalIndividual: Math.round(totalIndividual * 100) / 100,
    totalCompany: Math.round(totalCompany * 100) / 100,
    totalCompanyCost,
    totalCompanyCostFull,
    companySavings,
    breakdown,
  }
}
