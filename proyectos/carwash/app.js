/* ============================================
   AquaWash Pro - Car Wash Management System
   Application Logic
   ============================================ */

// ===== Data Store =====
const STORAGE_KEYS = {
    CONFIG: 'aquawash_config',
    SERVICES: 'aquawash_services',
    TIRE_SERVICES: 'aquawash_tire_services',
    EXPENSES: 'aquawash_expenses',
    SESSION: 'aquawash_session'
};

const DEFAULT_CONFIG = {
    password: 'carwash123',
    businessName: 'AutoShine Pro',
    serviceTypes: [
        { name: 'Interior y Exterior', price: 100 },
        { name: 'Interior y Exterior (Camión)', price: 150 },
        { name: 'Motor', price: 250 },
        { name: 'Motor (Camión)', price: 350 },
        { name: 'Champuseado', price: 200 },
        { name: 'Champuseado (Camión)', price: 300 }
    ],
    workers: [],
    tireServiceTypes: [
        { name: 'Parche', price: 50 },
        { name: 'Cambio de llanta', price: 150 },
        { name: 'Balanceo', price: 80 },
        { name: 'Alineacion', price: 200 },
        { name: 'Rotacion de llantas', price: 100 }
    ],
    whatsappTemplate: '¡Hola {nombre}! 👋🚗\n\nTu {carro} ya está listo y reluciente. ✨\nServicio: {servicio}\n\n¡Te esperamos en AutoShine Pro!\nGracias por tu preferencia. ðŸ™'
};

// ===== Helper Functions =====
function getData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading data:', e);
        return null;
    }
}

function setData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));

        // Push to Firebase silently
        if (typeof db !== 'undefined') {
            const dataToPush = {
                config: JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG)) || { ...DEFAULT_CONFIG },
                services: JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES)) || [],
                tireServices: JSON.parse(localStorage.getItem(STORAGE_KEYS.TIRE_SERVICES)) || [],
                expenses: JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES)) || []
            };
            db.collection('carwash').doc('data').set(dataToPush).catch(err => console.error(err));
        }
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function refreshPageData(page) {
    if (page === 'dashboard') updateDashboard();
    else if (page === 'reception') updateReception();
    else if (page === 'tires' && typeof updateTires === 'function') updateTires();
    else if (page === 'finances') updateFinances();
    else if (page === 'history') updateHistory();
    else if (page === 'settings') updateSettings();
}
function getConfig() {
    return getData(STORAGE_KEYS.CONFIG) || { ...DEFAULT_CONFIG };
}

function saveConfig(config) {
    setData(STORAGE_KEYS.CONFIG, config);
}

function getServices() {
    return getData(STORAGE_KEYS.SERVICES) || [];
}

function saveServices(services) {
    setData(STORAGE_KEYS.SERVICES, services);
}

function getExpenses() {
    return getData(STORAGE_KEYS.EXPENSES) || [];
}

function saveExpenses(expenses) {
    setData(STORAGE_KEYS.EXPENSES, expenses);
}

function getTireServices() {
    return getData(STORAGE_KEYS.TIRE_SERVICES) || [];
}

function saveTireServices(services) {
    setData(STORAGE_KEYS.TIRE_SERVICES, services);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatCurrency(amount) {
    return 'L ' + Number(amount).toLocaleString('es-HN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDuration(start, end) {
    const ms = new Date(end) - new Date(start);
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

function getElapsedTime(startTime) {
    const ms = Date.now() - new Date(startTime).getTime();
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
}

function isToday(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isThisWeek(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
}

function isThisMonth(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

// ===== Toast Notification System =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="material-icons-round">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.classList.add('toast-out'); setTimeout(() => this.parentElement.remove(), 300);">
            <span class="material-icons-round">close</span>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===== Authentication =====
function initAuth() {
    const config = getConfig();
    // Initialize config if first time
    if (!getData(STORAGE_KEYS.CONFIG)) {
        saveConfig(DEFAULT_CONFIG);
    }

    // Check session
    const session = getData(STORAGE_KEYS.SESSION);
    if (session && session.authenticated) {
        showApp();
    }
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    const config = getConfig();

    if (password === config.password) {
        setData(STORAGE_KEYS.SESSION, { authenticated: true, timestamp: Date.now() });
        document.getElementById('loginError').classList.add('hidden');
        showApp();
    } else {
        document.getElementById('loginError').classList.remove('hidden');
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
    }
});

function togglePasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const icon = document.querySelector('.toggle-password .material-icons-round');
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
    }
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    initApp();
}

function logout() {
    document.getElementById('logoutModal').classList.remove('hidden');

    document.getElementById('confirmLogoutBtn').onclick = function () {
        setData(STORAGE_KEYS.SESSION, { authenticated: false });
        closeModal('logoutModal');
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginPassword').value = '';
    };
}

// ===== Sidebar & Navigation =====
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); const overlay = document.getElementById('sidebarOverlay'); if(overlay) overlay.classList.toggle('active'); }

function navigateTo(page) {
    // Save to local storage
    localStorage.setItem('aquawash_last_page', page);

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Show page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    // Update title
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Resumen general del negocio' },
        reception: { title: 'Recepción', subtitle: 'Gestión de servicios activos' },
        tires: { title: 'Llantera', subtitle: 'Gestión de servicios de llantera' },
        finances: { title: 'Finanzas', subtitle: 'Control de ingresos y gastos' },
        history: { title: 'Historial', subtitle: 'Registro de servicios completados' },
        settings: { title: 'Configuración', subtitle: 'Ajustes del sistema' }
    };

    document.getElementById('pageTitle').textContent = titles[page].title;
    document.getElementById('pageSubtitle').textContent = titles[page].subtitle;

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open'); const overlay = document.getElementById('sidebarOverlay'); if(overlay) overlay.classList.remove('active');

    // Refresh page data
    refreshPageData(page);
}

function refreshPageData(page) {
    switch (page) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'reception':
            updateReception();
            break;
        case 'tires':
            updateTires();
            break;
        case 'finances':
            updateFinances();
            break;
        case 'history':
            updateHistory();
            break;
        case 'settings':
            updateSettings();
            break;
    }
}

