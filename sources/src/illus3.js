/* =====================================================================
   ILLUSTRATIONS DU NIVEAU 3 — famille « l3:type|arg1|arg2|… »
   Tout est dessiné en SVG (aucune image externe).
   Chaque type est une fonction L3[type](args, C, T) ; C = couleur du thème,
   T = teinte claire du thème.
   ===================================================================== */
const L3={};
function ill3(args,C,T){ const k=args[0], f=L3[k]; return f?f(args.slice(1),C,T):null; }
const PALS=['#3D7BE0','#2FA65A','#FFC233','#E5484D','#9B5DE5','#178F8F','#FF8A3D'];
const nums=s=>String(s||'').split(',').filter(x=>x!=='').map(Number);
function rr(x,y,w,h,r,fill,stroke,sw,extra){ return `<rect x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" width="${(+w).toFixed(1)}" height="${(+h).toFixed(1)}" rx="${r}" fill="${fill}" stroke="${stroke||INK}" stroke-width="${sw==null?2.5:sw}" ${extra||''}/>`; }
function chip(x,y,t,size,C,T,w){ size=size||13; w=w||Math.max(34,String(t).length*size*0.6+16); return rr(x-w/2,y-size*0.95,w,size*1.55,size*0.6,T,C,2.5)+tx(x,y+size*0.15,t,size,C,900); }
/* repère : renvoie les fonctions X, Y et le dessin des axes */
function frm(o){
  const L=o.L!=null?o.L:24, R=o.R!=null?o.R:192, Tp=o.T!=null?o.T:10, B=o.B!=null?o.B:122;
  const X=v=>L+(v-o.x0)*(R-L)/(o.x1-o.x0), Y=v=>B-(v-o.y0)*(B-Tp)/(o.y1-o.y0);
  let s='';
  if(o.grid!==false){
    if(o.gx) for(let v=Math.ceil(o.x0/o.gx-1e-9)*o.gx; v<=o.x1+1e-9; v+=o.gx) s+=ln(X(v),Tp,X(v),B,'var(--line)',0.9);
    if(o.gy) for(let v=Math.ceil(o.y0/o.gy-1e-9)*o.gy; v<=o.y1+1e-9; v+=o.gy) s+=ln(L,Y(v),R,Y(v),'var(--line)',0.9); }
  const ay=(o.y0<=0&&o.y1>=0)?Y(0):B, ax=(o.x0<=0&&o.x1>=0)?X(0):L;
  s+=ln(L,ay,R+4,ay,INK,2)+arrowHead(R+6,ay,'r',INK).replace('stroke-width="4"','stroke-width="2.5"')+ln(ax,B,ax,Tp-4,INK,2)+arrowHead(ax,Tp-6,'u',INK).replace('stroke-width="4"','stroke-width="2.5"');
  const fs=o.fs||9;
  if(o.lx) for(let v=Math.ceil(o.x0/o.lx-1e-9)*o.lx; v<=o.x1+1e-9; v+=o.lx){ if(Math.abs(v)<1e-9&&o.y0<=0&&o.x0<=0) continue; s+=ln(X(v),ay-3,X(v),ay+3,INK,1.5)+tx(X(v),ay+12,fN(+v.toFixed(4)),fs,SOFT,800); }
  if(o.ly) for(let v=Math.ceil(o.y0/o.ly-1e-9)*o.ly; v<=o.y1+1e-9; v+=o.ly){ if(Math.abs(v)<1e-9&&o.x0<=0) continue; s+=ln(ax-3,Y(v),ax+3,Y(v),INK,1.5)+tx(ax-5,Y(v)+3,fN(+v.toFixed(4)),fs,SOFT,800,'end'); }
  if(o.x0<=0&&o.y0<=0&&o.x1>=0&&o.y1>=0&&(o.lx||o.ly)) s+=tx(ax-5,ay+11,'0',fs,SOFT,800,'end');
  if(o.nx) s+=tx(R+4,ay-6,o.nx,10,INK,900,'end'); if(o.ny) s+=tx(ax+6,Tp+2,o.ny,10,INK,900,'start');
  return {X,Y,s,L,R,T:Tp,B,ax,ay};
}
/* courbe d’une fonction, coupée hors de la fenêtre */
function fpath(F,f,a,b,col,w,extra,n){ n=n||90; let d='', pen=false; const lo=Math.min(F.T,F.B)-2, hi=Math.max(F.T,F.B)+2;
  for(let i=0;i<=n;i++){ const x=a+(b-a)*i/n; const y=f(x); if(!isFinite(y)){ pen=false; continue; } const px=F.X(x), py=F.Y(y); if(py<lo-40||py>hi+40){ pen=false; continue; } d+=(pen?'L':'M')+px.toFixed(1)+' '+py.toFixed(1)+' '; pen=true; }
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w||3}" stroke-linecap="round" stroke-linejoin="round" ${extra||''} clip-path="url(#${F.cid||'none'})"/>`; }
let CLIPN=0;
function clip(F){ F.cid='c3k'+(++CLIPN); return `<defs><clipPath id="${F.cid}"><rect x="${F.L}" y="${F.T-4}" width="${F.R-F.L+6}" height="${F.B-F.T+8}"/></clipPath></defs>`; }

/* ===================== STATISTIQUE (2de) ===================== */
function miniPerson(x,y,s,col){ return `<circle cx="${x}" cy="${y}" r="${6*s}" fill="${col}" stroke="${INK}" stroke-width="2"/><path d="M${x-9*s} ${y+21*s} q0 -13 ${9*s} -13 q${9*s} 0 ${9*s} 13 z" fill="${col}" stroke="${INK}" stroke-width="2"/>`; }
L3.population=(a,C,T)=>{ let s=rr(14,8,172,104,18,'none',C,3,'stroke-dasharray="7 5"'); for(let i=0;i<10;i++){ const x=36+(i%5)*32, y=26+Math.floor(i/5)*42; s+=miniPerson(x,y,1.1,i===6&&a[0]==='un'?YEL:T); }
  return SV(s+tx(100,132,a[0]==='un'?'un individu dans la population':'la population',13,C,900)); };
L3.individu=(a,C,T)=>SV(person(100,40,YEL)+rr(40,96,120,26,10,T,C,2.5)+tx(100,114,'1 client',14,C,900)+tx(30,34,'?',22,SOFT,900)+tx(170,34,'?',22,SOFT,900));
L3.caractere=(a,C,T)=>SV(person(36,48,T)+vec(60,62,92,62,C,3)+rr(98,30,92,62,12,'#FFFFFF',C,3)+tx(144,54,'pointure',13,INK,900)+tx(144,80,'38',22,C,900)+tx(100,124,'ce que j’observe',13,C,800));
L3.qualitatif=(a,C,T)=>SV(['satisfait','moyen','déçu'].map((t,i)=>chip(100,34+i*34,t,15,C,T,110)).join('')+tx(100,134,'des mots',12,SOFT,800));
L3.quantitatif=(a,C,T)=>SV(['3 min','7 min','42,50 €'].map((t,i)=>chip(100,34+i*34,t,15,C,T,110)).join('')+tx(100,134,'des nombres',12,SOFT,800));
L3.tableau=(a,C,T)=>{ const R=[['Pointure x','37','38','39'],['Effectif n','7','12','15']]; let s=''; R.forEach((r,i)=>r.forEach((v,j)=>{ const w=j===0?70:36, x=j===0?12:82+(j-1)*36; s+=`<rect x="${x}" y="${34+i*34}" width="${w}" height="34" fill="${j===0?T:PAPER}" stroke="${INK}" stroke-width="2"/>`+tx(x+w/2,56+i*34,v,j===0?11:15,j===0?C:INK,900); })); return SV(s+tx(100,124,'valeurs et effectifs',12,SOFT,800)); };
L3.cumul=(a,C,T)=>{ const v=[4,11,23,38]; let s=''; v.forEach((h,i)=>{ const H=h*2.2; s+=`<rect x="${34+i*36}" y="${108-H}" width="28" height="${H}" rx="3" fill="${C}" fill-opacity="${.25+i*.22}" stroke="${INK}" stroke-width="1.5"/>`+tx(48+i*36,104-H,String(h),12,INK,900); if(i) s+=tx(30+i*36,120,'+',12,SOFT,900); }); return SV(s+ln(26,108,182,108,INK,2.5)+tx(100,132,'4 → 4 + 7 → …',12,C,900)); };
L3.classe=(a,C,T)=>{ const X=v=>20+v*2.6; let s=ln(14,72,190,72,INK,2.5); [0,20,40,60].forEach(v=>{ s+=ln(X(v),66,X(v),78,INK,2)+tx(X(v),94,String(v),12,INK,800); });
  s+=`<rect x="${X(20)}" y="62" width="${X(40)-X(20)}" height="20" rx="4" fill="${T}" stroke="none"/>`+ln(X(20),72,X(40),72,C,5)+dot(X(20),72,5,C,C)+`<circle cx="${X(40)}" cy="72" r="5" fill="#FFFFFF" stroke="${C}" stroke-width="2.5"/>`;
  return SV(s+tx(100,40,'[20 ; 40[',22,C,900)+tx(100,122,'20 compris, 40 non compris',12,SOFT,800)); };
L3.mode=(a,C,T)=>{ const v=[7,12,15,10], L=['37','38','39','40']; let s=''; v.forEach((h,i)=>{ const H=h*4.8, x=34+i*36; s+=rr(x,110-H,26,H,3,i===2?C:T,INK,1.5)+tx(x+13,124,L[i],12,INK,800); }); return SV(s+ln(26,110,182,110,INK,2.5)+tx(111,16,'mode : 39',14,C,900)+arrowHead(111,32,'d',C)); };
L3.moyenne=(a,C,T)=>{ const X=v=>20+v*16; let s=ln(16,70,184,70,INK,3); [[1,1],[3,2],[6,1],[10,1]].forEach(([v,n])=>{ for(let k=0;k<n;k++) s+=dot(X(v),58-k*14,6,T,C); }); const m=4.6; s+=poly([[X(m),72],[X(m)-12,96],[X(m)+12,96]],C,INK,2)+tx(X(m),116,'x̄ = 4,6',15,C,900);
  [0,2,4,6,8,10].forEach(v=>{ s+=tx(X(v),88,String(v),9,SOFT,700); }); return SV(s+tx(100,134,'le point d’équilibre',12,SOFT,800)); };
L3.quartiles=(a,C,T)=>{ let s=''; for(let i=0;i<4;i++) s+=rr(14+i*43,48,43,30,0,i%2?T:PAPER,INK,2)+tx(35.5+i*43,68,'25 %',12,INK,800);
  [['Q₁',57],['Me',100],['Q₃',143]].forEach(([t,x],i)=>{ s+=ln(x,38,x,88,i===1?ORANGE:C,4)+tx(x,106,t,15,i===1?ORANGE:C,900); }); return SV(s+tx(100,28,'la série rangée',12,SOFT,800)+tx(100,130,'4 parts de même taille',12,SOFT,800)); };
function boxRow(X,y,h,b,col,lab){ const [mi,q1,me,q3,ma]=b; let s='';
  s+=ln(X(mi),y+h/2,X(q1),y+h/2,INK,2.5)+ln(X(q3),y+h/2,X(ma),y+h/2,INK,2.5)+ln(X(mi),y+4,X(mi),y+h-4,INK,2.5)+ln(X(ma),y+4,X(ma),y+h-4,INK,2.5);
  s+=`<rect x="${X(q1).toFixed(1)}" y="${y}" width="${(X(q3)-X(q1)).toFixed(1)}" height="${h}" rx="2" fill="${col}" fill-opacity=".22" stroke="${col}" stroke-width="2.5"/>`+ln(X(me),y,X(me),y+h,col,4);
  if(lab) s+=tx(12,y+h/2+4,lab,11,INK,900,'start'); return s; }
L3.boites=(a,C,T)=>{ const s1=nums(a[0]), s2=nums(a[1]), lo=+(a[2]||0), hi=+(a[3]||Math.max(...s1,...s2)); const two=s2.length===5; const L=two?34:16, R=188, X=v=>L+(v-lo)*(R-L)/(hi-lo);
  const step=[1,2,4,5,10,20,25,50,100,200,500].find(st=>(hi-lo)/st<=8)||1000; let s='';
  for(let v=Math.ceil(lo/step)*step; v<=hi+1e-9; v+=step){ s+=ln(X(v),10,X(v),108,'var(--line)',1)+tx(X(v),124,fN(v),9,SOFT,800); }
  s+=ln(L,110,R,110,INK,2.5);
  if(two){ s+=boxRow(X,22,26,s1,BLUE,'A')+boxRow(X,66,26,s2,ORANGE,'B'); }
  else { s+=boxRow(X,40,30,s1,C,''); [['min',0],['Q₁',1],['Me',2],['Q₃',3],['max',4]].forEach(([t,i])=>{ s+=tx(X(s1[i]),i%2?94:32,t,10,i===2?ORANGE:C,900); }); }
  return SV(s); };
L3.eiq=(a,C,T)=>{ const X=v=>16+v*10.5; let s=boxRow(X,54,30,[2,5,7,9,15],C,''); s+=ln(X(5),40,X(9),40,PURP,3)+arrowHead(X(5),40,'l',PURP)+arrowHead(X(9),40,'r',PURP)+tx(X(7),24,'Q₃ − Q₁',14,PURP,900);
  return SV(s+tx(X(5),104,'Q₁',12,C,900)+tx(X(9),104,'Q₃',12,C,900)+tx(100,128,'la moitié des valeurs',12,SOFT,800)); };
L3.ecarttype=(a,C,T)=>{ const m=100; let s=dash(m,14,m,112,ORANGE,2.5)+tx(m,128,'x̄',16,ORANGE,900);
  const pts=a[0]==='petit'?[[92,40],[106,52],[96,66],[104,80],[98,92],[108,30]]:[[60,40],[140,52],[78,66],[128,80],[52,92],[150,30]];
  pts.forEach(([x,y])=>{ s+=dot(x,y,6,T,C); }); const w=a[0]==='petit'?10:42; s+=ln(m-w,104,m+w,104,PURP,3)+arrowHead(m-w,104,'l',PURP)+arrowHead(m+w,104,'r',PURP);
  return SV(s+tx(178,70,'σ',30,PURP,900)+tx(178,92,a[0]==='petit'?'petit':'grand',11,PURP,900)); };
L3.camembert=(a,C,T)=>{ const v=a[0]?nums(a[0]):[45,25,20,10], lab=a[1]?a[1].split(','):['carte','espèces','chèque','autre']; const tot=v.reduce((p,q)=>p+q,0); let s='', a0=0;
  v.forEach((x,i)=>{ const a1=a0+x/tot*2*Math.PI; s+=sector(62,70,52,a0,a1,PALS[i%PALS.length]); a0=a1; });
  lab.forEach((t,i)=>{ s+=rr(120,24+i*24,12,12,3,PALS[i%PALS.length],INK,1.5)+tx(136,34+i*24,t+(a[0]?'':' '+v[i]+' %'),10,INK,800,'start'); }); return SV(s); };
L3.serie=(a,C,T)=>SV(tx(100,30,'temps d’attente (min)',13,SOFT,800)+boxes([6,12,4,9,2,7],50,null,C,T,26)+tx(100,112,'une liste de valeurs',14,C,900));
L3.histo=(a,C,T)=>{ const b=nums(a[0]||'0,20,40,60,80'), v=nums(a[1]||'6,14,8,2'); const F=frm({x0:b[0],x1:b[b.length-1],y0:0,y1:Math.ceil(Math.max(...v)/5)*5,L:30,R:186,T:12,B:116,gy:5,ly:5,lx:b[1]-b[0],grid:true}); let s='';
  v.forEach((h,i)=>{ s+=`<rect x="${F.X(b[i]).toFixed(1)}" y="${F.Y(h).toFixed(1)}" width="${(F.X(b[i+1])-F.X(b[i])).toFixed(1)}" height="${(F.Y(0)-F.Y(h)).toFixed(1)}" fill="${C}" fill-opacity=".55" stroke="${INK}" stroke-width="1.5"/>`; }); return SV(F.s.replace(/<polyline[^>]*>/g,'')+s); };

/* ===================== LYCÉE PROFESSIONNEL : sujet, documents, outils ===================== */
L3.sujet=(a,C,T)=>{ let s=rr(40,8,120,124,8,'#FFFFFF',INK,3)+tx(100,26,'Mathématiques',12,INK,900);
  [['Partie A',38],['Partie B',70],['Annexe',102]].forEach(([t,y],i)=>{ const on=a[0]===['partie','partie','annexe'][i]&&(a[0]!=='partie'||i===0); s+=rr(50,y,100,26,6,on?T:PAPER,on?C:'#AEB6CC',on?3:2)+tx(100,y+17,t,12,on?C:SOFT,900); }); return SV(s); };
L3.annexe=(a,C,T)=>SV(rr(36,10,128,120,8,'#FFFFFF',INK,3)+rr(36,10,128,24,8,T,C,3)+tx(100,27,'ANNEXE à rendre',11,C,900)+frm({x0:0,x1:5,y0:0,y1:4,L:52,R:146,T:44,B:112,gx:1,gy:1}).s.replace(/<polyline[^>]*>/g,'')+ln(52,104,140,52,C,3));
L3.document=(a,C,T)=>SV(rr(24,10,152,120,10,'#FFFFFF',INK,3)+rr(24,10,152,24,10,T,C,3)+tx(100,27,'Document 2',12,C,900)+[46,60,74].map(y=>ln(36,y,164,y,'#AEB6CC',4)).join('')+[[40,30],[64,46],[88,22],[112,38]].map(([x,h])=>rr(x,122-h,16,h,2,C,INK,1.5)).join('')+ln(34,122,140,122,INK,2));
L3.calculatrice=(a,C,T)=>{ const scr=a[0]||'2,5×4'; let s=rr(56,6,88,128,14,'#2B3150',INK,3)+rr(64,14,72,30,5,'#D8F0D0',INK,2)+tx(132,34,scr,Math.min(12,64/(scr.length*0.56)),'#1D2240',900,'end');
  for(let r=0;r<4;r++) for(let c=0;c<4;c++) s+=rr(66+c*17,52+r*19,14,14,3,r===3&&c===3?C:'#EEF1F8','#1D2240',1.2); return SV(s+(a[1]?tx(100,148,a[1],11,C,900):'')); };
L3.tableur=(a,C,T)=>{ const hl=a[0]||'B2', f=a[1]||'=A2*3'; let s=rr(10,8,180,22,5,'#FFFFFF',INK,2)+tx(16,23,'fx',11,C,900,'start')+tx(36,23,f,12,INK,800,'start');
  const cols=['','A','B','C'], W=[24,52,52,52]; let x=10; cols.forEach((c,j)=>{ for(let r=0;r<4;r++){ const head=r===0||j===0; const id=c+r; const on=id===hl; s+=`<rect x="${x}" y="${38+r*24}" width="${W[j]}" height="24" fill="${on?T:head?'var(--sunk)':PAPER}" stroke="${on?C:INK}" stroke-width="${on?3:1.5}"/>`;
      const v=r===0?c:j===0?String(r):(a[2]&&a[2].split(';')[r-1]?a[2].split(';')[r-1].split('/')[j-1]||'':''); if(v) s+=tx(x+W[j]/2,55+r*24,v,11,head?SOFT:INK,800); } x+=W[j]; }); return SV(s); };
L3.cellule=(a,C,T)=>L3.tableur(['B2','← la cellule B2',''],C,T);
L3.recopier=(a,C,T)=>{ let s=L3.tableur(['C2','=A2*B2','1/4/4;2/4/8;3/4/12'],C,T); s=s.replace('</svg>',`<rect x="138" y="62" width="52" height="72" fill="none" stroke="${C}" stroke-width="3" stroke-dasharray="5 3"/>`+rr(184,128,8,8,1,C,C,1)+vec(196,70,196,124,C,2.5)+'</svg>'); return s; };
L3.verbe=(a,C,T)=>{ const k=a[0];
  const scenes={
   analyser:()=>page(18,14,70,100,5)+`<circle cx="128" cy="62" r="30" fill="${T}" fill-opacity=".6" stroke="${INK}" stroke-width="5"/>`+ln(150,84,178,114,INK,9)+tx(128,70,'?',24,C,900),
   interpreter:()=>{ const F=frm({x0:0,x1:6,y0:0,y1:5,L:16,R:100,T:24,B:110,grid:false}); return F.s.replace(/<polyline[^>]*>/g,'')+ln(20,100,92,40,C,3.5)+vec(108,66,128,66,INK,3)+bubble(132,40,62,48,'#FFFFFF',C,'l')+tx(163,62,'ça',12,C,900)+tx(163,78,'augmente',11,C,900); },
   argumenter:()=>bubble(14,12,172,58,'#FFFFFF',C,'l')+tx(100,38,'Je choisis B',15,INK,900)+tx(100,58,'car 3 < 5.',15,C,900)+chip(100,112,'car… donc…',14,C,T,120),
   hypothese:()=>bubble(14,12,172,64,'#FFFFFF',C,'l')+tx(100,40,'Peut-être que…',15,INK,900)+tx(100,62,'le prix double ?',14,C,900)+`<circle cx="100" cy="108" r="16" fill="${YEL}" stroke="${INK}" stroke-width="2.5"/>`+tx(100,115,'?',18,INK,900),
   valider:()=>rr(28,30,144,56,14,T,C,3)+tx(100,58,'Q₃ = 5 ≤ 5',18,INK,900)+tx(100,78,'objectif atteint',12,C,900)+`<circle cx="100" cy="114" r="16" fill="${GREEN}" stroke="${INK}" stroke-width="2.5"/>`+tx(100,120,'✓',18,'#FFFFFF',900),
   critiquer:()=>rr(18,24,164,46,12,'#FFFFFF',INK,2.5)+tx(100,52,'Résultat : 2 500 m ?',15,INK,900)+tx(60,104,'trop grand !',14,RED,900)+tx(150,104,'je vérifie',13,C,900),
   exploiter:()=>page(14,16,64,90,4)+vec(84,60,112,60,C,3.5)+rr(118,30,70,60,12,T,C,3)+tx(153,56,'40 €',16,C,900)+tx(153,76,'× 3',14,INK,900)+tx(100,128,'j’utilise le document',12,SOFT,800),
   modeliser:()=>person(36,40,T)+rr(10,92,56,26,8,PAPER,INK,2)+tx(38,110,'situation',10,INK,800)+vec(72,70,108,70,C,3.5)+rr(112,46,80,48,12,T,C,3)+tx(152,76,'y = 2x + 5',13,C,900),
   communiquer:()=>bubble(10,10,120,50,'#FFFFFF',C,'l')+tx(70,40,'Je réponds :',13,INK,900)+bubble(70,72,120,46,T,C,'r')+tx(130,100,'… avec une phrase.',11,C,900)
  };
  return SV((scenes[k]||(()=>tx(100,70,k,16,C,900)))()); };
L3.examen=(a,C,T)=>SV(clock(48,62,34,10,10,false,true,C)+rr(96,24,90,78,8,'#FFFFFF',INK,3)+tx(141,46,'Examen',14,INK,900)+[62,76,90].map(y=>ln(106,y,176,y,'#AEB6CC',4)).join('')+tx(100,128,'je gère mon temps',12,C,800));

/* ===================== FLUCTUATION ET PROBABILITÉS (2de) ===================== */
L3.echantillon=(a,C,T)=>{ let s=urn(14,14,96,104,shuffle([...Array(14).fill(BLUE),...Array(10).fill(ORANGE)]).slice(0,24)); s+=vec(114,66,138,66,C,3.5)+rr(142,40,48,52,10,T,C,3);
  [[154,56,BLUE],[176,56,ORANGE],[154,76,BLUE],[176,76,BLUE]].forEach(([x,y,c])=>{ s+=dot(x,y,7,c); }); return SV(s+tx(166,110,'n = 4',12,C,900)+tx(62,134,'population',11,SOFT,800)); };
L3.fluct=(a,C,T)=>{ const F=frm({x0:0,x1:21,y0:0,y1:1,L:30,R:190,T:12,B:116,ly:0.25,grid:false}); const p=+(a[0]||0.5); let s=F.s;
  const fr=[.46,.56,.5,.38,.6,.52,.44,.58,.48,.66,.5,.42,.54,.36,.62,.47,.53,.57,.45,.51]; if(a[1]==='bande') s+=`<rect x="${F.L}" y="${F.Y(p+.2)}" width="${F.R-F.L}" height="${F.Y(p-.2)-F.Y(p+.2)}" fill="${T}" fill-opacity=".8"/>`;
  s+=dash(F.L,F.Y(p),F.R,F.Y(p),ORANGE,2.5)+tx(F.R,F.Y(p)-5,'p = '+fN(p),11,ORANGE,900,'end');
  fr.forEach((f,i)=>{ s+=dot(F.X(i+1),F.Y(f),3.5,C,INK); }); return SV(s+tx(110,134,'20 échantillons',11,SOFT,800)); };
L3.convergence=(a,C,T)=>{ const F=frm({x0:0,x1:1000,y0:0,y1:1,L:30,R:186,T:12,B:110,ly:0.5,lx:500,grid:false}); const p=+(a[0]||0.5);
  let d=''; let r=0.42; for(let i=1;i<=100;i++){ const n=i*10; const v=p+(Math.sin(i*1.7)*0.35+Math.cos(i*0.9)*0.2)/Math.sqrt(i); d+=(i===1?'M':'L')+F.X(n).toFixed(1)+' '+F.Y(v).toFixed(1)+' '; }
  return SV(F.s+dash(F.L,F.Y(p),F.R,F.Y(p),ORANGE,2.5)+`<path d="${d}" fill="none" stroke="${C}" stroke-width="2.5"/>`+tx(F.R,F.Y(p)-6,'p',12,ORANGE,900,'end')+tx(110,132,'nombre de lancers',11,SOFT,800)); };
L3.simul=(a,C,T)=>SV(L3.tableur(['A2','=ALEA.ENTRE.BORNES(1;6)','4;1;6'],C,T).replace(/<svg[^>]*>|<\/svg>/g,'').replace(/font-size="12" font-weight="800" fill="var\(--ink\)" text-anchor="start">=ALEA/,'font-size="9" font-weight="800" fill="var(--ink)" text-anchor="start">=ALEA')+dieFace(150,82,40,4));
L3.frequence=(a,C,T)=>SV(tx(100,40,a[0]||'12 sur 60',20,INK,900)+vec(100,52,100,74,C,3)+tx(100,104,a[1]||'12 ÷ 60 = 0,2',20,C,900)+tx(100,130,a[2]||'= 20 %',15,SOFT,900));

/* ===================== INTERVALLES, ÉQUATIONS ET INÉQUATIONS ===================== */
/* l3:inter|a|b|bornes  ex. l3:inter|2|5|[[   (a ou b peut valoir -inf / +inf) */
L3.inter=(a,C,T)=>{ const lo=a[0], hi=a[1], br=a[2]||'[]'; const vals=[lo,hi].filter(v=>!/inf/.test(v)).map(Number); const mn=Math.min(...vals)-3, mx=Math.max(...vals)+3; const X=v=>16+(v-mn)*(168/(mx-mn)); const Y=74; let s=ln(8,Y,192,Y,INK,2.5)+arrowHead(194,Y,'r',INK);
  for(let v=Math.ceil(mn);v<=mx;v++){ s+=ln(X(v),Y-4,X(v),Y+4,INK,1.5); }
  const xa=/inf/.test(lo)?8:X(+lo), xb=/inf/.test(hi)?192:X(+hi); s+=`<rect x="${xa}" y="${Y-8}" width="${xb-xa}" height="16" fill="${T}" stroke="none"/>`+ln(xa,Y,xb,Y,C,5);
  const bracket=(x,ch)=>{ const open=ch==='['?1:-1; return `<path d="M${x+open*7} ${Y-14} H${x} V${Y+14} H${x+open*7}" fill="none" stroke="${C}" stroke-width="3.5" stroke-linejoin="round"/>`; };
  if(!/inf/.test(lo)) s+=bracket(xa,br[0])+tx(xa,Y+32,fN(lo),14,INK,900); if(!/inf/.test(hi)) s+=bracket(xb,br[1])+tx(xb,Y+32,fN(hi),14,INK,900);
  const lab=(br[0]==='['&&!/inf/.test(lo)?'[':']')+(/inf/.test(lo)?'−∞':fN(lo))+' ; '+(/inf/.test(hi)?'+∞':fN(hi))+(br[1]===']'&&!/inf/.test(hi)?']':'[');
  return SV(s+tx(100,36,a[3]||lab,20,C,900)); };
L3.inequation=(a,C,T)=>SV(tx(100,44,a[0]||'2x + 3 < 11',22,INK,900)+vec(100,56,100,76,C,3)+tx(100,104,a[1]||'x < 4',24,C,900)+tx(100,130,a[2]||'toutes les valeurs plus petites que 4',11,SOFT,800));
L3.sens=(a,C,T)=>SV(tx(100,34,'−2x > 6',20,INK,900)+tx(100,66,'÷ (−2)',14,RED,900)+tx(100,100,'x < −3',22,C,900)+`<circle cx="152" cy="94" r="16" fill="${YEL}" stroke="${INK}" stroke-width="2.5"/>`+tx(152,100,'!',18,INK,900)+tx(100,130,'le signe change de sens',12,RED,900));

/* ===================== FONCTIONS (2de) ===================== */
/* une courbe « type » avec un maximum, pour les mots généraux */
const fGen=x=>-0.3*(x-2.5)**2+3.6;
L3.fonction=(a,C,T)=>{ const k=a[0]||'courbe'; const F=frm({x0:-0.5,x1:6,y0:-0.5,y1:5,L:20,R:186,T:12,B:118,gx:1,gy:1,lx:1,ly:1,nx:'x',ny:'y'}); let s=clip(F)+F.s;
  const f=k==='croissante'?(x=>0.6*x+0.6):k==='decroissante'?(x=>4.4-0.6*x):k==='minimum'?(x=>0.35*(x-3)**2+1):fGen;
  s+=fpath(F,f,0,5.5,C,3.5);
  if(k==='maximum') s+=dash(F.X(2.5),F.Y(3.6),F.X(2.5),F.Y(0),ORANGE,2)+dot(F.X(2.5),F.Y(3.6),6,ORANGE)+tx(F.X(2.5),F.Y(3.6)-10,'max = 3,6',11,ORANGE,900);
  if(k==='minimum') s+=dot(F.X(3),F.Y(1),6,ORANGE)+tx(F.X(3),F.Y(1)+18,'min = 1',11,ORANGE,900);
  if(k==='croissante') s+=tx(F.X(4.6),F.Y(4.8),'↗',20,C,900);
  if(k==='decroissante') s+=tx(F.X(4.6),F.Y(3.6),'↘',20,C,900);
  if(k==='image'){ const x=1, y=f(1); s+=dash(F.X(x),F.Y(0),F.X(x),F.Y(y),ORANGE,2.2)+dash(F.X(x),F.Y(y),F.X(0),F.Y(y),ORANGE,2.2)+dot(F.X(x),F.Y(y),5,ORANGE)+tx(F.X(0)+4,F.Y(y)-6,'f(1)',11,ORANGE,900,'start'); }
  if(k==='antecedent'){ const yv=2.4; const xs=[2.5-Math.sqrt((3.6-yv)/0.3),2.5+Math.sqrt((3.6-yv)/0.3)]; s+=dash(F.X(0),F.Y(yv),F.X(xs[1]),F.Y(yv),ORANGE,2.2); xs.forEach(x=>{ s+=dash(F.X(x),F.Y(yv),F.X(x),F.Y(0),ORANGE,2.2)+dot(F.X(x),F.Y(yv),5,ORANGE); }); }
  if(k==='domaine') s+=ln(F.X(0),F.Y(0),F.X(5.5),F.Y(0),ORANGE,6)+tx(F.X(2.75),F.Y(0)-8,'[0 ; 5,5]',11,ORANGE,900);
  return SV(s); };
/* tableau de variations : l3:tabvar|x1,x2,x3|y1,y2,y3|nom  (flèches calculées) */
L3.tabvar=(a,C,T)=>{ const sp=t=>t.includes(';')?t.split(';'):t.split(','); const xs=sp(a[0]), ys=sp(a[1]), nm=a[2]||'f(x)'; const n=xs.length, x0=50, w=(186-x0)/(n-1+0.6); let s=rr(8,20,184,100,4,PAPER,INK,2)+ln(8,46,192,46,INK,2)+ln(46,20,46,120,INK,2)+tx(27,38,'x',13,INK,900)+tx(27,88,nm,12,INK,900);
  const X=i=>x0+w*0.3+i*w; xs.forEach((v,i)=>{ s+=tx(X(i),38,v,12,INK,900); });
  const yy=ys.map(v=>Number(String(v).replace(/−/g,'-').replace(',','.').replace(/[^0-9.\-]/g,''))); const Y=i=>{ const mn=Math.min(...yy), mx=Math.max(...yy); return mn===mx?82:110-(yy[i]-mn)/(mx-mn)*52; };
  ys.forEach((v,i)=>{ s+=tx(X(i),Y(i)+(Y(i)>90?0:8),v,12,C,900); if(i<n-1){ const y1=Y(i), y2=Y(i+1), d=y2<y1; s+=vec(X(i)+12,y1+(d?-6:2)-2,X(i+1)-12,y2+(d?10:-6)-2,C,2.5); } });
  return SV(s); };
L3.carre=(a,C,T)=>{ const F=frm({x0:-3,x1:3,y0:-1,y1:9,L:20,R:186,T:10,B:122,gx:1,gy:1,lx:1,ly:2}); let s=clip(F)+F.s+fpath(F,x=>x*x,-3,3,C,3.5)+tx(F.X(2.2),F.Y(8.5),'y = x²',13,C,900,'start')+dot(F.X(0),F.Y(0),5,ORANGE); return SV(s); };
L3.inverse=(a,C,T)=>{ const F=frm({x0:-4,x1:4,y0:-4,y1:4,L:20,R:186,T:10,B:122,gx:1,gy:1,lx:2,ly:2}); return SV(clip(F)+F.s+fpath(F,x=>1/x,0.2,4,C,3.5,'',60)+fpath(F,x=>1/x,-4,-0.2,C,3.5,'',60)+tx(F.X(1.4),F.Y(2.6),'y = 1/x',12,C,900,'start')); };
L3.affine=(a,C,T)=>{ const m=+(a[0]||0.5), p=+(a[1]||1); const F=frm({x0:-1,x1:5,y0:-1,y1:5,L:20,R:186,T:10,B:122,gx:1,gy:1,lx:1,ly:1}); let s=clip(F)+F.s+fpath(F,x=>m*x+p,-1,5,C,3.5);
  s+=dot(F.X(0),F.Y(p),5,ORANGE)+tx(F.X(0)+6,F.Y(p)+14,'b = '+fN(p),11,ORANGE,900,'start'); s+=dash(F.X(1),F.Y(m+p),F.X(2),F.Y(m+p),PURP,2.5)+dash(F.X(2),F.Y(m+p),F.X(2),F.Y(2*m+p),PURP,2.5)+tx(F.X(2)+4,F.Y(1.5*m+p)+4,'a = '+fN(m),11,PURP,900,'start'); return SV(s); };
/* lecture graphique d’une équation f(x) = k */
L3.grapheq=(a,C,T)=>{ const k=+(a[0]||2.4); const F=frm({x0:-0.5,x1:6,y0:-0.5,y1:5,L:20,R:186,T:12,B:118,gx:1,gy:1,lx:1,ly:1}); let s=clip(F)+F.s+fpath(F,fGen,0,5.5,C,3.5)+ln(F.L,F.Y(k),F.R,F.Y(k),ORANGE,2.5)+tx(F.R,F.Y(k)-5,'y = '+fN(k),11,ORANGE,900,'end');
  const xs=[2.5-Math.sqrt((3.6-k)/0.3),2.5+Math.sqrt((3.6-k)/0.3)]; xs.forEach(x=>{ s+=dash(F.X(x),F.Y(k),F.X(x),F.Y(0),PURP,2)+dot(F.X(x),F.Y(k),5,PURP)+dot(F.X(x),F.Y(0),4,PURP,PURP); }); return SV(s); };

/* ===================== CALCULS COMMERCIAUX ===================== */
L3.ht=(a,C,T)=>{ const ht=+(a[0]||100), t=+(a[1]||20); const tva=ht*t/100; const W=150/(ht+tva); let s=rr(24,40,ht*W,32,6,T,C,2.5)+tx(24+ht*W/2,61,'HT '+fN(ht)+' €',12,C,900)+rr(24+ht*W,40,tva*W,32,6,'#FFE2C8',ORANGE,2.5)+tx(24+ht*W+tva*W/2,61,'TVA',11,ORANGE,900);
  s+=ln(24,90,174,90,INK,2)+arrowHead(24,90,'l',INK)+arrowHead(174,90,'r',INK)+tx(99,112,'TTC '+fN(ht+tva)+' €',15,INK,900)+tx(99,28,'TVA '+t+' %',12,ORANGE,900); return SV(s); };
L3.coef=(a,C,T)=>{ const v0=a[0]||'50 €', k=a[1]||'× 1,2', v1=a[2]||'60 €'; return SV(rr(10,44,62,40,10,PAPER,INK,2.5)+tx(41,70,v0,14,INK,900)+rr(128,44,62,40,10,T,C,3)+tx(159,70,v1,14,C,900)+`<path d="M72 54 Q100 18 126 54" fill="none" stroke="${C}" stroke-width="3"/>`+arrowHead(126,54,'d',C)+tx(100,26,k,15,C,900)+tx(100,120,a[3]||'+ 20 %',16,a[3]&&/−/.test(a[3])?RED:GREEN,900)); };
L3.remise=(a,C,T)=>SV(`<path d="M30 30 h90 l40 40 l-40 40 h-90 z" fill="${T}" stroke="${C}" stroke-width="3" stroke-linejoin="round"/>`+`<circle cx="128" cy="70" r="6" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`+tx(70,64,a[0]||'− 30 %',20,RED,900)+tx(70,90,a[1]||'80 € → 56 €',12,INK,900));
L3.marge=(a,C,T)=>{ let s=rr(16,30,96,34,6,PAPER,INK,2.5)+tx(64,52,'prix d’achat',12,INK,900)+rr(112,30,62,34,6,T,C,2.5)+tx(143,52,'marge',12,C,900)+ln(16,84,174,84,INK,2)+arrowHead(16,84,'l',INK)+arrowHead(174,84,'r',INK)+tx(95,108,'prix de vente',15,INK,900); return SV(s); };
L3.ticket=(a,C,T)=>{ let s=`<path d="M50 6 h100 v124 l-10 -6 l-10 6 l-10 -6 l-10 6 l-10 -6 l-10 6 l-10 -6 l-10 6 l-10 -6 l-10 6 z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  [['Total HT','50,00'],['TVA 20 %','10,00'],['Total TTC','60,00']].forEach(([l,v],i)=>{ const on=a[0]&&i===+a[0]; s+=(on?rr(54,22+i*26,92,22,5,T,C,2):'')+tx(58,37+i*26,l,10,on?C:INK,900,'start')+tx(142,37+i*26,v,10,on?C:INK,900,'end'); }); return SV(s+[104,114].map(y=>ln(60,y,140,y,'#AEB6CC',3)).join('')); };
L3.evol=(a,C,T)=>{ const v0=+(a[0]||80), v1=+(a[1]||100); const up=v1>=v0; return SV(rr(16,124-v0/Math.max(v0,v1)*80,48,v0/Math.max(v0,v1)*80,5,PAPER,INK,2.5)+tx(40,118,fN(v0),13,INK,900)+rr(136,124-v1/Math.max(v0,v1)*80,48,v1/Math.max(v0,v1)*80,5,T,C,2.5)+tx(160,118,fN(v1),13,C,900)+vec(70,60,128,60,up?GREEN:RED,3)+tx(99,48,(up?'+ ':'− ')+fN(Math.round(Math.abs(v1-v0)/v0*1000)/10)+' %',15,up?GREEN:RED,900)+tx(100,138,'taux d’évolution',11,SOFT,800)); };
L3.interets=(a,C,T)=>{ const comp=a[0]==='compose'; const v=comp?[1000,1050,1102.5,1157.63]:[1000,1050,1100,1150]; let s=''; v.forEach((x,i)=>{ const h=50+(x-1000)*0.35; const X=24+i*42; s+=rr(X,118-h,30,h,4,i?T:PAPER,i?C:INK,2)+tx(X+15,132,'an '+i,10,SOFT,800)+tx(X+15,112-h,fN(x),9,INK,900); if(i) s+=tx(X-6,64,comp?'×1,05':'+50',9,C,900); }); return SV(s+tx(100,14,comp?'intérêts composés':'intérêts simples',12,C,900)); };

/* ===================== PYTHON ===================== */
/* l3:py|ligne 1|ligne 2|…   (·· = 4 espaces d’indentation) */
function pyColor(l){ return escX(l).replace(/(#.*)$/,'<tspan fill="#8A93AD">$1</tspan>').replace(/\b(def|return|for|in|while|if|elif|else|import|from|and|or|not|True|False)\b/g,'<tspan fill="#C2410C" font-weight="900">$1</tspan>').replace(/\b(print|input|range|int|float|len|round|append)\b/g,'<tspan fill="#2563EB" font-weight="900">$1</tspan>'); }
L3.py=(a,C,T)=>{ const L=a.length?a:['x = 5','print(x)']; const mx=Math.max(...L.map(l=>l.replace(/^(··)+/,m=>'    '.repeat(m.length/2)).length)); const W=Math.max(200,Math.ceil(40+mx*6.9)); const h=Math.max(140,28+L.length*16); let s=rr(4,4,W-8,h-8,10,'#FFFFFF',INK,2.5)+rr(4,4,W-8,18,10,T,C,2.5)+[14,24,34].map((x,i)=>dot(x,13,3,['#E5484D','#FFC233','#2FA65A'][i],INK)).join('')+tx(W-12,17,'Python',10,C,900,'end');
  L.forEach((l,i)=>{ const ind=(l.match(/^(··)*/)[0].length/2); s+=tx(12,38+i*16,String(i+1),9,'#8A93AD',800,'start')+`<text x="${26+ind*16}" y="${38+i*16}" font-size="11" font-weight="700" fill="#1D2240" font-family="ui-monospace,Menlo,Consolas,monospace" xml:space="preserve">${pyColor(l.replace(/^(··)+/,''))}</text>`; }); return SVh(s,h,W); };
L3.console=(a,C,T)=>{ const L=a.length?a:['>>> ']; let s=rr(4,10,192,120,10,'#1D2240',INK,2.5); L.forEach((l,i)=>{ s+=`<text x="14" y="${34+i*18}" font-size="12" font-weight="700" fill="${/^>>>/.test(l)?'#9FE5A8':'#FFFFFF'}" font-family="ui-monospace,Menlo,Consolas,monospace" xml:space="preserve">${escX(l)}</text>`; }); return SV(s); };
L3.variable=(a,C,T)=>SV(`<path d="M50 50 l50 -20 l50 20 v54 l-50 20 l-50 -20 z" fill="${T}" stroke="${C}" stroke-width="3" stroke-linejoin="round"/>`+tx(100,52,a[0]||'prix',15,C,900)+tx(100,92,a[1]||'12.5',22,INK,900)+tx(100,136,'une boîte avec un nom',11,SOFT,800));
L3.boucle=(a,C,T)=>{ const n=+(a[0]||3); let s=''; for(let i=0;i<n;i++) s+=rr(28+i*50,52,40,36,8,T,C,2.5)+tx(48+i*50,76,'i = '+i,11,C,900)+(i<n-1?vec(70+i*50,70,76+i*50,70,INK,2.5):''); return SV(s+`<path d="M${48+(n-1)*50} 92 Q${48+(n-1)*25} 128 48 92" fill="none" stroke="${SOFT}" stroke-width="2.5" stroke-dasharray="5 4"/>`+tx(100,30,a[1]||'for i in range(3):',13,INK,900)); };
L3.test=(a,C,T)=>SV(poly([[100,14],[160,48],[100,82],[40,48]],T,C,3)+tx(100,52,a[0]||'x > 10 ?',14,INK,900)+vec(40,48,20,100,GREEN,3)+tx(30,122,'oui',13,GREEN,900)+vec(160,48,180,100,RED,3)+tx(172,122,'non',13,RED,900));
L3.liste=(a,C,T)=>{ const v=(a[0]||'12,15,9,14').split(','); let s=tx(100,30,'notes = ['+v.join(', ')+']',13,INK,900); v.forEach((x,i)=>{ s+=rr(28+i*38,52,34,34,6,i===0?T:PAPER,i===0?C:INK,2.5)+tx(45+i*38,75,x,13,INK,900)+tx(45+i*38,104,String(i),11,C,900); }); return SV(s+tx(100,128,'indice',11,C,800)); };

/* ===================== COURBE PAR POINTS (générateurs) =====================
   l3:plot|x0,x1,y0,y1,gx,gy,lx,ly|x:y;x:y;…|options
   options séparées par des virgules : smooth, h=k (droite y = k), v=a (lecture en x = a),
   pts (points marqués), nx=t, ny=T (noms des axes) */
/* courbe lisse et monotone entre les points (pas de bosse inventée entre deux points) */
function smoothD(P){ const n=P.length; if(n<3) return 'M'+P.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join(' L');
  const dx=[], sl=[]; for(let i=0;i<n-1;i++){ dx[i]=P[i+1][0]-P[i][0]; sl[i]=(P[i+1][1]-P[i][1])/dx[i]; }
  const m=P.map((_,i)=>{ if(i===0) return sl[0]; if(i===n-1) return sl[n-2]; const a=sl[i-1], b=sl[i]; if(a*b<=0) return 0; return 2*a*b/(a+b); });
  let d=`M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`; for(let i=0;i<n-1;i++){ const h=dx[i]/3; d+=` C${(P[i][0]+h).toFixed(1)} ${(P[i][1]+m[i]*h).toFixed(1)} ${(P[i+1][0]-h).toFixed(1)} ${(P[i+1][1]-m[i+1]*h).toFixed(1)} ${P[i+1][0].toFixed(1)} ${P[i+1][1].toFixed(1)}`; } return d; }
L3.plot=(a,C,T)=>{ const w=nums(a[0]); const pts=(a[1]||'').split(';').filter(Boolean).map(p=>p.split(':').map(Number)); const op={}; (a[2]||'').split(',').filter(Boolean).forEach(o=>{ const [k,v]=o.split('='); op[k]=v==null?true:v; });
  const F=frm({x0:w[0],x1:w[1],y0:w[2],y1:w[3],gx:w[4],gy:w[5],lx:w[6]||w[4],ly:w[7]||w[5],L:30,R:186,T:12,B:116,nx:op.nx,ny:op.ny}); let s=F.s;
  const P=pts.map(([x,y])=>[F.X(x),F.Y(y)]); s+=`<path d="${op.smooth?smoothD(P):'M'+P.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join(' L')}" fill="none" stroke="${C}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(op.pts) P.forEach(p=>{ s+=dot(p[0],p[1],3.5,C,INK); });
  if(op.h!=null) s+=ln(F.L,F.Y(+op.h),F.R,F.Y(+op.h),ORANGE,2.5);
  if(op.v!=null){ const x=+op.v, y=(pts.find(p=>p[0]===x)||[x,0])[1]; s+=dash(F.X(x),F.Y(0>w[2]?0:w[2]),F.X(x),F.Y(y),ORANGE,2.2)+dash(F.X(x),F.Y(y),F.X(0>w[0]?0:w[0]),F.Y(y),ORANGE,2.2)+dot(F.X(x),F.Y(y),4.5,ORANGE); }
  return SV(s); };

/* ===================== GÉOMÉTRIE DANS L’ESPACE (2de) ===================== */
/* pavé en perspective cavalière ; hl = arete | face | sommet | cache | diag */
L3.pave=(a,C,T)=>{ const hl=a[0]||''; const A=[34,116],B=[124,116],Cc=[124,52],D=[34,52],E=[70,88],F=[160,88],G=[160,24],H=[70,24];
  let s=poly([A,B,Cc,D],hl==='face'?T:PAPER,INK,2.5)+poly([B,F,G,Cc],'#E9ECF5',INK,2.5)+poly([D,Cc,G,H],'#FFFFFF',INK,2.5);
  s+=dash(...A,...E,hl==='cache'?C:INK,hl==='cache'?3:1.8)+dash(...E,...F,hl==='cache'?C:INK,hl==='cache'?3:1.8)+dash(...E,...H,hl==='cache'?C:INK,hl==='cache'?3:1.8);
  if(hl==='arete') s+=ln(...B,...Cc,C,6);
  if(hl==='sommet') s+=dot(...G,7,C);
  if(hl==='face') s+=tx(79,90,'face',14,C,900);
  if(hl==='diag') s+=ln(...A,...G,ORANGE,3);
  if(hl==='cache') s+=tx(100,136,'arêtes cachées en pointillés',11,C,900);
  if(hl==='arete') s+=tx(176,88,'arête',12,C,900,'end').replace('x="176"','x="190"');
  if(hl==='sommet') s+=tx(176,20,'sommet',12,C,900);
  return SV(s); };
L3.patron=(a,C,T)=>{ const k=a[0]||'cube'; let s='';
  if(k==='cube'){ const u=28, sq=(c,r,f)=>rr(30+c*u,8+r*u,u,u,0,f?T:PAPER,INK,2); [[1,0],[0,1],[1,1],[2,1],[3,1],[1,2]].forEach(([c,r],i)=>{ s+=sq(c,r,i===2); }); return SV(s+tx(150,118,'6 faces',13,C,900)); }
  if(k==='cyl'){ s+=`<circle cx="70" cy="24" r="16" fill="${T}" stroke="${INK}" stroke-width="2.5"/>`+rr(16,40,108,58,0,PAPER,INK,2.5)+`<circle cx="70" cy="114" r="16" fill="${T}" stroke="${INK}" stroke-width="2.5"/>`+tx(70,74,'2πr × h',13,C,900)+tx(160,74,'cylindre',12,SOFT,800); return SV(s); }
  s+=poly([[100,18],[70,70],[130,70]],T,INK,2.5)+poly([[70,70],[130,70],[100,122]],PAPER,INK,2.5)+poly([[70,70],[100,18],[40,18]],PAPER,INK,2.5)+poly([[130,70],[100,18],[160,18]],PAPER,INK,2.5); return SV(s+tx(100,136,'pyramide',11,SOFT,800)); };
L3.vues=(a,C,T)=>{ let s=L3.pave([''],C,T).replace(/<svg[^>]*>|<\/svg>/g,''); s=`<g transform="translate(0 10) scale(.55)">${s}</g>`;
  s+=rr(118,14,56,36,0,T,C,2.5)+tx(146,64,'de face',10,C,900)+rr(118,80,56,22,0,PAPER,INK,2.5)+tx(146,116,'de dessus',10,INK,900); return SV(s+tx(52,106,'le solide',10,SOFT,800)); };
L3.alat=(a,C,T)=>SV(`<path d="M24 30 V100 A22 7 0 0 0 68 100 V30" fill="${T}" stroke="${INK}" stroke-width="2.5"/><ellipse cx="46" cy="30" rx="22" ry="7" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/>`+vec(76,66,100,66,C,3)+rr(106,34,86,66,0,T,C,2.5)+tx(149,72,'2πr × h',12,C,900)+tx(149,114,'longueur 2πr',10,INK,800)+tx(100,134,'la surface autour',11,SOFT,800));
L3.silo=(a,C,T)=>SV(`<path d="M60 18 V82 L100 124 L140 82 V18" fill="${T}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="100" cy="18" rx="40" ry="10" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5"/><path d="M60 82 A40 10 0 0 0 140 82" fill="none" stroke="${INK}" stroke-width="2"/><path d="M60 82 A40 10 0 0 1 140 82" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4 3"/>`+tx(152,54,'cylindre',11,C,900,'start')+tx(130,112,'cône',11,C,900,'start'));
L3.contenance=(a,C,T)=>SV(`<path d="M86 10 h28 v18 q22 10 22 30 v66 q0 8 -8 8 h-56 q-8 0 -8 -8 v-66 q0 -20 22 -30 z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M67 70 h66 v54 q0 6 -6 6 h-54 q-6 0 -6 -6 z" fill="${T}" stroke="none"/>`+tx(100,104,a[0]||'1,5 L',18,C,900)+tx(170,70,'= 1,5 dm³',11,INK,800).replace('x="170"','x="168"'));

/* ===================== PENTES ET TRIANGLES (2de) ===================== */
L3.pente=(a,C,T)=>{ const hl=a[0]||''; let s=poly([[16,112],[176,112],[176,56]],T,C,3)+rAngle(176,112,-1,0,0,-1,10,INK);
  s+=(hl==='denivele'?ln(176,112,176,56,ORANGE,6):'')+(hl==='distance'?ln(16,112,176,112,ORANGE,6):'')+(hl==='angle'?arcA(16,112,42,0,Math.atan2(56,160),ORANGE,3,'#FFE2C8')+tx(66,106,'α',14,ORANGE,900):'');
  s+=tx(96,130,'distance horizontale',11,hl==='distance'?ORANGE:INK,900)+tx(184,88,'dénivelé',11,hl==='denivele'?ORANGE:INK,900,'start').replace('x="184"','x="150"').replace('text-anchor="start"','text-anchor="end"');
  if(!hl||hl==='pente') s+=tx(70,36,'pente = dénivelé ÷ distance',11,C,900);
  return SV(s); };
L3.trigo3=(a,C,T)=>{ const A=[30,112],B=[170,112],Cc=[170,40]; let s=poly([A,B,Cc],T,INK,3)+rAngle(170,112,-1,0,0,-1,10,INK)+arcA(30,112,34,0,Math.atan2(72,140),ORANGE,2.5,'#FFE2C8')+tx(72,106,'α',13,ORANGE,900);
  s+=tx(100,128,'côté adjacent',11,BLUE,900)+tx(176,80,'opposé',11,RED,900,'start').replace('x="176"','x="158"').replace('start','end')+tx(92,62,'hypoténuse',11,GREEN,900,'end');
  return SV(s+tx(100,20,a[0]||'cos α = adjacent ÷ hypoténuse',12,C,900)); };

/* ===================== STATISTIQUE À DEUX VARIABLES (1re) ===================== */
const GLACES=[[18,120],[20,140],[22,160],[26,200],[28,215],[30,245]];
L3.nuage=(a,C,T)=>{ const k=a[0]||''; let P=GLACES, win=[16,34,80,300,2,20,4,40], fx2=x=>10.09*x-62.14, xb=24, yb=180;
  if(k==='courbe'||k==='expo'||k==='compare'){ P=[[0,20],[1,24],[2,30],[3,38],[4,50],[5,66],[6,88]]; win=[0,7,0,100,1,10,1,20]; }
  if(k==='solaire'){ P=[[0,40],[1,52],[2,68],[3,88],[4,114],[5,148]]; win=[0,8,0,300,1,25,1,50]; }
  if(k==='nul'){ P=[[1,40],[2,10],[3,70],[4,25],[5,60],[6,15],[7,50]]; win=[0,8,0,80,1,10,1,20]; }
  const F=frm({x0:win[0],x1:win[1],y0:win[2],y1:win[3],gx:win[4],gy:win[5],lx:win[6],ly:win[7],L:30,R:186,T:12,B:116,fs:8}); let s=clip(F)+F.s;
  if(k==='droite'||k==='extra'||k==='G') s+=fpath(F,fx2,16,34,ORANGE,2.5);
  if(k==='extra'){ s+=`<rect x="${F.X(30)}" y="${F.T}" width="${F.R-F.X(30)}" height="${F.B-F.T}" fill="${T}" fill-opacity=".7"/>`+dot(F.X(32),F.Y(fx2(32)),5,ORANGE)+tx(F.X(32),F.Y(fx2(32))+16,'?',12,ORANGE,900); }
  P.forEach(([x,y])=>{ s+=cross(F.X(x),F.Y(y),C); });
  if(k==='expo'||k==='compare') s+=fpath(F,x=>20*1.28**x,0,7,ORANGE,2.5);
  if(k==='compare') s+=fpath(F,x=>11.2*x+12,0,7,PURP,2,'stroke-dasharray="6 4"')+tx(F.X(6.6),F.Y(98)+4,'affine',9,PURP,900,'end')+tx(F.X(4.2),F.Y(80),'exponentiel',9,ORANGE,900,'end');
  if(k==='solaire') s+=fpath(F,x=>40*1.3**x,0,8,ORANGE,2.5)+dot(F.X(7),F.Y(40*1.3**7),5,ORANGE)+tx(F.X(7)-4,F.Y(251)-6,'année 7 ?',9,ORANGE,900,'end');
  if(k==='G') s+=dot(F.X(xb),F.Y(yb),6,PURP)+tx(F.X(xb)+8,F.Y(yb)+14,'G',13,PURP,900,'start');
  if(k===''||k==='droite') s+=tx(F.X(17),F.T+10,'ventes',9,SOFT,800,'start')+tx(F.R,F.B-6,'°C',9,SOFT,800,'end');
  return SV(s); };

/* ===================== PROBABILITÉS (1re, Tle) ===================== */
L3.venn=(a,C,T)=>{ const k=a[0]||'inter'; const id='v'+(++CLIPN); let s=rr(10,10,180,112,10,k==='contraire'?T:PAPER,INK,2);
  const cA=k==='incompat'?[62,66]:[80,66], cB=k==='incompat'?[138,66]:[120,66], r=k==='incompat'?34:40;
  const circ=(c,f,op)=>`<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="${f}" fill-opacity="${op}" stroke="${INK}" stroke-width="2.5"/>`;
  if(k==='union') s+=circ(cA,C,.55)+circ(cB,C,.55);
  else if(k==='inter') s+=`<defs><clipPath id="${id}"><circle cx="${cA[0]}" cy="${cA[1]}" r="${r}"/></clipPath></defs>`+circ(cA,'#FFFFFF',1)+circ(cB,'#FFFFFF',1)+`<circle cx="${cB[0]}" cy="${cB[1]}" r="${r}" fill="${C}" fill-opacity=".7" clip-path="url(#${id})"/>`+circ(cA,'none',1)+circ(cB,'none',1);
  else if(k==='contraire') s+=circ(cA,'#FFFFFF',1);
  else s+=circ(cA,'#FFFFFF',1)+circ(cB,'#FFFFFF',1);
  if(k!=='contraire') s+=tx(cA[0]-20,cA[1]+5,'A',15,INK,900)+tx(cB[0]+20,cB[1]+5,'B',15,INK,900); else s+=tx(cA[0],cA[1]+5,'A',15,INK,900)+tx(160,100,'Ā',16,C,900);
  return SV(s+tx(100,136,{inter:'A ∩ B : A et B',union:'A ∪ B : A ou B',incompat:'A ∩ B = ∅ : incompatibles',contraire:'Ā : contraire de A'}[k],12,C,900)); };
/* tableau croisé : l3:tabcroise|hl  (hl = cellule « r,c » ou « ligne » ou « total ») */
L3.tabcroise=(a,C,T)=>{ const hl=a[0]||'1,1'; const R=[['','Essence','Électr.','Total'],['Neuf','50','60','110'],['Occasion','70','20','90'],['Total','120','80','200']]; let s='';
  R.forEach((r,i)=>r.forEach((v,j)=>{ const w=j===0?56:44, x=j===0?6:62+(j-1)*44; const on=hl===`${i},${j}`||(hl==='total'&&i===3&&j===3)||(hl==='marge'&&(i===3||j===3)&&i*j>0); s+=`<rect x="${x}" y="${12+i*28}" width="${w}" height="28" fill="${on?T:(i===0||j===0?'var(--sunk)':PAPER)}" stroke="${on?C:INK}" stroke-width="${on?3:1.5}"/>`+tx(x+w/2,31+i*28,v,i===0||j===0?10:13,on?C:INK,900); }));
  return SV(s); };

/* ===================== SUITES (1re, Tle) ===================== */
const SUB=n=>String(n).split('').map(c=>'₀₁₂₃₄₅₆₇₈₉'[+c]||c).join('');
/* l3:suite|arith|u0|r  ou  l3:suite|geo|u0|q */
L3.suite=(a,C,T)=>{ const geo=a[0]==='geo'; const u0=+(a[1]||(geo?100:300)), r=+(a[2]||(geo?1.1:45)); let s=''; const v=[u0]; for(let i=1;i<4;i++) v.push(geo?Math.round(v[i-1]*r*100)/100:v[i-1]+r);
  v.forEach((x,i)=>{ const X=10+i*48; s+=rr(X,58,40,34,8,i===0?T:PAPER,i===0?C:INK,2.5)+tx(X+20,80,fN(x),x>=1000?10:12,INK,900)+tx(X+20,108,'u'+SUB(i),13,C,900); if(i<3) s+=`<path d="M${X+24} 54 Q${X+44} 30 ${X+64} 54" fill="none" stroke="${C}" stroke-width="2.5"/>`+arrowHead(X+64,54,'d',C).replace('stroke-width="4"','stroke-width="3"')+tx(X+44,34,(geo?'× ':(r<0?'− ':'+ '))+fN(Math.abs(r)),11,C,900); });
  return SV(s+tx(100,132,geo?'toujours × le même nombre':'toujours + le même nombre',11,SOFT,800)); };
L3.suitegr=(a,C,T)=>{ const geo=a[0]==='geo'; const u0=+(a[1]||(geo?1:2)), r=+(a[2]||(geo?1.5:1.5)); const v=[]; for(let i=0;i<7;i++) v.push(geo?u0*r**i:u0+r*i); const mx=Math.max(...v), mn=Math.min(0,...v);
  const st=[1,2,5,10,20,50,100].find(t=>(mx-mn)/t<=6)||200; const F=frm({x0:0,x1:7,y0:mn,y1:Math.ceil(mx/st)*st+st*0.3,gx:1,gy:st,lx:1,ly:st,L:30,R:186,T:12,B:116,nx:'n',ny:'uₙ'}); let s=F.s;
  v.forEach((y,i)=>{ s+=dot(F.X(i),F.Y(y),4.5,C,INK); }); if(!geo&&a[3]!=='nodroite') s+=`<line x1="${F.X(0)}" y1="${F.Y(v[0])}" x2="${F.X(6)}" y2="${F.Y(v[6])}" stroke="${C}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  return SV(s+tx(F.R,F.T+10,geo?'points sur une courbe':'points alignés',10,C,900,'end')); };

/* ===================== RÉSOLUTION GRAPHIQUE (1re) ===================== */
L3.courbe=(a,C,T)=>{ const k=a[0]||'contrats'; let s='';
  if(k==='contrats'){ const F=frm({x0:0,x1:2000,y0:0,y1:600,gx:250,gy:100,lx:500,ly:100,L:34,R:186,T:12,B:116,fs:8,nx:'kWh',ny:'€'}); s=clip(F)+F.s+fpath(F,x=>0.2*x+150,0,2000,C,3)+fpath(F,x=>0.16*x+190,0,2000,ORANGE,3);
    if(a[1]!=='sans') s+=dash(F.X(1000),F.Y(350),F.X(1000),F.Y(0),PURP,2)+dot(F.X(1000),F.Y(350),5,PURP);
    return SV(s+tx(F.X(1700),F.Y(510)-6,'A',12,C,900)+tx(F.X(1850),F.Y(486)+16,'B',12,ORANGE,900)); }
  if(k==='cm'){ const F=frm({x0:0,x1:600,y0:0,y1:14,gx:50,gy:1,lx:100,ly:2,L:30,R:186,T:12,B:116,fs:8,nx:'x',ny:'€'}); s=clip(F)+F.s+fpath(F,x=>2+600/x,50,600,C,3)+ln(F.L,F.Y(5),F.R,F.Y(5),ORANGE,2.5)+tx(F.R,F.Y(5)-5,'prix : 5 €',9,ORANGE,900,'end');
    if(a[1]==='sol') s+=ln(F.X(200),F.Y(0),F.X(600),F.Y(0),PURP,6)+dash(F.X(200),F.Y(5),F.X(200),F.Y(0),PURP,2);
    return SV(s); }
  if(k==='signe'){ const f=x=>0.25*(x+2)*(x-1)*(x-4); const F=frm({x0:-3,x1:5,y0:-4,y1:4,gx:1,gy:1,lx:1,ly:2,L:22,R:186,T:12,B:116,fs:8}); s=clip(F)+F.s;
    s+=fpath(F,x=>f(x)>=0?f(x):NaN,-3,5,GREEN,3.5,'',200)+fpath(F,x=>f(x)<=0?f(x):NaN,-3,5,RED,3.5,'',200);
    [-2,1,4].forEach(x=>{ s+=dot(F.X(x),F.Y(0),4.5,C,INK); }); return SV(s+tx(F.X(-0.5),F.Y(2.6),'+',16,GREEN,900)+tx(F.X(2.5),F.Y(-2.2),'−',18,RED,900)); }
  if(k==='ineq'){ const F=frm({x0:-0.5,x1:6,y0:-0.5,y1:5,gx:1,gy:1,lx:1,ly:1,L:20,R:186,T:12,B:118}); const kk=2.4, xs=[2.5-Math.sqrt((3.6-kk)/0.3),2.5+Math.sqrt((3.6-kk)/0.3)];
    s=clip(F)+F.s+fpath(F,fGen,0,5.5,C,3.5)+ln(F.L,F.Y(kk),F.R,F.Y(kk),ORANGE,2.5)+fpath(F,x=>fGen(x)>=kk?fGen(x):NaN,xs[0],xs[1],GREEN,5)+ln(F.X(xs[0]),F.Y(0),F.X(xs[1]),F.Y(0),GREEN,6); return SV(s+tx(F.R,F.Y(kk)-5,'y = k',10,ORANGE,900,'end')); }
  if(k==='fg'){ const F=frm({x0:-1,x1:5,y0:-1,y1:6,gx:1,gy:1,lx:1,ly:1,L:20,R:186,T:12,B:118}); s=clip(F)+F.s+fpath(F,x=>(x-2)**2+1,-1,5,C,3.5)+fpath(F,x=>x+1,-1,5,ORANGE,3);
    [0,3].forEach(x=>{ s+=dot(F.X(x),F.Y(x+1),5,PURP)+dash(F.X(x),F.Y(x+1),F.X(x),F.Y(0),PURP,2); }); return SV(s+tx(F.X(4.6),F.Y(4.2),'𝒞f',12,C,900)+tx(F.X(4.4),F.Y(5.8),'𝒞g',12,ORANGE,900)); }
  return null; };
L3.tabsigne=(a,C,T)=>{ const xs=(a[0]||'−2,1,4').split(','), sg=(a[1]||'−,+,−,+').split(','), nm=a[2]||'f(x)'; let s=rr(8,30,184,76,4,PAPER,INK,2)+ln(8,58,192,58,INK,2)+ln(46,30,46,106,INK,2)+tx(27,49,'x',13,INK,900)+tx(27,88,nm,12,INK,900);
  const n=xs.length, w=(186-50)/(n+1); s+=tx(56,49,'−∞',11,SOFT,900)+tx(184,49,'+∞',11,SOFT,900,'end'); xs.forEach((x,i)=>{ const X=50+w*(i+1); s+=tx(X,49,x,12,INK,900)+ln(X,58,X,106,INK,1.5)+tx(X,92,'0',12,INK,900); });
  sg.forEach((g,i)=>{ const X=50+w*(i+0.5)+ (i===0?4:0); s+=tx(X,90,g,18,g==='+'?GREEN:RED,900); }); return SV(s); };
L3.hyperbole=L3.inverse;

/* ===================== SECOND DEGRÉ (1re) ===================== */
L3.parabole=(a,C,T)=>{ const k=a[0]||'up'; const down=k==='down'||k==='jet'; const f=down?(x=>-0.5*(x-2)**2+3):(x=>0.5*(x-2)**2-2);
  const F=k==='jet'?frm({x0:-0.5,x1:5,y0:-0.5,y1:4,gx:1,gy:1,lx:1,ly:1,L:20,R:186,T:12,B:118,nx:'x',ny:'h'}):frm({x0:-1,x1:5,y0:-3,y1:4,gx:1,gy:1,lx:1,ly:1,L:20,R:186,T:12,B:118});
  let s=clip(F)+F.s+fpath(F,f,k==='jet'?0:-1,k==='jet'?2+Math.sqrt(6):5,C,3.5);
  const sx=2, sy=f(2);
  if(k==='sommet'||k==='up'||k==='down'||k==='jet') s+=dot(F.X(sx),F.Y(sy),5.5,ORANGE)+tx(F.X(sx)+8,F.Y(sy)+(down?-6:16),'S',12,ORANGE,900,'start');
  if(k==='axe') s+=dash(F.X(2),F.T,F.X(2),F.B,PURP,2.5)+tx(F.X(2)+6,F.T+12,'x = 2',11,PURP,900,'start');
  if(k==='racines'){ [0,4].forEach(x=>{ s+=dot(F.X(x),F.Y(0),5.5,PURP); }); s+=tx(F.X(0),F.Y(0)-10,'x₁',11,PURP,900)+tx(F.X(4),F.Y(0)-10,'x₂',11,PURP,900); }
  if(k==='up') s+=tx(F.X(4.3),F.Y(3.3),'a > 0',11,C,900); if(k==='down') s+=tx(F.X(4.3),F.Y(-2.5),'a < 0',11,C,900);
  if(k==='jet') s+=dot(F.X(2+Math.sqrt(6)),F.Y(0),5,PURP);
  return SV(s); };
L3.delta=(a,C,T)=>{ let s=''; [['Δ > 0','2 solutions',0.5],['Δ = 0','1 solution',0],['Δ < 0','0 solution',-0.6]].forEach(([t,u,d],i)=>{ const x0=8+i*64, X=v=>x0+28+v*12, Y=v=>84-v*14; let p=''; for(let j=0;j<=30;j++){ const v=-2.2+j*4.4/30, y=v*v*0.7-d*2.4; p+=(j?'L':'M')+X(v).toFixed(1)+' '+Y(y).toFixed(1)+' '; }
    s+=ln(x0,84,x0+56,84,INK,1.5)+`<path d="${p}" fill="none" stroke="${C}" stroke-width="2.5" clip-path="none"/>`+tx(x0+28,112,t,11,['+','0','-'][i]===a[0]?ORANGE:INK,900)+tx(x0+28,126,u,9,SOFT,800);
    if(d>0) [-1,1].forEach(sg=>{ const r=Math.sqrt(d*2.4/0.7); s+=dot(X(sg*r),84,3.5,PURP); }); if(d===0) s+=dot(X(0),84,3.5,PURP); });
  return SV(s); };

/* ===================== DÉRIVATION (1re, Tle) ===================== */
L3.tangente=(a,C,T)=>{ const k=a[0]||''; const f=x=>0.5*x*x-1*x+2.5, df=x=>x-1; const F=frm({x0:-1,x1:5,y0:-0.5,y1:7,gx:1,gy:1,lx:1,ly:1,L:20,R:186,T:12,B:118}); let s=clip(F)+F.s+fpath(F,f,-1,5,C,3.5);
  const x0=k==='horiz'?1:3, y0=f(x0), m=df(x0); s+=fpath(F,x=>y0+m*(x-x0),-1,5,ORANGE,2.5)+dot(F.X(x0),F.Y(y0),5,ORANGE)+tx(F.X(x0)-6,F.Y(y0)-8,'A',12,ORANGE,900,'end');
  if(k==='pente'||k===''){ s+=dash(F.X(x0),F.Y(y0),F.X(x0+1),F.Y(y0),PURP,2.5)+dash(F.X(x0+1),F.Y(y0),F.X(x0+1),F.Y(y0+m),PURP,2.5)+tx(F.X(x0+0.5),F.Y(y0)+13,'+1',10,PURP,900)+tx(F.X(x0+1)+4,F.Y(y0+m/2)+4,'+'+fN(m),10,PURP,900,'start'); }
  if(k==='horiz') s+=tx(F.X(x0),F.Y(y0)+18,'f′(1) = 0',11,ORANGE,900);
  return SV(s); };
/* l3:tabder|x1;x2;x3|signes|y1;y2;y3|nom  — signe de f′ puis variations */
L3.tabder=(a,C,T)=>{ const xs=a[0].split(';'), sg=a[1].split(','), ys=a[2].split(';'), nm=a[3]||'f'; const n=xs.length, x0=52, X=i=>x0+12+i*((178-x0)/(n-1));
  let s=rr(6,6,188,128,4,PAPER,INK,2)+ln(6,30,194,30,INK,2)+ln(6,58,194,58,INK,2)+ln(46,6,46,134,INK,2)+tx(26,23,'x',13,INK,900)+tx(26,49,nm+'′(x)',11,INK,900)+tx(26,100,nm+'(x)',11,INK,900);
  xs.forEach((v,i)=>{ s+=tx(X(i),23,v,11,INK,900); });
  sg.forEach((g,i)=>{ s+=tx((X(i)+X(i+1))/2,51,g,16,g==='+'?GREEN:RED,900); if(i<n-2) s+=tx(X(i+1),50,'0',11,INK,900)+ln(X(i+1),30,X(i+1),58,INK,1.2); });
  const yy=ys.map(v=>Number(String(v).replace(/−/g,'-').replace(',','.'))); const Y=i=>{ const mn=Math.min(...yy), mx=Math.max(...yy); return mn===mx?96:128-(yy[i]-mn)/(mx-mn)*56; };
  ys.forEach((v,i)=>{ s+=tx(X(i),Y(i)+(Y(i)>100?0:6),v,11,C,900); if(i<n-1){ const d=yy[i+1]<yy[i]; s+=vec(X(i)+12,Y(i)+(d?-2:-8),X(i+1)-12,Y(i+1)+(d?-8:4),C,2.2); } });
  return SV(s); };
L3.plans=(a,C,T)=>{ const k=a[0]||'paralleles'; let s='';
  const pl=(y,f)=>poly([[20,y],[150,y],[180,y-30],[50,y-30]],f,INK,2.5,'fill-opacity=".8"');
  if(k==='paralleles') s+=pl(116,T)+pl(66,'#E9ECF5')+tx(190,104,'P₁',12,C,900,'end').replace('x="190"','x="196"')+tx(190,54,'P₂',12,INK,900,'end').replace('x="190"','x="196"');
  if(k==='perp'){ s+=pl(116,T)+ln(100,101,100,18,C,4)+rAngle(100,101,1,0,0,-1,9,INK)+dot(100,101,4,INK)+tx(108,30,'(d)',12,C,900,'start'); }
  if(k==='coplan'){ s+=pl(110,T)+ln(40,98,150,92,C,3.5)+ln(60,86,170,80,C,3.5)+tx(100,128,'(d₁) et (d₂) dans le même plan',11,C,900); }
  if(k==='noncoplan'){ s+=pl(116,T)+ln(40,104,160,96,C,3.5)+ln(120,20,90,80,ORANGE,3.5)+dash(90,80,84,92,ORANGE,2)+tx(100,134,'pas dans le même plan',11,ORANGE,900); }
  return SV(s); };
L3.sectsphere=(a,C,T)=>SV(`<circle cx="90" cy="70" r="56" fill="${T}" stroke="${INK}" stroke-width="2.5"/>`+`<ellipse cx="90" cy="48" rx="45" ry="9" fill="${C}" fill-opacity=".45" stroke="${C}" stroke-width="2.5"/>`+dot(90,70,3.5,INK)+dash(90,70,90,48,ORANGE,2.2)+tx(96,62,'d',12,ORANGE,900,'start')+ln(90,48,135,48,PURP,2.5)+tx(112,42,'r',12,PURP,900)+ln(90,70,135,48,INK,1.5)+tx(118,70,'R',12,INK,900)+tx(170,110,'r² = R² − d²',10,C,900,'end').replace('x="170"','x="196"'));

/* ===================== VECTEURS (1re, Tle) ===================== */
function arrowV(F,x1,y1,x2,y2,col,lab,w){ const X1=F.X(x1),Y1=F.Y(y1),X2=F.X(x2),Y2=F.Y(y2); let s=vec(X1,Y1,X2,Y2,col,w||3); if(lab){ const mx=(X1+X2)/2, my=(Y1+Y2)/2, dx=X2-X1, dy=Y2-Y1, L=Math.hypot(dx,dy)||1; const ox=-dy/L*12, oy=dx/L*12; s+=`<text x="${(mx+ox).toFixed(1)}" y="${(my+oy+4).toFixed(1)}" font-size="12" font-weight="900" fill="${col}" text-anchor="middle">${escX(lab)}</text>`+ln(mx+ox-5,my+oy-8,mx+ox+5,my+oy-8,col,1.5)+`<polyline points="${mx+ox+2},${my+oy-10.5} ${mx+ox+5},${my+oy-8} ${mx+ox+2},${my+oy-5.5}" fill="none" stroke="${col}" stroke-width="1.5"/>`; } return s; }
L3.vect=(a,C,T)=>{ const k=a[0]||'single'; const F=frm({x0:0,x1:10,y0:0,y1:7,gx:1,gy:1,L:14,R:186,T:10,B:122,grid:true}); let s=F.s.replace(/<line[^>]*stroke="var\(--ink\)"[^>]*\/>|<polyline[^>]*>/g,''); const P=(x,y,n,col)=>dot(F.X(x),F.Y(y),3.5,col||INK)+(n?tx(F.X(x)+(n.dx||-6),F.Y(y)+(n.dy||-6),n.t,11,col||INK,900,'middle'):'');
  if(k==='single'){ s+=arrowV(F,1,1,7,5,C,'u')+P(1,1,{t:'A',dx:-7,dy:12})+P(7,5,{t:'B',dx:6,dy:-6})+tx(F.X(8.4),F.Y(6.2),'direction',9,SOFT,800)+tx(F.X(8.6),F.Y(1.4),'sens : A → B',9,SOFT,800); }
  if(k==='egaux'){ s+=poly([[F.X(1),F.Y(1)],[F.X(6),F.Y(2)],[F.X(8),F.Y(5)],[F.X(3),F.Y(4)]],T,'none',0)+arrowV(F,1,1,6,2,C,'')+arrowV(F,3,4,8,5,C,'')+dash(F.X(1),F.Y(1),F.X(3),F.Y(4),INK,1.5)+dash(F.X(6),F.Y(2),F.X(8),F.Y(5),INK,1.5)+P(1,1,{t:'A',dy:12})+P(6,2,{t:'B',dx:6,dy:12})+P(8,5,{t:'C',dx:6})+P(3,4,{t:'D',dx:-6})+tx(F.X(5),F.Y(6.4),'AB = DC',11,C,900); }
  if(k==='somme'){ s+=arrowV(F,1,1,4,5,BLUE,'u')+arrowV(F,4,5,9,3,ORANGE,'v')+arrowV(F,1,1,9,3,C,'u + v',3.5)+P(1,1,{t:'A',dy:12})+P(4,5,{t:'B'})+P(9,3,{t:'C',dx:6}); }
  if(k==='coord'){ s+=arrowV(F,2,1,7,4,C,'AB')+dash(F.X(2),F.Y(1),F.X(7),F.Y(1),BLUE,2.5)+dash(F.X(7),F.Y(1),F.X(7),F.Y(4),RED,2.5)+tx(F.X(4.5),F.Y(1)+14,'x = 5',11,BLUE,900)+tx(F.X(7)+6,F.Y(2.5),'y = 3',11,RED,900,'start')+P(2,1,{t:'A',dx:-7})+P(7,4,{t:'B',dx:6}); }
  if(k==='colin'){ s+=arrowV(F,1,1,3,2,C,'u')+arrowV(F,3,4,9,7,ORANGE,'3u'); }
  if(k==='oppose'){ s+=arrowV(F,1,2,5,5,C,'u')+arrowV(F,9,5,5,2,ORANGE,'−u'); }
  if(k==='norme'){ s+=arrowV(F,1,1,7,5,C,'')+tx(F.X(3.4),F.Y(3.8),'‖AB‖',12,C,900)+P(1,1,{t:'A',dy:12})+P(7,5,{t:'B',dx:6})+tx(F.X(7),F.Y(0.8),'= √(6² + 4²)',10,INK,900); }
  if(k==='force'){ s+=rr(F.X(4)-12,F.Y(3)-10,24,20,3,'#C9D1EA',INK,2)+arrowV(F,4,3,9,3,BLUE,'F₁')+arrowV(F,4,3,4,7,ORANGE,'F₂')+arrowV(F,4,3,9,7,C,'F',3.5); }
  return SV(s); };

/* ===================== TRIGONOMÉTRIE (1re, Tle) ===================== */
L3.cercle=(a,C,T)=>{ const k=a[0]||'cercle', th=+(a[1]||Math.PI/3); const cx=84, cy=70, R=52; let s=ln(cx-R-12,cy,cx+R+14,cy,INK,1.8)+ln(cx,cy+R+10,cx,cy-R-10,INK,1.8)+`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C}" stroke-width="3"/>`+dot(cx,cy,3,INK);
  const px=cx+R*Math.cos(th), py=cy-R*Math.sin(th);
  s+=tx(cx+R+4,cy+14,'1',10,SOFT,900,'start')+tx(cx-6,cy-R-2,'1',10,SOFT,900,'end')+tx(cx+R+4,cy-4,'I',11,INK,900,'start')+tx(cx+6,cy-R-4,'J',11,INK,900,'start');
  if(k!=='cercle'){ s+=ln(cx,cy,px,py,INK,2.5)+dot(px,py,4.5,ORANGE)+tx(px+8,py-6,'M',12,ORANGE,900,'start')+arcA(cx,cy,16,0,th,ORANGE,2.5)+tx(cx+24*Math.cos(th/2),cy-24*Math.sin(th/2)+4,k==='radian'?'1 rad':'θ',10,ORANGE,900); }
  if(k==='cos'||k==='point') s+=dash(px,py,px,cy,BLUE,2.2)+ln(cx,cy,px,cy,BLUE,4)+tx((cx+px)/2,cy+14,'cos θ',11,BLUE,900);
  if(k==='sin'||k==='point') s+=dash(px,py,cx,py,RED,2.2)+ln(cx,cy,cx,py,RED,4)+tx(cx-6,(cy+py)/2+4,'sin θ',11,RED,900,'end');
  if(k==='sens') s+=`<path d="M${cx+R+8} ${cy+20} A${R+8} ${R+8} 0 0 0 ${cx+20} ${cy-R-4}" fill="none" stroke="${GREEN}" stroke-width="3"/>`+arrowHead(cx+20,cy-R-4,'l',GREEN)+tx(176,30,'sens +',11,GREEN,900);
  if(k==='radian') s+=`<path d="M${cx+R} ${cy} A${R} ${R} 0 0 0 ${px.toFixed(1)} ${py.toFixed(1)}" fill="none" stroke="${ORANGE}" stroke-width="5"/>`+tx(166,40,'arc = rayon',10,ORANGE,900);
  if(k==='enroul'){ s+=ln(cx+R,cy+30,cx+R,cy-R-6,PURP,2.5)+tx(cx+R+6,cy-R+4,'droite des réels',9,PURP,900,'start')+`<path d="M${cx+R} ${cy} A${R} ${R} 0 0 0 ${px.toFixed(1)} ${py.toFixed(1)}" fill="none" stroke="${PURP}" stroke-width="4"/>`; }
  return SV(s); };
