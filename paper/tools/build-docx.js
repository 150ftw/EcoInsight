// Builds the EcoInsight paper as a Word document in the IEEE conference
// layout (US Letter, two columns, Times New Roman), mirroring
// paper/ecoinsight-ieee.tex section for section.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, SectionType, TabStopType, LevelFormat,
  VerticalAlign,
} = require('docx');

const PAPER = path.resolve(__dirname, '..');
const FIGS = path.join(PAPER, 'figures');
const OUT = path.join(PAPER, 'ecoinsight-ieee.docx');

const FONT = 'Times New Roman';
const MONO = 'Courier New';
const COL_W = 5040;   // 3.5 in column, in DXA
const FULL_W = 10440; // 7.25 in text width
const PX = 96;        // docx-js image units are px at 96 dpi

// ---------- inline markup: **bold**, *italic*, `code`, ~subscript~ ----------
// Pages ignores the document-default font, so every run names its font.
// Zero-width spaces after "." "/" "_" in code tokens give justified lines
// somewhere to break instead of stretching letter by letter.
const ZWSP = '\u200B';
const breakable = (t) => t.replace(/([./_])/g, `$1${ZWSP}`).replace(/([a-z])([A-Z])/g, `$1${ZWSP}$2`);
function runs(text, baseIn = {}) {
  const base = { font: FONT, ...baseIn };
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|~[^~]+~)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith('**')) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else if (t.startsWith('`')) out.push(new TextRun({ ...base, text: breakable(t.slice(1, -1)), font: MONO, size: (base.size || 20) - 2 }));
    else if (t.startsWith('~')) out.push(new TextRun({ ...base, text: t.slice(1, -1), subScript: true }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}

const body = (text) => new Paragraph({ style: 'Body', children: runs(text) });
const bodyNoIndent = (text) => new Paragraph({ style: 'BodyNoIndent', children: runs(text) });
const h1 = (text) => new Paragraph({ style: 'H1', children: [new TextRun({ text, font: FONT, smallCaps: true })] });
const h2 = (text) => new Paragraph({ style: 'H2', children: [new TextRun({ text, font: FONT, italics: true })] });
const bullet = (text) => new Paragraph({ style: 'Body', numbering: { reference: 'bullets', level: 0 }, indent: { left: 288, hanging: 216 }, children: runs(text) });
const numbered = (text) => new Paragraph({ style: 'Body', numbering: { reference: 'contrib', level: 0 }, indent: { left: 360, hanging: 288 }, children: runs(text) });

function image(file, widthIn) {
  const buf = fs.readFileSync(file);
  // PNG width/height from the IHDR chunk
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  const width = Math.round(widthIn * PX);
  return new ImageRun({ type: 'png', data: buf, transformation: { width, height: Math.round(width * h / w) } });
}
const figure = (file, widthIn) => new Paragraph({ style: 'FigureImage', children: [image(file, widthIn)] });
// keepWithNext=false lets a multi-panel figure continue in the next column
// instead of leaving a half-empty column.
const subcaption = (text, keepWithNext = true) => new Paragraph({ style: keepWithNext ? 'SubCaption' : 'SubCaptionBreak', children: runs(text, { size: 16 }) });
const figCaption = (n, text) => new Paragraph({ style: 'Caption', children: [new TextRun({ text: `Fig. ${n}. `, size: 16, font: FONT }), ...runs(text, { size: 16 })] });
const tableCaption = (roman, title) => [
  new Paragraph({ style: 'TableCaption', children: [new TextRun({ text: `TABLE ${roman}`, size: 16, font: FONT })] }),
  new Paragraph({ style: 'TableTitle', children: [new TextRun({ text: title, smallCaps: true, size: 16, font: FONT })] }),
];

// Booktabs-style table: rules at top, under the header, and at the bottom.
function table(widths, header, rows) {
  const rule = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (text, i, { isHeader = false, isLast = false } = {}) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 60, right: 60 },
    verticalAlign: VerticalAlign.TOP,
    borders: { top: isHeader ? rule : none, bottom: (isHeader || isLast) ? rule : none, left: none, right: none },
    children: [new Paragraph({ style: 'TableText', children: runs(text, { size: 16 }) })],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    alignment: AlignmentType.CENTER,
    margins: { top: 0, bottom: 0, left: 60, right: 60 },
    borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
    rows: [
      new TableRow({ tableHeader: true, height: { value: 200, rule: 'atLeast' }, children: header.map((t, i) => cell(t, i, { isHeader: true })) }),
      ...rows.map((r, ri) => new TableRow({ cantSplit: true, height: { value: 200, rule: 'atLeast' }, children: r.map((t, i) => cell(t, i, { isLast: ri === rows.length - 1 })) })),
    ],
  });
}
const spacer = () => new Paragraph({ style: 'Spacer', children: [] });

