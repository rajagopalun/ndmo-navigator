import pdfplumber, re, json, collections
SPEC=re.compile(r'^([A-Z]{2,4})[ .](\d+)\.(\d+)$')
clean=lambda s:re.sub(r'\s+',' ',(s or '').replace('\n',' ')).strip()
def keep_lines(s):
    # keep numbered lists as line breaks
    return re.sub(r'[ \t]+',' ',(s or '')).strip()
pdf=pdfplumber.open('/mnt/user-data/uploads/NDMO.pdf')
domains=collections.OrderedDict(); controls=collections.OrderedDict(); specs=collections.OrderedDict()
cur_dom=None; cur_ctl=None; last=None
for pn in range(14,len(pdf.pages)):
    for t in pdf.pages[pn].extract_tables():
        for r in t:
            cells=[clean(c) for c in r]
            ne=[c for c in cells if c]
            if not ne: continue
            if 'Domain Name' in cells:
                i=cells.index('Domain Name'); name=next(c for c in cells[i+1:] if c)
                did=[c for c in cells if re.fullmatch(r'[A-Z]{2,4}',c)]
                cur_dom={'name':name,'id':did[-1] if did else None}; domains[cur_dom['id']]=cur_dom; last=None
            elif 'Control Name' in cells:
                i=cells.index('Control Name'); name=next(c for c in cells[i+1:] if c)
                cid=[c for c in cells if re.fullmatch(r'[A-Z]{2,4}[ .]\d+',c)]
                cid=cid[-1].replace(' ','.') if cid else None
                cur_ctl={'id':cid,'name':name,'description':'','domain':cur_dom['id'] if cur_dom else None}; controls[cid]=cur_ctl; last=None
            elif ne[0].startswith('Control') and len(ne)>=2 and 'Description' in ne[0] and cur_ctl and not cur_ctl['description']:
                cur_ctl['description']=ne[1]
            elif SPEC.match(ne[0]):
                m=SPEC.match(ne[0]); sid=f'{m[1]}.{m[2]}.{m[3]}'
                pr=ne[-1] if re.fullmatch(r'P[123]',ne[-1]) else None
                body=ne[1:-1] if pr else ne[1:]
                raw=[c for c in r if c and c.strip()]
                rawbody=raw[1:-1] if pr else raw[1:]
                name=body[0] if body else ''
                text_raw=rawbody[-1] if len(rawbody)>=2 else ''
                text=clean(body[-1]) if len(body)>=2 else ''
                specs[sid]={'id':sid,'name':name,'text':text,'text_raw':keep_lines(text_raw),'priority':pr,'control':f'{m[1]}.{m[2]}'}
                last=sid
            elif last and not cells[0] and len(ne)>=1 and not any(k in cells for k in ('Version History','Dependencies')) and not re.match(r'^(June|Jan|Feb|Mar|Apr|May|Jul|Aug|Sep|Oct|Nov|Dec)',ne[0]):
                specs[last]['text']+=' '+ne[-1]
byd=collections.Counter(s['id'].split('.')[0] for s in specs.values())
print(len(domains),len(controls),len(specs)); print(dict(byd)); print({d:v['name'] for d,v in domains.items()})
json.dump({'domains':list(domains.values()),'controls':list(controls.values()),'specs':list(specs.values())},open('/tmp/ndmo_parsed.json','w'),indent=1,ensure_ascii=False)