L3.sinus=(a,C,T)=>{ const fn=a[0]==='cos'?Math.cos:Math.sin; const amp=+(a[1]||1), w=+(a[2]||1), ph=+(a[3]||0); const P=Math.PI; const F=frm({x0:0,x1:2*P*1.05,y0:-Math.max(1.3,amp*1.3),y1:Math.max(1.3,amp*1.3),gy:amp>2?amp/2:0.5,L:24,R:186,T:10,B:122,grid:true});
  let s=clip(F)+F.s+fpath(F,x=>amp*fn(w*x+ph),0,2*P*1.05,C,3,'',160);
  [[P/2,'π/2'],[P,'π'],[3*P/2,'3π/2'],[2*P,'2π']].forEach(([x,l])=>{ s+=ln(F.X(x),F.Y(0)-3,F.X(x),F.Y(0)+3,INK,1.5)+tx(F.X(x),F.Y(0)+13,l,9,SOFT,900); });
  s+=tx(F.ax-4,F.Y(amp)+3,fN(amp),9,SOFT,900,'end')+tx(F.ax-4,F.Y(-amp)+3,fN(-amp),9,SOFT,900,'end')+ln(F.ax-3,F.Y(amp),F.ax+3,F.Y(amp),INK,1.5)+ln(F.ax-3,F.Y(-amp),F.ax+3,F.Y(-amp),INK,1.5);
  if(a[4]==='periode') s+=ln(F.X(0),F.Y(amp)-6,F.X(2*P/w),F.Y(amp)-6,PURP,2.5)+arrowHead(F.X(0),F.Y(amp)-6,'l',PURP)+arrowHead(F.X(2*P/w),F.Y(amp)-6,'r',PURP)+tx(F.X(P/w),F.Y(amp)-10,'période',10,PURP,900);
  return SV(s); };

