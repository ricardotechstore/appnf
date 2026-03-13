// ==========================================
// NF Reembolso - Main JavaScript
// ==========================================

// Global Variables
let html5QrCode = null;
let currentNotes = [];
let currentNoteId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadNotes();
    setupEventListeners();
    updateTotalValue();
    updateStats();
    setDefaultDate();
}

// ==========================================
// Local Storage Management
// ==========================================

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        showToast('Erro ao salvar dados', 'error');
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        showToast('Erro ao carregar dados', 'error');
        return null;
    }
}

function loadNotes() {
    const notes = loadFromLocalStorage('nfReembolsoNotes');
    currentNotes = notes || [];
    renderNotesList();
}

function saveNote(note) {
    note.id = Date.now().toString();
    note.createdAt = new Date().toISOString();
    currentNotes.unshift(note);
    saveToLocalStorage('nfReembolsoNotes', currentNotes);
    showToast('Nota fiscal salva com sucesso!', 'success');
    updateTotalValue();
    updateStats();
    renderNotesList();
}

function deleteNote(noteId) {
    currentNotes = currentNotes.filter(note => note.id !== noteId);
    saveToLocalStorage('nfReembolsoNotes', currentNotes);
    showToast('Nota fiscal excluída', 'success');
    updateTotalValue();
    updateStats();
    renderNotesList();
    closeModal();
}

// ==========================================
// Event Listeners
// ==========================================

function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // QR Scanner
    document.getElementById('startScanBtn').addEventListener('click', startQRScanner);
    document.getElementById('stopScanBtn').addEventListener('click', stopQRScanner);

    // Manual Form
    document.getElementById('manualForm').addEventListener('submit', handleManualSubmit);
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);

    // Search and Filter
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('sortFilter').addEventListener('change', renderNotesList);

    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('deleteNoteBtn').addEventListener('click', handleDeleteNote);

    // Report
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);

    // Close modal on backdrop click
    document.getElementById('noteModal').addEventListener('click', (e) => {
        if (e.target.id === 'noteModal') closeModal();
    });
}

// ==========================================
// Tab Management
// ==========================================

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Stop QR scanner when switching tabs
    if (tabName !== 'add' && html5QrCode) {
        stopQRScanner();
    }

    // Update stats when switching to report tab
    if (tabName === 'report') {
        updateStats();
    }
}

// ==========================================
// QR Code Scanner
// ==========================================

async function startQRScanner() {
    const qrReaderDiv = document.getElementById('qrReader');
    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');

    try {
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("qrReader");
        }

        qrReaderDiv.classList.add('active');
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';

        await html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess,
            onScanError
        );

        showToast('Scanner iniciado. Posicione o QR Code', 'success');
    } catch (err) {
        console.error('Erro ao iniciar scanner:', err);
        showToast('Erro ao acessar câmera. Verifique as permissões.', 'error');
        stopQRScanner();
    }
}

function stopQRScanner() {
    const qrReaderDiv = document.getElementById('qrReader');
    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');

    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            qrReaderDiv.classList.remove('active');
            startBtn.style.display = 'inline-flex';
            stopBtn.style.display = 'none';
        }).catch(err => {
            console.error('Erro ao parar scanner:', err);
        });
    } else {
        qrReaderDiv.classList.remove('active');
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
    }
}

function onScanSuccess(decodedText, decodedResult) {
    console.log('QR Code detectado:', decodedText);
    
    // Parse NF-e URL to extract data
    const nfeData = parseNFeQRCode(decodedText);
    
    if (nfeData && nfeData.value) {
        stopQRScanner();
        showToast('QR Code lido com sucesso! Valor: R$ ' + nfeData.value, 'success');
        
        // Auto-fill form with scanned data
        document.getElementById('manualValue').value = nfeData.value || '';
        document.getElementById('manualDate').value = nfeData.date || '';
        
        // Switch to manual form to let user complete the information
        setTimeout(() => {
            document.getElementById('manualDescription').focus();
        }, 500);
    } else {
        // Keep scanning if no value found
        console.log('Valor não encontrado, continue escaneando...');
    }
}

function onScanError(errorMessage) {
    // Ignore scan errors (too noisy in console)
}

