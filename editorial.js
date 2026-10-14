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
document.querySelectorAll('details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('details').forEach(other=>{if(other!==item)other.open=false;});}));
document.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('service-choice').value=button.dataset.service;document.getElementById('contacto').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});document.querySelector('[name="nome"]').focus({preventScroll:true});}));
document.getElementById('brief-form').addEventListener('submit',event=>{event.preventDefault();if(!event.currentTarget.reportValidity())return;document.querySelector('.form-status').textContent='Tudo certo. Na versão final, o seu pedido seria enviado à AVYENA. Esta demonstração não envia mensagens.';});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-10% 0px -55% 0px'});['trabalhos','servicos','contacto'].forEach(id=>observer.observe(document.getElementById(id)));}
})();
