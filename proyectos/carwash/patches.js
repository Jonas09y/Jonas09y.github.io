// This script patches the updateSettings, filterHistory, exportToExcel, exportToPDF
// Run this in the browser console or append to app.js

// ===== PATCH: updateSettings to show tire services + workers =====
const _origUpdateSettings = updateSettings;
updateSettings = function() {
    _origUpdateSettings();
    const config = getConfig();

    // Tire service types list
    const tireContainer = document.getElementById('tireServicesList');
    if (tireContainer) {
        const tireTypes = config.tireServiceTypes || [];
        if (tireTypes.length === 0) {
            tireContainer.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No hay servicios de llantera</p>';
        } else {
            tireContainer.innerHTML = tireTypes.map((s, i) => `
                <div class="service-type-item">
                    <span class="service-type-name">${s.name}</span>
                    <span class="service-type-price">${formatCurrency(s.price)}</span>
                    <button class="btn-delete-service" onclick="deleteTireServiceType(${i})" title="Eliminar">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
            `).join('');
        }
    }

    // Workers list
    const workersContainer = document.getElementById('workersList');
    if (workersContainer) {
        const workers = config.workers || [];
        if (workers.length === 0) {
            workersContainer.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No hay trabajadores registrados</p>';
        } else {
            workersContainer.innerHTML = workers.map((w, i) => `
                <div class="service-type-item">
                    <span class="service-type-name"><span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:0.25rem;">person</span> ${w}</span>
                    <button class="btn-delete-service" onclick="deleteWorker(${i})" title="Eliminar">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
            `).join('');
        }
    }
};