// ===== App Initialization =====
function initApp() {
    // Set current date
    function updateHeaderDate() {
        const now = new Date();
        document.getElementById('currentDate').textContent = now.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    updateHeaderDate();
    setInterval(updateHeaderDate, 60000);

    // Set expense date default to today
    const now = new Date();
    document.getElementById('expenseDate').value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    // Load service types into select
    loadServiceTypes();

    // Restore last visited page
    const lastPage = localStorage.getItem('aquawash_last_page') || 'dashboard';
    navigateTo(lastPage);

    // Update all pages (to ensure data is loaded even if hidden)
    updateDashboard();
    updateReception();
    updateSettings();

    // Start timer updates
    setInterval(updateElapsedTimes, 30000); // Update every 30 seconds
}

// ===== Service Types =====
function loadServiceTypes() {
    const config = getConfig();
    const container = document.getElementById('serviceTypeContainer');

    if (!container) return; // For pages without it
    container.innerHTML = '';

    config.serviceTypes.forEach((service) => {
        const pill = document.createElement('label');
        pill.className = 'service-dropdown-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = service.name;
        checkbox.dataset.price = service.price;
        checkbox.className = 'service-checkbox';

        checkbox.addEventListener('change', function () {
            if (this.checked) {
                pill.classList.add('selected');
            } else {
                pill.classList.remove('selected');
            }
            updateTotalPrice();
        });

        pill.appendChild(checkbox);
        const textSpan = document.createElement('span');
        textSpan.style.marginLeft = '0.5rem';
        textSpan.textContent = `${service.name} - ${formatCurrency(service.price)}`;
        pill.appendChild(textSpan);
        container.appendChild(pill);
    });
}

function updateTotalPrice() {
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    let total = 0;
    let selectedNames = [];
    checkboxes.forEach(cb => {
        total += parseFloat(cb.dataset.price);
        selectedNames.push(cb.value);
    });
    document.getElementById('servicePrice').value = total || '';

    const textSpan = document.getElementById('multiSelectText');
    if (textSpan) {
        if (selectedNames.length === 0) textSpan.textContent = 'Seleccionar servicios...';
        else if (selectedNames.length === 1) textSpan.textContent = selectedNames[0];
        else textSpan.textContent = selectedNames.length + ' servicios seleccionados';
    }
}

// ===== RECEPTION - Add Car Form =====
document.getElementById('addCarForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast('Selecciona al menos un servicio', 'error');
        return;
    }

    const service = {
        id: generateId(),
        category: 'carwash',
        clientName: document.getElementById('clientName').value.trim(),
        phone: document.getElementById('clientPhone').value.trim(),
        carModel: document.getElementById('carModel').value.trim(),
        worker: document.getElementById('serviceWorker').value,

        serviceType: Array.from(document.querySelectorAll('.service-checkbox:checked')).map(cb => cb.value).join(' + '),
        price: parseFloat(document.getElementById('servicePrice').value),
        notes: document.getElementById('serviceNotes').value.trim(),
        status: 'active',
        startTime: new Date().toISOString(),
        endTime: null
    };

    const services = getServices();
    services.push(service);
    saveServices(services);

    this.reset();
    document.querySelectorAll('.service-dropdown-item.selected').forEach(pill => pill.classList.remove('selected'));
    document.getElementById('serviceTypeContainer').classList.remove('open');
    updateTotalPrice();
    document.getElementById('expenseDate').value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    showToast(`Servicio registrado para ${service.clientName}`, 'success');
    updateReception();
    updateDashboard();
});