function parseNFeQRCode(qrText) {
    try {
        console.log('Tentando parsear QR Code:', qrText);
        
        let value = null;
        let date = null;
        
        // Método 1: Tentar como URL
        try {
            const url = new URL(qrText);
            const params = new URLSearchParams(url.search);
            
            // Check for vNF parameter (valor da nota fiscal)
            if (params.has('vNF')) {
                value = parseFloat(params.get('vNF')).toFixed(2);
                console.log('Valor encontrado via URL params:', value);
            }
            
            // Check for dhEmi parameter (data/hora emissão)
            if (params.has('dhEmi')) {
                const dateStr = params.get('dhEmi');
                date = dateStr.substring(0, 10);
            }
        } catch (urlError) {
            console.log('Não é uma URL válida, tentando outros métodos...');
        }
        
        // Método 2: Regex para diferentes formatos de NF-e
        if (!value) {
            // Formato: vNF=123.45
            const vNFMatch = qrText.match(/vNF=([0-9]+\.?[0-9]*)/);
            if (vNFMatch) {
                value = parseFloat(vNFMatch[1]).toFixed(2);
                console.log('Valor encontrado via regex vNF:', value);
            }
        }
        
        if (!value) {
            // Formato: |vNF:123.45|
            const vNFColonMatch = qrText.match(/\|?vNF:([0-9]+\.?[0-9]*)\|?/);
            if (vNFColonMatch) {
                value = parseFloat(vNFColonMatch[1]).toFixed(2);
                console.log('Valor encontrado via regex vNF:', value);
            }
        }
        
        if (!value) {
            // Formato NFe com pipe separators (versão 2.0)
            const parts = qrText.split('|');
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].includes('vNF') && i + 1 < parts.length) {
                    const potentialValue = parseFloat(parts[i + 1]);
                    if (!isNaN(potentialValue)) {
                        value = potentialValue.toFixed(2);
                        console.log('Valor encontrado via pipe separator:', value);
                        break;
                    }
                }
            }
        }
        
        // Método 3: Buscar qualquer número que pareça um valor monetário
        if (!value) {
            const moneyMatch = qrText.match(/([0-9]+\.[0-9]{2})/);
            if (moneyMatch) {
                const potentialValue = parseFloat(moneyMatch[1]);
                if (potentialValue > 0 && potentialValue < 999999) {
                    value = potentialValue.toFixed(2);
                    console.log('Valor encontrado via padrão monetário:', value);
                }
            }
        }
        
        // Extrair data se não encontrou antes
        if (!date) {
            // Formato: dhEmi=2024-03-12
            const dateMatch = qrText.match(/dhEmi=([0-9]{4}-[0-9]{2}-[0-9]{2})/);
            if (dateMatch) {
                date = dateMatch[1];
            } else {
                // Formato: 20240312 ou 2024/03/12
                const altDateMatch = qrText.match(/([0-9]{4})[\/-]?([0-9]{2})[\/-]?([0-9]{2})/);
                if (altDateMatch) {
                    date = `${altDateMatch[1]}-${altDateMatch[2]}-${altDateMatch[3]}`;
                }
            }
        }
        
        // Se encontrou valor, retorna os dados
        if (value) {
            return { 
                value: value, 
                date: date || new Date().toISOString().split('T')[0] 
            };
        }
        
        return null;
    } catch (e) {
        console.error('Erro ao parsear QR Code:', e);
        return null;
    }
}

// ==========================================
// Manual Form Handling
// ==========================================

function handleManualSubmit(e) {
    e.preventDefault();
    
    const value = parseFloat(document.getElementById('manualValue').value);
    const date = document.getElementById('manualDate').value;
    const description = document.getElementById('manualDescription').value;
    const category = document.getElementById('manualCategory').value;
    const photoInput = document.getElementById('photoInput');
    
    if (!value || !date || !category) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    const note = {
        value: value,
        date: date,
        description: description || 'Sem descrição',
        category: category,
        photo: null
    };
    
    // Get photo if uploaded
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            note.photo = event.target.result;
            saveNote(note);
            resetManualForm();
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveNote(note);
        resetManualForm();
    }
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('photoPreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            preview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }
}

function resetManualForm() {
    document.getElementById('manualForm').reset();
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('photoPreview').classList.remove('active');
    setDefaultDate();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('manualDate').value = today;
}

// ==========================================
// Notes List Rendering
// ==========================================

