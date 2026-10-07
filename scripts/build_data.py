import json,re,collections
nd=json.load(open('/tmp/ndmo_parsed.json')); ndi=json.load(open('/tmp/ndi_parsed.json'))
clean=lambda s:re.sub(r'\s+',' ',s).strip()
# ---- NDMO fixes
specs=[s for s in nd['specs']]
for s in specs:
    if s['id']=='DC.2.1': s['priority']='NCA'; s['text']='The Entity shall assign data handling and protection controls to datasets and artifacts based on their classification to ensure secure handling, processing, sharing and disposal of data by following the National Cybersecurity Authority regulations. (Priority: as specified by NCA)'; s['text_raw']=s['text']
ntxt=open('/tmp/ndmo.txt').read()
ctl=[c for c in nd['controls'] if c['id']]
for c in ctl:
    m=re.search(r'Control ID\s+'+re.escape(c['id'])+r'\b(.*?)Specification\s+Specification',ntxt,re.S)
    if m:
        t=re.sub(r'^\s*\n','',m.group(1)); t=re.sub(r'\n\s*(Control|Description)\s*(?=\n)','\n',t)
        t=re.sub(r'^\s*Control\s+','',clean(t)); t=re.sub(r'^Description\s+','',t); c['description']=t
# ---- OE metrics
oe=open('/tmp/oe.txt').read()
metrics=[]
for m in re.finditer(r'Metric ID\s+([A-Z]+\.OE\.\d+)\s+Metric Name\s+(.*?)\n\s*Metric Description(.*?)Domain Name\s+(.*?)\n\s*Data Platforms\s+(.*?)\n(.*?)Acceptable Threshold\s+(.*?)\n',oe,re.S):
    mid,name,desc,dom,plat,mid2,thr=m.groups()
    metrics.append({'code':mid,'name':clean(name),'platform':clean(plat),'threshold':clean(thr),'domain':mid.split('.')[0],'desc':clean(desc)[:700]})
seen={};[seen.setdefault(m['code'],m) for m in metrics]; metrics=list(seen.values())
metrics+=[{'code':'OD.OE.05','name':'Response effectiveness to new open dataset requests','platform':'Open Data Platform (ODP)','threshold':'70%','domain':'OD','desc':'Measures the time taken to process new open dataset requests raised on ODP. A request ends by publishing the dataset or rejecting it with justification when the data is unavailable.'},{'code':'DO.OE.02','name':'Responsiveness of GSB API calls','platform':'Government Service Bus (GSB)','threshold':'94%','domain':'DO','desc':'Measures the percentage of failed API calls (errors caused by the provider entity) against total calls on the entity APIs published on GSB.'}]  # tables split across PDF pages; verified manually
W={'DSI.OE.02':.20,'DO.OE.03':.05,'DQ.OE.02':.05,'DO.OE.02':.10,'DSI.OE.01':.05,'RMD.OE.01':.10,'OD.OE.01':.15,'OD.OE.05':.05,'MCM.OE.01':.05,'MCM.OE.02':.05,'MCM.OE.03':.05,'DSI.OE.05':.05,'DQ.OE.03':.05}
for m in metrics: m['round3Weight']=W.get(m['code'])
# ---- NDI cleanup
LV={0:'Absence of Capabilities',1:'Establishing',2:'Defined',3:'Activated',4:'Managed',5:'Pioneer'}
def groups(lines):
    g=[]
    for raw in lines:
        t=cl(raw); r=raw.strip()
        if not t: continue
        if r.startswith(('\uf0b7','\u2022')) or (r.startswith('-') and g):
            if g: g[-1]['points'].append(t)
            continue
        g.append({'text':t,'points':[]})
    return g
def cl(x): 
    x=x.replace('\uf0b7','').replace('\u2022','').strip(' -•'); x=re.split(r'Has the entity|Maturity Questions',x)[0]; return clean(x)