// ===== RECEPTION - Active Services List =====
function updateReception() {
    const services = getServices().filter(s => s.status === 'active');
    const container = document.getElementById('activeServicesList');
    const countEl = document.getElementById('activeServicesCount');

    countEl.textContent = services.length;

    if (services.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round">directions_car</span>
                <p>No hay servicios activos</p>
                <small>Registra un nuevo servicio arriba</small>
            </div>
        `;
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="service-card" data-id="${service.id}">
            <div class="service-card-icon">
                <span class="material-icons-round">directions_car</span>
            </div>
            <div class="service-card-info">
                <div class="service-card-name">
                    ${service.carModel || 'Vehículo sin modelo'}
                </div>
                <div class="service-card-details">
                    <span><span class="material-icons-round">person</span> ${service.clientName || 'Cliente anónimo'}</span>
                    <span><span class="material-icons-round">build</span> ${service.serviceType}</span>
                    <span><span class="material-icons-round">attach_money</span> ${formatCurrency(service.price)}</span>
                    <span><span class="material-icons-round">phone</span> ${service.phone}</span>
                    ${service.worker ? `<span><span class="material-icons-round">badge</span> ${service.worker}</span>` : ''}
                </div>
                <div class="service-card-time elapsed-time" data-start="${service.startTime}">
                    <span class="material-icons-round">schedule</span>
                    ${getElapsedTime(service.startTime)} en servicio
                </div>
                ${service.notes ? `<div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted);font-style:italic;">ðŸ“ ${service.notes}</div>` : ''}
            </div>
            <div class="service-card-actions">
                <button class="btn-icon-only btn-whatsapp" onclick="sendQuickWhatsApp('${service.id}')" title="Enviar WhatsApp">
                    <span class="material-icons-round">chat</span>
                </button>
                <button class="btn-icon-only btn-complete" onclick="showCompleteModal('${service.id}')" title="Finalizar servicio">
                    <span class="material-icons-round">check_circle</span>
                </button>
                <button class="btn-icon-only btn-delete" onclick="cancelService('${service.id}')" title="Cancelar servicio">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

function updateElapsedTimes() {
    document.querySelectorAll('.elapsed-time').forEach(el => {
        const start = el.dataset.start;
        if (start) {
            el.innerHTML = `<span class="material-icons-round">schedule</span> ${getElapsedTime(start)} en servicio`;
        }
    });
}

// ===== Complete Service =====
let currentCompleteId = null;

function showCompleteModal(serviceId) {
    currentCompleteId = serviceId;
    const services = getServices();
    const service = services.find(s => s.id === serviceId);

    if (!service) return;

    document.getElementById('completeModalInfo').innerHTML = `
        <strong>${service.clientName}</strong><br>
        🚗 ${service.carModel || 'N/A'}<br>
        🔧 ${service.serviceType}<br>
        💰 ${formatCurrency(service.price)}<br>
        ⏱️ Tiempo: ${getElapsedTime(service.startTime)}
    `;

    document.getElementById('completeModal').classList.remove('hidden');

    document.getElementById('confirmCompleteBtn').onclick = function () {
        completeService(serviceId, false);
    };

    document.getElementById('confirmCompleteWhatsappBtn').onclick = function () {
        completeService(serviceId, true);
    };
}

function completeService(serviceId, sendWhatsapp) {
    const services = getServices();
    const serviceIndex = services.findIndex(s => s.id === serviceId);

    if (serviceIndex === -1) return;

    services[serviceIndex].status = 'completed';
    services[serviceIndex].endTime = new Date().toISOString();
    saveServices(services);

    const service = services[serviceIndex];

    // Send WhatsApp if true
    if (sendWhatsapp && service.phone) {
        sendWhatsAppMessage(service);
    }

    closeModal('completeModal');
    showToast(`Servicio completado para ${service.clientName} ✅`, 'success');

    updateReception();
    updateDashboard();
    currentCompleteId = null;
}

let currentCancelId = null;

function cancelService(serviceId) {
    currentCancelId = serviceId;
    const services = getServices();
    const service = services.find(s => s.id === serviceId);

    if (!service) return;

    document.getElementById('cancelModalInfo').innerHTML = `
        <strong>${service.clientName}</strong><br>
        🚗 ${service.carModel || 'N/A'}<br>
        🔧 ${service.serviceType}
    `;

    document.getElementById('cancelModal').classList.remove('hidden');

    document.getElementById('confirmCancelBtn').onclick = function () {
        confirmCancelService(serviceId);
    };
}

function confirmCancelService(serviceId) {
    const services = getServices();
    const serviceIndex = services.findIndex(s => s.id === serviceId);

    if (serviceIndex === -1) {
        closeModal('cancelModal');
        return;
    }

    const service = services[serviceIndex];
    services.splice(serviceIndex, 1);
    saveServices(services);

    closeModal('cancelModal');
    showToast(`Servicio cancelado: ${service.clientName}`, 'warning');
    updateReception();
    updateDashboard();
    currentCancelId = null;
}

// ===== WhatsApp Integration =====
function sendWhatsAppMessage(service) {
    const config = getConfig();
    let message = config.whatsappTemplate;

    // Replace variables
    message = message.replace(/{nombre}/g, service.clientName);
    message = message.replace(/{carro}/g, service.carModel || 'vehículo');
    message = message.replace(/{servicio}/g, service.serviceType);

    // Clean phone number - remove spaces, dashes, parentheses
    let phone = service.phone.replace(/[\s\-\(\)]/g, '');

    // If doesn't start with +, assume it's ready
    if (!phone.startsWith('+')) {
        // Already should have country code
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function sendQuickWhatsApp(serviceId) {
    const services = getServices();
    const service = services.find(s => s.id === serviceId);
    if (!service || !service.phone) {
        showToast('No hay número de teléfono registrado', 'error');
        return;
    }
    sendWhatsAppMessage(service);
}

// ===== DASHBOARD =====
function updateBusinessNameUI() {
    const config = getConfig();
    const name = config.businessName || 'AutoShine Pro';
    document.title = name + ' - Gestión';
    const logoEl = document.getElementById('sidebarLogoText');
    if (logoEl) {
        // Split name to keep the cool styling: first word normal, rest is green and bold
        const parts = name.split(' ');
        if (parts.length > 1) {
            const firstWord = parts.shift();
            logoEl.innerHTML = `${firstWord} <strong>${parts.join(' ')}</strong>`;
        } else {
            logoEl.innerHTML = `<strong>${name}</strong>`;
        }
    }
}

function updateDashboard() {
    const services = getServices();
    const expenses = getExpenses();

    const activeCars = services.filter(s => s.status === 'active');
    const todayCompleted = services.filter(s => s.status === 'completed' && isToday(s.endTime));
    const todayExpenses = expenses.filter(e => isToday(e.date));

    const todayIncome = todayCompleted.reduce((sum, s) => sum + s.price, 0);
    const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const todayNet = todayIncome - todayExpenseTotal;

    // Update stat cards
    document.getElementById('statActiveCars').textContent = activeCars.length;
    document.getElementById('statTodayIncome').textContent = formatCurrency(todayIncome);
    document.getElementById('statTodayExpenses').textContent = formatCurrency(todayExpenseTotal);
    document.getElementById('statTodayNet').textContent = formatCurrency(todayNet);
    document.getElementById('statTodayNet').style.color = todayNet >= 0 ? 'var(--success)' : 'var(--danger)';

    // Update sidebar badge
    document.getElementById('activeCarsCount').textContent = activeCars.length;

    // Active cars list in dashboard
    const carsContainer = document.getElementById('dashboardActiveCars');
    if (activeCars.length === 0) {
        carsContainer.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round">directions_car</span>
                <p>No hay carros en servicio</p>
            </div>
        `;
    } else {
        carsContainer.innerHTML = activeCars.slice(0, 5).map(s => `
            <div class="service-card" style="margin-bottom:var(--space-sm);">
                <div class="service-card-icon">
                    <span class="material-icons-round">directions_car</span>
                </div>
                <div class="service-card-info">
                    <div class="service-card-name">${s.clientName}</div>
                    <div class="service-card-details">
                        <span><span class="material-icons-round">build</span> ${s.serviceType}</span>
                        <span><span class="material-icons-round">attach_money</span> ${formatCurrency(s.price)}</span>
                    </div>
                    <div class="service-card-time elapsed-time" data-start="${s.startTime}">
                        <span class="material-icons-round">schedule</span> ${getElapsedTime(s.startTime)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Recent activity
    const recentContainer = document.getElementById('dashboardRecentActivity');
    const allActivity = [];

    // Add completed services
    services.filter(s => s.status === 'completed').slice(-10).reverse().forEach(s => {
        allActivity.push({
            type: 'completed',
            text: `✅ ${s.clientName} - ${s.serviceType} (${formatCurrency(s.price)})`,
            time: s.endTime
        });
    });

    // Add active services
    activeCars.forEach(s => {
        allActivity.push({
            type: 'active',
            text: `🚗 ${s.clientName} ingresó - ${s.serviceType}`,
            time: s.startTime
        });
    });

    // Sort by time descending
    allActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    if (allActivity.length === 0) {
        recentContainer.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round">history</span>
                <p>Sin actividad reciente</p>
            </div>
        `;
    } else {
        recentContainer.innerHTML = allActivity.slice(0, 8).map(a => `
            <div class="activity-item">
                <div class="activity-dot ${a.type === 'completed' ? 'completed' : ''}"></div>
                <div>
                    <div class="activity-text">${a.text}</div>
                    <div class="activity-time">${formatDate(a.time)} - ${formatTime(a.time)}</div>
                </div>
            </div>
        `).join('');
    }

    // Dashboard chart
    const activePeriod = document.querySelector('[data-chart-period].active')?.dataset.chartPeriod || 'week';
    updateDashboardChart(activePeriod);
}

// ===== Charts =====
let weeklyChartInstance = null;
let expenseChartInstance = null;

function updateDashboardChart(period = 'week') {
    document.querySelectorAll('[data-chart-period]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.chartPeriod === period);
    });

    const services = getServices().filter(s => s.status === 'completed');
    const expensesList = getExpenses(); 
    const today = new Date();
    
    let labels = [];
    let incomes = [];
    let expensesData = [];
    let netData = [];

    if (period === 'day') {
        for (let i = 6; i <= 22; i++) {
            labels.push(`${i}:00`);
            const hourIncome = services.filter(s => {
                const sDate = new Date(s.endTime);
                return sDate.toDateString() === today.toDateString() && sDate.getHours() === i;
            }).reduce((sum, s) => sum + s.price, 0);
            
            const hourExpense = expensesList.filter(e => {
                const eDate = new Date(e.date.includes('T') ? e.date : e.date + 'T12:00:00');
                return eDate.toDateString() === today.toDateString() && i === 12; // Put daily expenses in middle of day
            }).reduce((sum, e) => sum + e.amount, 0);

            incomes.push(hourIncome);
            expensesData.push(hourExpense);
            netData.push(hourIncome - hourExpense);
        }
    } else if (period === 'week') {
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            labels.push(date.toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric' }));
            
            const dayIncome = services
                .filter(s => new Date(s.endTime).toDateString() === date.toDateString())
                .reduce((sum, s) => sum + s.price, 0);
            
            const dayExpense = expensesList
                .filter(e => {
                    const eDate = new Date(e.date.includes('T') ? e.date : e.date + 'T12:00:00'); // Normalize timezone
                    return eDate.toDateString() === date.toDateString();
                })
                .reduce((sum, e) => sum + e.amount, 0);

            incomes.push(dayIncome);
            expensesData.push(dayExpense);
            netData.push(dayIncome - dayExpense);
        }
    } else if (period === 'month') {
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            if (i === 1 || i % 5 === 0 || i === daysInMonth) labels.push(`${i}/${month + 1}`);
            else labels.push('');

            const dayIncome = services
                .filter(s => {
                    const d = new Date(s.endTime);
                    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i;
                }).reduce((sum, s) => sum + s.price, 0);
                
            const dayExpense = expensesList
                .filter(e => {
                    const d = new Date(e.date.includes('T') ? e.date : e.date + 'T12:00:00');
                    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i;
                }).reduce((sum, e) => sum + e.amount, 0);

            incomes.push(dayIncome);
            expensesData.push(dayExpense);
            netData.push(dayIncome - dayExpense);
        }
    } else if (period === 'year') {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const year = today.getFullYear();
        for (let i = 0; i < 12; i++) {
            labels.push(monthNames[i]);
            const monthIncome = services
                .filter(s => {
                    const d = new Date(s.endTime);
                    return d.getFullYear() === year && d.getMonth() === i;
                }).reduce((sum, s) => sum + s.price, 0);
                
            const monthExpense = expensesList
                .filter(e => {
                    const d = new Date(e.date.includes('T') ? e.date : e.date + 'T12:00:00');
                    return d.getFullYear() === year && d.getMonth() === i;
                }).reduce((sum, e) => sum + e.amount, 0);

            incomes.push(monthIncome);
            expensesData.push(monthExpense);
            netData.push(monthIncome - monthExpense);
        }
    }

    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    if (weeklyChartInstance) {
        weeklyChartInstance.destroy();
    }

    weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos Brutos',
                    data: incomes,
                    backgroundColor: 'rgba(33, 150, 243, 0.25)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                },
                {
                    label: 'Gastos',
                    data: expensesData,
                    backgroundColor: 'rgba(244, 67, 54, 0.25)',
                    borderColor: 'rgba(244, 67, 54, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                },
                {
                    type: 'line',
                    label: 'Ganancia Neta',
                    data: netData,
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: false,
                    pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#555555',
                        font: { size: 12, weight: 600 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: 'rgba(33, 150, 243, 0.3)',
                    borderWidth: 1,
                    titleColor: '#1a1a1a',
                    bodyColor: '#555555',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    ticks: { color: '#555555', font: { size: 11, weight: 600 } }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    ticks: {
                        color: '#555555',
                        font: { size: 11, weight: 600 },
                        callback: (value) => 'L ' + value
                    }
                }
            }
        }
    });
}

function updateExpenseChart() {
    const expenses = getExpenses();
    const currentPeriod = document.querySelector('.period-btn.active')?.dataset.period || 'day';

    let filteredExpenses = expenses;
    if (currentPeriod === 'day') filteredExpenses = expenses.filter(e => isToday(e.date));
    else if (currentPeriod === 'week') filteredExpenses = expenses.filter(e => isThisWeek(e.date));
    else if (currentPeriod === 'month') filteredExpenses = expenses.filter(e => isThisMonth(e.date));

    // Group by category
    const categories = {};
    filteredExpenses.forEach(e => {
        if (!categories[e.category]) categories[e.category] = 0;
        categories[e.category] += e.amount;
    });

    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    const categoryColors = {
        'Suministros': '#3b82f6',
        'Agua': '#0ea5e9',
        'Electricidad': '#eab308',
        'Salarios': '#10b981',
        'Equipo': '#8b5cf6',
        'Mantenimiento': '#f97316',
        'Otro': '#64748b',
    };

    const labels = Object.keys(categories);
    const data = Object.values(categories);
    const colors = labels.map(l => categoryColors[l] || '#8b5cf6');

    if (labels.length === 0) {
        expenseChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Sin datos'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(255,255,255,0.05)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
        return;
    }

    expenseChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.map(c => c + '80'),
                borderColor: colors,
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#8898b9',
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 10,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 26, 46, 0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#e8ecf4',
                    bodyColor: '#8898b9',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`
                    }
                }
            }
        }
    });
}