// ===== PATCH: filterHistory to include tire services + type/worker columns =====
const _origFilterHistory = filterHistory;
filterHistory = function() {
    // Get carwash completed services
    const carwashServices = getServices().filter(s => s.status === 'completed').map(s => ({...s, category: s.category || 'carwash'}));
    // Get tire completed services
    const tireServices = getTireServices().filter(s => s.status === 'completed').map(s => ({...s, category: 'tire'}));
    
    // Combine
    let allServices = [...carwashServices, ...tireServices];

    // Filter by type
    if (typeof currentHistoryType !== 'undefined' && currentHistoryType !== 'all') {
        allServices = allServices.filter(s => s.category === currentHistoryType);
    }

    const search = (document.getElementById('historySearch').value || '').toLowerCase();
    const from = document.getElementById('historyFrom').value;
    const to = document.getElementById('historyTo').value;

    let filtered = allServices;

    if (search) {
        filtered = filtered.filter(s =>
            (s.clientName && s.clientName.toLowerCase().includes(search)) ||
            (s.phone && s.phone.includes(search)) ||
            (s.serviceType && s.serviceType.toLowerCase().includes(search)) ||
            (s.carModel && s.carModel.toLowerCase().includes(search)) ||
            (s.worker && s.worker.toLowerCase().includes(search))
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
                    <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.7rem;font-weight:700;color:white;background:${s.category === 'tire' ? '#ff9800' : 'var(--primary)'};">
                        ${s.category === 'tire' ? '🔧 Llantera' : '🚗 Carwash'}
                    </span>
                </td>
                <td>
                    <div style="font-weight:600;">${formatDate(s.endTime)}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${formatTime(s.endTime)}</div>
                </td>
                <td>
                    <div style="font-weight:600; color:var(--primary); font-size: 1.05rem;">${s.carModel || 'N/A'}</div>
                </td>
                <td>
                    <div>${s.clientName || 'Cliente'}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${s.phone || ''}</div>
                </td>
                <td>${s.serviceType}</td>
                <td>${s.worker || '<span style="color:var(--text-muted);">-</span>'}</td>
                <td style="font-weight:700;color:var(--success);">${formatCurrency(s.price)}</td>
                <td style="color:var(--text-secondary);">${s.startTime && s.endTime ? formatDuration(s.startTime, s.endTime) : 'N/A'}</td>
            </tr>
        `).join('');
    }
};

// ===== PATCH: updateDashboard to show tire services too =====
const _origUpdateDashboard = updateDashboard;
updateDashboard = function() {
    _origUpdateDashboard();
    
    // Update tire badge count
    const tireActive = getTireServices().filter(s => s.status === 'active');
    const tireBadge = document.getElementById('activeTiresCount');
    if (tireBadge) tireBadge.textContent = tireActive.length;
    
    // Add tire income to today's stats
    const tireCompletedToday = getTireServices().filter(s => s.status === 'completed' && isToday(s.endTime));
    const tireIncome = tireCompletedToday.reduce((sum, s) => sum + s.price, 0);
    
    if (tireIncome > 0) {
        const carwashServices = getServices();
        const todayCarwash = carwashServices.filter(s => s.status === 'completed' && isToday(s.endTime));
        const carwashIncome = todayCarwash.reduce((sum, s) => sum + s.price, 0);
        const expenses = getExpenses().filter(e => isToday(e.date));
        const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncome = carwashIncome + tireIncome;
        const net = totalIncome - expenseTotal;
        
        document.getElementById('statTodayIncome').textContent = formatCurrency(totalIncome);
        document.getElementById('statTodayNet').textContent = formatCurrency(net);
        document.getElementById('statTodayNet').style.color = net >= 0 ? 'var(--success)' : 'var(--danger)';
    }
};

// ===== PATCH: exportToExcel to include tire services + new columns =====
const _origExportToExcel = exportToExcel;
exportToExcel = function() {
    const carwashServices = getServices().filter(s => s.status === 'completed').map(s => ({...s, category: s.category || 'carwash'}));
    const tireServices = getTireServices().filter(s => s.status === 'completed').map(s => ({...s, category: 'tire'}));
    let allServices = [...carwashServices, ...tireServices];

    if (typeof currentHistoryType !== 'undefined' && currentHistoryType !== 'all') {
        allServices = allServices.filter(s => s.category === currentHistoryType);
    }

    const search = (document.getElementById('historySearch').value || '').toLowerCase();
    const from = document.getElementById('historyFrom').value;
    const to = document.getElementById('historyTo').value;

    let filtered = allServices;
    if (search) {
        filtered = filtered.filter(s =>
            (s.clientName && s.clientName.toLowerCase().includes(search)) ||
            (s.phone && s.phone.includes(search)) ||
            (s.serviceType && s.serviceType.toLowerCase().includes(search)) ||
            (s.carModel && s.carModel.toLowerCase().includes(search)) ||
            (s.worker && s.worker.toLowerCase().includes(search))
        );
    }
    if (from) filtered = filtered.filter(s => new Date(s.endTime) >= new Date(from));
    if (to) {
        const toDate = new Date(to); toDate.setHours(23,59,59);
        filtered = filtered.filter(s => new Date(s.endTime) <= toDate);
    }
    filtered.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    if (filtered.length === 0) { showToast('No hay datos para exportar', 'warning'); return; }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Tipo,Fecha,Hora,Vehículo,Cliente,Teléfono,Servicio,Trabajador,Precio,Duración,Notas\n";

    filtered.forEach(s => {
        const dateObj = new Date(s.endTime);
        const tipo = s.category === 'tire' ? 'Llantera' : 'Carwash';
        const dateStr = dateObj.toLocaleDateString();
        const timeStr = dateObj.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        const car = s.carModel ? s.carModel.replace(/,/g,' ') : '';
        const client = s.clientName ? s.clientName.replace(/,/g,' ') : '';
        const phone = s.phone ? s.phone.replace(/,/g,' ') : '';
        const serv = s.serviceType ? s.serviceType.replace(/,/g,' ') : '';
        const worker = s.worker ? s.worker.replace(/,/g,' ') : '';
        const duration = s.startTime ? formatDuration(s.startTime, s.endTime).replace(/,/g,'') : '';
        const notes = s.notes ? s.notes.replace(/,/g,' ').replace(/\n/g,' ') : '';
        csvContent += `"${tipo}","${dateStr}","${timeStr}","${car}","${client}","${phone}","${serv}","${worker}","${s.price}","${duration}","${notes}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_completo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo Excel descargado', 'success');
};

// ===== PATCH: exportToPDF to include tire services + new columns =====
const _origExportToPDF = exportToPDF;
exportToPDF = function() {
    const carwashServices = getServices().filter(s => s.status === 'completed').map(s => ({...s, category: s.category || 'carwash'}));
    const tireServices = getTireServices().filter(s => s.status === 'completed').map(s => ({...s, category: 'tire'}));
    let allServices = [...carwashServices, ...tireServices];

    if (typeof currentHistoryType !== 'undefined' && currentHistoryType !== 'all') {
        allServices = allServices.filter(s => s.category === currentHistoryType);
    }

    const search = (document.getElementById('historySearch').value || '').toLowerCase();
    const from = document.getElementById('historyFrom').value;
    const to = document.getElementById('historyTo').value;

    let filtered = allServices;
    if (search) {
        filtered = filtered.filter(s =>
            (s.clientName && s.clientName.toLowerCase().includes(search)) ||
            (s.phone && s.phone.includes(search)) ||
            (s.serviceType && s.serviceType.toLowerCase().includes(search)) ||
            (s.carModel && s.carModel.toLowerCase().includes(search)) ||
            (s.worker && s.worker.toLowerCase().includes(search))
        );
    }
    if (from) filtered = filtered.filter(s => new Date(s.endTime) >= new Date(from));
    if (to) {
        const toDate = new Date(to); toDate.setHours(23,59,59);
        filtered = filtered.filter(s => new Date(s.endTime) <= toDate);
    }
    filtered.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    if (filtered.length === 0) { showToast('No hay datos para exportar', 'warning'); return; }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        const config = getConfig();
        const businessName = config.businessName || 'AutoShine Pro';

        doc.setFontSize(20);
        doc.text(businessName + ' - Reporte Completo', 14, 22);

        doc.setFontSize(11);
        let subtitle = 'Filtros: ';
        if (from && to) subtitle += `Desde ${from} hasta ${to}`;
        else if (from) subtitle += `Desde ${from}`;
        else if (to) subtitle += `Hasta ${to}`;
        else subtitle += 'Todos los registros';
        if (typeof currentHistoryType !== 'undefined' && currentHistoryType !== 'all') {
            subtitle += ` | Tipo: ${currentHistoryType === 'tire' ? 'Llantera' : 'Carwash'}`;
        }
        doc.text(subtitle, 14, 30);

        let totalRevenue = 0;
        const tableData = filtered.map(s => {
            totalRevenue += s.price;
            const dateObj = new Date(s.endTime);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
            return [
                s.category === 'tire' ? 'Llantera' : 'Carwash',
                dateStr + ' ' + timeStr,
                s.carModel || 'N/A',
                s.clientName || 'Cliente',
                s.serviceType,
                s.worker || '-',
                formatCurrency(s.price)
            ];
        });

        doc.autoTable({
            startY: 35,
            head: [['Tipo', 'Fecha', 'Vehículo', 'Cliente', 'Servicio', 'Trabajador', 'Precio']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] },
            foot: [['', '', '', '', '', 'Total:', formatCurrency(totalRevenue)]],
            footStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255], fontStyle: 'bold' }
        });

        doc.save(`reporte_completo_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast('Reporte PDF descargado', 'success');
    } catch (e) {
        console.error(e);
        showToast('Error al generar PDF', 'error');
    }
};

// ===== PATCH: resetSystemData to also clear tire services =====
const _origConfirmReset = confirmResetSystem;
confirmResetSystem = function() {
    const config = getConfig();
    const pass = document.getElementById('resetPasswordInput').value;
    if (pass === config.password) {
        localStorage.removeItem('aquawash_services');
        localStorage.removeItem('aquawash_tire_services');
        localStorage.removeItem('aquawash_expenses');
        localStorage.removeItem('aquawash_config');
        localStorage.removeItem('aquawash_session');
        localStorage.removeItem('aquawash_last_page');
        closeModal('resetModal');
        showToast('Sistema reseteado correctamente', 'info');
        setTimeout(() => { window.location.reload(); }, 1500);
    } else {
        showToast('Contraseña incorrecta', 'error');
    }
};

// ===== ASSIGN WORKER - Using Modal =====
let _assignWorkerTarget = null; // { type: 'carwash'|'tire', serviceId: string }

function assignWorkerCarwash(serviceId) {
    _assignWorkerTarget = { type: 'carwash', serviceId };
    showAssignWorkerModal(serviceId, 'carwash');
}

function assignWorkerTire(serviceId) {
    _assignWorkerTarget = { type: 'tire', serviceId };
    showAssignWorkerModal(serviceId, 'tire');
}

function showAssignWorkerModal(serviceId, type) {
    const config = getConfig();
    const workers = config.workers || [];

    // Get service info
    let service;
    if (type === 'carwash') {
        service = getServices().find(s => s.id === serviceId);
    } else {
        service = getTireServices().find(s => s.id === serviceId);
    }

    if (!service) return;

    // Set info text
    const infoEl = document.getElementById('assignWorkerInfo');
    infoEl.innerHTML = `
        <span style="color:var(--text-secondary);">Servicio:</span> ${service.serviceType}<br>
        ${service.clientName ? `<span style="color:var(--text-secondary);">Cliente:</span> ${service.clientName}` : ''}
    `;

    // Build worker buttons
    const container = document.getElementById('workerButtonsList');

    if (workers.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:1rem;color:var(--text-muted);">
                <span class="material-icons-round" style="font-size:2rem;display:block;margin-bottom:0.5rem;">person_off</span>
                No hay trabajadores registrados.<br>
                <small>Ve a <strong>Configuración → Trabajadores</strong> para agregar.</small>
            </div>
        `;
    } else {
        container.innerHTML = workers.map(w => `
            <button class="btn btn-full" onclick="confirmAssignWorker('${w.replace(/'/g, "\\'")}')" 
                style="justify-content:flex-start; gap:0.75rem; padding:0.85rem 1.2rem; background:white; border:2px solid #e0e0e0; color:#333; font-weight:600; font-size:0.95rem; border-radius:12px; cursor:pointer; transition: all 0.2s;">
                <span class="material-icons-round" style="color:#ff9800;">person</span>
                ${w}
                ${service.worker === w ? '<span style="margin-left:auto;color:#4caf50;"><span class="material-icons-round">check_circle</span></span>' : ''}
            </button>
        `).join('');
    }

    document.getElementById('assignWorkerModal').classList.remove('hidden');
}