// Display equation as formatted text (Pages cannot render Word equation
// objects): centred in the column, its number at the right margin.
const v = (t) => new TextRun({ text: t, font: FONT, italics: true });
const t_ = (t) => new TextRun({ text: t, font: FONT });
const sb = (t) => new TextRun({ text: t, font: FONT, subScript: true });
const equation = (children, n) => new Paragraph({ style: 'Equation', children: [t_('\t'), ...children, t_(`\t(${n})`)] });

// ---------- content ----------
const titleBlock = [
  new Paragraph({ style: 'PaperTitle', children: [new TextRun({ text: 'EcoInsight: Grounding a Small Open-Weight LLM in Live Indian Market Data with Serverless Retrieval and a Provenance Policy', size: 48, font: FONT })] }),
];
const authors = [
  ['Shivam Sharma', 'ss18244646@gmail.com'],
  ['Gaurav Kumar Mehra', 'gmehra161@gmail.com'],
  ['Ansh Tripathi', 'anshtripathi259@gmail.com'],
];
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const authorTable = new Table({
  width: { size: FULL_W, type: WidthType.DXA },
  columnWidths: [3480, 3480, 3480],
  alignment: AlignmentType.CENTER,
  borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
  rows: [new TableRow({
    children: authors.map(([name, email]) => new TableCell({
      width: { size: 3480, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 40, right: 40 },
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
      children: [
        new Paragraph({ style: 'Author', children: [new TextRun({ text: name, size: 22, font: FONT })] }),
        new Paragraph({ style: 'Author', children: [new TextRun({ text: 'Manav Rachna International', italics: true, size: 18, font: FONT })] }),
        new Paragraph({ style: 'Author', children: [new TextRun({ text: 'Institute of Research and Studies', italics: true, size: 18, font: FONT })] }),
        new Paragraph({ style: 'Author', children: [new TextRun({ text: 'Faridabad, India', size: 18, font: FONT })] }),
        new Paragraph({ style: 'Author', children: [new TextRun({ text: email, size: 18, font: FONT })] }),
      ],
    })),
  })],
});

const abstract = new Paragraph({
  style: 'Abstract',
  children: [
    new TextRun({ text: 'Abstract', bold: true, italics: true, size: 18, font: FONT }),
    new TextRun({ text: '—General-purpose large language models (LLMs) answer financial questions from frozen training data, so they quote stale prices and produce precise-looking figures that are not real. We present EcoInsight, an India-focused economic intelligence assistant that grounds a 20-billion-parameter open-weight model (gpt-oss-20b) in market data fetched at query time. Its retrieval layer, Search-Sync, uses deterministic rules to decide when to retrieve, runs three fetchers in parallel (benchmark context, entity-resolved stock quotes, and web search), and injects the results into the system prompt as a labelled authority block. A six-category provenance policy lets the model issue forecasts and buy/hold/sell verdicts while reserving the label “verified fact” for figures that were actually retrieved. A single per-symbol quote cache keeps the chatbot and every dashboard on the same price, with a worst-case staleness of six minutes. In live runs on 15 October 2026, the assistant reported retrieved price, P/E, EPS, and 52-week figures exactly, the chat and dashboard surfaces agreed within the cache window, and answers separated retrieved facts from labelled assumptions, predictions, and recommendations. Measured design iterations cut index-loading latency from 5.9 s to 2.2 s and gave the two response modes distinct profiles (2.5 s concise answers versus 63 s analyst reports). We also propose an evaluation protocol for grounded financial assistants.', bold: true, size: 18, font: FONT }),
  ],
});
const keywords = new Paragraph({
  style: 'Keywords',
  children: [
    new TextRun({ text: 'Index Terms', bold: true, italics: true, size: 18, font: FONT }),
    new TextRun({ text: '—retrieval-augmented generation, large language models, financial question answering, hallucination, provenance, serverless systems', bold: true, size: 18, font: FONT }),
  ],
});

