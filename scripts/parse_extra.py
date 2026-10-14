import re,json,unicodedata
norm=lambda x: re.sub('[\u202a-\u202e\u200e\u200f]','',unicodedata.normalize('NFKC',x))
# ---------- 1. NDI English: levels from Appendix I (fixes missing levels such as DG.MQ.1 L0-L2)
pages=open('/tmp/ndi.txt').read().split('\f')
lv={};mq=None;cols=None;L=None;rel=None
for pn in range(16,87):
    for l in pages[pn].split('\n'):
        m=re.match(r'^\s{0,30}([A-Z]{2,4}\.MQ\.\d+)\b',l)
        if m and 'Level' not in l: mq=m[1]; L=None; lv.setdefault(mq,{}); continue
        if re.search(r'\bRelated\b',l) and 'Level' not in l: rel=l.index('Related')
        if 'Level Description' in l and 'Acceptance Evidence' in l: e0=l.index('Acceptance Evidence'); cols=(l.index('Level Description'),e0,rel if rel and rel>e0 else e0+36); continue
        m=re.match(r'^\s{0,20}Level (\d):',l)
        if m: L=int(m[1])
        if mq and cols and L is not None:
            d,e,r=cols; lv[mq].setdefault(L,{'d':[],'e':[]})
            lv[mq][L]['d'].append(l[d-2:e-2].strip() if len(l)>d else '')
            lv[mq][L]['e'].append(l[e-2:r-2].strip() if len(l)>e else '')
def bullets(lines):
    out=[]
    for x in lines:
        if not x: continue
        if x.startswith('-'): out.append(x.lstrip('- ').strip())
        elif out: out[-1]+=' '+x
    return [re.sub(r'\s+',' ',b) for b in out]
res={}
for q,ls in lv.items():
    res[q]={}
    for L,v in ls.items():
        ev=[b for b in bullets(v['e']) if not re.match(r'(?i)(all level \d|requirements including|no required documents)',b)]
        # drop continuation lines that were glued to "All level N ..." paragraphs
        res[q][L]={'desc':' '.join(bullets(v['d'])),'items':ev}
json.dump(res,open('/tmp/ndi_levels.json','w'),ensure_ascii=False)
print('MQs',len(res),'levels',sum(len(v) for v in res.values()))
print(json.dumps(res['DG.MQ.1'],ensure_ascii=False)[:700])
# ---------- 2. PDPL English articles
t=open('/tmp/pdpl_en.txt').read().replace('\f','\n')
parts=re.split(r'\n\s*Article (\d+)\s*\n',t)
arts={}
for i in range(1,len(parts),2):
    n=int(parts[i]); body=parts[i+1]
    paras=[]
    for l in [x.strip() for x in body.split('\n') if x.strip()]:
        if re.match(r'^(\d+\s*[-.)]|[A-Za-z]\)|\([a-z]\))',l) or not paras: paras.append(l)
        else: paras[-1]+=' '+l
    arts[n]=[re.sub(r'\s+',' ',p) for p in paras]
print('articles',len(arts),sorted(arts)[:3],sorted(arts)[-2:]); print(arts[4][:2])
# ---------- 3. Arabic page maps
ar=open('/tmp/pdpl_ar.txt').read().split('\f'); cnt=0; ppage={}
for pn,p in enumerate(ar):
    for l in norm(p).split('\n'):
        if re.match(r'^\s*(ةداملا|المادة)\s+[^()\d]{2,40}$',l.strip().rstrip(':').strip()+''): cnt+=1; ppage[cnt]=pn+1
print('arabic PDPL headings',cnt)
na=open('/tmp/ndi_ar.txt').read().split('\f'); ndi_pg={}
codes=sorted(res.keys())
for c in codes:
    hits=[i+1 for i,p in enumerate(na) if c in p]
    if hits: ndi_pg[c]={'q':hits[0],'c':next((h for h in hits if h>=85),hits[-1])}
print('NDI AR pages',len(ndi_pg),ndi_pg.get('DG.MQ.1'))
nm=open('/tmp/ndmo_ar.txt').read().split('\f'); ndmo_pg={}
en=json.load(open('/tmp/ndmo_parsed.json'))
for s in en['specs']:
    h=next((i+1 for i,p in enumerate(nm) if i>=14 and re.search(r'(?<![\w.])'+re.escape(s['id'])+r'(?![\w.])',p)),None)
    if h: ndmo_pg[s['id']]=h
print('NDMO AR page map',len(ndmo_pg),'of',len(en['specs']))
json.dump({'articles':arts,'pdplPages':ppage,'ndiPages':ndi_pg,'ndmoPages':ndmo_pg},open('/tmp/extra.json','w'),ensure_ascii=False)
