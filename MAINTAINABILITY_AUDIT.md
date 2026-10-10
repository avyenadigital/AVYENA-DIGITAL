# Auditoria de manutenibilidade — 2026-10-10

Estado: auditoria preliminar, **não certificada**. Branch de auditoria, sem alterações à aplicação.

## Evidência verificada
- `vercel.json`: deploy Vercel com ficheiros estáticos e função Node `contact.js`.
- `index.html`: HTML com canonical, hreflang PT/EN, Open Graph e JSON-LD.
- Ficheiros referidos em `vercel.json` incluem `styles.css`, `app.js`, `analytics.js`, `privacy.js`, `terms.js` e páginas de serviços PT/EN.
- Não foram encontrados `package.json`, `composer.json` nem `README.md` na raiz; isso não demonstra defeito por si só.

## Riscos / verificações prioritárias
1. **P1** Auditar `contact.js`: validação, rate limiting, CORS, segredos, spam e tratamento de erros; não colocar segredos em documentos.
2. **P1** Confirmar regras de deploy/redirects, fallback 404, domínio canonical, sitemap, robots e headers de segurança.
3. **P1** Testar formulários, consentimento de cookies, analytics e páginas PT/EN.
4. **P1** Inspecionar `app.js`, `styles.css` e CSS das páginas SEO quanto a duplicação, overrides e regressões em diferentes ecrãs.
5. **P2** Definir testes de smoke/regressão, lint e verificações de acessibilidade/performance.
6. **P2** Criar documentação de arquitetura, deploy, rollback, edição de conteúdo e integrações.

## Critérios de entrega a outro programador
- README com mapa de ficheiros, como testar localmente e publicar no Vercel.
- Inventário de páginas PT/EN e pontos onde conteúdo/estilos são alterados.
- Lista de variáveis de ambiente (nomes apenas), domínios e integrações.
- Testes reproduzíveis e screenshots de referência para mobile, tablet e desktop.
- Alterações por PR numa branch dedicada; nunca alterar diretamente `main`.

## Classificação
**Não atribuída**: falta leitura integral dos módulos e testes de execução. Não confundir documentação criada com correção do código.


## Inspeção adicional de código (2026-10-10)
- `contact.js`: 249 linhas; contém validação de serviços, escape de HTML, allowlist de origem e limitação de pedidos por IP em `globalThis.__avyenaContactRateStore`. **Risco concreto:** a memória local de instância serverless não é um rate limiter global distribuído; não garante limite entre instâncias/restarts. Recomenda-se serviço partilhado (Redis/KV ou WAF/edge) e teste de abuso; não alterar sem testes e configuração.
- `requestIp()` usa o primeiro valor de `x-forwarded-for`. Verificar o modelo de confiança de proxies da plataforma antes de depender deste header para segurança.
- `app.js`: 257 linhas, 26.269 caracteres; concentra tradução e comportamentos da página. Avaliar modularização, não refatorizar sem testes visuais.
- `styles.css`: 832 linhas, 46.875 caracteres; verificar regras repetidas/overrides e especificidade CSS, especialmente responsive.
- **Não executado:** testes de segurança, carga, CI, validação em dispositivos. Nenhuma vulnerabilidade explorada ou confirmada.

## Primeira suite de regressão adicionada
- `tests/contact.test.mjs`: oito testes isolados para método HTTP, origem, validação, tamanho do pedido, honeypot e escaping HTML no envio Resend simulado.
- Executar localmente com Node.js 20+: `node --test tests/contact.test.mjs`.
- **Execução ainda não confirmada**. Os testes não são prova de segurança completa nem de integração real com Resend.
- A implementação funcional de `contact.js` permanece inalterada. O rate limiting distribuído continua por resolver.
