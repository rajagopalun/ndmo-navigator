import re, json, collections
pages=open('/tmp/ndi.txt').read().split('\f')
SPEC=re.compile(r'\b([A-Z]{2,4})\.(\d+)\.(\d+)\b')
MQ=re.compile(r'^\s{0,25}([A-Z]{2,4}\.MQ\.\d+)\s*(\S.*)?$')
LV=re.compile(r'^\s{0,20}Level (\d):\s*(.*)$')
clean=lambda s:re.sub(r'\s+',' ',s).strip()
questions={}; a1=collections.defaultdict(lambda: collections.defaultdict(list))  # mq->lvl->lines
a2=collections.defaultdict(lambda: collections.defaultdict(list))
def walk(rng,store,hdr):
    mq=None;lvl=None;qbuf=None;cols=None
    for pn in rng:
        lines=pages[pn].split('\n')
        for i,l in enumerate(lines):
            m=MQ.match(l)
            if m and 'Maturity' not in l and 'Checklist' not in l:
                if m[1]!=mq: lvl=None
                mq=m[1]; k=i-1
                while k>=0 and not lines[k].strip(): k-=1
                prev=lines[k].strip() if k>=0 and 'Maturity' not in lines[k] and 'Checklist' not in lines[k] else ''
                qbuf=[prev,m[2] or '']
                j=i+1
                while j<len(lines) and lines[j].strip() and not MQ.match(lines[j]) and not lines[j].strip().startswith(('Level','Levels')) and len(qbuf)<4:
                    qbuf.append(lines[j].strip()); j+=1
                questions.setdefault(mq,clean(' '.join(qbuf)))
                continue
            if hdr in l and ('Acceptance Evidence' in l): 
                if hdr=='Levels': cols=(l.index('Acceptance Evidence'),l.index('Acceptance Criteria'))
                continue
            m=LV.match(l)
            if m: lvl=int(m[1])
            if mq and lvl is not None: store[mq][lvl].append((pn,l,cols))
walk(range(16,88),a1,'Level Name'); walk(range(88,245),a2,'Levels')
# spec -> [(mq,level)]
smap=collections.defaultdict(set)
for mq,lv in a1.items():
    for L,ls in lv.items():
        for _,l,_ in ls:
            for m in SPEC.finditer(l):
                if m[1]!='MQ': smap[f'{m[1]}.{m[2]}.{m[3]}'].add((mq,L))
# App II per mq/level: evidence col + criteria col
ev={}
for mq,lv in a2.items():
    ev[mq]={}
    for L,ls in lv.items():
        E=[];C=[];curE=None
        for pn,l,cols in ls:
            if not cols: continue
            ec,cc=cols
            if 'Checklist' in l or l.strip()=='Public' or re.search(r'\s+Public\s+\d+$',l) or MQ.match(l): continue
            ecol=l[ec-2:cc-2] if len(l)>ec else ''; ccol=l[cc-2:] if len(l)>cc else ''
            ecol=ecol.strip(); ccol=ccol.strip()
            if ecol: E.append(ecol)
            if ccol: C.append(ccol)
        # rebuild evidence list: items start with '-'
        items=[];
        for e in E:
            if e.startswith('-'): items.append(e.lstrip('- ').strip())
            elif items: items[-1]+=' '+e
        crit=[];
        for c in C:
            if re.match(r'^(Attach|The entity|The Entity|-|•|\uf0b7|\u2022)',c) or not crit: crit.append(c)
            else: crit[-1]+=' '+c
        ev[mq][L]={'evidence':[clean(i) for i in items if clean(i)],'criteria':[clean(c) for c in crit]}
out={'questions':questions,'specMap':{k:sorted(v) for k,v in smap.items()},'evidence':ev}
json.dump(out,open('/tmp/ndi_parsed.json','w'),indent=1,ensure_ascii=False)
print(len(questions),len(smap),sum(len(v) for v in ev.values()))
print(list(questions.items())[:3])
print(json.dumps(ev['DG.MQ.1'],indent=1)[:2500]); print(smap['DG.1.1'])
