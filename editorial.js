(() => {
'use strict';
const nav=document.querySelector('nav'), toggle=document.querySelector('.menu-toggle');
function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();toggle.focus();}});
const dialog=document.getElementById('project-dialog');let previousFocus;
function openProject(){if(typeof dialog.showModal!=='function'){window.open('https://sunhousealgarve.com','_blank','noopener');return;}previousFocus=document.activeElement;dialog.showModal();document.body.classList.add('modal-open');}
function closeProject(){dialog.close();}
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');previousFocus?.focus({preventScroll:true});});
dialog.querySelector('.close').addEventListener('click',closeProject);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeProject();}});
['project-open','image-open'].forEach(id=>document.getElementById(id).addEventListener('click',openProject));
document.querySelectorAll('details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)item.parentElement.querySelectorAll('details').forEach(other=>{if(other!==item)other.open=false;});}));
document.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('service-choice').value=button.dataset.service;document.getElementById('contacto').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});document.querySelector('[name="nome"]').focus({preventScroll:true});}));
document.getElementById('brief-form').addEventListener('submit',event=>{event.preventDefault();if(!event.currentTarget.reportValidity())return;document.querySelector('.form-status').textContent='Tudo certo. Na versão final, o seu pedido seria enviado à AVYENA. Esta demonstração não envia mensagens.';});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-10% 0px -55% 0px'});['trabalhos','servicos','processo','contacto'].forEach(id=>observer.observe(document.getElementById(id)));}
})();