const partA = [
  abstract, keywords,
  h1('I. Introduction'),
  body('Retail investors increasingly ask chat assistants questions such as “Is Reliance overvalued right now?”. A correct answer depends on figures that change by the minute: price, price-to-earnings (P/E) ratio, 52-week range, and index levels. An LLM answering from its weights either refuses or produces a fluent, wrong number. In finance, a confident wrong number does more harm than a refusal.'),
  body('Retrieval-augmented generation (RAG) is the standard remedy [1], but most RAG work assumes a static corpus and a vector index. Market data differs in three ways. It is structured. It expires within minutes. And the same figure appears on several surfaces of a product (a chatbot, a dashboard, a ticker) that must agree with each other.'),
  body('EcoInsight is a working web application built for this setting. It pairs a streaming assistant (“Eko”) with live dashboards for Indian indices, equities, commodities, currencies, and institutional fund flows. We address three research questions:'),
  bullet('**RQ1.** Can a small open-weight model be grounded in live market data well enough to answer price and valuation questions using only serverless infrastructure and no vector store?'),
  bullet('**RQ2.** How should a grounded assistant treat figures that were *not* retrieved, so that it neither refuses to engage nor presents estimates as facts?'),
  bullet('**RQ3.** Which caching and prompting choices keep figures consistent across surfaces and keep latency acceptable?'),
  bodyNoIndent('Our contributions are:'),
  numbered('*Search-Sync*, a query-time retrieval pipeline built from rule-based gating, three parallel fetchers, and a shared 3-minute quote cache (Section IV).'),
  numbered('A *six-category provenance policy* that separates verified facts from derived values, assumptions, predictions, interpretations, and recommendations (Section IV-C).'),
  numbered('A *cross-surface consistency design* that keeps chatbot and dashboard prices identical within a bounded staleness window (Section IV-B).'),
  numbered('An *empirical study* of the deployed system: measured design iterations drawn from 391 commits, and live runs against real market data (Section VI).'),

  h1('II. Related Work'),
  body('**Retrieval augmentation.** Lewis et al. [1] condition generation on passages retrieved from a dense index. EcoInsight keeps the core idea but replaces the index with structured quote lookups and live web search, because its key facts expire within minutes. Vu et al. [2] show that inserting fresh search-engine results into the prompt substantially improves answers to fast-changing questions. Search-Sync is a domain-specific instance of that approach.'),
  body('**Tool use.** Toolformer [3] trains a model to decide when to call external tools. EcoInsight takes the opposite route: deterministic rules decide which tools to call before the model runs. This is predictable and cheap, and it works with a model that was never fine-tuned for tool use.'),
  body('**Financial LLMs.** BloombergGPT [4] trains a 50B-parameter model on financial text, and FinGPT [5] argues for open, frequently refreshed financial models. Both store domain knowledge in the weights, which goes stale between training runs. FinanceBench [6] reports that GPT-4-Turbo with a retrieval system answered incorrectly or refused 81% of its questions. That result motivates EcoInsight’s emphasis on structured, query-time data and on explicit handling of figures that were not retrieved.'),
  body('**Hallucination and evaluation.** Ji et al. [7] survey hallucination in text generation. FActScore [8] breaks long answers into atomic facts and checks each, and Ragas [9] measures how faithful a RAG answer is to its retrieved context. EcoInsight’s provenance policy asks the model to tag each of its own atomic facts by origin, which makes those tags checkable by such tools (Section VI-C).'),
];

const fig1 = [
  figure(path.join(FIGS, 'fig-architecture.png'), 6.5),
  figCaption(1, 'Architecture. The browser never contacts a data source, the model, or the user tables directly. `api/ticker.js` both scrapes quotes and writes the shared cache that the chatbot and every dashboard read.'),
];