function renderNotesList() {
    const notesList = document.getElementById('notesList');
    const sortValue = document.getElementById('sortFilter').value;
    
    if (currentNotes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma nota fiscal cadastrada</p>
                <p class="empty-subtitle">Use o scanner de QR Code para adicionar</p>
            </div>
        `;
        return;
    }
    
    // Sort notes
    let sortedNotes = [...currentNotes];
    switch(sortValue) {
        case 'date-desc':
            sortedNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            sortedNotes.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'value-desc':
            sortedNotes.sort((a, b) => b.value - a.value);
            break;
        case 'value-asc':
            sortedNotes.sort((a, b) => a.value - b.value);
            break;
    }
    
    notesList.innerHTML = sortedNotes.map(note => `
        <div class="note-item" onclick="showNoteDetails('${note.id}')">
            <div class="note-header">
                <span class="note-value">R$ ${formatCurrency(note.value)}</span>
                <span class="note-date">${formatDate(note.date)}</span>
            </div>
            <div class="note-info">
                <p class="note-description">${note.description}</p>
                <span class="note-category">${getCategoryLabel(note.category)}</span>
                ${note.photo ? '<p class="note-photo-indicator"><i class="fas fa-camera"></i> Com foto</p>' : ''}
            </div>
        </div>
    `).join('');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredNotes = currentNotes.filter(note => {
        return note.description.toLowerCase().includes(searchTerm) ||
               note.category.toLowerCase().includes(searchTerm) ||
               note.value.toString().includes(searchTerm) ||
               formatDate(note.date).includes(searchTerm);
    });
    
    const notesList = document.getElementById('notesList');
    
    if (filteredNotes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Nenhuma nota encontrada</p>
                <p class="empty-subtitle">Tente outro termo de busca</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = filteredNotes.map(note => `
        <div class="note-item" onclick="showNoteDetails('${note.id}')">
            <div class="note-header">
                <span class="note-value">R$ ${formatCurrency(note.value)}</span>
                <span class="note-date">${formatDate(note.date)}</span>
            </div>
            <div class="note-info">
                <p class="note-description">${note.description}</p>
                <span class="note-category">${getCategoryLabel(note.category)}</span>
                ${note.photo ? '<p class="note-photo-indicator"><i class="fas fa-camera"></i> Com foto</p>' : ''}
            </div>
        </div>
    `).join('');
}

// ==========================================
// Modal Management
// ==========================================

function showNoteDetails(noteId) {
    const note = currentNotes.find(n => n.id === noteId);
    if (!note) return;
    
    currentNoteId = noteId;
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Valor</div>
            <div class="detail-value" style="color: var(--primary-color); font-size: 24px; font-weight: 700;">
                R$ ${formatCurrency(note.value)}
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Data</div>
            <div class="detail-value">${formatDate(note.date)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Descrição</div>
            <div class="detail-value">${note.description}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Categoria</div>
            <div class="detail-value">${getCategoryLabel(note.category)}</div>
        </div>
        ${note.photo ? `
            <div class="detail-item">
                <div class="detail-label">Foto da Nota Fiscal</div>
                <img src="${note.photo}" alt="Nota Fiscal" class="detail-image">
            </div>
        ` : ''}
    `;
    
    document.getElementById('noteModal').classList.add('active');
}

function closeModal() {
    document.getElementById('noteModal').classList.remove('active');
    currentNoteId = null;
}

function handleDeleteNote() {
    if (!currentNoteId) return;
    
    if (confirm('Deseja realmente excluir esta nota fiscal?')) {
        deleteNote(currentNoteId);
    }
}

// ==========================================
// Statistics and Totals
// ==========================================

function updateTotalValue() {
    const total = currentNotes.reduce((sum, note) => sum + note.value, 0);
    document.getElementById('totalValue').textContent = `R$ ${formatCurrency(total)}`;
}

function updateStats() {
    const total = currentNotes.length;
    const totalValue = currentNotes.reduce((sum, note) => sum + note.value, 0);
    
    // Calculate current month total
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthNotes = currentNotes.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate.getMonth() === currentMonth && noteDate.getFullYear() === currentYear;
    });
    const monthTotal = monthNotes.reduce((sum, note) => sum + note.value, 0);
    
    // Calculate average
    const average = total > 0 ? totalValue / total : 0;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statValue').textContent = `R$ ${formatCurrency(totalValue)}`;
    document.getElementById('statMonth').textContent = `R$ ${formatCurrency(monthTotal)}`;
    document.getElementById('statAvg').textContent = `R$ ${formatCurrency(average)}`;
}

// ==========================================
// Report Generation
// ==========================================

function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const category = document.getElementById('reportCategory').value;
    
    let filteredNotes = [...currentNotes];
    
    // Apply filters
    if (startDate) {
        filteredNotes = filteredNotes.filter(note => note.date >= startDate);
    }
    if (endDate) {
        filteredNotes = filteredNotes.filter(note => note.date <= endDate);
    }
    if (category) {
        filteredNotes = filteredNotes.filter(note => note.category === category);
    }
    
    // Sort by date
    filteredNotes.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (filteredNotes.length === 0) {
        showToast('Nenhuma nota encontrada para os filtros selecionados', 'warning');
        return;
    }
    
    // Show loading
    showToast('Gerando PDF com fotos... Aguarde...', 'success');
    
    // Generate PDF
    generatePDFReport(filteredNotes, startDate, endDate, category);
}

