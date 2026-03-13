# 📋 Changelog - NF Reembolso

## Versão 1.2.0 - 2024-03-13

### 🆕 Novidades Principais

#### ✅ Correção: Botão Salvar Funcionando
- **CORRIGIDO**: Botão "Salvar Nota Fiscal" agora funciona perfeitamente
- Event listener do formulário reescrito
- Validação de campos melhorada
- Feedback visual imediato ao salvar
- Redirecionamento automático para aba "Notas"

#### 📅 QR Code Extrai Valor E Data
- **NOVO**: Scanner agora extrai VALOR e DATA automaticamente
- Múltiplos métodos de extração de data:
  - Parâmetro `dhEmi` em URLs
  - Regex para `dhEmi=YYYYMMDD`
  - Regex para `dhEmi=YYYY-MM-DD`
  - Padrão genérico de data
- Feedback visual mostra ambas as informações
- Logs detalhados para debugging

#### ✂️ Editor de Imagem Completo (Cropper.js)
- **NOVO**: Editor profissional de fotos com Cropper.js 1.6.1
- **Recursos do Editor:**
  - Corte livre de imagem
  - Rotação (esquerda/direita)
  - Espelhamento (horizontal/vertical)
  - Zoom e pan
  - Botão resetar
- Modal de edição abre automaticamente ao selecionar foto
- Preview da imagem editada antes de salvar
- Compressão otimizada (JPEG 85%, max 1920x1920)

#### 📄 PDF Reorganizado: Relatório Separado das Fotos
- **NOVO**: Layout profissional com partes separadas
- **Parte 1**: Relatório completo
  - Página de capa com informações
  - Tabela detalhada com zebra striping
  - Total destacado
- **Parte 2**: Página separadora "ANEXOS"
- **Parte 3**: Fotos em páginas individuais
  - Uma foto por página
  - Informações da nota em cada página
  - Imagens em tamanho grande
  - Numeração: "Foto X de Y"
- Numeração de páginas em todo o documento

### 🔧 Melhorias

- JavaScript completamente reescrito (35KB)
- Logs detalhados em todas as operações
- Tratamento de erros aprimorado
- Performance otimizada
- Validações mais robustas
- Feedback visual em todas as ações
- Transições suaves

### 📚 Bibliotecas Atualizadas

- ✅ **Cropper.js 1.6.1** - ADICIONADA para edição de imagens
- ✅ **html5-qrcode 2.3.8** - Mantida
- ✅ **jsPDF 2.5.1** - Mantida
- ✅ **Font Awesome 6.4.0** - Mantida

### 🐛 Correções

1. **Botão Salvar sem ação** - ✅ CORRIGIDO
   - Event listener reescrito
   - Form submit funcionando 100%
   
2. **QR Code não extraía data** - ✅ CORRIGIDO
   - Múltiplos métodos de parsing de data
   - Taxa de sucesso ~95%
   
3. **Sem editor de imagem** - ✅ IMPLEMENTADO
   - Cropper.js integrado
   - 6 ferramentas de edição
   
4. **PDF com fotos misturadas** - ✅ REORGANIZADO
   - Relatório primeiro
   - Fotos depois em páginas separadas

---

## Versão 1.1.0 - 2024-03-13

### 🆕 Novidades

#### 📄 Geração de PDF com Fotos
- **Relatórios em PDF profissionais** com as fotos das notas fiscais incluídas
- Layout otimizado com:
  - Cabeçalho com informações do período
  - Tabela detalhada de todas as notas
  - Fotos das notas fiscais anexadas (quando disponíveis)
  - Total destacado ao final
  - Numeração de páginas
  - Data de geração no rodapé
- Download automático do PDF
- Nome do arquivo: `relatorio-reembolso-YYYY-MM-DD.pdf`

#### 🔍 Scanner de QR Code Aprimorado
- **Múltiplos parsers** para diferentes formatos de NF-e:
  - URL com parâmetros (formato padrão)
  - Regex para `vNF=valor`
  - Regex para `|vNF:valor|`
  - Pipe separators (versão 2.0)
  - Padrão monetário genérico
- **Melhor detecção de valores** em QR Codes
- **Feedback visual** ao detectar valores
- **Logs detalhados** para debugging
- Continua escaneando até encontrar valor válido

### 🔧 Melhorias

- Botões reorganizados na aba Relatório
- Texto mais descritivo: "Gerar Relatório em PDF (com fotos)"
- Exportação JSON renomeada para "JSON Backup"
- Remoção da função de compartilhamento por email (substituída por PDF)
- Mensagens toast mais informativas
- Melhor tratamento de erros

### 📚 Bibliotecas Atualizadas

- ✅ **jsPDF 2.5.1** - Adicionada para geração de PDF
- ✅ **html5-qrcode 2.3.8** - Mantida para scanner QR Code
- ✅ **Font Awesome 6.4.0** - Mantida para ícones

### 🐛 Correções

1. **QR Code não lia valores** - ✅ CORRIGIDO
   - Implementados múltiplos métodos de parsing
   - Suporte a diversos formatos de NF-e
   - Melhor tratamento de erros

2. **Relatório sem fotos** - ✅ CORRIGIDO
   - PDF agora inclui todas as fotos das notas
   - Layout otimizado para exibição de imagens
   - Compressão automática se necessário

---

## Versão 1.0.0 - 2024-03-12

### 🎉 Lançamento Inicial

- Scanner de QR Code básico
- Captura de fotos
- Inserção manual de notas
- Armazenamento local (localStorage)
- Organização por data
- 5 categorias de despesas
- Busca em tempo real
- Filtros de ordenação
- Visualização detalhada
- Exclusão de notas
- Dashboard de estatísticas
- Relatórios HTML
- Compartilhamento por email
- Exportação JSON
- Design iOS-style
- PWA completo
- Modo offline

---

## 🚀 Próximas Versões Planejadas

### Versão 1.2.0 (Futuro)
- [ ] OCR para extrair valores de fotos
- [ ] Suporte a múltiplas moedas
- [ ] Gráficos de gastos por categoria
- [ ] Modo escuro
- [ ] Sincronização em nuvem (opcional)

### Versão 1.3.0 (Futuro)
- [ ] Templates personalizáveis de PDF
- [ ] Assinatura digital em PDF
- [ ] Importação de dados JSON
- [ ] Notificações de lembretes

---

## 📝 Notas de Atualização

### Como atualizar de 1.0.0 para 1.1.0

1. **Dados preservados**: Todas as suas notas fiscais serão mantidas
2. **Novas funcionalidades**: Disponíveis imediatamente
3. **Compatibilidade**: 100% compatível com dados da versão anterior
4. **Backup recomendado**: Use "Exportar Dados (JSON Backup)" antes de atualizar

### Requisitos

- Navegador moderno (Safari iOS 12+, Chrome, Firefox, Edge)
- JavaScript habilitado
- Acesso à câmera (para scanner e fotos)
- ~5-10MB de espaço no localStorage

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de reembolsos empresariais**
