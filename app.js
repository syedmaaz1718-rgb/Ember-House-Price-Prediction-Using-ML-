const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=l=>l>=100?'₹'+(l/100).toFixed(2)+' Cr':'₹'+Math.round(l)+' L';
const crore=l=>l>=100?(l/100).toFixed(2):Math.round(l);
const BRAND='Ember';let MODEL,STATS;
const load=Promise.all([fetch('data/model.json').then(r=>r.json()),fetch('data/stats.json').then(r=>r.json())]).then(([m,s])=>{MODEL=m;STATS=s});
function predict(loc,bhk,sqft,bath){
  const m=MODEL,x=[m.locenc[loc],Math.log(sqft),bath,bhk];let s=m.init;
  for(const t of m.trees){let i=0;while(t.l[i]!==-1)i=x[t.f[i]]<=t.t[i]?t.l[i]:t.r[i];s+=m.lr*t.v[i]}
  return{mid:Math.exp(s),lo:Math.exp(s+m.resid_lo),hi:Math.exp(s+m.resid_hi)};
}
document.body.insertAdjacentHTML('afterbegin',`<div class="vig"></div><div class="curtain closed" id="cu"><i></i><i></i><b>${BRAND}</b></div><div class="cur"></div><header><a class="logo" href="index.html">Ember<i>.</i></a><nav>${[['index','Predict'],['market','Market'],['localities','Localities'],['method','Method']].map(([p,n])=>`<a href="${p}.html" class="${location.pathname.includes(p)||(p=='index'&&/\/$/.test(location.pathname))?'on':''}">${n}</a>`).join('')}</nav></header>`);
document.addEventListener('pointermove',e=>{const c=$('.cur');if(c){c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'}});
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&(e.target.classList.add('in'),e.target.dispatchEvent(new Event('shown')))),{threshold:.12});
function reveal(){$$('.reveal').forEach(e=>io.observe(e))}
function count(el,to,fm,d=1400){const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,4);el.textContent=fm(to*e);if(k<1)requestAnimationFrame(f)})(t0)}
/* charts */
function hist(el){const {counts,edges}=STATS.hist,W=900,H=340,p=40,mx=Math.max(...counts),bw=(W-2*p)/counts.length;
 let s=`<svg class="ch" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e0457b"/><stop offset="1" stop-color="#ffb35c"/></linearGradient></defs>`;
 counts.forEach((c,i)=>{const h=(H-2*p)*c/mx;s+=`<rect class="hb" data-t="${edges[i]}–${edges[i+1]}${i==counts.length-1?'+':''} L: ${c} listings" x="${p+i*bw+2}" y="${H-p-h}" width="${bw-4}" height="${h}" rx="4" fill="url(#g)"/>`});
 [0,100,200,300,400,500].forEach(v=>s+=`<text x="${p+v/500*(W-2*p)}" y="${H-14}" fill="#a8958c" font-size="13" text-anchor="middle">${v==500?'500+':v}</text>`);
 el.innerHTML=s+`<text x="${W/2}" y="${H-1}" fill="#6f5f58" font-size="11" text-anchor="middle">price, ₹ lakh</text></svg><div class="tt"></div>`;tip(el,'.hb')}