function confirmAssignWorker(workerName) {
    if (!_assignWorkerTarget) return;

    const { type, serviceId } = _assignWorkerTarget;

    if (type === 'carwash') {
        const services = getServices();
        const idx = services.findIndex(s => s.id === serviceId);
        if (idx !== -1) {
            services[idx].worker = workerName;
            saveServices(services);
        }
        updateReception();
    } else {
        const services = getTireServices();
        const idx = services.findIndex(s => s.id === serviceId);
        if (idx !== -1) {
            services[idx].worker = workerName;
            saveTireServices(services);
        }
        updateTires();
    }

    closeModal('assignWorkerModal');
    showToast(`Trabajador "${workerName}" asignado ✅`, 'success');
    _assignWorkerTarget = null;
}

// ===== PATCH: updateReception to show worker assign button =====
const _origUpdateReception = updateReception;
updateReception = function() {
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
                    ${service.worker ? `<span style="color:#ff9800;font-weight:600;"><span class="material-icons-round">badge</span> ${service.worker}</span>` : '<span style="color:var(--text-muted);font-style:italic;"><span class="material-icons-round">badge</span> Sin asignar</span>'}
                </div>
                <div class="service-card-time elapsed-time" data-start="${service.startTime}">
                    <span class="material-icons-round">schedule</span>
                    ${getElapsedTime(service.startTime)} en servicio
                </div>
                ${service.notes ? `<div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted);font-style:italic;">📝 ${service.notes}</div>` : ''}
            </div>
            <div class="service-card-actions">
                <button class="btn-icon-only" onclick="assignWorkerCarwash('${service.id}')" title="Asignar trabajador" style="background:rgba(255,152,0,0.12);color:#ff9800;">
                    <span class="material-icons-round">badge</span>
                </button>
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
};