// ===== FINANCES =====
let currentFinancePeriod = 'day';

function setFinancePeriod(period) {
    currentFinancePeriod = period;
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
    });
    updateFinances();
}

function updateFinances() {
    const services = getServices().filter(s => s.status === 'completed');
    const expenses = getExpenses();

    let filteredServices = services;
    let filteredExpenses = expenses;

    switch (currentFinancePeriod) {
        case 'day':
            filteredServices = services.filter(s => isToday(s.endTime));
            filteredExpenses = expenses.filter(e => isToday(e.date));
            break;
        case 'week':
            filteredServices = services.filter(s => isThisWeek(s.endTime));
            filteredExpenses = expenses.filter(e => isThisWeek(e.date));
            break;
        case 'month':
            filteredServices = services.filter(s => isThisMonth(s.endTime));
            filteredExpenses = expenses.filter(e => isThisMonth(e.date));
            break;
    }

    const income = filteredServices.reduce((sum, s) => sum + s.price, 0);
    const expenseTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const net = income - expenseTotal;

    document.getElementById('finIncome').textContent = formatCurrency(income);
    document.getElementById('finExpenses').textContent = formatCurrency(expenseTotal);
    document.getElementById('finNet').textContent = formatCurrency(net);
    document.getElementById('finNet').style.color = net >= 0 ? 'var(--success)' : 'var(--danger)';

    // Expense list
    const expenseContainer = document.getElementById('expensesList');
    if (filteredExpenses.length === 0) {
        expenseContainer.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round">receipt_long</span>
                <p>No hay gastos en este período</p>
            </div>
        `;
    } else {
        const sorted = [...filteredExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        expenseContainer.innerHTML = sorted.map(e => {
            const emoji = {
                'Suministros': '🧼',
                'Agua': '💧',
                'Electricidad': '⚡',
                'Salarios': '👷',
                'Equipo': '🔧',
                'Mantenimiento': '🛠️',
                'Otro': '📦',
            };
            return `
                <div class="expense-item">
                    <div class="expense-icon">${emoji[e.category] || '📦'}</div>
                    <div class="expense-info">
                        <div class="expense-desc">${e.description}</div>
                        <div class="expense-category">${e.category}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="expense-amount">-${formatCurrency(e.amount)}</div>
                        <div class="expense-date">${formatDate(e.date)}</div>
                    </div>
                    <button class="expense-delete" onclick="deleteExpense('${e.id}')" title="Eliminar">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
            `;
        }).join('');
    }

    // Update chart
    updateExpenseChart();
}

// ===== EXPENSES =====
document.getElementById('addExpenseForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const expense = {
        id: generateId(),
        description: document.getElementById('expenseDesc').value.trim(),
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value + 'T12:00:00'
    };

    const expenses = getExpenses();
    expenses.push(expense);
    saveExpenses(expenses);

    this.reset();
    document.getElementById('expenseDate').value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    showToast(`Gasto registrado: ${expense.description} - ${formatCurrency(expense.amount)}`, 'info');
    updateFinances();
    updateDashboard();
});

function deleteExpense(expenseId) {
    if (!confirm('¿Eliminar este gasto?')) return;

    const expenses = getExpenses();
    const index = expenses.findIndex(e => e.id === expenseId);
    if (index === -1) return;

    expenses.splice(index, 1);
    saveExpenses(expenses);

    showToast('Gasto eliminado', 'warning');
    updateFinances();
    updateDashboard();
}

// ===== HISTORY =====
function updateHistory() {
    const services = getServices().filter(s => s.status === 'completed');
    filterHistory();
}

function filterHistory() {
    const services = getServices().filter(s => s.status === 'completed');
    const search = (document.getElementById('historySearch').value || '').toLowerCase();
    const from = document.getElementById('historyFrom').value;
    const to = document.getElementById('historyTo').value;

    let filtered = services;

    if (search) {
        filtered = filtered.filter(s =>
            s.clientName.toLowerCase().includes(search) ||
            (s.plate && s.plate.toLowerCase().includes(search)) ||
            (s.phone && s.phone.includes(search)) ||
            s.serviceType.toLowerCase().includes(search) ||
            (s.carModel && s.carModel.toLowerCase().includes(search))
        );
    }

    if (from) {
        filtered = filtered.filter(s => new Date(s.endTime) >= new Date(from));
    }

    if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59);
        filtered = filtered.filter(s => new Date(s.endTime) <= toDate);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    document.getElementById('historyCount').textContent = filtered.length;

    const tbody = document.getElementById('historyTableBody');
    const emptyEl = document.getElementById('historyEmpty');
    const tableEl = document.getElementById('historyTable');

    if (filtered.length === 0) {
        tableEl.style.display = 'none';
        emptyEl.classList.remove('hidden');
    } else {
        tableEl.style.display = '';
        emptyEl.classList.add('hidden');

        tbody.innerHTML = filtered.map(s => `
            <tr>
                <td>
                    <div style="font-weight:600;">${formatDate(s.endTime)}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${formatTime(s.endTime)}</div>
                </td>
                <td>
                    <div style="font-weight:600; color:var(--primary); font-size: 1.05rem;">${s.carModel || 'Vehículo'}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${s.plate || 'Sin placa'}</div>
                </td>
                <td>
                    <div>${s.clientName}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${s.phone || ''}</div>
                </td>
                <td>${s.serviceType}</td>
                <td style="font-weight:700;color:var(--success);">${formatCurrency(s.price)}</td>
                <td style="color:var(--text-secondary);">${s.startTime && s.endTime ? formatDuration(s.startTime, s.endTime) : 'N/A'}</td>
            </tr>
        `).join('');
    }
}

function clearHistoryFilters() {
    document.getElementById('historySearch').value = '';
    document.getElementById('historyFrom').value = '';
    document.getElementById('historyTo').value = '';
    filterHistory();
}

// ===== SETTINGS =====
function updateSettings() {
    const config = getConfig();

    document.getElementById('businessName').value = config.businessName || '';
    document.getElementById('whatsappTemplate').value = config.whatsappTemplate || '';

    // Service types list
    const container = document.getElementById('servicesList');
    if (config.serviceTypes.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No hay servicios configurados</p>';
    } else {
        container.innerHTML = config.serviceTypes.map((s, i) => `
            <div class="service-type-item">
                <span class="service-type-name">${s.name}</span>
                <span class="service-type-price">${formatCurrency(s.price)}</span>
                <button class="btn-delete-service" onclick="deleteServiceType(${i})" title="Eliminar">
                    <span class="material-icons-round">close</span>
                </button>
            </div>
        `).join('');
    }
}

function saveBusinessName() {
    const config = getConfig();
    config.businessName = document.getElementById('businessName').value.trim();
    saveConfig(config);
    updateBusinessNameUI();
    showToast('Nombre del negocio actualizado', 'success');
}

function changePassword() {
    const config = getConfig();
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (current !== config.password) {
        showToast('Contraseña actual incorrecta', 'error');
        return;
    }

    if (newPass.length < 4) {
        showToast('La nueva contraseña debe tener al menos 4 caracteres', 'error');
        return;
    }

    if (newPass !== confirm) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }

    config.password = newPass;
    saveConfig(config);

    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    showToast('Contraseña actualizada correctamente 🔒', 'success');
}

function saveWhatsAppTemplate() {
    const config = getConfig();
    config.whatsappTemplate = document.getElementById('whatsappTemplate').value;
    saveConfig(config);
    showToast('Plantilla de WhatsApp guardada', 'success');
}

function showAddServiceModal() {
    document.getElementById('newServiceName').value = '';
    document.getElementById('newServicePrice').value = '';
    document.getElementById('addServiceModal').classList.remove('hidden');
}

function addServiceType() {
    const name = document.getElementById('newServiceName').value.trim();
    const price = parseFloat(document.getElementById('newServicePrice').value);

    if (!name) {
        showToast('Ingresa el nombre del servicio', 'error');
        return;
    }

    if (isNaN(price) || price <= 0) {
        showToast('Ingresa un precio válido', 'error');
        return;
    }

    const config = getConfig();
    config.serviceTypes.push({ name, price });
    saveConfig(config);

    closeModal('addServiceModal');
    loadServiceTypes();
    updateSettings();
    showToast(`Servicio "${name}" agregado`, 'success');
}

let currentDeleteServiceTypeIndex = null;

function deleteServiceType(index) {
    const config = getConfig();
    const serviceType = config.serviceTypes[index];

    if (!serviceType) return;

    currentDeleteServiceTypeIndex = index;

    document.getElementById('deleteServiceTypeModalInfo').innerHTML = `
        <strong>${serviceType.name}</strong><br>
        <span style="color: var(--success); font-weight: 600;">${formatCurrency(serviceType.price)}</span>
    `;

    document.getElementById('deleteServiceTypeModal').classList.remove('hidden');

    document.getElementById('confirmDeleteServiceTypeBtn').onclick = function () {
        confirmDeleteServiceType();
    };
}

function confirmDeleteServiceType() {
    if (currentDeleteServiceTypeIndex === null) return;

    const config = getConfig();
    config.serviceTypes.splice(currentDeleteServiceTypeIndex, 1);
    saveConfig(config);

    closeModal('deleteServiceTypeModal');
    loadServiceTypes();
    updateSettings();
    showToast('Servicio eliminado del menú', 'warning');

    currentDeleteServiceTypeIndex = null;
}



// ===== Modal Helpers =====
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(m => {
            m.classList.add('hidden');
        });
    }
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', initAuth);

// ===== Reset System Data =====
function resetSystemData() {
    document.getElementById('resetPasswordInput').value = '';
    document.getElementById('resetModal').classList.remove('hidden');
}

function confirmResetSystem() {
    const config = getConfig();
    const pass = document.getElementById('resetPasswordInput').value;

    if (pass === config.password) {
        localStorage.removeItem('aquawash_services');
        localStorage.removeItem('aquawash_expenses');
        localStorage.removeItem('aquawash_config');
        localStorage.removeItem('aquawash_session');
        localStorage.removeItem('aquawash_last_page');

        closeModal('resetModal');
        showToast('Sistema reseteado correctamente', 'info');

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } else {
        showToast('Contraseña incorrecta', 'error');
    }
}

// ===== EXPORT TO EXCEL =====
function exportToExcel() {
    const services = getServices().filter(s => s.status === 'completed');
    const search = (document.getElementById('historySearch').value || '').toLowerCase();
    const from = document.getElementById('historyFrom').value;
    const to = document.getElementById('historyTo').value;

    let filtered = services;

    if (search) {
        filtered = filtered.filter(s =>
            s.clientName.toLowerCase().includes(search) ||
            (s.plate && s.plate.toLowerCase().includes(search)) ||
            (s.phone && s.phone.includes(search)) ||
            s.serviceType.toLowerCase().includes(search) ||
            (s.carModel && s.carModel.toLowerCase().includes(search))
        );
    }

    if (from) {
        filtered = filtered.filter(s => new Date(s.endTime) >= new Date(from));
    }

    if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59);
        filtered = filtered.filter(s => new Date(s.endTime) <= toDate);
    }

    filtered.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    if (filtered.length === 0) {
        showToast('No hay datos para exportar', 'warning');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for UTF-8 Excel support
    csvContent += "Fecha,Hora,Vehículo,Cliente,Teléfono,Servicio,Precio,Duración,Notas\n";

    filtered.forEach(s => {
        const dateObj = new Date(s.endTime);
        const dateStr = dateObj.toLocaleDateString();
        const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const car = s.carModel ? s.carModel.replace(/,/g, ' ') : '';
        const client = s.clientName ? s.clientName.replace(/,/g, ' ') : '';
        const phone = s.phone ? s.phone.replace(/,/g, ' ') : '';
        const serv = s.serviceType ? s.serviceType.replace(/,/g, ' ') : '';
        const duration = s.startTime ? formatDuration(s.startTime, s.endTime).replace(/,/g, '') : '';
        const notes = s.notes ? s.notes.replace(/,/g, ' ').replace(/\n/g, ' ') : '';
        
        csvContent += `"${dateStr}","${timeStr}","${car}","${client}","${phone}","${serv}","${s.price}","${duration}","${notes}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_carwash_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo Excel descargado', 'success');
}

// ===== EXPORT TO PDF =====
function exportToPDF() {
    const services = getServices().filter(s => s.status === 'completed');
    const search = (document.getElementById('historySearch').value || '').toLowerCase();
    const from = document.getElementById('historyFrom').value;
    const to = document.getElementById('historyTo').value;

    let filtered = services;

    if (search) {
        filtered = filtered.filter(s =>
            s.clientName.toLowerCase().includes(search) ||
            (s.plate && s.plate.toLowerCase().includes(search)) ||
            (s.phone && s.phone.includes(search)) ||
            s.serviceType.toLowerCase().includes(search) ||
            (s.carModel && s.carModel.toLowerCase().includes(search))
        );
    }

    if (from) {
        filtered = filtered.filter(s => new Date(s.endTime) >= new Date(from));
    }

    if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59);
        filtered = filtered.filter(s => new Date(s.endTime) <= toDate);
    }

    filtered.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    if (filtered.length === 0) {
        showToast('No hay datos para exportar', 'warning');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape'); // Horizontal para que quepa bien
        
        const config = getConfig();
        const businessName = config.businessName || 'AutoShine Pro';

        doc.setFontSize(20);
        doc.text(businessName + ' - Reporte de Servicios', 14, 22);
        
        doc.setFontSize(11);
        let subtitle = 'Filtros: ';
        if (from && to) subtitle += `Desde ${from} hasta ${to}`;
        else if (from) subtitle += `Desde ${from}`;
        else if (to) subtitle += `Hasta ${to}`;
        else subtitle += 'Todos los registros históricos';
        
        doc.text(subtitle, 14, 30);

        let totalRevenue = 0;
        const tableData = filtered.map(s => {
            totalRevenue += s.price;
            const dateObj = new Date(s.endTime);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            return [
                dateStr + ' ' + timeStr,
                s.carModel || 'N/A',
                s.clientName,
                s.phone || '',
                s.serviceType,
                formatCurrency(s.price)
            ];
        });

        doc.autoTable({
            startY: 35,
            head: [['Fecha y Hora', 'Vehículo', 'Cliente', 'Teléfono', 'Servicio', 'Precio']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }, // Azul primario
            foot: [['', '', '', '', 'Total:', formatCurrency(totalRevenue)]],
            footStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255], fontStyle: 'bold' } // Verde para total
        });

        doc.save(`reporte_carwash_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Reporte PDF descargado', 'success');
    } catch (e) {
        console.error(e);
        showToast('Error al generar PDF. Refresca la página y reintenta.', 'error');
    }
}

// ===== TIRE SERVICES =====
function loadTireServiceTypes() {
    const config = getConfig();
    const tireTypes = config.tireServiceTypes || [];
    const select = document.getElementById('tireServiceType');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar...</option>';
    tireTypes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.name;
        opt.dataset.price = t.price;
        opt.textContent = `${t.name} - ${formatCurrency(t.price)}`;
        select.appendChild(opt);
    });
    // Auto-fill price on select
    select.addEventListener('change', function() {
        const selected = this.options[this.selectedIndex];
        if (selected && selected.dataset.price) {
            document.getElementById('tirePrice').value = selected.dataset.price;
        }
    });
}

// Register tire service
document.getElementById('addTireForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const serviceType = document.getElementById('tireServiceType').value;
    if (!serviceType) {
        showToast('Selecciona un tipo de servicio', 'error');
        return;
    }

    const service = {
        id: generateId(),
        category: 'tire',
        serviceType: serviceType,
        worker: document.getElementById('tireWorker').value,
        price: parseFloat(document.getElementById('tirePrice').value),
        clientName: document.getElementById('tireClientName').value.trim() || 'Cliente',
        carModel: document.getElementById('tireVehicle').value.trim(),
        notes: document.getElementById('tireNotes').value.trim(),
        status: 'active',
        startTime: new Date().toISOString(),
        endTime: null
    };

    const services = getTireServices();
    services.push(service);
    saveTireServices(services);

    this.reset();
    showToast(`Servicio de llantera registrado`, 'success');
    updateTires();
    updateDashboard();
});

function updateTires() {
    const services = getTireServices().filter(s => s.status === 'active');
    const container = document.getElementById('activeTireServicesList');
    const countEl = document.getElementById('activeTireServicesCount');
    const badgeEl = document.getElementById('activeTiresCount');

    if (countEl) countEl.textContent = services.length;
    if (badgeEl) badgeEl.textContent = services.length;

    if (!container) return;

    if (services.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round">tire_repair</span>
                <p>No hay servicios activos de llantera</p>
                <small>Registra un nuevo servicio arriba</small>
            </div>
        `;
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="service-card" data-id="${service.id}">
            <div class="service-card-icon" style="background: rgba(255,152,0,0.12); color: #ff9800;">
                <span class="material-icons-round">tire_repair</span>
            </div>
            <div class="service-card-info">
                <div class="service-card-name">${service.serviceType}</div>
                <div class="service-card-details">
                    <span><span class="material-icons-round">person</span> ${service.clientName || 'Cliente'}</span>
                    ${service.carModel ? `<span><span class="material-icons-round">directions_car</span> ${service.carModel}</span>` : ''}
                    <span><span class="material-icons-round">attach_money</span> ${formatCurrency(service.price)}</span>
                    ${service.worker ? `<span><span class="material-icons-round">badge</span> ${service.worker}</span>` : ''}
                </div>
                <div class="service-card-time elapsed-time" data-start="${service.startTime}">
                    <span class="material-icons-round">schedule</span>
                    ${getElapsedTime(service.startTime)} en servicio
                </div>
                ${service.notes ? `<div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted);font-style:italic;">📝 ${service.notes}</div>` : ''}
            </div>
            <div class="service-card-actions">
                <button class="btn-icon-only btn-complete" onclick="completeTireService('${service.id}')" title="Completar">
                    <span class="material-icons-round">check_circle</span>
                </button>
                <button class="btn-icon-only btn-delete" onclick="cancelTireService('${service.id}')" title="Cancelar">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

function completeTireService(serviceId) {
    const services = getTireServices();
    const idx = services.findIndex(s => s.id === serviceId);
    if (idx === -1) return;

    services[idx].status = 'completed';
    services[idx].endTime = new Date().toISOString();
    saveTireServices(services);

    showToast(`Servicio de llantera completado ✅`, 'success');
    updateTires();
    updateDashboard();
}

function cancelTireService(serviceId) {
    if (!confirm('¿Cancelar este servicio de llantera?')) return;
    const services = getTireServices();
    const idx = services.findIndex(s => s.id === serviceId);
    if (idx === -1) return;

    services.splice(idx, 1);
    saveTireServices(services);

    showToast('Servicio de llantera cancelado', 'warning');
    updateTires();
    updateDashboard();
}

// ===== WORKERS =====
function loadWorkerSelects() {
    const config = getConfig();
    const workers = config.workers || [];
    const selects = [
        document.getElementById('serviceWorker'),
        document.getElementById('tireWorker')
    ];

    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Sin asignar</option>';
        workers.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            select.appendChild(opt);
        });
    });
}

