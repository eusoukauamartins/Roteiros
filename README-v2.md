# Otimizador v2 — Roteiros

App de produtividade pra criação de conteúdo (TikTok, Reels, Shorts).

---

## ⚡ Como rodar em paralelo ao original

Esta versão roda na porta **3005** (o original fica na 3000).

```
cd Otimizador-v2
npm install
npm run dev
```

Abre automaticamente em `http://localhost:3005`.

> **IMPORTANTE:** os dois apps salvam dados no mesmo localStorage do navegador. Pra não misturar:
> - Use uma **janela anônima** ou **outro navegador** pro app de teste
> - Ou faça export dos dados do original antes de testar

---

## 🔧 O que foi mudado nesta versão

### 🐛 Bugs críticos corrigidos

- **TopBar quebrava páginas inteiras** — violação das regras de hooks do React fazia Benchmark, Produtos, Tarefas, Configurações, Acervo, Músicas, Roteiros e IA ficarem em branco
- **Benchmark crashava ao abrir um item** (`Target` não estava importado)
- **Produtos crashava ao criar projeções com valores** (`Code`, `CreditCard`, `Users` não importados)
- **Duração de fala formatada errado** ("63s" virou "1m 03s")
- **Benchmarks e Produtos sumiam no export/import** (faltava `importBenchmarks`/`importProducts`)
- **`clearAllData` deixava Benchmarks e Produtos pra trás**

### 🎯 Pipeline reformulado

- Coluna "Ideias" removida (uma ideia já é um estágio de criação)
- Pipeline ativo agora tem 4 colunas: **Em criação → Pronto p/ gravar → Gravado → Em edição**
- Vídeos postados saem do pipeline ativo e vão pra nova página **Postados**
- Migração automática: cards antigos com status `ideas` viram `creating`, cards com status `posted` vão pro arquivo

### 📦 Nova página: Postados

- Arquivo dedicado dos vídeos publicados
- Avaliação manual de performance: Viralizou / Médio / Não rendeu
- Estatísticas: total postados, taxa de viralização, etc
- Filtros por nicho e performance
- Botão de "Desarquivar" pra trazer um vídeo de volta ao fluxo

### 🎬 Vídeos (página de edição) — novos campos

- **CTA** (Call-to-Action) explícito
- **Produto vinculado** — selecionar qual oferta o vídeo promove
- **Inspirado em Benchmarks** — marcar quais benchmarks serviram de referência
- **Tags estruturais** — categorizar gancho, narrativa e CTA (`gancho-pergunta`, `narrativa-3-atos`, `cta-comentário`...)
- **Auto-save** com indicador visual ("Salvo às 14:32:05")
- **Marcar como postado** — quando o vídeo está em "Em edição", aparece botão verde pra arquivar

### 🔭 Benchmark

- Nova seção "Adaptado em" — mostra quais vídeos seus se inspiraram naquele benchmark (engenharia reversa)
- Duração formatada (1m 03s em vez de 63s)
- `importBenchmarks` agora existe (corrige bug de backup)

### 📊 Dashboard

- Novo banner **"Continuar de onde parou"** — clica no último vídeo editado e abre direto o editor
- Vídeos recentes clicáveis (abrem direto, não mais redirecionando genericamente)
- Filtra arquivados das estatísticas

### 🔔 Toast / Feedback

- Sistema novo de notificações no canto inferior direito
- Headlines/Scripts/QuickCapture agora dão feedback ao "usar no fluxo"
- Mostra ação rápida pra abrir o card criado

### ⌨️ Atalhos de teclado

- `Ctrl/Cmd + N` — nova ideia (já existia)
- `Ctrl/Cmd + K` — focar barra de busca
- `/` — focar busca da página atual
- `Esc` — fechar modais

### 🔍 Busca global

- Agora inclui **Benchmarks** e **Produtos**
- Busca dentro do CTA dos vídeos
- Posts arquivados são marcados diferente
- Click em vídeo abre direto o editor

### 🤖 Export pra IA — totalmente novo

Modal de exportação ganhou toggle **"Modo IA"** que adiciona ao JSON:

- **`_schema`** — documentação em português de cada campo (status, performance, ticketType, etc)
- **`_summary`** — agregados úteis: total por estágio, distribuição por nicho, performance dos postados, top benchmarks reutilizados
- **`_relations`** — cruzamentos prontos: tasks por card, vídeos por produto, vídeos por benchmark, **gaps de nicho** (onde tem muito benchmark e poucos vídeos seus)
- **`_creatorVoice`** — sua voz/estilo (configurada em Settings)
- **`_derived` em cada item** — dados pré-calculados (word count, duração estimada, lucro/margem de projeções, etc)

Também novo: botão **"Resumo Markdown"** — exporta um resumo legível pra colar direto em qualquer IA.

### 🎙️ Voz do Criador (Settings)

Nova seção com 5 campos sobre seu estilo:
- Quem você é / pra quem fala
- Tom & estilo
- Exemplos de trecho seu
- Palavras que usa
- Palavras que evita

Esse contexto vai no export "Modo IA" e qualquer IA gera conteúdo no seu estilo sem precisar re-explicar toda hora.

### 🗑️ Lixeira (delete suave)

Vídeos deletados vão pra lixeira (já existia no store, agora está totalmente operacional). Restaurar/excluir permanentemente disponíveis.

---

## 🧪 O que testar primeiro

1. Navegar entre todas as páginas (Benchmark, Produtos, Tarefas, etc) → todas devem abrir
2. Criar um benchmark e abrir pra editar → não pode quebrar
3. Criar um produto, abrir aba Projeções, criar projeção com valores → não pode quebrar
4. Pipeline: arrastar cards entre colunas
5. Marcar um card como postado (em "Em edição" aparece o botão verde) → vai pra Postados
6. Configurações > Voz do Criador → preencher
7. Configurações > Exportar Dados > Marcar "Modo IA" → exportar JSON e abrir pra ver o que tem
8. Importar JSON antigo do v1 → migração automática deve funcionar

---

## 📂 Estrutura

- `src/stores/` — Zustand stores (state management)
- `src/pages/` — páginas
- `src/components/` — componentes reutilizáveis (incluindo o novo `Toast`)
- `src/utils/` — utilidades (export/import, search, text)
- `src/themes/` — paletas de cor

---

Boa criação! 🎬
