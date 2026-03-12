// ==========================================
// NF Reembolso S&S - Main JavaScript
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
    document.getElementById('shareReportBtn').addEventListener('click', shareReport);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);

    // Close modal on backdrop click
    document.getElementById('noteModal').addEventListener('click', (e) => {
        if (e.target.id === 'noteModal') closeModal();
    });
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

    if (nfeData) {
        stopQRScanner();
        showToast('QR Code lido com sucesso!', 'success');
        
        // Auto-fill form with scanned data
        document.getElementById('manualValue').value = nfeData.value || '';
        document.getElementById('manualDate').value = nfeData.date || '';
        
        // Switch to manual form to let user complete the information
        setTimeout(() => {
            document.getElementById('manualValue').focus();
        }, 500);
    }
}

function onScanError(errorMessage) {
    console.log('Erro de leitura do QR Code:', errorMessage);
    // Você pode adicionar uma mensagem de alerta aqui se necessário
}

function parseNFeQRCode(qrText) {
    try {
        const url = new URL(qrText);
        const params = new URLSearchParams(url.search);
        
        let value = null;
        let date = null;
        
        if (params.has('vNF')) {
            value = parseFloat(params.get('vNF')).toFixed(2);
        }
        
        if (params.has('dhEmi')) {
            const dateStr = params.get('dhEmi');
            date = dateStr.substring(0, 10);
        }
        
        if (value) {
            return { value, date: date || new Date().toISOString().split('T')[0] };
        }

        const pathMatch = qrText.match(/vNF=([0-9.]+)/);
        if (pathMatch) {
            value = parseFloat(pathMatch[1]).toFixed(2);
            return { value, date: new Date().toISOString().split('T')[0] };
        }

        return null;
    } catch (e) {
        console.log('Texto do QR Code:', qrText);
        showToast('QR Code detectado. Preencha os dados manualmente.', 'warning');
        return null;
    }
}

// ==========================================
// Report Generation
// ==========================================

function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const category = document.getElementById('reportCategory').value;
    
    let filteredNotes = [...currentNotes];
    
    if (startDate) {
        filteredNotes = filteredNotes.filter(note => note.date >= startDate);
    }
    if (endDate) {
        filteredNotes = filteredNotes.filter(note => note.date <= endDate);
    }
    if (category) {
        filteredNotes = filteredNotes.filter(note => note.category === category);
    }
    
    filteredNotes.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const reportPreview = document.getElementById('reportPreview');
    const reportContent = document.getElementById('reportContent');
    
    if (filteredNotes.length === 0) {
        showToast('Nenhuma nota encontrada para os filtros selecionados', 'warning');
        reportPreview.style.display = 'none';
        return;
    }

    // Generate report HTML
    const totalValue = filteredNotes.reduce((sum, note) => sum + note.value, 0);
    
    let reportHTML = `
        <h3>Relatório de Reembolso</h3>
        <p><strong>Período:</strong> ${startDate ? formatDate(startDate) : 'Início'} até ${endDate ? formatDate(endDate) : 'Hoje'}</p>
        <p><strong>Categoria:</strong> ${category ? getCategoryLabel(category) : 'Todas'}</p>
        <p><strong>Total de Notas:</strong> ${filteredNotes.length}</p>
        
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>Foto</th>
                </tr>
            </thead>
            <tbody>
                ${filteredNotes.map(note => `
                    <tr>
                        <td>${formatDate(note.date)}</td>
                        <td>${note.description}</td>
                        <td>${getCategoryLabel(note.category)}</td>
                        <td>R$ ${formatCurrency(note.value)}</td>
                        <td>${note.photo ? `<img src="${note.photo}" alt="Foto da Nota" class="report-photo">` : ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="report-total">
            <span class="report-total-label">Valor Total:</span>
            <span class="report-total-value">R$ ${formatCurrency(totalValue)}</span>
        </div>
    `;
    
    reportContent.innerHTML = reportHTML;
    reportPreview.style.display = 'block';
    
    // Scroll to report
    reportPreview.scrollIntoView({ behavior: 'smooth' });
    
    showToast('Relatório gerado com sucesso!', 'success');
}

function shareReport() {
    const reportContent = document.getElementById('reportContent');
    
    if (!reportContent.innerHTML || reportContent.innerHTML.trim() === '') {
        showToast('Gere o relatório antes de compartilhar', 'warning');
        return;
    }
    
    // Get report text
    const reportText = reportContent.innerText;
    
    // Create email subject and body
    const subject = 'Relatório de Reembolso - NF Reembolso';
    const body = encodeURIComponent(reportText);
    
    // Open email client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    showToast('Abrindo cliente de email...', 'success');
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
    link.download = `nf-reembolso-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Dados exportados com sucesso!', 'success');
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