function tip(el,sel){const t=$('.tt',el);$$(sel,el).forEach(n=>{n.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();t.textContent=n.dataset.t;t.style.opacity=1;t.style.left=Math.min(e.clientX-r.left+12,r.width-170)+'px';t.style.top=e.clientY-r.top-38+'px'});n.addEventListener('pointerleave',()=>t.style.opacity=0)})}
function scatter(el,mark){const W=900,H=420,p=44,pts=STATS.scatter,xm=5000,ym=600,cols={1:'#ffb35c',2:'#ff9a52',3:'#ff6b4a',4:'#e0457b'};
 const X=v=>p+Math.min(v,xm)/xm*(W-2*p),Y=v=>H-p-Math.min(v,ym)/ym*(H-2*p);
 let s=`<svg class="ch" viewBox="0 0 ${W} ${H}">`;
 [0,200,400,600].forEach(v=>s+=`<line x1="${p}" x2="${W-p}" y1="${Y(v)}" y2="${Y(v)}" stroke="#432e34"/><text x="6" y="${Y(v)+4}" fill="#a8958c" font-size="12">${v}</text>`);
 [0,1000,2000,3000,4000,5000].forEach(v=>s+=`<text x="${X(v)}" y="${H-18}" fill="#a8958c" font-size="12" text-anchor="middle">${v}</text>`);
 pts.forEach(([a,b,k])=>{if(a<=xm&&b<=ym)s+=`<circle class="sp" data-t="${Math.round(a)} sqft · ${b} L · ${k} BHK" cx="${X(a)}" cy="${Y(b)}" r="4.5" fill="${cols[Math.min(k,4)]}" fill-opacity=".55"/>`});
 if(mark)s+=`<circle cx="${X(mark.sqft)}" cy="${Y(mark.price)}" r="9" fill="#fff"/><circle cx="${X(mark.sqft)}" cy="${Y(mark.price)}" r="16" fill="none" stroke="#fff"><animate attributeName="r" values="9;22;9" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="2s" repeatCount="indefinite"/></circle>`;
 el.innerHTML=s+`</svg><div class="tt"></div>`;tip(el,'.sp')}
function bars(el,rows,key,f){const mx=Math.max(...rows.map(r=>r[key]));el.innerHTML=rows.map(r=>`<div class="bar"><span>${r.name}</span><div class="t"><i data-w="${r[key]/mx*100}"></i></div><span>${f(r[key])}</span></div>`).join('');
 const go=()=>$$('i',el).forEach((i,k)=>setTimeout(()=>i.style.width=i.dataset.w+'%',k*25));el.classList.contains('in')?go():el.addEventListener('shown',go,{once:true})}

document.title=BRAND+' - '+({index:'Bengaluru House Price Predictor',market:'Market',localities:'Localities',method:'Method'}[(location.pathname.match(/(\w+)\.html/)||[0,'index'])[1]]);
(function(){const cu=$('#cu');const first=!sessionStorage.getItem('seen')&&/index|\/$/.test(location.pathname);
 const done=()=>{cu.classList.remove('closed');cu.classList.add('open');document.body.classList.add('go');setTimeout(()=>{if(cu.classList.contains('open'))cu.style.display='none'},1600);$$('.hero,.pg').forEach(e=>e.classList.add('go'))};
 setTimeout(done,first?1500:150);sessionStorage.setItem('seen',1);if(first)cu.querySelector('b').style.letterSpacing='.04em';
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.target||e.metaKey||e.ctrlKey||!/^[\w-]+\.html$/.test(a.getAttribute('href')))return;e.preventDefault();cu.style.display='block';void cu.offsetWidth;cu.classList.remove('open');cu.classList.add('closed');cu.querySelector('b').style.opacity=0;setTimeout(()=>location.href=a.href,620)});
 window.addEventListener('pageshow',e=>{if(e.persisted)done()})})();
/* parallax + dust */
(function(){const sun=$('.sun'),L=$$('.sky svg');addEventListener('scroll',()=>{const y=scrollY;if(sun)sun.style.transform=`translateY(${y*.35}px)`;L.forEach((s,i)=>s.style.transform=`translateY(${-y*(.05+i*.06)}px)`)},{passive:true});
 const c=$('#dust');if(!c)return;const x=c.getContext('2d');let W,H,P=[];const rs=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;P=Array.from({length:Math.round(W/16)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.3,v:Math.random()*.3+.08,a:Math.random()*.6+.2}))};rs();addEventListener('resize',rs);
 (function f(){x.clearRect(0,0,W,H);for(const p of P){p.y-=p.v;p.x+=Math.sin(p.y/60)*.15;if(p.y<-5){p.y=H+5;p.x=Math.random()*W}x.fillStyle=`rgba(255,${160+p.r*30|0},110,${p.a})`;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()}requestAnimationFrame(f)})()})();
