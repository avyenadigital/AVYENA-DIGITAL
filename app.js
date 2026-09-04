const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
menuBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '✕' : '☰';
});
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuBtn.textContent = '☰';
  menuBtn.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .10 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const translations = {
  pt: {
    'nav.home':'Início','nav.services':'Serviços','nav.process':'Processo','nav.about':'Sobre','nav.contact':'Contacto',
    'cta.talk':'Falar Connosco','cta.services':'Ver Serviços','values.strategy':'Estratégia','values.creativity':'Criatividade','values.results':'Resultado',
    'hero.line1':'Conectamos ideias.','hero.line2':'Criamos impacto.','hero.copy':'Ajudamos negócios em todo o território português a ganhar visibilidade, atrair clientes e crescer no digital com estratégia, criatividade e foco em resultados.',
    'services.kicker':'O QUE FAZEMOS','services.title':'Soluções digitais que impulsionam o seu negócio.',
    'services.social.title':'Gestão de Redes Sociais','services.social.copy':'Planeamento, criação de conteúdo e gestão diária para fortalecer a sua marca e gerar ligação com o público certo.',
    'services.google.title':'Google Business & Presença Local','services.google.copy':'Otimização completa do seu perfil, aumento de visibilidade local e gestão de avaliações para atrair mais clientes.',
    'services.digital.title':'Soluções Digitais & Experiência','services.digital.copy':'Menus digitais, QR Codes, reservas, pedidos e outras soluções que tornam a experiência do cliente mais prática e moderna.',
    'services.web.title':'Websites & Landing Pages','services.web.copy':'Sites rápidos, responsivos e otimizados para converter visitantes em clientes e destacar o seu negócio.',
    'services.brand.title':'Branding & Identidade Visual','services.brand.copy':'Criamos marcas memoráveis com identidade visual forte, coerente e alinhada ao posicionamento do negócio.',
    'services.seo.title':'SEO & Visibilidade Online','services.seo.copy':'Otimização para Google, SEO local e estratégia de conteúdo para aumentar a visibilidade orgânica do seu negócio.','services.ads.title':'Publicidade Digital','services.ads.copy':'Campanhas Google e Meta orientadas para aumentar visibilidade, gerar contactos e apoiar o crescimento do seu negócio.',
    'process.kicker':'COMO TRABALHAMOS','process.title':'Simples. Eficaz. Com resultado.','process.1.title':'Analisamos','process.1.copy':'Conhecemos o seu negócio, o mercado, os objetivos e os desafios.','process.2.title':'Planeamos','process.2.copy':'Criamos uma estratégia personalizada e um plano claro de ação.','process.3.title':'Produzimos','process.3.copy':'Colocamos a estratégia em prática com criatividade, qualidade e foco.','process.4.title':'Evoluímos','process.4.copy':'Acompanhamos, medimos e ajustamos para garantir evolução constante.',
    'promise.kicker':'O QUE PODE ESPERAR DA AVYENA','promise.1.title':'Estratégia adaptada ao seu negócio','promise.1.copy':'Nada de soluções genéricas. Cada plano é desenvolvido à medida dos seus objetivos e da realidade do seu negócio.','promise.2.title':'Comunicação próxima e transparente','promise.2.copy':'Mantemos uma comunicação próxima, explicamos tudo de forma simples e trabalhamos consigo em cada etapa.','promise.3.title':'Soluções práticas, sem complicações','promise.3.copy':'Focamo-nos no que realmente importa e pode criar valor para o seu negócio.','promise.4.title':'Acompanhamento contínuo','promise.4.copy':'Monitorizamos resultados, otimizamos e evoluímos consigo ao longo do processo.',
    'audience.kicker':'PARA QUEM TRABALHAMOS','audience.1.title':'Restauração & Bares','audience.1.copy':'Restaurantes, cafés, pastelarias, bares, gelatarias e muito mais.','audience.2.title':'Comércio & Serviços','audience.2.copy':'Lojas, salões, clínicas, oficinas, imobiliárias e negócios locais.','audience.3.title':'Turismo & Alojamento','audience.3.copy':'Alojamento local, hotéis, villas, experiências e atividades turísticas.','audience.4.title':'Marcas em Crescimento','audience.4.copy':'Negócios que querem profissionalizar a presença digital e escalar.',
    'cta.title':'Não sabe por onde começar?','cta.copy':'Analisamos a sua presença digital e identificamos oportunidades de melhoria — website, Google, redes sociais, imagem ou processos digitais.',
    'form.intro':'Analisamos a sua presença digital e identificamos oportunidades de melhoria no seu website, Google, redes sociais, imagem ou processos digitais.','form.title':'ENVIE-NOS UMA MENSAGEM','form.name':'Nome','form.company':'Empresa','form.phone':'Telefone','form.service':'Serviço de interesse','form.message':'Mensagem','form.submit':'Enviar mensagem','form.privacy':'Ao enviar esta mensagem, os dados indicados serão utilizados apenas para responder ao seu pedido. Consulte a nossa Política de Privacidade e Cookies.',
    'contact.title':'VAMOS CONVERSAR','contact.location':'Portugal','contact.hours':'Seg - Sex: 09h00 - 18h00','footer.rights':'Todos os direitos reservados.','footer.privacy':'Privacidade & Cookies','footer.terms':'Termos de Utilização'
  },
  en: {
    'nav.home':'Home','nav.services':'Services','nav.process':'Process','nav.about':'About','nav.contact':'Contact',
    'cta.talk':'Talk to Us','cta.services':'View Services','values.strategy':'Strategy','values.creativity':'Creativity','values.results':'Results',
    'hero.line1':'We connect ideas.','hero.line2':'We create impact.','hero.copy':'We help businesses across Portugal gain visibility, attract customers and grow digitally through strategy, creativity and a focus on results.',
    'services.kicker':'WHAT WE DO','services.title':'Digital solutions that move your business forward.',
    'services.social.title':'Social Media Management','services.social.copy':'Planning, content creation and day-to-day management to strengthen your brand and connect with the right audience.',
    'services.google.title':'Google Business & Local Presence','services.google.copy':'Complete profile optimisation, stronger local visibility and review management to attract more customers.',
    'services.digital.title':'Digital Solutions & Customer Experience','services.digital.copy':'Digital menus, QR codes, bookings, orders and other solutions that make the customer experience simpler and more modern.',
    'services.web.title':'Websites & Landing Pages','services.web.copy':'Fast, responsive websites designed to convert visitors into customers and make your business stand out.',
    'services.brand.title':'Branding & Visual Identity','services.brand.copy':'Memorable brands with a strong, coherent visual identity aligned with the positioning of the business.',
    'services.seo.title':'SEO & Online Visibility','services.seo.copy':'Google optimisation, local SEO and content strategy designed to increase your business’s organic visibility.','services.ads.title':'Digital Advertising','services.ads.copy':'Google and Meta campaigns focused on increasing visibility, generating enquiries and supporting your business growth.',
    'process.kicker':'HOW WE WORK','process.title':'Simple. Effective. Results-driven.','process.1.title':'Analyse','process.1.copy':'We understand your business, market, goals and challenges.','process.2.title':'Plan','process.2.copy':'We create a tailored strategy and a clear action plan.','process.3.title':'Create','process.3.copy':'We put the strategy into action with creativity, quality and focus.','process.4.title':'Evolve','process.4.copy':'We monitor, measure and refine to keep improving.',
    'promise.kicker':'WHAT YOU CAN EXPECT FROM AVYENA','promise.1.title':'A strategy tailored to your business','promise.1.copy':'No generic solutions. Every plan is shaped around your goals and reality.','promise.2.title':'Close, transparent communication','promise.2.copy':'We stay available, explain things clearly and work alongside you.','promise.3.title':'Practical solutions, no unnecessary complexity','promise.3.copy':'We focus on what matters and creates real value for your business.','promise.4.title':'Continuous support','promise.4.copy':'We monitor results, optimise and evolve with you at every step.',
    'audience.kicker':'WHO WE WORK WITH','audience.1.title':'Restaurants & Bars','audience.1.copy':'Restaurants, cafés, bakeries, bars, ice-cream shops and more.','audience.2.title':'Retail & Services','audience.2.copy':'Shops, salons, clinics, workshops, real estate and local businesses.','audience.3.title':'Tourism & Accommodation','audience.3.copy':'Local accommodation, hotels, villas, experiences and tourism activities.','audience.4.title':'Growing Brands','audience.4.copy':'Businesses ready to professionalise their digital presence and scale.',
    'cta.title':'Not sure where to start?','cta.copy':'We review your digital presence and identify opportunities to improve your website, Google presence, social media, brand image or digital processes.',
    'form.intro':'We analyse your digital presence and identify opportunities to improve your website, Google presence, social media, brand image or digital processes.','form.title':'SEND US A MESSAGE','form.name':'Name','form.company':'Company','form.phone':'Phone','form.service':'Service of interest','form.message':'Message','form.submit':'Send message','form.privacy':'By sending this message, the information provided will only be used to respond to your enquiry. See our Privacy & Cookies Policy.',
    'contact.title':'LET’S TALK','contact.location':'Portugal','contact.hours':'Mon - Fri: 09:00 - 18:00','footer.rights':'All rights reserved.','footer.privacy':'Privacy & Cookies','footer.terms':'Terms of Use'
  }
};
let lang = 'pt';
try {
  const savedLang = localStorage.getItem('avyena_lang');
  if (savedLang === 'pt' || savedLang === 'en') lang = savedLang;
} catch (_) {}
const langBtn = document.getElementById('langToggle');
const applyLang = () => {
  const dict = translations[lang];
  document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
  const langFlag = document.getElementById('langFlag');
  const langCode = document.getElementById('langCode');
  const pageIsPT = lang === 'pt';

  if (langCode) langCode.textContent = pageIsPT ? 'PT' : 'EN';
  if (langFlag) {
    langFlag.src = pageIsPT ? 'flag-pt.png' : 'flag-uk.png';
    langFlag.alt = pageIsPT ? 'Bandeira de Portugal' : 'United Kingdom flag';
  }
  if (langBtn) {
    langBtn.setAttribute('aria-label', pageIsPT ? 'Mudar para Inglês' : 'Switch to Portuguese');
    langBtn.setAttribute('title', pageIsPT ? 'Português' : 'English');
  }
};
langBtn?.addEventListener('click', () => {
  lang = lang === 'pt' ? 'en' : 'pt';
  try { localStorage.setItem('avyena_lang', lang); } catch (_) {}
  applyLang();
});

