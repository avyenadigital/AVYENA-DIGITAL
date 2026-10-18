(()=>{'use strict';
const english=document.documentElement.lang.startsWith('en')||new URLSearchParams(location.search).get('lang')==='en';
const tr=(pt,en)=>english?en:pt;
for(const form of document.querySelectorAll('[data-newsletter-form]')){
 const note=form.querySelector('[role=status]'),button=form.querySelector('button[type=submit]');
 form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity()||button.disabled)return;button.disabled=true;note.textContent=tr('A enviar confirmação…','Sending confirmation…');
 try{const response=await fetch('/api/newsletter?action=subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.elements.email.value,consent:form.elements.consent.checked,website:form.elements.website.value,lang:english?'en':'pt',source:form.dataset.source||'homepage'})});const data=await response.json();if(!response.ok)throw Error(data.error);note.textContent=tr('Verifique o seu email e confirme a subscrição. Se não encontrar a mensagem, veja a pasta de spam.','Check your email and confirm your subscription. If the message is missing, check your spam folder.');form.reset();window.AvyenaAnalytics?.track('newsletter_confirmation_requested',{source:form.dataset.source||'homepage'});}catch(e){note.textContent=english?'Unable to subscribe right now. Check your details and try again later.':e.message||'Não foi possível subscrever. Tente novamente.';}finally{button.disabled=false;}});
}
const confirm=document.querySelector('[data-newsletter-confirm]');if(!confirm)return;
if(english){document.documentElement.lang='en';confirm.querySelector('p').textContent='Confirm below that you would like to receive AVYENA news by email. You can unsubscribe at any time.';}
const params=new URLSearchParams(location.hash.slice(1));const token=params.get('token');history.replaceState(null,'',location.pathname+location.search);
const note=confirm.querySelector('[role=status]'),button=confirm.querySelector('button');
if(!token){confirm.hidden=true;return;}
confirm.hidden=false;
button.textContent=tr('Confirmar a minha subscrição','Confirm my subscription');
confirm.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;note.textContent=tr('A confirmar…','Confirming…');try{const response=await fetch('/api/newsletter?action=confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});const data=await response.json();if(!response.ok)throw Error(data.error);note.textContent=tr('Subscrição confirmada. Obrigado por acompanhar a AVYENA!','Subscription confirmed. Thank you for following AVYENA!');button.hidden=true;}catch(e){note.textContent=english?'Unable to confirm. The link may have expired or the subscription was previously cancelled. Please contact geral@avyena.pt.':e.message;button.disabled=false;}});
})();