function addWorker() {
    const input = document.getElementById('newWorkerName');
    const name = input.value.trim();
    if (!name) {
        showToast('Ingresa el nombre del trabajador', 'error');
        return;
    }

    const config = getConfig();
    if (!config.workers) config.workers = [];
    if (config.workers.includes(name)) {
        showToast('Ese trabajador ya existe', 'warning');
        return;
    }

    config.workers.push(name);
    saveConfig(config);
    input.value = '';

    loadWorkerSelects();
    updateSettings();
    showToast(`Trabajador "${name}" agregado`, 'success');
}

function deleteWorker(index) {
    if (!confirm('¿Eliminar este trabajador?')) return;
    const config = getConfig();
    config.workers.splice(index, 1);
    saveConfig(config);
    loadWorkerSelects();
    updateSettings();
    showToast('Trabajador eliminado', 'warning');
}

// ===== TIRE SERVICE TYPES MANAGEMENT =====
function showAddTireServiceModal() {
    // Reuse existing add service modal with different context
    document.getElementById('newServiceName').value = '';
    document.getElementById('newServicePrice').value = '';
    document.getElementById('addServiceModal').classList.remove('hidden');
    // Temporarily change the add button behavior
    document.getElementById('addServiceModal').dataset.context = 'tire';
    document.querySelector('#addServiceModal .modal-header h3').innerHTML = '<span class="material-icons-round">tire_repair</span> Agregar Servicio de Llantera';
}

