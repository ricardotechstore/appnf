# 📱 NF Reembolso - Gerenciador de Notas Fiscais

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PWA](https://img.shields.io/badge/PWA-Ready-orange)

**NF Reembolso** é um aplicativo web progressivo (PWA) completo para gerenciamento de notas fiscais para reembolso empresarial. Desenvolvido com design iOS-style, funciona 100% offline e oferece recursos avançados de captura e organização de notas fiscais.

## 📖 Documentação

- 🚀 **[COMO-INSTALAR.md](COMO-INSTALAR.md)** - Passo a passo super simples para instalar no iPhone
- 📱 **[guia-instalacao.html](guia-instalacao.html)** - Guia visual completo e interativo
- ⚡ **[INSTALACAO.md](INSTALACAO.md)** - Resumo rápido de instalação
- 📚 **[README.md](README.md)** - Documentação técnica completa (este arquivo)

## ✨ Funcionalidades Implementadas

### 🎯 Principais Recursos

- ✅ **Scanner de QR Code Aprimorado** - Leitura automática de QR Codes com múltiplos parsers para diferentes formatos de NF-e
- ✅ **Captura de Fotos** - Tire fotos das notas fiscais diretamente do app
- ✅ **Inserção Manual** - Adicione notas manualmente com todos os detalhes
- ✅ **Armazenamento Local** - Dados salvos no localStorage (funciona offline)
- ✅ **Organização por Data** - Notas organizadas cronologicamente
- ✅ **Categorização** - 5 categorias: Alimentação, Transporte, Hospedagem, Material, Outros
- ✅ **Busca em Tempo Real** - Pesquise por valor, descrição, categoria ou data
- ✅ **Filtros Avançados** - Ordene por data ou valor (crescente/decrescente)
- ✅ **Visualização Detalhada** - Modal com todos os detalhes da nota
- ✅ **Exclusão de Notas** - Remova notas indesejadas facilmente
- ✅ **Estatísticas** - Dashboard com resumo completo
- ✅ **Geração de PDF com Fotos** - 🆕 Gere relatórios em PDF com as fotos das notas fiscais anexadas
- ✅ **Exportação de Dados** - Export em formato JSON para backup
- ✅ **Design iOS-Style** - Interface moderna e familiar para usuários iPhone
- ✅ **Responsivo** - Funciona perfeitamente em todos os dispositivos
- ✅ **PWA Completo** - Instalável como app nativo
- ✅ **Modo Offline** - Funciona sem conexão com internet

## 🚀 Como Usar

### 📱 Instalação no iPhone - [GUIA COMPLETO](guia-instalacao.html)

**Acesse o guia visual passo a passo:** [guia-instalacao.html](guia-instalacao.html)

#### Resumo Rápido:

1. **Publique o app** usando a aba "Publish" desta ferramenta
2. **Copie o link** gerado após a publicação
3. **Abra no Safari** do seu iPhone (não funciona em outros navegadores)
4. **Toque no ícone de compartilhar** (⬆️) na barra inferior
5. **Selecione "Adicionar à Tela de Início"**
6. **Toque em "Adicionar"**
7. **Pronto!** O app aparecerá na tela inicial como um app nativo

> 💡 **Dica:** Consulte o [guia-instalacao.html](guia-instalacao.html) para um tutorial detalhado com ilustrações e solução de problemas

### Adicionando Notas Fiscais

#### Método 1: Scanner de QR Code
1. Abra a aba "Adicionar"
2. Toque em "Iniciar Scanner"
3. Permita o acesso à câmera
4. Posicione o QR Code da nota fiscal na câmera
5. O valor será detectado automaticamente
6. Complete as informações e salve

#### Método 2: Inserção Manual
1. Abra a aba "Adicionar"
2. Role até "Inserir Manualmente"
3. Preencha os campos:
   - **Valor** (obrigatório)
   - **Data** (obrigatório)
   - **Descrição** (opcional)
   - **Categoria** (obrigatório)
   - **Foto** (opcional)
4. Toque em "Salvar Nota Fiscal"

### Gerenciando Notas

#### Visualizar Notas
- Abra a aba "Notas"
- Todas as notas aparecem em cards organizados
- Toque em qualquer nota para ver detalhes completos

#### Buscar Notas
- Use a barra de busca no topo da aba "Notas"
- Digite valor, descrição, categoria ou data
- Resultados aparecem em tempo real

#### Ordenar Notas
- Use o filtro abaixo da busca
- Opções disponíveis:
  - Mais recentes
  - Mais antigas
  - Maior valor
  - Menor valor

#### Excluir Nota
1. Toque na nota desejada
2. No modal, toque em "Excluir"
3. Confirme a exclusão

### Gerando Relatórios em PDF

1. Abra a aba "Relatório"
2. Visualize as estatísticas gerais:
   - Total de notas
   - Valor total
   - Total do mês atual
   - Média por nota

3. Configure os filtros (opcional):
   - Data inicial
   - Data final
   - Categoria específica

4. Toque em **"Gerar Relatório em PDF (com fotos)"**
5. O sistema irá:
   - Criar um PDF profissional
   - Incluir todas as notas filtradas
   - **Anexar as fotos das notas fiscais**
   - Adicionar totais e resumos
   - Numerar as páginas
6. O PDF será baixado automaticamente

### Exportando Backup

1. Toque em **"Exportar Dados (JSON Backup)"**
2. Um arquivo JSON será baixado com todas as notas
3. Use para backup ou importação futura

## 📋 URIs e Rotas Funcionais

### Página Principal
- **URI:** `/` ou `/index.html`
- **Descrição:** Página principal do aplicativo
- **Parâmetros:** Nenhum

### Abas do Aplicativo
O aplicativo usa navegação por abas, todas na mesma página:

1. **Aba Notas**
   - Visualização e busca de notas fiscais
   - Filtros de ordenação

2. **Aba Adicionar**
   - Scanner de QR Code
   - Formulário de inserção manual

3. **Aba Relatório**
   - Estatísticas gerais
   - Geração de relatórios
   - Exportação de dados

## 🎨 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Design iOS-style com variáveis CSS
- **JavaScript (ES6+)** - Lógica da aplicação

### Bibliotecas
- **html5-qrcode** (v2.3.8) - Scanner de QR Code
- **Font Awesome** (v6.4.0) - Ícones

### APIs do Navegador
- **Camera API** - Acesso à câmera para QR Code e fotos
- **localStorage** - Armazenamento de dados
- **Service Worker** - Funcionalidade offline (PWA)
- **Web App Manifest** - Instalação como app

## 💾 Estrutura de Dados

### Modelo de Nota Fiscal

```javascript
{
  id: "1234567890123",           // Timestamp único
  value: 125.50,                 // Valor em número decimal
  date: "2024-03-12",            // Data no formato YYYY-MM-DD
  description: "Almoço cliente", // Descrição textual
  category: "alimentacao",        // Categoria (enum)
  photo: "data:image/jpeg...",   // Base64 da foto (opcional)
  createdAt: "2024-03-12T..."    // ISO timestamp de criação
}
```

### Categorias Disponíveis
- `alimentacao` - Alimentação
- `transporte` - Transporte
- `hospedagem` - Hospedagem
- `material` - Material de Escritório
- `outros` - Outros

### Armazenamento Local
- **Chave:** `nfReembolsoNotes`
- **Formato:** Array JSON de objetos de nota
- **Persistência:** Dados mantidos mesmo após fechar o navegador

## 🎯 Recursos Não Implementados

Esta versão não inclui:

- ❌ Sincronização com servidor/nuvem
- ❌ Login e autenticação de usuários
- ❌ Integração com sistemas contábeis
- ❌ OCR automático de valores da foto
- ❌ Backup automático em nuvem
- ❌ Notificações push
- ❌ Múltiplos usuários/contas
- ❌ Aprovação de reembolsos

## 🔄 Próximos Passos Recomendados

### Curto Prazo
1. **Melhorar Parser de QR Code** - Suporte a mais formatos de NF-e
2. **Adicionar Gráficos** - Visualização de gastos por categoria (Chart.js)
3. **Modo Escuro** - Tema escuro para o aplicativo
4. **Mais Filtros** - Filtros por faixa de valor

### Médio Prazo
1. **OCR de Notas** - Extração automática de valores das fotos
2. **Backup em Nuvem** - Sincronização opcional com Google Drive/iCloud
3. **Notificações** - Lembretes para enviar relatórios
4. **Templates de Relatório** - Múltiplos formatos de relatório

### Longo Prazo
1. **Backend com API** - Sistema completo com servidor
2. **Multi-usuário** - Suporte a equipes e aprovações
3. **Integração Contábil** - API para sistemas contábeis
4. **App Nativo** - Versão Swift para iOS

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Safari (iOS 12+)
- ✅ Chrome (Android/Desktop)
- ✅ Firefox (Android/Desktop)
- ✅ Edge (Desktop)

### Dispositivos Testados
- ✅ iPhone (iOS 12+)
- ✅ iPad (iPadOS)
- ✅ Android smartphones
- ✅ Desktop (todos os tamanhos)

### Recursos Necessários
- Câmera (para QR Code e fotos)
- Suporte a localStorage
- JavaScript habilitado

## 🔒 Privacidade e Segurança

- 📍 **Dados Locais** - Todos os dados ficam no dispositivo
- 🔐 **Sem Servidor** - Nenhum dado é enviado para servidores
- 🚫 **Sem Tracking** - Sem analytics ou rastreamento
- 💾 **Você Controla** - Export e delete quando quiser
- 📸 **Fotos Privadas** - Armazenadas apenas localmente

## 🐛 Problemas Conhecidos

1. **QR Code Parser** - Alguns formatos de NF-e podem não ser reconhecidos automaticamente
2. **Limite de Storage** - localStorage tem limite de ~5-10MB por domínio
3. **Fotos Grandes** - Fotos muito grandes podem atingir limite do localStorage

## 💡 Dicas de Uso

1. **Tire Fotos Menores** - Use qualidade média para economizar espaço
2. **Exporte Regularmente** - Faça backup dos dados periodicamente
3. **Organize por Período** - Crie relatórios mensais para melhor controle
4. **Use Descrições** - Adicione detalhes para facilitar busca futura
5. **Categorize Corretamente** - Facilita análise de gastos por tipo

## 📄 Licença

Este projeto é fornecido como está, sem garantias. Sinta-se livre para usar, modificar e distribuir.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o gerenciamento de reembolsos empresariais.

---

**Versão:** 1.0.0  
**Última atualização:** Março 2024  
**Status:** ✅ Produção