// Apply the correct language and flag immediately on first load.
applyLang();

const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = lang === 'pt' ? 'A enviar…' : 'Sending…';
  note.textContent = lang === 'pt' ? 'A enviar o seu pedido…' : 'Sending your request…';
  note.style.color = '#aeb8cf';
  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.nome = payload.nome || payload.empresa || 'Contacto Website';
    const r = await fetch('/api/contact', {
      method:'POST',
      credentials:'same-origin',
      referrerPolicy:'same-origin',
      headers:{'Content-Type':'application/json','X-Requested-With':'AVYENA-Contact'},
      body:JSON.stringify(payload)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.message || (lang === 'pt' ? 'Não foi possível enviar o pedido.' : 'Could not send your request.'));
    form.reset();
    note.textContent = lang === 'pt' ? 'Mensagem enviada com sucesso. Entraremos em contacto em breve.' : 'Message sent successfully. We will be in touch shortly.';
    note.style.color = '#00e5ff';
  } catch (err) {
    note.textContent = err.message || (lang === 'pt' ? 'Ocorreu um erro. Tente novamente.' : 'Something went wrong. Please try again.');
    note.style.color = '#ff79c6';
  } finally {
    button.disabled = false;
    button.textContent = translations[lang]['form.submit'] || original;
  }
});

