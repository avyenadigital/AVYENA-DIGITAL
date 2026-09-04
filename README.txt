AVYENA DIGITAL — VERSÃO FINAL 2026

Ficheiros prontos para publicação no GitHub/Vercel, todos na raiz do repositório.

Inclui:
- Visual dark/neon aprovado
- 7 serviços: Redes Sociais, Google Business, Soluções Digitais, Websites, Branding, SEO e Publicidade Digital
- Secções Processo, Compromisso, Públicos e contacto
- Cartões de públicos com imagens centradas e overlay uniforme
- Tradução editorial completa PT-PT / English (UK)
- Bandeiras locais PT/UK no seletor de idioma
- Apenas Instagram no rodapé, ligado a @avyena.digital
- Contactos: geral@avyena.pt | +351 962 434 680 | Portugal
- Formulário sem mailto; endpoint /api/contact via contact.js

VERCEL / FORMULÁRIO
Para o formulário enviar mensagens é necessário configurar RESEND_API_KEY nas Environment Variables do Vercel e voltar a fazer deploy. CONTACT_FROM é opcional após validação do domínio no Resend.

V2: removido o banner “Não sabe por onde começar?”. O texto de diagnóstico foi integrado no topo do formulário, seguido de “ENVIE-NOS UMA MENSAGEM” em maior destaque.

V4 — CORREÇÃO DEFINITIVA DO SELETOR DE IDIOMA
- Português: bandeira de Portugal + PT
- Inglês: bandeira do Reino Unido + EN
- Bandeira e sigla mudam sempre em conjunto
- Idioma escolhido mantém-se após recarregar a página
- Bandeiras continuam incorporadas no próprio index.html, sem links externos

V5 — CORREÇÃO DEFINITIVA DO SELETOR DE IDIOMA
- Página em Português: botão mostra 🇬🇧 EN
- Clique: todo o site muda para Inglês e o botão passa a 🇵🇹 PT
- Novo clique: regressa a Português e o botão volta a 🇬🇧 EN
- Estado aplicado logo no carregamento inicial
- Bandeiras incorporadas no HTML, sem dependência de ficheiros externos

AVYENA V9 — SEGURANÇA E ICONOGRAFIA
- Substituídos os emojis dos dois primeiros cartões por SVG outline neon, coerentes com os restantes ícones.
- CSP restritiva, proteção anti-iframe, nosniff, HSTS, Permissions-Policy, COOP/CORP e política de referrer.
- Removidos estilos inline usados nas imagens de audiência para permitir style-src 'self'.
- Formulário endurecido com limites de tamanho, validação server-side, honeypot, allowlist de serviços, verificação de Origin/Sec-Fetch-Site e cabeçalho same-origin.
- Resposta do Resend deixa de expor detalhes internos ao browser e passa a ter timeout.
- RESEND_API_KEY e CONTACT_FROM devem continuar apenas nas Environment Variables da Vercel, nunca no GitHub/frontend.
- Opcional recomendado: configurar Rate Limiting / WAF na Vercel para /api/contact. Rate limiting apenas em memória numa serverless function não é proteção fiável.
- Se usar um domínio extra/preview para testar o formulário, adicionar esse origin à variável CONTACT_ALLOWED_ORIGINS, separado por vírgulas.
