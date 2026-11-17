# Página de venta — Adiós Chupón

Estado: **pronta para revisão. Não publicada.** O botão de compra está em "modo revisão" (não leva a nenhum pagamento).

## Estrutura
```
pagina-venta/
├── index.html            # página (espanhol mexicano)
├── css/styles.css        # estilos mobile-first, identidade do PDF (Fredoka + Nunito, paleta pastel)
├── js/config.js          # ← ÚNICO arquivo a editar para conectar checkout, garantia e links legais
├── js/main.js            # botões de compra, barra fixa no celular, visor de páginas, avisos
├── img/                  # 8 prévias geradas do próprio PDF final (JPG, 640 px)
└── servidor-local.js     # servidor só para revisar localmente (não vai para produção)
```

## Como visualizar localmente
Opção 1 (recomendada): no terminal, na pasta do projeto:
```bash
node pagina-venta/servidor-local.js
```
Abrir http://localhost:8770 no navegador (para ver como celular: DevTools → modo dispositivo).

Opção 2: abrir `pagina-venta/index.html` direto com duplo clique (funciona; as fontes vêm do Google Fonts, então precisa de internet).

No app Claude, a configuração "pagina-venta" do `.claude/launch.json` inicia o mesmo servidor.

## Verificado (13/11/2026)
- Celular (375 px) e desktop (1024 px): sem rolagem horizontal; fontes carregadas; sem erros no console; imagens carregadas.
- Botões "Quiero la guía": em modo revisão mostram o aviso "el enlace de pago todavía no está configurado".
- Barra fixa de compra no celular: aparece depois do topo e some na seção de preço.
- Visor de páginas abre e fecha (botão, clique fora e tecla Esc).
- Perguntas frequentes abrem e fecham.

## Atualização 17/11/2026
- **Checkout conectado:** `js/config.js` → `https://pay.hotmart.com/W108503870B`. Os botões levam os parâmetros da visita (UTMs etc.) até o checkout sem sobrescrever os que já existirem.
- **Utmify (Script de UTMs) instalado** no `<head>` do `index.html` (carrega `cdn.utmify.com.br/scripts/utms/latest.js`, sem sub-ids). Script de Back Redirect **não** instalado.
- **Celular:** testado de 320 px a 1280 px (incluindo paisagem): sem rolagem lateral, botões em uma linha, barra fixa sem cortes (até 400 px mostra só preço + botão).
- **Pixel da Meta instalado** (ID 1160488830002998) no `<head>`: dispara `PageView` ao abrir a página e `InitiateCheckout` (149 MXN) ao clicar em comprar. O `Purchase` precisa ser configurado na Hotmart (integração do Pixel no produto).
- **Pixel da Utmify instalado** no `<head>` (carrega `cdn.utmify.com.br/scripts/pixel/pixel.js`, pixelId Utmify `6afc4756629910d382bcd081`). Em `localhost` ele tenta enviar para `localhost:3001` (modo de desenvolvimento) e falha: só dá para testar com a página publicada. **Depois de publicar:** abrir o Gerenciador de Eventos da Meta → Testar eventos, visitar a página e ver se o PageView chega uma vez (ou "desduplicado"). Se chegar duplicado (navegador + servidor), remover o bloco "Meta Pixel Code" do `index.html` e reativar o Initiate Checkout na Utmify com o texto "Quiero la guía".
- **Preço:** a Hotmart mostra **MX$128.45 + IVA (16%) = $149 MXN**. A página informa "$149 MXN · IVA incluido" (fatos do topo, caixa de preço e barra fixa).

## O que falta para conectar o checkout
1. **Criar o produto na plataforma de pagamento** (ex.: Hotmart, ou outra que aceite compradores do México) a **$149 MXN**, com entrega automática do PDF `produto/Adios-Chupon-Guia.pdf`.
2. **Colar o link de pagamento** em `js/config.js` → `checkoutUrl` (precisa começar com `https://`). Todos os botões passam a usá-lo automaticamente.
3. **Garantia:** a página promete **7 dias de satisfação**. Configure a mesma garantia na plataforma. Se a plataforma não oferecer reembolso, mude `showGuarantee` para `false` (a seção e a pergunta frequente somem).
4. **Métodos de pagamento:** a página NÃO cita OXXO/cartão de propósito ("se muestran en la página de pago"). Se quiser citá-los, confirme antes na plataforma.
5. **Entrega:** a FAQ diz "recibes el acceso en el correo… una vez que se confirme tu pago". Confirmar que a plataforma faz isso.
6. **Links legais obrigatórios** antes de publicar: `privacyUrl` (aviso de privacidad, LFPDPPP — confirmar com assessoria), `termsUrl`, `contactUrl`. Hoje mostram um aviso "Pendiente".
7. **Pixel da Meta:** colar o código base no `<head>` do `index.html` (há um comentário marcando o lugar). O `main.js` já dispara `InitiateCheckout` (149 MXN) ao clicar em comprar, **só se** o Pixel existir. O evento `Purchase` deve vir da plataforma de pagamento (integração nativa ou Conversions API).
8. **Remover `<meta name="robots" content="noindex, nofollow">`** quando for publicar, se quiser que a página seja indexada.
9. **Hospedagem + domínio:** a página é estática (HTML/CSS/JS); qualquer hospedagem estática serve. Não publicar `servidor-local.js`.

## Regras de conteúdo respeitadas
Sem depoimentos, avaliações ou números de clientes; sem prazos ("Sin fechas ni números de días"); sem alegações médicas ("no sustituye la consulta con tu pediatra u odontopediatra"); apenas materiais que existem no PDF (22 páginas: 16 de guia + 6 imprimíveis); "No es un curso en video ni incluye asesoría personalizada".