const canvas = document.getElementById('network');
const ctx = canvas.getContext('2d');
let points = [];
function resizeCanvas(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count = innerWidth < 700 ? 30 : 72;
  points = Array.from({length:count}, () => ({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.16,vy:(Math.random()-.5)*.16}));
}
resizeCanvas(); addEventListener('resize', resizeCanvas);
function animate(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  points.forEach(p => { p.x += p.vx; p.y += p.vy; if(p.x<0||p.x>innerWidth)p.vx*=-1; if(p.y<0||p.y>innerHeight)p.vy*=-1; });
  for(let i=0;i<points.length;i++){
    const p=points[i];
    for(let j=i+1;j<points.length;j++){
      const q=points[j], d=Math.hypot(p.x-q.x,p.y-q.y);
      if(d<135){
        const a=(1-d/135)*.12;
        const g=ctx.createLinearGradient(p.x,p.y,q.x,q.y); g.addColorStop(0,`rgba(225,0,255,${a})`); g.addColorStop(1,`rgba(0,229,255,${a})`);
        ctx.strokeStyle=g; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
      }
    }
    ctx.fillStyle=i%3===0?'rgba(0,229,255,.55)':'rgba(151,55,255,.5)'; ctx.beginPath(); ctx.arc(p.x,p.y,1.05,0,Math.PI*2); ctx.fill();
  }
  requestAnimationFrame(animate);
}
animate();
