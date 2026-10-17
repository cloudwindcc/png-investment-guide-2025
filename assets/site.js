import { calculateScenario } from './scenario.mjs';

document.documentElement.classList.add('js');
const zh = document.documentElement.lang.startsWith('zh');
const text = (en, cn) => zh ? cn : en;

// Analytics adapters can subscribe without collecting form fields or search text.
function track(event, attributes = {}) {
  const detail = { event, ...attributes };
  window.dispatchEvent(new CustomEvent('isp:analytics', { detail }));
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(detail);
}

const menuToggle = document.getElementById('menu-toggle');
const navigation = document.getElementById('primary-nav');
if (menuToggle && navigation) {
  function closeMenu(returnFocus = false) {
    navigation.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', text('Open navigation', '展开导航'));
    if (returnFocus) menuToggle.focus();
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? text('Close navigation', '收起导航') : text('Open navigation', '展开导航'));
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('is-open')) closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
}

const filters = document.getElementById('market-filters');
if (filters) {
  const search = document.getElementById('market-search');
  const region = document.getElementById('market-region');
  const sector = document.getElementById('market-sector');
  const count = document.getElementById('market-count');
  const empty = document.getElementById('market-empty');
  const cards = [...document.querySelectorAll('[data-market]')];
  const initial = new URLSearchParams(location.search);
  search.value = (initial.get('q') || '').slice(0, 100);
  for (const select of [region, sector]) {
    const requested = initial.get(select.name);
    if ([...select.options].some(option => option.value === requested)) select.value = requested;
  }
  function filterMarkets(updateUrl = true) {
    const query = search.value.toLocaleLowerCase().trim();
    let visible = 0;
    for (const card of cards) {
      const matches = (!query || card.dataset.name.includes(query)) && (!region.value || card.dataset.region === region.value) && (!sector.value || card.dataset.sectors.split(' ').includes(sector.value));
      card.hidden = !matches;
      if (matches) visible++;
    }
    count.textContent = zh ? `${visible}个匹配市场` : `${visible} ${visible === 1 ? 'market' : 'markets'} to explore`;
    empty.hidden = visible !== 0;
    if (updateUrl) {
      const url = new URL(location.href);
      for (const field of [search, region, sector]) field.value ? url.searchParams.set(field.name, field.value) : url.searchParams.delete(field.name);
      history.replaceState(null, '', url);
    }
  }
  filters.addEventListener('submit', event => { event.preventDefault(); filterMarkets(); });
  search.addEventListener('input', () => filterMarkets());
  for (const select of [region, sector]) select.addEventListener('change', () => { filterMarkets(); track('market_filter', { region: region.value || 'all', sector: sector.value || 'all' }); });
  document.getElementById('reset-filters').addEventListener('click', () => { filters.reset(); filterMarkets(); search.focus(); });
  filterMarkets(false);
}

const scenarioForm = document.getElementById('scenario-form');
if (scenarioForm) {
  const results = document.getElementById('scenario-results');
  const status = document.getElementById('scenario-status');
  function updateScenario() {
    if (!scenarioForm.checkValidity()) {
      results.hidden = true;
      status.textContent = text('Enter valid figures in every field to calculate the scenario.', '请在每个字段中输入有效数值，再计算情景。');
      return false;
    }
    const form = new FormData(scenarioForm);
    const currency = form.get('currency');
    try {
      const { yieldPercent, payback, npv } = calculateScenario(Object.fromEntries(['capital', 'cashflow', 'years', 'discount'].map(key => [key, Number(form.get(key))])));
      const locale = zh ? 'zh-CN' : 'en-US';
      const decimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      document.getElementById('result-yield').textContent = `${decimal.format(yieldPercent)}%`;
      document.getElementById('result-payback').textContent = payback === null ? text('Not reached in this horizon', '所设期限内未达到') : `${decimal.format(payback)}${text(' years', '年')}`;
      document.getElementById('result-npv').textContent = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(npv);
      status.textContent = '';
      results.hidden = false;
      return true;
    } catch {
      results.hidden = true;
      status.textContent = text('Check the input ranges and try again.', '请检查输入范围后重试。');
      return false;
    }
  }
  scenarioForm.addEventListener('input', updateScenario);
  scenarioForm.addEventListener('change', updateScenario);
  scenarioForm.addEventListener('submit', event => {
    event.preventDefault();
    if (updateScenario()) track('scenario_calculated', { currency: scenarioForm.elements.currency.value, years: Number(scenarioForm.elements.years.value) });
  });
  updateScenario();
}

