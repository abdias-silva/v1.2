# Site NEPA — Sistema de Edição via Planilha

Resumo prático de como o site funciona. Para o guia visual completo, abra o arquivo `GUIA-EDICAO.html` no navegador.

## A regra de ouro

> **Você só edita `database.xlsx`. Nunca mais precisa mexer em HTML.**

## Como atualizar o site (5 passos)

1. Baixe o `database.xlsx` do servidor
2. Abra no Excel
3. Edite a aba que precisa
4. Salve (mantendo o nome `database.xlsx`)
5. Suba o arquivo no servidor (mesma pasta dos HTMLs)

Pronto — o site se atualiza automaticamente para todos os visitantes na próxima vez que abrirem a página. **Não precisa de Ctrl+F5**: o sistema verifica se o arquivo mudou e baixa a versão nova sozinho.

## Arquivos do site

### Principal (único que você edita)

| Arquivo | O que faz |
|---|---|
| `database.xlsx` | **Único arquivo que você edita** — controla todo o conteúdo |

### Páginas HTML (7 páginas)

| Arquivo | O que mostra |
|---|---|
| `index.html` | Página inicial — hero, áreas, projetos, eventos, equipe |
| `biblioteca.html` | Lista filtrável das 850+ publicações |
| `publicacao.html` | Detalhes de uma publicação (abre via `?id=N`) |
| `atlas.html` | Atlas de mapas (com zoom, favoritos, deep link) |
| `pesquisas.html` | Linhas de pesquisa, projetos e produção científica |
| `pesquisa-detalhe.html` | Detalhes de um projeto (abre via `?id=N`) |
| `membros.html` | Equipe agrupada por categoria |

### Suporte (não mexer)

| Arquivo | O que faz |
|---|---|
| `nepa-data.js` | Motor que lê a planilha e gera os cards |
| `style.css` | Estilos visuais do site todo |
| `dark-tweaks.css` | Ajustes do tema escuro |
| `GUIA-EDICAO.html` | Manual visual completo |

## Abas do `database.xlsx`

| Aba | O que controla |
|---|---|
| `_INSTRUCOES` | Guia rápido (não mexer) |
| `publicacoes` | Biblioteca digital (850+ registros) |
| `projetos` | Projetos de pesquisa |
| `linhas_pesquisa` | Linhas temáticas com ícones e cores |
| `membros` | Equipe (todas as categorias) |
| `eventos` | Eventos e notícias da home |
| `parceiros` | Logos e cards de instituições |
| `documentarios` | Documentários da home |
| `slides_home` | Banner principal (com 2 botões opcionais) |
| `atlas` | Mapas do Atlas |
| `config` | Textos gerais (email, endereço, estatísticas) |

## Colunas especiais ("destaque")

O sistema usa "destaques" para escolher o que aparece em cada lugar:

| Coluna | Onde aparece | Lógica |
|---|---|---|
| `publicacoes.destaque` | Home (Publicações em Destaque) | Marque `1` para destacar |
| `publicacoes.destaque_pesquisa` | Pesquisas (Produção Científica) | Coluna separada — independente da home |
| `projetos.destaque_home` | Home (cards 01, 02, 03, 04) | Marque `1` nos 4 que devem aparecer |
| `parceiros.destaque` | Pesquisas (4 financiadores principais) | Marque `1` em 4 parceiros |
| `eventos.destaque` | Card principal grande na home | Marque `1` no evento principal |
| `atlas.destaque` | Estrela no canto do card | Marque `1` para destacar visualmente |

**Fallback automático:** se uma coluna estiver vazia, o site cai automaticamente para outra opção razoável (ex: se não tem `destaque_home`, usa `destaque`; se não tem nenhum, mostra os primeiros).

## Dica importante: backup

Antes de subir uma versão nova da planilha, **renomeie a versão antiga** no servidor (ex: `database-2025-05-13.xlsx`). Assim, se algo der errado, é só restaurar.

## Recursos especiais

- **Modo escuro**: botão sol/lua no header de cada página
- **Atlas interativo**: zoom/pan nos mapas, favoritos, navegação por teclado, links compartilháveis
- **Cache inteligente**: quando você atualiza a planilha, todos os visitantes veem a mudança automaticamente

## Em caso de dúvida

Abra o **GUIA-EDICAO.html** no navegador — manual visual com explicação de cada aba, exemplos de preenchimento e solução de problemas comuns.