async function generatePDFReport(notes, startDate, endDate, category) {
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        const totalValue = notes.reduce((sum, note) => sum + note.value, 0);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        let yPosition = 20;
        
        // Title
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('Relatório de Reembolso', margin, yPosition);
        yPosition += 15;
        
        // Period and filters
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Período: ${startDate ? formatDate(startDate) : 'Início'} até ${endDate ? formatDate(endDate) : 'Hoje'}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`Categoria: ${category ? getCategoryLabel(category) : 'Todas'}`, margin, yPosition);
        yPosition += 7;
        pdf.text(`Total de Notas: ${notes.length}`, margin, yPosition);
        yPosition += 10;
        
        // Summary table header
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Data', margin, yPosition);
        pdf.text('Descrição', margin + 25, yPosition);
        pdf.text('Categoria', margin + 85, yPosition);
        pdf.text('Valor', margin + 135, yPosition);
        yPosition += 7;
        
        // Draw line
        pdf.setDrawColor(0, 122, 255);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
        
        // Notes list
        pdf.setFont(undefined, 'normal');
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            
            // Check if need new page
            if (yPosition > pageHeight - 40) {
                pdf.addPage();
                yPosition = 20;
            }
            
            // Note data
            pdf.text(formatDate(note.date), margin, yPosition);
            
            // Truncate description if too long
            let desc = note.description;
            if (desc.length > 25) {
                desc = desc.substring(0, 22) + '...';
            }
            pdf.text(desc, margin + 25, yPosition);
            
            pdf.text(getCategoryLabel(note.category).substring(0, 15), margin + 85, yPosition);
            pdf.text(`R$ ${formatCurrency(note.value)}`, margin + 135, yPosition);
            yPosition += 7;
            
            // Add photo if exists
            if (note.photo) {
                // Check if need new page for photo
                if (yPosition > pageHeight - 90) {
                    pdf.addPage();
                    yPosition = 20;
                }
                
                yPosition += 5;
                
                try {
                    // Add image to PDF
                    const imgWidth = 80;
                    const imgHeight = 60;
                    pdf.addImage(note.photo, 'JPEG', margin, yPosition, imgWidth, imgHeight);
                    
                    // Add caption
                    pdf.setFontSize(8);
                    pdf.setTextColor(100);
                    pdf.text(`Nota Fiscal - ${formatDate(note.date)}`, margin, yPosition + imgHeight + 5);
                    pdf.setTextColor(0);
                    pdf.setFontSize(10);
                    
                    yPosition += imgHeight + 10;
                } catch (imgError) {
                    console.error('Erro ao adicionar imagem:', imgError);
                    pdf.text('[Imagem não pôde ser adicionada]', margin, yPosition);
                    yPosition += 7;
                }
            }
            
            yPosition += 3;
        }
        
        // Total
        if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
        }
        
        yPosition += 10;
        pdf.setDrawColor(0, 122, 255);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('VALOR TOTAL:', margin, yPosition);
        pdf.setTextColor(0, 122, 255);
        pdf.text(`R$ ${formatCurrency(totalValue)}`, margin + 50, yPosition);
        
        // Footer
        const pageCount = pdf.internal.getNumberOfPages();
        pdf.setTextColor(100);
        pdf.setFontSize(8);
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.text(
                `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
        
        // Save PDF
        const fileName = `relatorio-reembolso-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        showToast(`PDF gerado com sucesso! ${notes.filter(n => n.photo).length} fotos incluídas`, 'success');
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF. Tente novamente.', 'error');
    }
}

function exportData() {
    if (currentNotes.length === 0) {
        showToast('Nenhuma nota para exportar', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(currentNotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nf-reembolso-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso!', 'success');
}

// ==========================================
// Utility Functions
// ==========================================

function formatCurrency(value) {
    return value.toFixed(2).replace('.', ',');
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getCategoryLabel(category) {
    const categories = {
        'alimentacao': 'Alimentação',
        'transporte': 'Transporte',
        'hospedagem': 'Hospedagem',
        'material': 'Material de Escritório',
        'outros': 'Outros'
    };
    return categories[category] || category;
}

// ==========================================
// Toast Notifications
// ==========================================

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas ${icon} toast-icon"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================
// Service Worker Registration (PWA)
// ==========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registrado:', reg))
            .catch(err => console.log('Erro no Service Worker:', err));
    });
}