// Lightweight 3D projection, with no library or continuous work off-screen.
(() => {
  const canvas=document.getElementById('brand-network');
  if(!canvas || !canvas.getContext) return;
  const ctx=canvas.getContext('2d');
  const control=document.querySelector('.network-control');
  if(!ctx){control.hidden=true;return;}
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let paused=reduced.matches,visible=true,frame=0,last=0,angle=.38,targetTilt=0,tilt=0;
  const points=Array.from({length:64},(_,i)=>{const y=1-2*(i+.5)/64,r=Math.sqrt(1-y*y),a=i*Math.PI*(3-Math.sqrt(5));return {x:Math.cos(a)*r,y,z:Math.sin(a)*r};});
  const edges=[];
  points.forEach((a,i)=>points.slice(i+1).forEach((b,j)=>{const distance=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);if(distance<.70)edges.push([i,i+1+j]);}));
  // Each pulse follows actual graph edges, then continues through the next node.
  const neighbours=points.map(()=>[]);
  edges.forEach(([a,b])=>{neighbours[a].push(b);neighbours[b].push(a);});
  const heat=new Float32Array(points.length);
  const pulses=[3,18,35,51].map((from,i)=>({from,to:neighbours[from][i%neighbours[from].length],progress:i*.23,hops:i}));
  function advanceFlow(dt){
    for(let i=0;i<heat.length;i++)heat[i]*=Math.exp(-dt/850);
    pulses.forEach(p=>{
      p.progress+=dt/1800;
      if(p.progress>=1){
        p.progress-=1;heat[p.to]=1;
        const previous=p.from;p.from=p.to;
        const candidates=neighbours[p.from].filter(n=>n!==previous);
        p.hops++;p.to=candidates[(p.hops*7+p.from)%candidates.length]??previous;
      }
    });
  }
  let size=400;
  function resize(){const width=canvas.getBoundingClientRect().width||400;size=width;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(width*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  function draw(){
    ctx.clearRect(0,0,size,size);
    const center=size/2,radius=size*.36;
    ctx.save();ctx.translate(center,size*.89);ctx.scale(1,.12);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,size*.25);
    shadow.addColorStop(0,'rgba(56,38,74,.10)');shadow.addColorStop(1,'rgba(56,38,74,0)');
    ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,size*.25,0,Math.PI*2);ctx.fill();ctx.restore();
    const surface=ctx.createRadialGradient(center-size*.12,center-size*.15,size*.02,center,center,radius*1.08);
    surface.addColorStop(0,'rgba(179,155,204,.10)');surface.addColorStop(.65,'rgba(122,98,145,.035)');surface.addColorStop(1,'rgba(17,17,19,0)');
    ctx.fillStyle=surface;ctx.beginPath();ctx.arc(center,center,radius*1.08,0,Math.PI*2);ctx.fill();
    const nodes=points.map(p=>{const x=p.x*Math.cos(angle)-p.z*Math.sin(angle),z=p.x*Math.sin(angle)+p.z*Math.cos(angle),t=.25+tilt;
      const y=p.y*Math.cos(t)-z*Math.sin(t),depth=p.y*Math.sin(t)+z*Math.cos(t),scale=3.8/(3.8-depth);
      return {x:center+x*radius*scale,y:center+y*radius*scale-8,z:depth,s:scale};});
    edges.slice().sort((a,b)=>(nodes[a[0]].z+nodes[a[1]].z)-(nodes[b[0]].z+nodes[b[1]].z)).forEach(([i,j])=>{
      const a=nodes[i],b=nodes[j],depth=(a.z+b.z+2)/4;
      ctx.strokeStyle=`rgba(108,82,132,${.12+depth*.49})`;ctx.lineWidth=(.5+depth*.8)*size/400;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    });
    nodes.slice().sort((a,b)=>a.z-b.z).forEach((p,i)=>{const depth=(p.z+1)/2,rr=(1.4+depth*3.6)*size/400*p.s;
      const gradient=ctx.createRadialGradient(p.x-rr*.35,p.y-rr*.4,rr*.1,p.x,p.y,rr);
      gradient.addColorStop(0,depth>.55?'#ffffff':'#e1dce4');gradient.addColorStop(.38,depth>.55?'#a48abf':'#b7a7c7');gradient.addColorStop(1,depth>.55?'#614579':'#88749b');
      ctx.globalAlpha=.35+depth*.65;ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    });
    drawFlow(nodes);
  }
  function drawFlow(nodes){
    const unit=size/400;
    ctx.save();ctx.lineCap='round';
    pulses.forEach(p=>{
      const a=nodes[p.from],b=nodes[p.to],depth=(a.z+(b.z-a.z)*p.progress+1)/2;
      const alpha=.28+depth*.7;
      // Short fading trail keeps the connection readable rather than illuminating the whole globe.
      for(let k=0;k<12;k++){
        const end=p.progress-k*.018,start=Math.max(0,end-.024);
        if(end<=0)continue;
        ctx.beginPath();ctx.moveTo(a.x+(b.x-a.x)*start,a.y+(b.y-a.y)*start);
        ctx.lineTo(a.x+(b.x-a.x)*end,a.y+(b.y-a.y)*end);
        ctx.strokeStyle=`rgba(133,63,197,${alpha*(1-k/12)})`;
        ctx.lineWidth=(1.3+depth)*unit;ctx.stroke();
      }
      const x=a.x+(b.x-a.x)*p.progress,y=a.y+(b.y-a.y)*p.progress;
      const glow=ctx.createRadialGradient(x,y,0,x,y,12*unit);
      glow.addColorStop(0,`rgba(255,246,255,${alpha})`);
      glow.addColorStop(.23,`rgba(149,81,219,${alpha*.75})`);
      glow.addColorStop(1,'rgba(149,81,219,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,12*unit,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=`rgba(255,250,255,${alpha})`;ctx.beginPath();ctx.arc(x,y,1.7*unit,0,Math.PI*2);ctx.fill();
    });
    heat.forEach((value,i)=>{
      if(value<.025)return;
      const n=nodes[i],alpha=value*(.25+(n.z+1)*.3),radius=(8+7*(1-value))*unit;
      const glow=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,radius);
      glow.addColorStop(0,`rgba(250,235,255,${alpha})`);glow.addColorStop(.3,`rgba(149,81,219,${alpha*.65})`);glow.addColorStop(1,'rgba(198,152,240,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(n.x,n.y,radius,0,Math.PI*2);ctx.fill();
    });
    ctx.restore();
  }
  function tick(time){frame=0;if(paused||!visible||document.hidden){last=0;return;}const dt=last?Math.min(time-last,40):0;last=time;angle+=dt*.000045;advanceFlow(dt);tilt+=(targetTilt-tilt)*.035;draw();frame=requestAnimationFrame(tick);}
  function sync(){control.textContent=paused?'▷':'Ⅱ';control.setAttribute('aria-label',paused?'Animar a rede':'Pausar movimento');control.title=paused?'Animar a rede':'Pausar movimento';control.setAttribute('aria-pressed',String(paused));if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick);else draw();}
  control.addEventListener('click',()=>{paused=!paused;sync();});
  canvas.addEventListener('pointermove',e=>{if(paused||reduced.matches)return;const rect=canvas.getBoundingClientRect();targetTilt=((e.clientY-rect.top)/rect.height-.5)*.35;});
  canvas.addEventListener('pointerleave',()=>{targetTilt=0;});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);else addEventListener('resize',resize);
  resize();sync();
})();
