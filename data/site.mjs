import payments from './payments.json' with { type: 'json' };

export const site = {
  name: 'Invest South Pacific',
  origin: 'https://investsouthpacific.com',
  email: 'info@cloudwindai.com',
  reviewed: '2026-10-17',
  regionSource: 'https://pacifictradeinvest.com/about-us/what-we-do/'
};

export const sectors = [
  { id: 'tourism', en: 'Tourism & hospitality', zh: '旅游与酒店', short: '01', description: ['Visitor experiences, accommodation and the businesses that support them.', '住宿、目的地体验，以及为旅游业提供支持的本地企业。'] },
  { id: 'agriculture', en: 'Food & agriculture', zh: '食品与农业', short: '02', description: ['Agrifood, local processing and routes from producers to regional markets.', '农业食品、本地加工，以及连接生产者和区域市场的业务。'] },
  { id: 'energy', en: 'Energy & infrastructure', zh: '能源与基础设施', short: '03', description: ['Renewable energy and the infrastructure behind productive businesses.', '可再生能源，以及支撑企业运营的基础设施。'] },
  { id: 'ocean', en: 'Ocean industries', zh: '海洋产业', short: '04', description: ['Fisheries, aquaculture and responsible use of marine resources.', '渔业、水产养殖，以及海洋资源的负责任开发。'] },
  { id: 'manufacturing', en: 'Value-added production', zh: '加工与制造', short: '05', description: ['Processing and manufacturing that connect local strengths with demand.', '连接本地资源优势与市场需求的加工和制造。'] },
  { id: 'digital', en: 'Digital & technology', zh: '数字与科技', short: '06', description: ['Technology businesses, digital services and enabling infrastructure.', '技术企业、数字服务与配套基础设施。'] }
];

export const regions = [
  { id: 'australasia', en: 'Australia & New Zealand', zh: '澳大利亚与新西兰' },
  { id: 'melanesia', en: 'Melanesia', zh: '美拉尼西亚' },
  { id: 'polynesia', en: 'Polynesia', zh: '波利尼西亚' }
];

