
const menuBtn=document.getElementById('menuBtn');
const mobileNav=document.getElementById('mobileNav');
menuBtn?.addEventListener('click',()=>{
  const open=mobileNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded',String(open));
  menuBtn.textContent=open?'×':'☰';
});
mobileNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mobileNav.classList.remove('open'); menuBtn.textContent='☰'; menuBtn.setAttribute('aria-expanded','false');
}));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
  })
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

/* Contact form — envio em segundo plano para /api/contact */
const form=document.getElementById('contactForm');
const note=document.getElementById('formNote');
form?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!form.reportValidity()) return;
  const button=form.querySelector('button[type="submit"]');
  const original=button.innerHTML;
  button.disabled=true; button.textContent='A enviar…';
  note.textContent='A enviar o teu pedido…'; note.style.color='#aeb6ca';
  try{
    const payload=Object.fromEntries(new FormData(form).entries());
    const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.message||'Não foi possível enviar o pedido.');
    form.reset();
    note.textContent='Pedido enviado com sucesso. Obrigado — entraremos em contacto em breve.';
    note.style.color='#00dff0';
  }catch(err){
    note.textContent=err.message||'Não foi possível enviar. Tenta novamente.';
    note.style.color='#ff7ba8';
  }finally{button.disabled=false;button.innerHTML=original;}
});

/* Subtle animated network background */
const canvas=document.getElementById('network'),ctx=canvas.getContext('2d');
let pts=[],mx=-9999,my=-9999;
function resize(){
  const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;
  canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count=innerWidth<700?32:68;
  pts=[...Array(count)].map(()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18}));
}
addEventListener('resize',resize);
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY});
resize();
function draw(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  pts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;
  });
  for(let i=0;i<pts.length;i++){
    const p=pts[i];
    for(let j=i+1;j<pts.length;j++){
      const q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);
      if(d<120){
        ctx.strokeStyle=`rgba(58,102,255,${(1-d/120)*.12})`;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
    }
    const md=Math.hypot(p.x-mx,p.y-my);
    ctx.fillStyle=md<150?'rgba(0,225,255,.8)':'rgba(107,77,255,.55)';
    ctx.beginPath();ctx.arc(p.x,p.y,md<150?1.8:1.05,0,Math.PI*2);ctx.fill();
  }
  requestAnimationFrame(draw);
}
draw();