mq={}
for k,q in ndi['questions'].items():
    lv={}
    for L,e in ndi['evidence'].get(k,{}).items():
        ev=[cl(i) for i in e['evidence'] if cl(i) and not cl(i).lower().startswith('all level')]
        gs=groups(e['criteria'])
        pair=len(gs)==len(ev)
        lv[L]={'name':LV[int(L)],'items':[{'evidence':x,'criteria':(gs[i] if pair else None)} for i,x in enumerate(ev)],'loose':([] if pair else gs)}
    mq[k]={'code':k,'question':q,'levels':lv}
# ---- recommended-practice methodology templates (NOT official NDMO content)
T={
'Strategy':['Assess current data-management challenges and business drivers','Draft the document covering every required element in the specification text','Review with the Data Management Office and legal/risk stakeholders','Obtain formal approval from the Data Management Committee / authority holder','Publish internally and record the approval decision and version'],
'Plan':['Baseline the current state against the specification','Define initiatives, owners, timeline and budget','Prioritise (e.g., impact vs. ease) and mark quick wins','Obtain approval and track progress with periodic status reports'],
'Policy':['Run a gap analysis against NDMO policies and sector regulations','Draft the policy/standard using the entity template (name, version, scope, statements, document control)','Review, approve through the governance committee and publish','Communicate to stakeholders and keep acknowledgement evidence'],
'Training':['Identify target roles and training needs','Build or procure the curriculum and schedule sessions','Deliver sessions and capture attendance and feedback','Measure effectiveness and refresh annually'],
'Organization':['Define the required roles and responsibilities from the specification','Issue appointment decisions and job descriptions','Document the operating structure and RACI','Review role coverage periodically'],
'Performance':['Define KPIs with owner, equation, baseline and target','Collect measurements on a fixed cadence','Produce an approved monitoring report with improvement recommendations'],
'Artifacts':['Identify the artifacts required by the specification','Create them in the agreed template and tool','Version-control, review and approve','Publish to the designated repository (e.g., catalog/portal) for stakeholders'],
'Compliance':['Define audit scope, frequency and checklists','Plan and perform the audit','Report findings with remediation owners and deadlines','Track remediation to closure'],
}
def method(c):
    for k,v in T.items():
        if k.lower() in c['name'].lower(): return v
    return ['Read the specification text and list each requirement it contains','Assign an accountable owner and set a delivery date','Design and implement the process, tooling or document that satisfies each requirement','Approve it through the entity governance route','Retain dated evidence (see the NDI evidence checklist)']
cmap={c['id']:c for c in ctl}
out_specs=[]
for s in specs:
    refs=ndi['specMap'].get(s['id'],[])
    rel=[]
    for q,L in refs:
        e=mq.get(q,{}).get('levels',{}).get(str(L),{})
        rel.append({'mq':q,'level':L,'levelName':LV[L]})
    s['methodology']=method(cmap[s['control']]); s['methodologyNote']='Recommended practice - not official NDMO content'
    s['ndi']=rel
    dom=s['id'].split('.')[0]
    s['oe']=[m['code'] for m in metrics if m['domain']==dom]
    s.pop('text_raw',None); out_specs.append(s)
dom=[d for d in nd['domains']]
js='// AUTO-GENERATED by scripts/build_data.py from NDMO Standards v1.5, NDI v1.1 and OE docs. Do not hand-edit.\n'
js+='export const domains = '+json.dumps(dom,ensure_ascii=False)+';\n'
js+='export const controls = '+json.dumps(ctl,ensure_ascii=False)+';\n'
js+='export const specifications = '+json.dumps(out_specs,ensure_ascii=False)+';\n'
js+='export const maturityQuestions = '+json.dumps(mq,ensure_ascii=False)+';\n'
js+='export const oeMetrics = '+json.dumps(metrics,ensure_ascii=False)+';\n'
import os; os.makedirs('src',exist_ok=True); open('src/ndmoData.js','w').write(js)
print(len(dom),len(ctl),len(out_specs),len(mq),len(metrics),len(js)//1024,'KB')
print('no NDI link:',[s['id'] for s in out_specs if not s['ndi']])
print('empty ctl desc:',[c['id'] for c in ctl if not c['description']])
print([(m['code'],m['threshold']) for m in metrics][:26])
print(sum(1 for q in mq.values() if not q['levels']),'MQs w/o evidence')
