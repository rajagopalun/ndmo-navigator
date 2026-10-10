// Facts below are taken from the official documents (NDMO Standards v1.5, NDI v1.1, NDI OE v5.0 and OE Support Handbook v6.0).
export const DOCS = [
  { tag: 'NDMO', title: 'National Data Management and Personal Data Protection Standards', ver: 'Version 1.5', by: 'National Data Management Office (NDMO)', file: 'NDMO.pdf', desc: 'Controls and specifications for 15 data management and personal data protection domains.' },
  { tag: 'NDI', title: 'National Data Index (NDI)', ver: 'Version 1.1', by: 'Saudi Data & AI Authority (SDAIA)', file: 'National-Data-Index_v1_0_EN.pdf', desc: 'Maturity questions, assessment levels and acceptance-evidence checklists (Appendices I and II).' },
  { tag: 'NDI OE', title: 'National Data Index – Operational Excellence (OE)', ver: 'Version 5.0 (document dated 18/11/2025)', by: 'Saudi Data & AI Authority (SDAIA)', file: 'OperationalExcellence-OE.pdf', desc: 'Operational Excellence metrics, calculation approach and scale intervals.' },
  { tag: 'NDI OE', title: 'NDI Operational Excellence – Support Handbook', ver: 'Version 6.0 (August 2026)', by: 'Saudi Data & AI Authority (SDAIA)', file: 'FAQsforOperationalExcellence.pdf', desc: 'Questions and answers, examples and the metrics and weights targeted in the 2026 round.' },
]
export const INTRO = {
  ndmo: { title: 'NDMO – Data Management and Personal Data Protection Standards', paras: [
    'The Data Management and Personal Data Protection Standards were developed by the National Data Management Office (NDMO), the national regulator of data in the Kingdom, to govern data management practices across government entities.',
    'The document covers 15 domains, each with controls and specifications. Government entities must implement the standards, and compliance is measured yearly.'],
    note: 'This section lists the domains that have controls and specifications in the NDMO document. The controls of Data Security and Protection are issued by the National Cybersecurity Authority and are not listed in it.' },
  ndi: { title: 'NDI – National Data Index (Maturity and acceptance evidence)', paras: [
    'The National Data Index (NDI) is SDAIA’s monitoring and evaluation index for government entities. It assesses the maturity of data management practices, compliance with the Data Management and Personal Data Protection Standards, and Operational Excellence (OE).',
    'This section follows the NDI maturity questions: each question is assessed at maturity levels from Level 0 “Absence of Capabilities” to Level 5 “Pioneer”, with acceptance evidence and criteria listed per level.'],
    note: 'Every NDI evidence item is linked to the NDMO specification it relates to; use the cross-references on each page.' },
  oe: { title: 'NDI Operational Excellence (OE)', paras: [
    'Operational Excellence measures how efficiently and effectively government entities run their data management operations, using information captured from the national data platforms managed by SDAIA (for example GSB, NDL, NDC, RDP, ODP and Tawakkalna).',
    'OE consists of 24 metrics across six domains. The 2026 round (1 January – 31 December 2026) targets 13 of them, each with a weight; scores are mapped to a 0–5 scale from Unacceptable to Leader.'],
    note: 'SDAIA collects OE results from the platforms; entities do not submit evidence for OE metrics. Use this tracker for your internal action status.' },
}
