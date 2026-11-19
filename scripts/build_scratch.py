import json, hashlib, zipfile
from pathlib import Path
out=Path(__file__).resolve().parents[1] / 'scratch'; out.mkdir(exist_ok=True); assets={}
def costume(name,svg,cx,cy):
    data=svg.encode(); aid=hashlib.md5(data).hexdigest(); assets[aid+'.svg']=data
    return dict(name=name,assetId=aid,md5ext=aid+'.svg',dataFormat='svg',rotationCenterX=cx,rotationCenterY=cy,bitmapResolution=1)
def svg(w,h,inside): return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{inside}</svg>'
bg='<rect width="480" height="360" fill="#86af55"/>'
for y in range(0,360,40):
 for x in range(0,480,40): bg+=f'<rect x="{x}" y="{y}" width="39" height="39" fill="'+('#80a64d' if (x+y)//40%2 else '#8bb45a')+'"/>'
bg+='<rect x="0" y="0" width="480" height="42" fill="#173c30"/><text x="465" y="27" text-anchor="end" font-family="monospace" font-size="17" font-weight="bold" fill="#fff2cf">BLOCK GOBBLER</text><rect x="0" y="329" width="480" height="31" fill="#173c30"/><text x="240" y="350" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#fff2cf">Move your mouse. Eat blocks. Cake = 3 points!</text>'
backdrop=costume('Picnic meadow',svg(480,360,bg),240,180)
hole=costume('Hungry hole',svg(100,100,'<circle cx="50" cy="50" r="47" fill="#112622" stroke="#dcf4a4" stroke-width="4"/><rect x="33" y="43" width="10" height="13" fill="#fff2cf"/><rect x="57" y="43" width="10" height="13" fill="#fff2cf"/>'),50,50)
grass=costume('Grass block',svg(30,30,'<path d="M2 2h26v26H2z" fill="#986344"/><path d="M2 2h26v9H2z" fill="#c1ef76"/><path d="M6 16h5v5H6zM19 23h5v3h-5z" fill="#744833"/>'),15,15)
wood=costume('Wood block',svg(34,34,'<path d="M2 2h30v30H2z" fill="#b2824b"/><path d="M7 7h20v20H7zM12 12h10v10H12z" fill="none" stroke="#734a2b" stroke-width="3"/>'),17,17)
cake=costume('Cake block',svg(40,36,'<path d="M2 2h36v32H2z" fill="#ac6547"/><path d="M2 2h36v19H2z" fill="#fff2d8"/><path d="M7 7h6v6H7zM24 11h6v6h-6zM17 4h4v4h-4z" fill="#eb6d80"/><path d="M2 26h36v4H2z" fill="#f6c98c"/>'),20,18)
class Code:
 def __init__(self): self.b={};self.n=0
 def add(self,op,inputs=None,fields=None,shadow=False):
  self.n+=1; id=f'b{self.n}';self.b[id]=dict(opcode=op,next=None,parent=None,inputs=inputs or {},fields=fields or {},shadow=shadow,topLevel=False);return id
 def reporter(self,op,inputs=None,fields=None): return self.add(op,inputs,fields)
 def ref(self,id): return [2,id]
 def num(self,n): return [1,[4,str(n)]]
 def text(self,s): return [1,[10,s]]
 def var(self,name): return [3,[12,name,{'Score':'score','Hole size':'size'}[name]],[4,'0']]
 def chain(self,*ids):
  for a,b in zip(ids,ids[1:]):self.b[a]['next']=b;self.b[b]['parent']=a
  return ids[0]
 def sub(self,parent,child): self.b[parent]['inputs']['SUBSTACK']=self.ref(child);self.b[child]['parent']=parent
 def root(self,id,x=30,y=40):self.b[id].update(topLevel=True,x=x,y=y)
 def fix(self):
  for id,b in self.b.items():
   for v in b['inputs'].values():
    if isinstance(v[1],str) and v[1] in self.b:self.b[v[1]]['parent']=id
  return self.b
 def setvar(self,name,value,change=False):return self.add('data_changevariableby' if change else 'data_setvariableto',{'VALUE':self.num(value)},{'VARIABLE':[name,{'Score':'score','Hole size':'size'}[name]]})
 def receive(self): return self.add('event_whenbroadcastreceived',fields={'BROADCAST_OPTION':['Start picnic','start']})
 def random(self,a,b):return self.reporter('operator_random',{'FROM':self.num(a),'TO':self.num(b)})
 def goto(self):return self.add('motion_gotoxy',{'X':self.ref(self.random(-200,200)),'Y':self.ref(self.random(-130,115))})

def target(name,costumes,code,stage=False,**kw):
 t=dict(isStage=stage,name=name,variables={},lists={},broadcasts={},blocks=code.fix(),comments={},currentCostume=0,costumes=costumes,sounds=[],volume=100,layerOrder=0 if stage else 1)
 if stage:t.update(tempo=60,videoTransparency=50,videoState='on',textToSpeechLanguage=None)
 else:t.update(visible=True,x=0,y=0,size=100,direction=90,draggable=False,rotationStyle='all around')
 t.update(kw);return t
c=Code();flag=c.add('event_whenflagclicked');s=c.setvar('Score',0);z=c.setvar('Hole size',60)
m=c.add('event_broadcast_menu',fields={'BROADCAST_OPTION':['Start picnic','start']},shadow=True);b=c.add('event_broadcast',{'BROADCAST_INPUT':[1,m]});c.chain(flag,s,z,b);c.root(flag)
stage=target('Stage',[backdrop],c,True,variables={'score':['Score',0],'size':['Hole size',60]},broadcasts={'start':'Start picnic'})
c=Code();e=c.receive();forever=c.add('control_forever');menu=c.add('motion_goto_menu',fields={'TO':['_mouse_']},shadow=True);go=c.add('motion_goto',{'TO':[1,menu]});size=c.add('looks_setsizeto',{'SIZE':c.var('Hole size')});c.chain(e,forever);c.sub(forever,c.chain(go,size));c.root(e)
ht=target('Hole',[hole],c,size=60,layerOrder=1)
foods=[]
for i,(name,cost,points,x,y) in enumerate([('Grass',grass,1,-150,50),('Wood',wood,1,140,70),('Cake',cake,3,0,-100)]):
 c=Code();e=c.receive();hide=c.add('looks_hide');go=c.goto();forever=c.add('control_forever');c.chain(e,hide,go,forever)
 # Pick a safe new place, even when the hole is large.
 menu=c.add('sensing_distancetomenu',fields={'DISTANCETOMENU':['Hole']},shadow=True);dist=c.reporter('sensing_distanceto',{'DISTANCETOMENU':[1,menu]});gt=c.reporter('operator_gt',{'OPERAND1':c.ref(dist),'OPERAND2':c.num(110)});pick=c.add('control_repeat_until',{'CONDITION':c.ref(gt)});c.sub(pick,c.goto())
 show=c.add('looks_show');menu=c.add('sensing_touchingobjectmenu',fields={'TOUCHINGOBJECTMENU':['Hole']},shadow=True);touch=c.reporter('sensing_touchingobject',{'TOUCHINGOBJECTMENU':[1,menu]});wait=c.add('control_wait_until',{'CONDITION':c.ref(touch)})
 hide2=c.add('looks_hide');score=c.setvar('Score',points,True)
 lt=c.reporter('operator_lt',{'OPERAND1':c.var('Hole size'),'OPERAND2':c.num(140)});cond=c.add('control_if',{'CONDITION':c.ref(lt)});c.sub(cond,c.setvar('Hole size',4,True))
 pause=c.add('control_wait',{'DURATION':c.num(.25)});relocate=c.goto();c.sub(forever,c.chain(pick,show,wait,hide2,score,cond,pause,relocate));c.root(e)
 foods.append(target(name,[cost],c,x=x,y=y,layerOrder=i+2))
project=dict(targets=[stage,ht,*foods],monitors=[dict(id='score',mode='default',opcode='data_variable',params={'VARIABLE':'Score'},spriteName=None,value=0,width=0,height=0,x=8,y=8,visible=True,sliderMin=0,sliderMax=100,isDiscrete=True)],extensions=[],meta=dict(semver='3.0.0',vm='12.0.0',agent='Family Block Gobbler starter'))
with zipfile.ZipFile(out/'Block-Gobbler-Scratch.sb3','w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('project.json',json.dumps(project))
 for name,data in assets.items():z.writestr(name,data)
print('Created Scratch project:',len(project['targets']),'targets,',sum(len(t['blocks']) for t in project['targets']),'blocks')