const partB = [
  h1('III. System Architecture'),
  body('EcoInsight has three tiers (Fig. 1): a React single-page client, a set of Vercel serverless functions, and a Supabase PostgreSQL database. All market data and model traffic passes through the serverless tier, which holds every secret and owns the shared quote cache. The codebase has 104 tracked files and roughly 17,000 lines of JavaScript. Table I lists the main components.'),
  ...tableCaption('I', 'Main Components'),
  table([900, 1900, 2240], ['Tier', 'Component', 'Role'], [
    ['Client', '`App.jsx`', 'Global state, view routing, chat pipeline, PDF export'],
    ['Client', '33 view components', 'Dashboards, simulators, 3D visuals (Recharts, Three.js)'],
    ['Client', 'Retrieval libraries (3 files)', 'Entity resolution, context assembly, session cache'],
    ['Server', '`api/chat.js`', 'Streams provider responses; key stays server-side'],
    ['Server', '`api/ticker.js`', 'Quotes, fundamentals, ~1 month of daily OHLC'],
    ['Server', '`api/web-search.js`', 'DuckDuckGo HTML results; Economic Times RSS fallback'],
    ['Server', '`api/fii-dii.js`', 'Provisional FII/DII cash-market flows from NSE'],
    ['Server', '`auth`, `chats`, `settings`', 'Accounts; storage scoped by verified JWT'],
    ['Data', 'Supabase', '`users`, `user_settings`, `chats`, `market_cache`'],
  ]),
  spacer(),
  body('**Model choice.** The assistant runs gpt-oss-20b [10] through NVIDIA’s hosted API with `reasoning_effort` fixed at “low”. With this reasoning model, hidden reasoning tokens share the output budget with the visible answer; “low” effort leaves that budget for the answer itself, and response depth is controlled by the prompt and the token ceiling instead. The server, not the client, selects the model, so a model change takes effect for every user at once.'),
  body('**Authentication.** Users sign up with an email and password (bcrypt-hashed, minimum 8 characters) or through Google OAuth. The server issues a signed JWT in an HTTP-only, SameSite=Lax cookie that is valid for 30 days. Every storage endpoint verifies that cookie and scopes its queries to the token’s user ID in code.'),

  h1('IV. Methodology'),
  h2('A. Search-Sync: Query-Time Grounding'),
  body('Search-Sync (Fig. 2) decides with fixed rules whether a query needs live data, fetches three kinds of context in parallel, and places the result in the system prompt under a labelled authority block. No model call is spent on retrieval decisions.'),
  figure(path.join(FIGS, 'fig-searchsync.png'), 2.74),
  figCaption(2, 'Search-Sync request flow: two rule-based gates and three parallel fetchers. The model sees one labelled block whether retrieval succeeded, partly succeeded, or was not needed.'),
  body('*Gating.* A query is routed to retrieval when it contains one of 51 financial keywords (e.g., “nifty”, “p/e”, “dividend”, “rbi”) or has more than four words. Greetings in English and Hindi/Hinglish are answered from a fixed table without a model call. A 5-second client-side cooldown limits message rate.'),
  body('*Three fetchers.* Retrieval runs under `Promise.allSettled`, so one slow or failing source never blocks the others. (i) *Benchmark context*: Nifty 50, Sensex, and Nifty Bank levels; USD/INR, EUR/INR, and GBP/INR; Indian gold and silver rates; and cached quotes for six large caps with an advance/decline ratio. (ii) *Entity-resolved quotes*: company mentions are resolved in three passes. The first is a longest-match against a hand-built alias table (Nifty 50 names, about 60 mid caps, renamed listings such as Zomato→\u200BETERNAL, and seven US mega caps). The second sends capitalised phrases to Alpha Vantage symbol search, with results cached for 7 days. The third treats ALL-CAPS tokens as tickers. Up to five symbols are quoted with price, P/E, EPS, market capitalisation, 52-week and intraday range, dividend yield, and volume. (iii) *Web search*: the query is rewritten by appending “India” to financial questions that lack Indian context and the current year when no year is given. The server scrapes DuckDuckGo results and falls back to an Economic Times RSS feed. The client keeps up to six results that share a keyword with the question and shows them as source cards beneath the answer.'),
  body('*Quote resolution.* `api/ticker.js` maps aliases (indices, commodities, currencies, crypto) to Google Finance identifiers. A bare symbol is tried on NSE, then BSE, then NASDAQ, then as an NSE or BSE index, and finally on NYSE. Each page yields the quote, a fundamentals table, and about one month of daily OHLC bars. The scraper finds the bars by the shape of the embedded array, not by a fixed key, which keeps extraction stable when the page’s internal keys are renumbered.'),
  body('*Prompt assembly.* The request contains: the system prompt (persona, current IST date and time, provenance policy, mode rules); an `INJECTED AUTHORITY CONTEXT` block holding everything retrieved; the chat history; the user message; and a language instruction (English, or mirror Hindi/Hinglish). When nothing was retrieved, the block states so explicitly and instructs the model to answer fully from its own knowledge, which keeps conceptual questions fully answered.'),

  h2('B. One Price Everywhere'),
  body('The chatbot, the Intelligence Hub dashboard, the news ticker, and the earnings panel all read prices through `api/ticker.js`. Consistency rests on three rules. First, the server caches the quote, fundamentals, and raw OHLC history under *one key per symbol* with a 3-minute TTL. Chart series for each range (1D, 1W, 1M, 1Y) are derived fresh from that quote on every request instead of being cached separately, so every chart range shows the same headline price. Second, the dashboard’s in-memory cache and the client-written grounding cache use the same 3-minute expiry, and forced refreshes are written back. Third, concurrent requests for one symbol share a single in-flight promise. Because two caches can stack, the worst-case age of a displayed price is'),
  equation([t_('Δ'), v('t'), sb('max'), t_(' ≈ TTL'), sb('server'), t_(' + TTL'), sb('client'), t_(' = 3 + 3 = 6 min.')], 1),
  bodyNoIndent('The 1W and 1M charts (Fig. 3) plot real daily closes taken from the quote page. The 1D and 1Y views are drawn as curves bounded by real values (today’s open, high, and low; the 52-week high and low) that end at the live price.'),
  figure(path.join(PAPER, 'figures', 'fig-hub.png'), 3.4),
  figCaption(3, 'Eko Intelligence Hub, 1M range, 15 Oct 2026. The series is real daily closes. The dashed line marks the previous close. The headline price comes from the same quote cache the chatbot reads.'),

  h2('C. Provenance Policy'),
  body('The system prompt asks the model to assign every number to one of six categories (Table II). The central rule is that the label “verified fact” is *earned* only by figures present in the injected context. Three companion rules complete the policy. A *no-refusal* rule requires the model to engage with every question from its own knowledge even when retrieval returns nothing. A *no-fabrication* rule requires it to write “not available in verified context” for any missing current figure. *Attribution* rules forbid citing analysts, filings, or URLs that are not in the context; inflating vague figures into false precision (“around 5%” into “5.02%”); and treating a missing value as zero. Every recommendation is presented as a labelled model output, not as regulated investment advice.'),
  ...tableCaption('II', 'Six-Category Provenance Policy'),
  table([1320, 2120, 1600], ['Category', 'Qualifies when', 'Example'], [
    ['Verified fact', 'In injected context, or stable well-known knowledge', 'RBI target band 2–6%'],
    ['Derived value', 'Computed only from verified inputs; method stated', 'EPS = price / P/E'],
    ['Assumption', 'An input the model chooses, stated as such', '“Assume 8% growth”'],
    ['Prediction', 'Forward-looking estimate, labelled', '“Model target Rs. 1,450”'],
    ['Interpretation', 'Qualitative synthesis of the above', 'Valuation vs. growth'],
    ['Recommendation', 'Verdict built on labelled factors', '“Verdict: Hold”'],
  ]),
  spacer(),

  h2('D. Two Response Modes'),
  body('The two modes produce different kinds of answer, not just different lengths (Table III). Eco mode returns a short plain-text answer quickly. In High mode the model may also emit a fenced `chart` JSON block that the client renders with Recharts, and a `sentinel` block listing the sector effects of a scenario. Tagged blocks that do not parse are dropped rather than shown as raw JSON.'),
  ...tableCaption('III', 'Response Modes (One Measured Query Each)'),
  table([600, 1640, 1500, 1300], ['Mode', 'Token budget', 'Format', 'Measured'], [
    ['Eco', '500 (fixed)', '5–6 lines, plain text', '2.5 s, 555 chars'],
    ['High', '1,536 / 3,072 / 6,144 (Short / Medium / Long)', 'Tables, ≤1 chart, ≤1 scenario matrix', '63 s, ~6,000 chars'],
  ]),
  spacer(),

  h1('V. Implementation'),
  h2('A. Streaming and Resilience'),
  body('The chat proxy forwards the provider’s server-sent event stream unchanged, so the API key stays on the server and the client keeps a standard streaming parser. The client retries twice, after 1 s and 2 s, on HTTP 429, any 5xx response, or a network error. It paces rendering at 20 ms per chunk. In High mode an 8-second minimum “analysis” animation runs before the answer appears; Eco mode skips it.'),
  h2('B. Derived Market Indicators'),
  body('Every dashboard indicator is a fixed formula over the same quotes the chatbot uses, not a model output. Breadth sentiment over the cached large-cap set is'),
  equation([v('S'), t_(' = min(100, max(0, 50 + 10 '), v('Δ̄%'), t_(' + 5 '), v('R'), sb('AD'), t_(')),')], 2),
  bodyNoIndent('where Δ̄% is the mean daily percentage change and *R*~AD~ is the advance/decline ratio. A fear-and-greed gauge starts at 50, adds between +20 and −30 by India VIX band and between +20 and −25 by the Nifty 50 daily move, and is clamped to [5, 95]. Technicals (Wilder RSI-14, distance from the 20-day simple moving average, and the one-month move) are computed from Nifty 50’s real daily closes. The economic calendar is generated from release rules: CPI on the 12th and WPI on the 14th (moved past weekends), quarterly GDP on the last weekday of February, May, August, and November, and RBI policy dates for FY 2026–27. Provisional FII/DII flows come from NSE and are cached for 30 minutes.'),
  h2('C. Storage and Security Model'),
  body('All user data passes through serverless endpoints that verify the JWT cookie and use the Supabase service-role key, taking the user ID from the verified token. Anonymous and authenticated database roles have no grants on `users`, `chats`, or `user_settings`, so the browser cannot query user tables directly. Only `market_cache` is shared, and only the server writes to it.'),

  h1('VI. Evaluation'),
  body('We evaluate EcoInsight in two ways: design iterations whose effect was measured during development (Section VI-A), and live runs of the full stack against real market data (Section VI-B). Section VI-C proposes a benchmark protocol for comparing grounded financial assistants.'),
  h2('A. Measured Design Iterations'),
  body('The system was built over 391 commits between March and October 2026. Table IV lists the iterations that shaped grounding, consistency, latency, and security, with the effect measured at the time.'),
];