/* ===================== LOGIQUE (1re) ===================== */
L3.logic=(a,C,T)=>{ const k=a[0]||'et'; const V='V', F='F'; let rows, head;
  if(k==='non'){ head=['A','non A']; rows=[[V,F],[F,V]]; } else { head=['A','B',k==='et'?'A et B':k==='ou'?'A ou B':'si A alors B']; rows=[[V,V,V],[V,F,k==='ou'?V:F],[F,V,k==='et'?F:V],[F,F,k==='et'||k==='ou'?F:V]]; }
  const n=head.length, W=n===2?70:56, x0=100-n*W/2; let s='';
  head.forEach((h,j)=>{ s+=rr(x0+j*W,10,W,24,0,j===n-1?T:'var(--sunk)',INK,1.5)+tx(x0+j*W+W/2,27,h,h.length>8?9:11,j===n-1?C:INK,900); });
  rows.forEach((r,i)=>r.forEach((v,j)=>{ s+=rr(x0+j*W,34+i*24,W,24,0,PAPER,INK,1.5)+tx(x0+j*W+W/2,51+i*24,v==='V'?'vrai':'faux',11,v==='V'?GREEN:RED,900); }));
  return SV(s); };
L3.quantif=(a,C,T)=>{ const all=a[0]!=='existe'; let s=''; for(let i=0;i<8;i++){ const x=30+(i%4)*40, y=34+Math.floor(i/4)*44; const on=all||i===5; s+=`<circle cx="${x}" cy="${y}" r="14" fill="${on?T:PAPER}" stroke="${on?C:INK}" stroke-width="2.5"/>`+(on?tx(x,y+5,'✓',14,GREEN,900):''); }
  return SV(s+tx(100,132,all?'pour tout : tous les éléments':'il existe : au moins un',12,C,900)); };