export const markets = [
  {
    id: 'australia', code: 'AU', en: 'Australia', zh: '澳大利亚', region: 'australasia',
    sectors: ['energy', 'manufacturing', 'agriculture', 'digital'],
    lead: ['Scale, established industries and a broad sector landscape.', '成熟产业、多元行业与规模化业务。'],
    summary: ['Explore Australia’s energy, advanced manufacturing and agrifood sectors. Austrade provides industry resources and investor guidance for businesses researching establishment, acquisitions and expansion.', '研究澳大利亚能源、先进制造与农业食品领域。Austrade 提供行业资料与投资者指引，协助了解设立、收购和业务扩张。'],
    agency: 'Austrade',
    source: 'https://international.austrade.gov.au/en/do-business-with-australia/invest-in-australia',
    extraSource: 'https://international.austrade.gov.au/en/do-business-with-australia/sectors',
    verify: ['Which foreign investment approvals and sector permits apply to this transaction?', '拟议交易适用哪些外国投资审批与行业许可？']
  },
  {
    id: 'new-zealand', code: 'NZ', en: 'New Zealand', zh: '新西兰', region: 'australasia',
    sectors: ['energy', 'agriculture', 'ocean', 'digital'],
    lead: ['Innovation, food systems and the energy transition.', '创新、食品体系与能源转型。'],
    summary: ['Invest New Zealand’s sector resources cover renewable energy, innovative food production, aquaculture and digital infrastructure. Use its published information to frame a project and contact the investment team.', 'Invest New Zealand 的行业资料涵盖可再生能源、创新食品、水产养殖和数字基础设施，可用于梳理项目方向并联系投资团队。'],
    agency: 'Invest New Zealand', source: 'https://www.investnz.govt.nz/',
    extraSource: 'https://www.investnz.govt.nz/sectors-overview',
    verify: ['Does the project need overseas investment consent, land access permissions or sector approvals?', '项目是否需要海外投资同意、土地使用许可或行业审批？']
  },
  {
    id: 'fiji', code: 'FJ', en: 'Fiji', zh: '斐济', region: 'melanesia',
    sectors: ['tourism', 'agriculture', 'energy'],
    lead: ['Visitor economy, agriculture and regional connections.', '旅游经济、农业与区域联系。'],
    summary: ['Investment Fiji introduces tourism, commercial agriculture and renewable energy among its investment sectors. Its resources offer an official starting point for market research and investor enquiries.', 'Investment Fiji 介绍了旅游、商业农业与可再生能源等投资领域，其官方资料可作为市场研究与投资咨询的起点。'],
    agency: 'Investment Fiji',
    source: 'https://www.investmentfiji.org.fj/investment-opportunities/sector-opportunities',
    extraSource: 'https://www.investmentfiji.org.fj/article/investment-fiji-sets-strategic-alignment-to-fijis-growth-ambition-targets',
    verify: ['Are the proposed site, regulatory approvals and utility connections ready for this project?', '拟选场地、监管审批和公共设施连接能否支持项目？']
  },
  {
    id: 'papua-new-guinea', code: 'PG', en: 'Papua New Guinea', zh: '巴布亚新几内亚', region: 'melanesia',
    sectors: ['agriculture', 'ocean', 'tourism'],
    lead: ['Local enterprise, natural resources and market entry.', '本地企业、自然资源与市场进入。'],
    summary: ['The Investment Promotion Authority provides investor information, business introductions and registration resources. Begin with its official services when researching agriculture, fisheries, tourism or a local operating business.', '投资促进局提供投资资料、商业对接和企业登记资源。研究农业、渔业、旅游或本地运营业务时，可先查阅 IPA 官方服务。'],
    agency: 'Investment Promotion Authority', source: 'https://www.ipa.gov.pg/',
    extraSource: 'https://www.ipa.gov.pg/public/help.aspx?cn=InvestorServicingExportPromotion',
    verify: ['Which reserved activities, foreign enterprise certification and sector licences apply to this exact business?', '具体业务适用哪些保留活动规定、外国企业认证与行业许可？']
  },
  {
    id: 'vanuatu', code: 'VU', en: 'Vanuatu', zh: '瓦努阿图', region: 'melanesia',
    sectors: ['tourism', 'agriculture', 'manufacturing'],
    lead: ['Tourism, agriculture and local value creation.', '旅游、农业与本地价值创造。'],
    summary: ['Vanuatu’s investment agency introduces tourism, primary production and processing opportunities. Its sector information provides a starting point for checking business eligibility and discussing operating requirements.', '瓦努阿图投资机构介绍旅游、初级产业与加工领域，可据此了解业务准入并咨询经营要求。'],
    agency: 'Vanuatu Foreign Investment Promotion Agency',
    source: 'https://investvanuatu.vu/sectors-opportunities/',
    extraSource: 'https://investvanuatu.vu/investment-opportunities-and-key-sectors/',
    verify: ['Which reserved or restricted activities, registration conditions and permits apply to the business?', '业务适用哪些保留或限制活动、登记条件与经营许可？']
  },
  {
    id: 'samoa', code: 'WS', en: 'Samoa', zh: '萨摩亚', region: 'polynesia',
    sectors: ['tourism', 'agriculture', 'energy', 'digital'],
    lead: ['Island enterprise, tourism and productive industries.', '岛国企业、旅游与生产性行业。'],
    summary: ['Samoa’s Ministry of Commerce, Industry and Labour publishes investment resources covering tourism, agriculture, ICT and renewable energy. Its investment unit supports enquiries about registration and industry development.', '萨摩亚工商劳工部提供旅游、农业、ICT 与可再生能源等领域的投资资料，投资部门可协助咨询登记与产业发展事项。'],
    agency: 'Ministry of Commerce, Industry and Labour',
    source: 'https://www.mcil.gov.ws/services/industry/',
    verify: ['Is the activity on a reserved or restricted list, and which registration documents are required?', '业务是否属于保留或限制活动，需要哪些登记文件？']
  },
  {
    id: 'solomon-islands', code: 'SB', en: 'Solomon Islands', zh: '所罗门群岛', region: 'melanesia',
    sectors: ['tourism', 'ocean', 'agriculture', 'manufacturing', 'energy'],
    lead: ['Ocean industries, agribusiness and visitor infrastructure.', '海洋产业、农业企业与旅游基础设施。'],
    summary: ['Invest Solomons introduces tourism infrastructure, fisheries, agribusiness, manufacturing and energy. The foreign investment division provides market information and investor services for establishment and expansion.', 'Invest Solomons 介绍旅游基础设施、渔业、农业企业、制造与能源领域，外国投资部门提供市场资料及企业设立和扩张服务。'],
    agency: 'Invest Solomons', source: 'https://www.investsolomons.gov.sb/',
    extraSource: 'https://www.investsolomons.gov.sb/unlocking-opportunities-in-priority-sectors',
    verify: ['Which registration requirements and land or resource permissions apply to the proposed site?', '拟选场地适用哪些登记要求及土地或资源使用许可？']
  },
  {
    id: 'tonga', code: 'TO', en: 'Tonga', zh: '汤加', region: 'polynesia',
    sectors: ['tourism', 'ocean', 'agriculture', 'manufacturing'],
    lead: ['Tourism, fisheries and agricultural processing.', '旅游、渔业与农产品加工。'],
    summary: ['Tonga’s official investment portal introduces tourism, fisheries and agroprocessing. Its investor services explain foreign investment certification, business establishment and routes to local business contacts.', '汤加官方投资门户介绍旅游、渔业和农产品加工，提供外国投资认证、企业设立与本地商业联系的指引。'],
    agency: 'Invest in Tonga', source: 'https://www.investtonga.gov.to/',
    extraSource: 'https://www.investtonga.gov.to/step-by-step-guide-to-starting-a-business/step-2-foreign-investment-certification',
    verify: ['Which certification, reserved activity rules and project-specific permits need to be checked first?', '应优先核实哪些投资认证、保留活动规定与项目许可？']
  }
];

