const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const exportFunc = `
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

    let csvContent = "data:text/csv;charset=utf-8,\\uFEFF"; // BOM for UTF-8 Excel support
    csvContent += "Fecha,Hora,Vehículo,Placa,Cliente,Teléfono,Servicio,Precio,Duración,Notas\\n";

    filtered.forEach(s => {
        const dateObj = new Date(s.endTime);
        const dateStr = dateObj.toLocaleDateString();
        const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const car = s.carModel ? s.carModel.replace(/,/g, ' ') : '';
        const plate = s.plate ? s.plate.replace(/,/g, ' ') : '';
        const client = s.clientName ? s.clientName.replace(/,/g, ' ') : '';
        const phone = s.phone ? s.phone.replace(/,/g, ' ') : '';
        const serv = s.serviceType ? s.serviceType.replace(/,/g, ' ') : '';
        const duration = s.startTime ? formatDuration(s.startTime, s.endTime).replace(/,/g, '') : '';
        const notes = s.notes ? s.notes.replace(/,/g, ' ').replace(/\\n/g, ' ') : '';
        
        csvContent += \`"\${dateStr}","\${timeStr}","\${car}","\${plate}","\${client}","\${phone}","\${serv}","\${s.price}","\${duration}","\${notes}"\\n\`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`historial_carwash_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo Excel descargado', 'success');
}
`;

c += exportFunc;
fs.writeFileSync('app.js', c, 'utf8');
console.log('Added exportToExcel');