L3.cubique=(a,C,T)=>{ const k=a[0]||'cube'; let F, f, s='';
  if(k==='cube'){ F=frm({x0:-2.2,x1:2.2,y0:-8,y1:8,gx:1,gy:2,lx:1,ly:4,L:20,R:186,T:10,B:122}); f=x=>x**3; s=clip(F)+F.s+fpath(F,f,-2.2,2.2,C,3.5)+tx(F.X(1.2),F.Y(7),'y = x³',12,C,900,'start'); return SV(s); }
  if(k==='local'){ F=frm({x0:-2.2,x1:2.2,y0:-3,y1:3,gx:1,gy:1,lx:1,ly:1,L:20,R:186,T:10,B:122}); f=x=>x**3-3*x; s=clip(F)+F.s+fpath(F,f,-2.2,2.2,C,3.5)+dot(F.X(-1),F.Y(2),5,ORANGE)+tx(F.X(-1),F.Y(2)-9,'max local',9,ORANGE,900)+dot(F.X(1),F.Y(-2),5,PURP)+tx(F.X(1),F.Y(-2)+16,'min local',9,PURP,900); return SV(s); }
  F=frm({x0:0,x1:15,y0:0,y1:2200,gx:1,gy:250,lx:5,ly:500,L:30,R:186,T:10,B:122,fs:8,nx:'x',ny:'V'}); f=x=>x*(30-2*x)**2; s=clip(F)+F.s+fpath(F,f,0,15,C,3.5)+dot(F.X(5),F.Y(2000),5,ORANGE)+dash(F.X(5),F.Y(2000),F.X(5),F.Y(0),ORANGE,2)+tx(F.X(5)+6,F.Y(2000)+4,'2 000 cm³',9,ORANGE,900,'start'); return SV(s); };