// USD prices and scope supplied by the site owner. Add only verified USD links.
// Existing HKD payment links must never be reused for these offers.
export const plans = [
  { id: 'consultation', name: ['Clarity call', '电话咨询'], amount: 199, currency: 'USD', checkout: payments.plans.consultation.url,
    summary: ['A focused conversation about your investment or business-entry questions.', '围绕投资或业务落地问题，进行有重点的一对一交流。'],
    items: [['One-hour telephone consultation', '1小时电话咨询'], ['Discuss your business questions and next steps', '讨论业务问题与后续行动'], ['Confirm your preferred language and time', '确认咨询语言与时间']] },
  { id: 'registration', name: ['Company registration', '当地公司注册'], amount: 399, currency: 'USD', checkout: payments.plans.registration.url,
    summary: ['Local company registration support, with the jurisdiction and filing scope agreed first.', '提供当地公司注册服务，先确认注册地区与办理范围。'],
    items: [['Local company registration service', '当地公司注册服务'], ['Confirm eligibility and required documents', '确认准入条件与所需文件'], ['Agree the filing scope and official fees', '确认办理范围与官方费用']] },
  { id: 'representation', name: ['On-the-ground support', '全套代理与线下对接'], amount: 999, currency: 'USD', checkout: payments.plans.representation.url,
    summary: ['Full-service agency support and local, in-person resource connections.', '全套代理服务，结合当地线下资源对接。'],
    items: [['Full-service agency support', '全套代理服务'], ['Local resource introductions', '当地线下资源对接'], ['Agree the project scope and delivery plan', '确认项目范围与交付计划']] }
];

export const faqs = [
  { q: ['Where should I start when exploring South Pacific investment?', '研究南太平洋投资，应从哪里开始？'], a: ['Define the business activity and shortlist markets before comparing specific projects. Our market guides link to the relevant investment agencies so you can check current requirements and discuss your proposed activity directly.', '先明确业务活动、筛选市场，再比较具体项目。各市场指南提供投资机构链接，便于查阅现行要求并直接咨询拟开展的业务。'] },
  { q: ['Which markets does this guide cover?', '本指南覆盖哪些市场？'], a: ['This guide currently covers Australia, New Zealand, Fiji, Papua New Guinea, Vanuatu, Samoa, Solomon Islands and Tonga. It is a selected regional guide rather than an exhaustive list of Pacific countries and territories.', '目前覆盖澳大利亚、新西兰、斐济、巴布亚新几内亚、瓦努阿图、萨摩亚、所罗门群岛和汤加，为区域精选指南。'] },
  { q: ['Is Invest South Pacific a government agency?', 'Invest South Pacific 是政府机构吗？'], a: ['Invest South Pacific is an independent information and consultation website. Links to government and investment agency resources are references; they do not imply endorsement, affiliation or a partnership.', 'Invest South Pacific 是独立的信息与咨询网站。政府与投资机构链接用于资料参考，不代表获得背书、隶属关系或合作授权。'] },
  { q: ['How current is the information?', '资料如何保持时效？'], a: ['The review date identifies when the linked sources were checked for this edition. Requirements can change between reviews. Follow the official source for a market and confirm project-specific rules with the relevant authority before acting.', '复核日期表示本版查阅所链接资料的日期。要求可能在两次复核间发生变化，行动前请查阅官方来源并向主管机构确认项目适用规则。'] },
  { q: ['What services can I book?', '可以预约哪些服务？'], a: ['Papua New Guinea services are US$199 for a one-hour telephone consultation, US$399 for local company registration, and US$999 for full-service agency support and local resource introductions. Other markets are quoted individually. Confirm scope, timing and any official fees before payment.', '巴布亚新几内亚服务包括 US$199 的1小时电话咨询、US$399 的当地公司注册，以及 US$999 的全套代理与线下资源对接。其他市场单独询价。付款前请确认范围、时间与官方费用。'] },
  { q: ['Does the scenario planner predict investment returns?', '情景工具会预测投资收益吗？'], a: ['The planner calculates cash-flow yield, simple payback and net present value using inputs you provide. It uses no country or industry return assumptions and does not include a terminal sale value or currency conversion.', '工具依据用户输入计算现金流收益率、简单回收期和净现值，不预设国家或行业收益，不包含期末出售价值或汇率换算。'] }
];
