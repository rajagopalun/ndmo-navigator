import pdfplumber,re,json
LIG={'لا':'\ue001','لأ':'\ue002','لإ':'\ue003','لآ':'\ue004'}; INV={v:k for k,v in LIG.items()}
def fix(s):
    out=[]
    for l in [x for x in (s or '').split('\n') if x.strip()]:
        r=l[::-1]; r=re.sub(r'[A-Za-z0-9](?:[A-Za-z0-9.\-:/_ ]*[A-Za-z0-9])?',lambda m:m.group(0)[::-1],r)
        out.append(r)
    t=' '.join(out)
    for k,v in INV.items(): t=t.replace(k,v)
    return re.sub(r'\s+',' ',t).strip()
pdf=pdfplumber.open('/mnt/user-data/uploads/ndmo_arabic.pdf')
dom={};ctl={};spec={}
ID=re.compile(r'^[A-Z]{2,4}(\.\d+){1,2}$|^[A-Z]{2,4}$')
for pn in range(14,len(pdf.pages)):
    p=pdf.pages[pn]
    for c in p.chars:
        if c['text'] in LIG: c['text']=LIG[c['text']]
    for t in p.extract_tables():
        for r in t:
            cells=[fix(c) for c in r if c and c.strip()]
            if not cells: continue
            if 'اسم المجال' in cells and len(cells)>=3: i=cells.index('اسم المجال'); dom[cells[0]]=cells[i-1]
            elif 'اسم الضابط' in cells and len(cells)>=3: i=cells.index('اسم الضابط'); ctl.setdefault(cells[0],{})['name']=cells[i-1]
            elif 'وصف الضابط' in cells: ctl.setdefault('_last',{}); cid=[k for k in ctl if k!='_last'][-1]; ctl[cid]['desc']=cells[0]
            else:
                ids=[c for c in cells if re.fullmatch(r'[A-Z]{2,4}\.\d+\.\d+',c)]
                if ids and len(cells)>=3:
                    i=cells.index(ids[0]); sid=ids[0]
                    spec[sid]={'name':cells[i-1],'text':max(cells[:i-1],key=len) if cells[:i-1] else '','page':pn+1}
ctl.pop('_last',None)
print(len(dom),len(ctl),len(spec))
en=json.load(open('/tmp/ndmo_parsed.json')); miss=[s['id'] for s in en['specs'] if s['id'] not in spec]; print('missing specs',miss[:10],len(miss))
print('missing ctl',[c['id'] for c in en['controls'] if c['id'] and c['id'] not in ctl][:10])
json.dump({'domains':dom,'controls':ctl,'specs':spec},open('/tmp/ndmo_ar.json','w'),ensure_ascii=False)
for k in ('DG.1.1','DG.3.1'): print(k,spec.get(k))
print(dom.get('DG'),ctl.get('DG.3'))