L3.boite=(a,C,T)=>{ let s=rr(30,10,120,120,0,PAPER,INK,2.5); [[30,10],[126,10],[30,106],[126,106]].forEach(([x,y])=>{ s+=rr(x,y,24,24,0,T,C,2,'stroke-dasharray="4 3"'); }); s+=tx(42,27,'x',11,C,900)+tx(90,74,'30 − 2x',12,INK,900)+tx(90,146,'30 cm',11,SOFT,800).replace('y="146"','y="139"');
  s+=dash(54,34,126,34,INK,1.5)+dash(54,106,126,106,INK,1.5)+dash(54,34,54,106,INK,1.5)+dash(126,34,126,106,INK,1.5); return SV(s+tx(176,60,'je plie',10,SOFT,800)+tx(176,74,'les bords',10,SOFT,800)); };

/* ===================== EXPONENTIELLES ET LOGARITHME (Tle) ===================== */
L3.expo=(a,C,T)=>{ const q=+(a[0]||2); const up=q>1; const F=frm({x0:-3,x1:3,y0:-0.5,y1:8,gx:1,gy:1,lx:1,ly:2,L:20,R:186,T:10,B:122}); let s=clip(F)+F.s+fpath(F,x=>q**x,-3,3,C,3.5)+dot(F.X(0),F.Y(1),4.5,ORANGE)+tx(F.X(0)+6,F.Y(1)+12,'(0 ; 1)',9,ORANGE,900,'start');
  return SV(s+tx(up?F.X(1.2):F.X(-2.8),F.Y(7.2),`y = ${fN(q)}ˣ`,12,C,900,'start')); };