const table4 = [
  ...tableCaption('IV', 'Design Iterations and Their Measured Effect, 2026 (From Commit History)'),
  table([760, 1900, 4100, 3680], ['Date', 'Area', 'Change', 'Measured effect'], [
    ['Oct 14', 'Cross-surface consistency', 'Dashboard session cache given the same 3-min expiry as the server; forced refreshes written back; silent 3-min refresh', 'Chatbot and dashboard read one quote'],
    ['Oct 14', 'Live dashboard panels', 'FII/DII flows from NSE; calendar generated from release rules; RSI computed from real closes', 'Panels driven by live or rule-derived data'],
    ['Sep 22', 'Price freshness', 'One 3-min quote cache per symbol; chart series derived per request', 'Identical price on the 1D, 1W, and 1M views'],
    ['Sep 15', 'Provenance policy', 'Six categories; “verified” reserved for injected figures', 'Missing price reported as unavailable while a labelled target is still given'],
    ['Sep 15', 'Time-sensitive figures', 'Data-integrity rules for prices, rates, and inflation prints', 'Uncertain figures given as ranges with a pointer to RBI/MoSPI'],
    ['Sep 15', 'Coverage', 'Mandate scoped to injected figures; empty context stated explicitly', 'Conceptual questions answered fully'],
    ['Sep 15', 'Response modes', 'Separate prompt branches; fixed 500-token Eco budget', '2.5 s Eco vs. 63 s High answers'],
    ['Sep 15', 'Data isolation', 'User data moved behind server-side endpoints scoped by verified JWT; direct table grants revoked', 'Unauthenticated requests receive HTTP 401'],
    ['Sep 15', 'Latency', 'Index quotes fetched in parallel; concurrent requests de-duplicated', '3 index lookups: 5.9 s → 2.2 s'],
    ['Sep 15', 'Structured output', 'Larger token budget; unparseable tagged blocks dropped', 'No raw JSON shown in chat'],
    ['Sep 14', 'Model serving', 'Server-side proxy; server selects gpt-oss-20b', 'API key kept server-only; 1–3 s first response'],
  ]),
  spacer(),
];