// Override addServiceType to handle both contexts
const originalAddServiceType = typeof addServiceType !== 'undefined' ? addServiceType : null;

function addServiceType() {
    const name = document.getElementById('newServiceName').value.trim();
    const price = parseFloat(document.getElementById('newServicePrice').value);

    if (!name) {
        showToast('Ingresa el nombre del servicio', 'error');
        return;
    }
    if (isNaN(price) || price <= 0) {
        showToast('Ingresa un precio válido', 'error');
        return;
    }

    const config = getConfig();
    const modal = document.getElementById('addServiceModal');
    const context = modal.dataset.context;

    if (context === 'tire') {
        if (!config.tireServiceTypes) config.tireServiceTypes = [];
        config.tireServiceTypes.push({ name, price });
        modal.dataset.context = '';
        // Restore header
        document.querySelector('#addServiceModal .modal-header h3').innerHTML = '<span class="material-icons-round">add_circle</span> Agregar Servicio';
    } else {
        config.serviceTypes.push({ name, price });
    }

    saveConfig(config);
    closeModal('addServiceModal');
    loadServiceTypes();
    loadTireServiceTypes();
    updateSettings();
    showToast(`Servicio "${name}" agregado`, 'success');
}

function deleteTireServiceType(index) {
    if (!confirm('¿Eliminar este servicio de llantera?')) return;
    const config = getConfig();
    config.tireServiceTypes.splice(index, 1);
    saveConfig(config);
    loadTireServiceTypes();
    updateSettings();
    showToast('Servicio de llantera eliminado', 'warning');
}

// ===== HISTORY TYPE FILTER =====
let currentHistoryType = 'all';

function setHistoryType(type) {
    currentHistoryType = type;
    document.querySelectorAll('[data-history-type]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.historyType === type);
    });
    filterHistory();
}

// ===== UPDATE initApp to load tire types and workers =====
const _originalInitApp = initApp;
initApp = function() {
    _originalInitApp();
    loadTireServiceTypes();
    loadWorkerSelects();
    updateTires();
};
