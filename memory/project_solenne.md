---
name: Projeto Solenne — Estado e Contexto
description: Stack, fase atual, banco de dados, admin refatorado, próximos passos
type: project
---

# Projeto Solenne

Stack: Next.js App Router + TypeScript + Tailwind + Supabase + Vercel

Fluxo de compra: WhatsApp-first (sem checkout tradicional).

## Admin — refatorado (2026-04-19)

### Páginas existentes
- `/admin/dashboard` — centro de decisão com KPIs reais (receita, lucro, margem, ticket médio, vendas do mês, clientes), alertas de estoque crítico/sem estoque, últimas vendas com margem inline
- `/admin/produtos` — tabela de produtos com filtro por categoria + busca; ações rápidas de flag/preço/disponibilidade
- `/admin/estoque` — página real de estoque ordenada por menor estoque, KPIs de cobertura, alertas de ruptura
- `/admin/clientes` — selos de fidelidade, cadastro de clientes
- `/admin/analytics` — KPIs financeiros, registrar venda, vendas recentes
- `/admin/pedidos` — lista de pedidos
- `/admin/banner` — gerenciar banner da homepage
- `/admin/configuracoes` — troca de senha do admin (movida da dashboard)

### Componentes-chave
- `components/admin/AdminMenu.tsx` — navbar com: Dashboard | Produtos | Estoque | Clientes | Analytics | Pedidos | Banner | Configurações
- `components/admin/ProductWizard.tsx` — wizard de 8 etapas para cadastro/edição de produto (tipo → nome → fotos → cores → tamanhos/estoque → preço/custo → vitrine → resumo). Substitui o modal monolítico anterior.
- `components/admin/EstoqueClient.tsx` — tabela de produtos com filtro de categoria, usa ProductWizard
- `components/admin/ClientesClient.tsx` — tabela de clientes com selos de fidelidade

### Services
- `services/admin-analytics.service.ts` — `getAdminFinancialSummary()`: receita, lucro, margem, ticket médio, vendas recentes
- `services/admin-product.service.ts` — CRUD de produtos
- `services/admin-client.service.ts` — CRUD de clientes, stats de selos
- `services/admin-banner.service.ts` — configuração do banner

## Banco de dados (Supabase)
- `produtos` — id, nome, preco, custo, stock, category, color, etc.
- `variantes` — cor, stock, tamanhos, imagens por variante
- `clientes` — id, nome, email, telefone
- `fidelidade` — selos_fidelidade, selos_indicacao por cliente
- `vendas` — forma_pagamento, tipo_cartao, parcelas, status
- `itens_venda` — venda_id, produto_id, quantidade, preco, custo
- `pedidos` — pedidos de resgate de brindes

## Próximas fases pendentes
- **Tráfego e conversão** — UI pronta para receber métricas (GA4, Vercel Analytics, Clarity, Meta Pixel). Integração manual necessária para GA4 e Meta Pixel.
- **RFM de clientes** — segmentação VIP / recorrente / inativa / alto potencial
- **Gráficos de evolução** — evolução diária 7/30/90 dias (requer biblioteca de gráficos, ex: recharts)
- **GMROI e sell-through** — precisam de dados históricos de entrada de estoque
- **Integrações de terceiros** — GA4 (script), Vercel Analytics (já disponível no projeto Vercel), Clarity (script), Meta Pixel (script)

**Why:** Admin estava básico demais para gestão real — sem KPIs de vendas na home, modal de produto monolítico, sem página de estoque real.
**How to apply:** Ao sugerir melhorias no admin, priorizar fluxo WhatsApp-first e analytics de rentabilidade por produto.