const partC = [
  body('Two patterns stand out. First, consistency is a property of the caching design rather than of the data source: unifying the quote cache per symbol is what made every surface and every chart range report the same price. Second, the provenance policy was refined iteratively, each version tested with and without injected data, until the model both engaged fully with every question and kept retrieved facts separate from its own estimates.'),
  h2('B. Live System Runs'),
  body('On 15 October 2026, between 13:00 and 13:20 IST during market hours, we ran the system (commit `497d294`) against the live model provider and live data sources. We asked the same Infosys valuation question twice in High mode, about ten minutes apart, and captured the Intelligence Hub at the same time.'),
  body('*Retrieved figures were reported exactly.* In both runs the assistant reported the injected price, P/E 15.01, EPS Rs. 74.02, and 52-week range Rs. 980.40–1,728.00, and attributed them to the retrieval engine (Fig. 4a). The figures are internally consistent (15.01 × 74.02 = 1,111.0, matching the reported price of Rs. 1,111).'),
  body('*Surfaces agreed.* The first run reported Rs. 1,111.60. The dashboards showed Rs. 1,111.30 at 13:02 and Rs. 1,111.45 at 13:03, so the chat and dashboard surfaces agreed to within 0.03%, inside the refresh window of (1).'),
  body('*Provenance labels were applied.* The first run placed its inputs under “Model Assumptions” with an explicit note that they were illustrative, its valuation under “Model Prediction”, and its verdict under “Recommendation”. The second run used “Model Prediction / Forecast” and “Recommendation” headings and gave verdicts per investor profile (Fig. 4b). In both runs, forward-looking values were presented as estimates and never as retrieved facts.'),
  body('*Sources were shown.* Each answer ended with source cards for the retrieved web results (Economic Times, Livemint, Value Research, and others), so a reader can check the context the model was given.'),
  figure(path.join(PAPER, 'figures', 'fig-answer-table.png'), 3.4),
  subcaption('(a) Retrieved figures, reported verbatim with their source.', false),
  figure(path.join(PAPER, 'figures', 'fig-answer-forecast.png'), 3.4),
  subcaption('(b) Labelled forecast and per-profile verdicts.'),
  figCaption(4, 'High-mode answer to “What is the current share price and PE ratio of Infosys? Is it a buy at this valuation?”, 15 Oct 2026. Retrieved figures and the model’s own estimates are kept under separate, labelled headings.'),

  h2('C. Proposed Benchmark Protocol'),
  body('To compare grounded financial assistants directly, we propose evaluating three configurations on a fixed question set: the model alone, retrieval without a provenance policy, and the full system. Questions should cover live price and valuation, macro statistics, conceptual explanation, and forecasting, each in English and Hindi/Hinglish. Each live question is paired with a reference quote captured when it is asked. Table V defines the metrics.'),
  ...tableCaption('V', 'Proposed Metrics'),
  table([1380, 3660], ['Metric', 'Definition'], [
    ['Numeric accuracy', 'Share of quoted figures within ±0.5% of the reference quote (tolerance covers (1))'],
    ['Fabrication rate', 'Share of specific figures in neither the context nor stable knowledge'],
    ['Label precision', 'Share of “verified” figures that appear in the injected context'],
    ['Derivation validity', 'Share of derived and predicted values reproducible from their stated inputs'],
    ['Refusal rate', 'Share of answerable questions declined'],
    ['Faithfulness', 'Ragas faithfulness to the retrieved context [9]'],
    ['Retrieval success', 'Share of gated queries where each fetcher returned data'],
    ['Language fidelity', 'Share of answers in the language of the question'],
    ['Latency', 'p50 and p95 time to first token and to completion, by mode'],
  ]),
  spacer(),

  h1('VII. Conclusion and Future Work'),
  body('Live market grounding is practical without a vector store or a fine-tuned model. Rule-gated parallel retrieval, a shared 3-minute quote cache, and an explicit authority block let a 20B open-weight model report current Indian market figures exactly and consistently across surfaces (RQ1). The six-category provenance policy lets the assistant give forecasts and verdicts while keeping them clearly separate from retrieved facts (RQ2). Per-symbol caching, parallel retrieval, and request de-duplication delivered cross-surface consistency within six minutes and cut index loading from 5.9 s to 2.2 s (RQ3).'),
  body('Future work will extend EcoInsight in five directions: automatic post-generation checks that every “verified” figure appears in the injected context and every derived value follows from its stated inputs; a visible grounding indicator showing which sources contributed to each answer; integration of licensed exchange data feeds and real intraday history; running the benchmark protocol of Section VI-C and releasing the question set; and broader coverage of Indian-language queries.'),

  h1('References'),
  ...[
    'P. Lewis *et al.*, “Retrieval-augmented generation for knowledge-intensive NLP tasks,” in *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2020. [Online]. Available: https://arxiv.org/abs/2005.11401',
    'T. Vu *et al.*, “FreshLLMs: Refreshing large language models with search engine augmentation,” 2023, *arXiv:2310.03214*.',
    'T. Schick *et al.*, “Toolformer: Language models can teach themselves to use tools,” 2023, *arXiv:2302.04761*.',
    'S. Wu *et al.*, “BloombergGPT: A large language model for finance,” 2023, *arXiv:2303.17564*.',
    'H. Yang *et al.*, “FinGPT: Open-source financial large language models,” 2023, *arXiv:2306.06031*.',
    'P. Islam *et al.*, “FinanceBench: A new benchmark for financial question answering,” 2023, *arXiv:2311.11944*.',
    'Z. Ji *et al.*, “Survey of hallucination in natural language generation,” 2022, *arXiv:2202.03629*.',
    'S. Min *et al.*, “FActScore: Fine-grained atomic evaluation of factual precision in long form text generation,” 2023, *arXiv:2305.14251*.',
    'S. Es *et al.*, “Ragas: Automated evaluation of retrieval augmented generation,” 2023, *arXiv:2309.15217*.',
    'OpenAI, “gpt-oss-120b & gpt-oss-20b model card,” 2025, *arXiv:2508.10925*.',
  ].map((ref, i) => new Paragraph({
    style: 'Reference',
    children: [new TextRun({ text: `[${i + 1}]\t`, size: 16, font: FONT }), ...runs(ref, { size: 16 })],
  })),
];

