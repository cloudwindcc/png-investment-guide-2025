export function calculateScenario({ capital, cashflow, years, discount }) {
  if (![capital, cashflow, years, discount].every(Number.isFinite)) throw new RangeError('All inputs must be finite numbers.');
  if (capital <= 0 || capital > 1e12 || Math.abs(cashflow) > 1e12 || !Number.isInteger(years) || years < 1 || years > 50 || discount < 0 || discount > 100) throw new RangeError('Inputs are outside the supported range.');
  let npv = -capital;
  for (let year = 1; year <= years; year++) npv += cashflow / (1 + discount / 100) ** year;
  const simplePayback = cashflow > 0 ? capital / cashflow : null;
  return {
    yieldPercent: cashflow / capital * 100,
    payback: simplePayback !== null && simplePayback <= years ? simplePayback : null,
    npv
  };
}
