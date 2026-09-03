
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

/* PT / EN — tradução local, sem serviços externos */
(() => {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  const pairs = [
    ['Início','Home'],['Serviços','Services'],['Processo','Process'],['Compromisso','Commitment'],['Para quem','Who we help'],['Contacto','Contact'],['Fala connosco','Talk to us'],
    ['Presença digital.','Digital presence.'],['Resultados reais.','Real results.'],['Conectamos ideias.','We connect ideas.'],['Criamos impacto.','We create impact.'],
    ['Ajudamos negócios em todo o território português a ganhar visibilidade, atrair clientes e crescer no digital com estratégia, criatividade e foco em resultados.','We help businesses across Portugal gain visibility, attract customers and grow digitally through strategy, creativity and a focus on results.'],
    ['Ver o que fazemos','See our services'],['Como trabalhamos','How we work'],['Explorar','Explore'],['Os nossos serviços','Our services'],['Tudo o que a tua marca precisa.','Everything your brand needs.'],['Soluções integradas para negócios que querem ser encontrados, lembrados e escolhidos.','Integrated solutions for businesses that want to be found, remembered and chosen.'],
    ['Gestão de Redes Sociais','Social Media Management'],['Google Business & Presença Local','Google Business & Local Presence'],['Soluções Digitais & Experiência','Digital Solutions & Experience'],['Websites & Landing Pages','Websites & Landing Pages'],['Branding & Identidade Visual','Branding & Visual Identity'],['Estratégia & Crescimento','Strategy & Growth'],
    ['Simples. Eficaz. Com resultado.','Simple. Effective. Results-driven.'],['Analisamos','We analyse'],['Planeamos','We plan'],['Produzimos','We create'],['Evoluímos','We evolve'],
    ['O que podes esperar da AVYENA','What you can expect from AVYENA'],['Estratégia adaptada','Tailored strategy'],['Comunicação próxima','Close communication'],['Soluções práticas','Practical solutions'],['Acompanhamento contínuo','Continuous support'],
    ['Restauração & Bares','Restaurants & Bars'],['Comércio & Serviços','Retail & Services'],['Turismo & Alojamento','Tourism & Accommodation'],['Marcas em crescimento','Growing Brands'],['Pensado para negócios reais','Built for real businesses'],['Digital com os pés no negócio.','Digital grounded in business.'],
    ['Perguntas frequentes','Frequently asked questions'],['Começar é simples.','Getting started is simple.'],['Conta-nos o que queres melhorar.','Tell us what you want to improve.'],['Enviar pedido','Send request'],['Nome / Empresa','Name / Company'],['Telefone','Phone'],['Localização','Location'],['O que procuras?','What are you looking for?'],['Fala-nos do projeto','Tell us about your project'],['Seleciona uma opção','Select an option'],['Vários serviços','Multiple services'],['Voltar ao topo ↑','Back to top ↑'],['Todos os direitos reservados.','All rights reserved.']
  ];
  const ptToEn = new Map(pairs), enToPt = new Map(pairs.map(([a,b])=>[b,a]));
  const translateText = (map) => {
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{ const raw=n.nodeValue, t=raw.trim(); if(map.has(t)) n.nodeValue=raw.replace(t,map.get(t)); });
    document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
      const v=el.getAttribute('placeholder'); const m=map.get(v); if(m) el.setAttribute('placeholder',m);
    });
    document.querySelectorAll('option').forEach(el=>{ const t=el.textContent.trim(); if(map.has(t)) el.textContent=map.get(t); });
  };
  let lang='pt';
  btn.addEventListener('click',()=>{
    if(lang==='pt'){ translateText(ptToEn); lang='en'; btn.innerHTML='🇵🇹 <span>PT</span>'; btn.setAttribute('aria-label','Mudar para Português'); document.documentElement.lang='en'; }
    else { translateText(enToPt); lang='pt'; btn.innerHTML='🇬🇧 <span>EN</span>'; btn.setAttribute('aria-label','Switch to English'); document.documentElement.lang='pt-PT'; }
  });
})();