// ---------- document ----------
const page = {
  size: { width: 12240, height: 15840 }, // US Letter
  margin: { top: 1080, bottom: 1440, left: 900, right: 900, header: 720, footer: 720 },
};
const twoCol = { count: 2, space: 360, equalWidth: true };

const doc = new Document({
  creator: 'Shivam Sharma, Gaurav Kumar Mehra, Ansh Tripathi',
  title: 'EcoInsight: Grounding a Small Open-Weight LLM in Live Indian Market Data with Serverless Retrieval and a Provenance Policy',
  styles: {
    default: { document: { run: { font: FONT, size: 20 } } },
    paragraphStyles: [
      { id: 'PaperTitle', name: 'Paper Title IEEE', basedOn: 'Normal', run: { font: FONT, size: 48 },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240, line: 240 } } },
      { id: 'Author', name: 'Author IEEE', basedOn: 'Normal', run: { font: FONT, size: 18 },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: 240 } } },
      { id: 'AfterAuthors', name: 'After Authors', basedOn: 'Normal', run: { font: FONT, size: 20 },
        paragraph: { spacing: { before: 0, after: 240, line: 240 } } },
      { id: 'BodyNoIndent', name: 'Body Text IEEE (no indent)', basedOn: 'Normal', run: { font: FONT, size: 20 },
        paragraph: { alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 0 }, spacing: { before: 0, after: 0, line: 240 } } },
      { id: 'Keywords', name: 'Keywords IEEE', basedOn: 'Normal', run: { font: FONT, size: 18, bold: true },
        paragraph: { alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 288 }, spacing: { before: 0, after: 160, line: 240 } } },
      { id: 'FigureImage', name: 'Figure IEEE', basedOn: 'Normal', run: { font: FONT, size: 20 },
        paragraph: { alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 60, line: 240 } } },
      { id: 'SubCaption', name: 'Subfigure Caption IEEE', basedOn: 'Normal', run: { font: FONT, size: 16 },
        paragraph: { alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 0, after: 100, line: 240 } } },
      { id: 'SubCaptionBreak', name: 'Subfigure Caption IEEE (column may break after)', basedOn: 'Normal', run: { font: FONT, size: 16 },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100, line: 240 } } },
      { id: 'TableTitle', name: 'Table Title IEEE', basedOn: 'Normal', run: { font: FONT, size: 16, smallCaps: true },
        paragraph: { alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 0, after: 80, line: 240 } } },
      { id: 'TableText', name: 'Table Text IEEE', basedOn: 'Normal', run: { font: FONT, size: 16 },
        paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 0, after: 0, line: 190, lineRule: 'exact' } } },
      { id: 'Spacer', name: 'Spacer IEEE', basedOn: 'Normal', run: { font: FONT, size: 12 },
        paragraph: { spacing: { before: 0, after: 120, line: 240 } } },
      { id: 'Equation', name: 'Equation IEEE', basedOn: 'Normal', run: { font: FONT, size: 20 },
        paragraph: { spacing: { before: 100, after: 100, line: 240 }, tabStops: [{ type: TabStopType.CENTER, position: COL_W / 2 }, { type: TabStopType.RIGHT, position: COL_W }] } },
      { id: 'Body', name: 'Body Text IEEE', basedOn: 'Normal', run: { font: FONT, size: 20 },
        paragraph: { alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 288 }, spacing: { before: 0, after: 0, line: 240 } } },
      { id: 'Abstract', name: 'Abstract', basedOn: 'Normal', run: { font: FONT, size: 18, bold: true },
        paragraph: { alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 288 }, spacing: { before: 0, after: 80, line: 240 } } },
      { id: 'H1', name: 'Heading 1 IEEE', basedOn: 'Normal', next: 'Body', run: { font: FONT, size: 20, smallCaps: true },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 100, line: 240 }, keepNext: true, outlineLevel: 0 } },
      { id: 'H2', name: 'Heading 2 IEEE', basedOn: 'Normal', next: 'Body', run: { font: FONT, size: 20, italics: true },
        paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 140, after: 70, line: 240 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Caption', name: 'Figure Caption IEEE', basedOn: 'Normal', run: { font: FONT, size: 16 },
        paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { before: 60, after: 200, line: 220 } } },
      { id: 'TableCaption', name: 'Table Caption IEEE', basedOn: 'Normal', run: { font: FONT, size: 16 },
        paragraph: { alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 0, line: 240 } } },
      { id: 'Reference', name: 'Reference IEEE', basedOn: 'Normal', run: { font: FONT, size: 16 },
        paragraph: { alignment: AlignmentType.JUSTIFIED, indent: { left: 400, hanging: 400 }, spacing: { before: 0, after: 40, line: 220 }, tabStops: [{ type: TabStopType.LEFT, position: 400 }] } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT }] },
      { reference: 'contrib', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1)', alignment: AlignmentType.LEFT }] },
    ],
  },
  sections: [
    { properties: { page }, children: [...titleBlock, authorTable, new Paragraph({ style: 'AfterAuthors', children: [] })] },
    { properties: { page, type: SectionType.CONTINUOUS, column: twoCol }, children: partA },
    { properties: { page, type: SectionType.CONTINUOUS, column: { count: 1 } }, children: fig1 },
    { properties: { page, type: SectionType.CONTINUOUS, column: twoCol }, children: partB },
    { properties: { page, type: SectionType.CONTINUOUS, column: { count: 1 } }, children: table4 },
    { properties: { page, type: SectionType.CONTINUOUS, column: twoCol }, children: partC },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log('wrote', OUT, buf.length, 'bytes');
});