const enquiryForm = document.getElementById('enquiry-form');
if (enquiryForm) {
  const market = document.getElementById('contact-market');
  const service = document.getElementById('contact-service');
  const status = document.getElementById('enquiry-status');
  const parameters = new URLSearchParams(location.search);
  const requestedMarket = parameters.get('market');
  market.value = [...market.options].some(option => option.value === requestedMarket) ? requestedMarket : 'papua-new-guinea';
  const serviceLabels = new Map([...service.options].map(option => [option.value, option.textContent]));
  const scopeNote = document.createElement('p');
  scopeNote.className = 'form-help';
  market.parentElement.append(scopeNote);
  function updateMarketScope() {
    const quote = market.value !== 'papua-new-guinea';
    for (const option of service.options) option.textContent = quote ? serviceLabels.get(option.value).replace(/PNG US\$[\d,]+/, text('Request a quote', '单独询价')) : serviceLabels.get(option.value);
    scopeNote.textContent = quote ? text('Other markets are quoted individually. Tell us the scope you need.', '其他市场单独询价，请说明所需服务范围。') : text('The displayed US dollar packages apply to Papua New Guinea.', '所列美元套餐适用于巴布亚新几内亚。');
  }
  market.addEventListener('change', updateMarketScope);
  updateMarketScope();
  document.querySelectorAll('[data-select-plan]').forEach(link => link.addEventListener('click', () => {
    service.value = link.dataset.selectPlan;
    status.textContent = text('Service selected. Tell us your preferred market and a little about your brief.', '已选择服务，请补充目标市场与简要需求。');
    track('service_selected', { service: service.value });
  }));
  function prepareEnquiry() {
    const form = new FormData(enquiryForm);
    const body = [
      'Invest South Pacific — service enquiry', '',
      `Name: ${form.get('name').trim()}`,
      `Email: ${form.get('email').trim()}`,
      `Market: ${market.selectedOptions[0].textContent}`,
      `Service: ${service.selectedOptions[0].textContent}`,
      `Preferred website language: ${zh ? 'Chinese' : 'English'}`,
      '', 'Brief:', form.get('brief').trim(), '',
      'Please confirm service availability, scope, timing and total fees before payment.'
    ].join('\r\n');
    const subject = `Service enquiry — ${market.selectedOptions[0].textContent} — ${service.selectedOptions[0].textContent}`;
    return { body, subject };
  }
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) return;
    const { body, subject } = prepareEnquiry();
    const link = document.createElement('a');
    link.href = `mailto:info@cloudwindai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.click();
    status.textContent = text('Your email draft is ready in your mail app. Review it and send when you are ready. If no app opened, copy the enquiry below.', '已在邮件应用准备草稿，请检查后自行发送。如邮件应用未打开，可使用复制需求功能。');
    track('enquiry_draft_opened', { market: market.value, service: service.value });
  });
  document.getElementById('copy-brief').addEventListener('click', async () => {
    if (!enquiryForm.reportValidity()) return;
    const { body, subject } = prepareEnquiry();
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\r\n\r\n${body}`);
      status.textContent = text('Enquiry copied. Paste it into an email to info@cloudwindai.com.', '需求已复制，请粘贴至邮件并发送到 info@cloudwindai.com。');
      track('enquiry_copied', { market: market.value, service: service.value });
    } catch {
      const field = document.getElementById('contact-brief');
      field.focus();
      field.select();
      status.textContent = text('Clipboard access is unavailable. Copy the selected brief and email it with your market and service to info@cloudwindai.com.', '当前无法访问剪贴板，请复制选中的需求，并将目标市场与服务一同发送至 info@cloudwindai.com。');
    }
  });
}

document.querySelectorAll('[data-checkout]').forEach(link => link.addEventListener('click', () => track('checkout_click', { service: link.dataset.checkout, currency: 'USD', amount: Number(link.dataset.amount) })));

// Keep native anchor history and keyboard semantics; no global selector interception.
