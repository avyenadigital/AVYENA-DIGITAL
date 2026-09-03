AVYENA Digital — v1.0 Produção

Conteúdo final:
- Logótipo AVYENA oficial incluído em assets/
- Serviços finais: Redes Sociais; Google Business; Soluções Digitais & Experiência; Websites & Landing Pages; Branding; Estratégia & Crescimento
- Sem testemunhos, métricas ou resultados fictícios
- Secção “O que podes esperar da AVYENA” com compromissos reais
- Telefone: +351 962 434 680 (apenas chamada; sem WhatsApp)
- Email: geral@avyena.pt
- Formulário sem mailto: envia em segundo plano para /api/contact

PARA O FORMULÁRIO FUNCIONAR EM PRODUÇÃO:
1. O projeto deve ser publicado no Vercel com a pasta api/contact.js incluída.
2. Criar/configurar uma conta Resend e uma API key.
3. No Vercel, adicionar a variável de ambiente RESEND_API_KEY.
4. Para envio com domínio AVYENA, verificar o domínio no Resend e definir CONTACT_FROM, por exemplo:
   AVYENA Website <site@avyena.pt>
   (usar um endereço/remetente validado no Resend).
5. Fazer um envio real de teste para confirmar receção em geral@avyena.pt.

Nota: sem RESEND_API_KEY, o site abre normalmente, mas o endpoint devolve aviso de que o serviço de email ainda não está configurado.