L3.log=(a,C,T)=>{ const F=frm({x0:0,x1:11,y0:-1.5,y1:1.5,gx:1,gy:0.5,lx:1,ly:0.5,L:24,R:186,T:10,B:122,fs:8}); let s=clip(F)+F.s+fpath(F,x=>Math.log10(x),0.03,11,C,3.5,'',200)+dot(F.X(1),F.Y(0),4.5,ORANGE)+dot(F.X(10),F.Y(1),4.5,ORANGE)+tx(F.X(10),F.Y(1)-8,'log 10 = 1',9,ORANGE,900);
  return SV(s+tx(F.X(4),F.Y(1.25),'y = log x',12,C,900)); };
L3.decibel=(a,C,T)=>{ const L=[[0,'seuil d’audition'],[30,'chuchotement'],[60,'conversation'],[85,'danger : casque'],[105,'marteau-piqueur'],[120,'douleur']]; let s=`<defs><linearGradient id="dbg" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="#2FA65A"/><stop offset=".6" stop-color="#FFC233"/><stop offset="1" stop-color="#E5484D"/></linearGradient></defs>`+rr(30,8,22,124,6,'url(#dbg)',INK,2);
  L.forEach(([v,t])=>{ const y=130-v; s+=ln(52,y,60,y,INK,2)+tx(64,y+4,`${v} dB : ${t}`,9,v===85?RED:INK,900,'start'); }); return SV(s); };