// ===== PATCH: updateTires to show worker assign button =====
const _origUpdateTires = updateTires;
updateTires = function() {
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
                    ${service.worker ? `<span style="color:#ff9800;font-weight:600;"><span class="material-icons-round">badge</span> ${service.worker}</span>` : '<span style="color:var(--text-muted);font-style:italic;"><span class="material-icons-round">badge</span> Sin asignar</span>'}
                </div>
                <div class="service-card-time elapsed-time" data-start="${service.startTime}">
                    <span class="material-icons-round">schedule</span>
                    ${getElapsedTime(service.startTime)} en servicio
                </div>
                ${service.notes ? `<div style="margin-top:4px;font-size:0.75rem;color:var(--text-muted);font-style:italic;">📝 ${service.notes}</div>` : ''}
            </div>
            <div class="service-card-actions">
                <button class="btn-icon-only" onclick="assignWorkerTire('${service.id}')" title="Asignar trabajador" style="background:rgba(255,152,0,0.12);color:#ff9800;">
                    <span class="material-icons-round">badge</span>
                </button>
                <button class="btn-icon-only btn-complete" onclick="completeTireService('${service.id}')" title="Completar">
                    <span class="material-icons-round">check_circle</span>
                </button>
                <button class="btn-icon-only btn-delete" onclick="cancelTireService('${service.id}')" title="Cancelar">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        </div>
    `).join('');
};

// ===== FIX: Dashboard ALWAYS includes tire income =====
// Override the previous dashboard patch to always sum both
const _origUpdateDashboard2 = updateDashboard;
updateDashboard = function() {
    // Run original (which runs carwash-only dashboard)
    _origUpdateDashboard2();
    
    // Now ALWAYS recalculate with tire income included
    const tireServices = getTireServices();
    const tireActive = tireServices.filter(s => s.status === 'active');
    const tireBadge = document.getElementById('activeTiresCount');
    if (tireBadge) tireBadge.textContent = tireActive.length;

    const tireCompletedToday = tireServices.filter(s => s.status === 'completed' && isToday(s.endTime));
    const tireIncome = tireCompletedToday.reduce((sum, s) => sum + s.price, 0);

    // Always recalculate totals including both carwash + tire
    const carwashServices = getServices();
    const todayCarwash = carwashServices.filter(s => s.status === 'completed' && isToday(s.endTime));
    const carwashIncome = todayCarwash.reduce((sum, s) => sum + s.price, 0);
    const expenses = getExpenses().filter(e => isToday(e.date));
    const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = carwashIncome + tireIncome;
    const net = totalIncome - expenseTotal;

    // Update stats
    document.getElementById('statActiveCars').textContent = carwashServices.filter(s => s.status === 'active').length + tireActive.length;
    document.getElementById('statTodayIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('statTodayNet').textContent = formatCurrency(net);
    document.getElementById('statTodayNet').style.color = net >= 0 ? 'var(--success)' : 'var(--danger)';
};
