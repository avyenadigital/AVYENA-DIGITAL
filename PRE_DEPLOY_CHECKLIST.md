# AVYENA Digital — pré-deploy (2026-10-10)

## Automatizado
- [x] 8 testes de regressão do endpoint de contacto no commit a5e9cb6f2ebcc92e3fa041c9988536e460f82fb3.
- [x] Security CI no mesmo commit.
- [x] Preview Vercel READY para a branch de auditoria.
- [ ] Confirmar CI verde no commit final antes do merge.

## Funcional e segurança
- [ ] Envio real de formulário com email de teste e entrega confirmada, sem spam.
- [ ] Erros de validação, honeypot, origem inválida, POST inválido e resposta ao utilizador.
- [ ] Avaliar rate limit em múltiplas instâncias serverless: contador em memória não garante limite global.
- [ ] Rever confiança em x-forwarded-for e eventual spoofing, sem alterar segurança sem testes.
- [ ] Confirmar variáveis de ambiente de produção, sem divulgar segredos.
- [ ] Confirmar Analytics/GA4 e links para Sun House e redes sociais.

## Visual — browser/dispositivos
- [ ] Desktop 19”/27” 2K, tablet, Samsung S22 Ultra portrait/landscape.
- [ ] PT/EN, cabeçalho, formulário, modais, portfólio Sun House, imagens PC/telemóvel.
- [ ] Verificar navegação, contraste, acessibilidade, consola JS e layout sem regressões.
- [ ] Comparar screenshots com versão pública antes do merge.

## Gates finais
- [ ] Rever diff PR #26 e CI verde no commit final.
- [ ] Confirmar plano de rollback na Vercel e domínio principal.
- [ ] Não integrar na main até completar revisão funcional e visual.
- [ ] **NÃO FAZER DEPLOY NESTA FASE.**

## Revisão adicional
- [x] Revisão estrutural do diff em relação à `main` (2026-10-10): 9 commits à frente, 0 atrás; 4 ficheiros adicionados (testes, CI e documentação), sem alterações a código público ou endpoint de produção.
- [ ] Revisão funcional e visual por browser real ainda por executar. A tentativa de acesso automatizado ao domínio neste ambiente falhou por indisponibilidade de DNS; **não interpretar como falha do site**.