/* arbre pondéré : l3:arbrep|A,Ā|p1;p2|B,B̄|q1;q2;q3;q4 */
L3.arbrep=(a,C,T)=>{ const N1=(a[0]||'A,Ā').split(','), P1=(a[1]||'0,6;0,4').split(';'), N2=(a[2]||'B,B̄').split(','), P2=(a[3]||'0,03;0,97;0,05;0,95').split(';'); const hl=a[4]||''; let s=dot(14,70,4,INK);
  [0,1].forEach(i=>{ const y1=i?102:38; s+=ln(18,70,72,y1,i===0&&hl?C:INK,2.2)+tx(40,i?96:46,P1[i],10,BLUE,900)+tx(84,y1+4,N1[i],12,INK,900);
    [0,1].forEach(j=>{ const y2=y1+(j?14:-14)+(i?8:-8)*(j?1:-1)*0; const Y=i*64+(j?44:12)+8; s+=ln(96,y1,150,Y,INK,2)+tx(122,(y1+Y)/2+(j?10:-4),P2[i*2+j],9,ORANGE,900)+tx(162,Y+4,N2[j],12,INK,900); }); });
  return SV(s); };

/* ===================== EMPRUNTS (Tle) ===================== */
L3.amort=(a,C,T)=>{ const H=['Mois','Capital dû','Intérêts','Amort.','Mensualité'], R=[['1','18 000','72,00','340,90','412,90'],['2','17 659,10','70,64','342,26','412,90'],['3','17 316,84','69,27','343,63','412,90']]; const W=[24,46,40,40,46]; let s='', x=2;
  H.forEach((h,j)=>{ s+=rr(x,14,W[j],22,0,'var(--sunk)',INK,1.2)+tx(x+W[j]/2,29,h,7.5,INK,900); x+=W[j]; });
  R.forEach((r,i)=>{ x=2; r.forEach((v,j)=>{ const on=(a[0]==='interets'&&j===2)||(a[0]==='capital'&&j===1)||(a[0]==='amort'&&j===3); s+=rr(x,36+i*22,W[j],22,0,on?T:PAPER,on?C:INK,on?2.5:1.2)+tx(x+W[j]/2,51+i*22,v,8,on?C:INK,800); x+=W[j]; }); });
  return SV(s+tx(100,126,'mensualité = intérêts + amortissement',9,C,900)); };

