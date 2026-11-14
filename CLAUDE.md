# CLAUDE.md — Direcionador

App web (hospedagem Vercel + Postgres no Render). Plano **PRO** ainda não é vendável: só é ligado manualmente por conta (rota `/admin`, restrita ao e-mail do Lucas, ou direto no banco). A conta do próprio Lucas (`vinny_rbr`) foi posta em PRO **só para teste** em 25/08/2026 — reverter antes de lançar pagamento real. Diferencial do PRO hoje: tema "Personalizado" (foto/cor via Vercel Blob).

## Como trabalhar com o Lucas (vale para todos os sistemas dele)
- Responder sempre em **português do Brasil**, simples e direto. Ele não é programador experiente: explique o que muda para o usuário, não o código.
- Textos que o **cliente/usuário final** vê: tom **formal**.
- "Me ensina" / "como eu faço" = ele quer fazer a edição; explique passo a passo e confira.
- Em passo a passo de telas externas, dê instruções em texto e espere o print dele (não use perguntas de múltipla escolha só para conferir progresso).
- Antes de **publicar** (AAB, iOS, deploy de produção), confirme com ele, a menos que já tenha pedido.
- **AAB**: sempre para **teste interno + teste fechado** (internal, alpha); produção só se ele pedir.
- **Nunca** mostrar conteúdo de chaves/senhas/tokens. Banco de produção: só leitura para diagnóstico; apagar/alterar só o item que ele pedir.
- Vídeos de ajuda: bem detalhados (explicar a conta com os números da tela), dados fictícios, só a tela do app, voz `pt-BR-FranciscaNeural` (edge-tts, -3%). Método: `kit-videos-tutoriais/COMO-FAZER.md` (no notebook).

## Infra comum
- VPS própria com **Coolify** (Meu Giro, Conciliaí e GD migrados para lá; push no `main` do backend/site costuma fazer deploy automático).
- **Codemagic** (iOS e Android): disparo por API com `x-auth-token: $CODEMAGIC_TOKEN` em `POST https://api.codemagic.io/builds` `{"appId":"...","workflowId":"...","branch":"main"}`; plano gratuito só tem máquina **Mac**. Se a versão iOS já foi aprovada, subir a versão antes ("train closed").
- **Play Console**: conta de serviço `play-publicador@meugiro-play...` publica Meu Giro, GD e Conciliaí (no notebook: `~/.play-service.json` + `~/tools/play_upload.py <pacote> <aab> "<nome>" "<notas>" internal,alpha`).
- **App Store Connect**: chave "GD ASC Key" (no notebook `~/.appstore/`), scripts `~/tools/asc_status.py` e `~/tools/asc_enviar_revisao.py <appId> <versão> <build> "<novidades>"`.
- Na **nuvem** (claude.ai/code, ambiente "apps") não há SSH da VPS, emulador nem gravação de vídeo — isso só no notebook.

## Pendências do notebook
O que só dá para fazer no notebook (emulador, vídeo, SSH/banco/logs da VPS, arquivos locais) vai para **`PENDENCIAS-NOTE.md` no repositório `vinny-rbr/meugiro-agentes`**, na **seção deste app**. Na nuvem: anotar lá (commit + push) e avisar o Lucas. No notebook, quando ele disser **"verifica as pendências de note"**: `git pull` nos clones de `C:\Projetos` (sem trocar de ramo nem descartar trabalho), fazer cada item e marcar `[x]` com a data.