/* ===================== REPÈRE DE L’ESPACE (Tle) ===================== */
function P3(x,y,z){ return [60+x*16-y*8, 104-z*12+y*5]; }
L3.esp=(a,C,T)=>{ const k=a[0]||'repere'; let s=''; const O=P3(0,0,0);
  const ax=(v,lab,col)=>{ const p=P3(...v); return vec(O[0],O[1],p[0],p[1],col,2.5)+tx(p[0]+(v[0]?6:v[1]?-6:4),p[1]+(v[2]?-4:10),lab,11,col,900); };
  s+=ax([7,0,0],'x',RED)+ax([0,5,0],'y',GREEN)+ax([0,0,7.5],'z',BLUE)+tx(O[0]-6,O[1]+12,'O',11,INK,900);
  if(k==='point'||k==='repere'){ const p=[4,3,5], M=P3(...p), A=P3(4,3,0), Bx=P3(4,0,0), By=P3(0,3,0); s+=dash(M[0],M[1],A[0],A[1],SOFT,1.6)+dash(A[0],A[1],Bx[0],Bx[1],SOFT,1.6)+dash(A[0],A[1],By[0],By[1],SOFT,1.6)+dot(M[0],M[1],5,C)+tx(M[0]+8,M[1]-4,'M(4 ; 3 ; 5)',11,C,900,'start'); }
  if(k==='vecteur'||k==='cable'){ const A=P3(0,0,0), B=P3(6,4,7); s+=vec(A[0],A[1],B[0],B[1],C,3.5)+dot(B[0],B[1],4,C)+tx(B[0]+6,B[1],'B',12,C,900,'start')+tx(A[0]+8,A[1]+4,'A',12,C,900,'start'); }
  if(k==='pave'){ const V=[[0,0,0],[4,0,0],[4,3,0],[0,3,0],[0,0,2],[4,0,2],[4,3,2],[0,3,2]].map(v=>P3(...v)); const e=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    e.forEach(([i,j])=>{ s+=((i===3&&j===0)||(i===2&&j===3)||(i===3&&j===7)?dash:ln)(V[i][0],V[i][1],V[j][0],V[j][1],INK,1.8); }); s+=ln(V[0][0],V[0][1],V[6][0],V[6][1],ORANGE,2.5)+dot(V[6][0],V[6][1],4,ORANGE)+tx(V[6][0]+6,V[6][1]-4,'G(4 ; 3 ; 2)',10,ORANGE,900,'start'); }
  return SV(s); };
L3.fresnel=(a,C,T)=>{ const ph=+(a[0]||Math.PI/4), A=+(a[1]||1); const cx=60, cy=70, R=46*Math.min(1,A); let s=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C}" stroke-width="1.5" stroke-dasharray="4 4"/>`+ln(cx-54,cy,cx+60,cy,INK,1.5)+arrowHead(cx+62,cy,'r',INK).replace('stroke-width="4"','stroke-width="2"');
  const px=cx+R*Math.cos(ph), py=cy-R*Math.sin(ph); s+=vec(cx,cy,px,py,C,3.5)+arcA(cx,cy,18,0,ph,ORANGE,2.5)+tx(cx+26*Math.cos(ph/2),cy-26*Math.sin(ph/2)+4,'φ',12,ORANGE,900)+tx((cx+px)/2-8,(cy+py)/2-6,'A',12,C,900,'end');
  s+=`<path d="M${cx+R+10} ${cy+16} A${R+10} ${R+10} 0 0 0 ${cx+18} ${cy-R-8}" fill="none" stroke="${GREEN}" stroke-width="2"/>`+tx(cx+R+8,cy-R+4,'ω',12,GREEN,900,'start');
  const X0=126; let d=''; for(let i=0;i<=40;i++){ const t=i/40*2*Math.PI; d+=(i?'L':'M')+(X0+i*1.6).toFixed(1)+' '+(cy-R*Math.sin(t+ph)).toFixed(1)+' '; } s+=ln(X0,cy,X0+66,cy,INK,1.2)+`<path d="${d}" fill="none" stroke="${C}" stroke-width="2.5"/>`+dash(px,py,X0,py,SOFT,1.2);
  return SV(s); };
L3.dephas=(a,C,T)=>{ const P=Math.PI, sh=+(a[0]||P/2); const F=frm({x0:0,x1:2*P*1.05,y0:-1.4,y1:1.4,gy:0.5,L:20,R:186,T:10,B:122,grid:true}); let s=clip(F)+F.s+fpath(F,Math.sin,0,2*P*1.05,C,3,'',140)+fpath(F,x=>Math.sin(x-sh),0,2*P*1.05,ORANGE,3,'stroke-dasharray="6 4"',140);
  s+=ln(F.X(P/2),F.Y(1.2),F.X(P/2+sh),F.Y(1.2),PURP,2.5)+arrowHead(F.X(P/2),F.Y(1.2),'l',PURP).replace('stroke-width="4"','stroke-width="2.5"')+arrowHead(F.X(P/2+sh),F.Y(1.2),'r',PURP).replace('stroke-width="4"','stroke-width="2.5"')+tx(F.X(P/2+sh/2),F.Y(1.2)-5,'décalage',9,PURP,900);
  return SV(s+tx(F.X(5.8),F.Y(-1.1),'u₁',11,C,900)+tx(F.X(6.3),F.Y(0.6),'u₂',11,ORANGE,900)); };
