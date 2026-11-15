const fs = require('fs');
let c = fs.readFileSync('app.js', 'utf8');

const exportFunc = `
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
        if (from && to) subtitle += \`Desde \${from} hasta \${to}\`;
        else if (from) subtitle += \`Desde \${from}\`;
        else if (to) subtitle += \`Hasta \${to}\`;
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
                s.plate || '',
                s.clientName,
                s.phone || '',
                s.serviceType,
                formatCurrency(s.price)
            ];
        });

        doc.autoTable({
            startY: 35,
            head: [['Fecha y Hora', 'Vehículo', 'Placa', 'Cliente', 'Teléfono', 'Servicio', 'Precio']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [33, 150, 243] }, // Azul primario
            foot: [['', '', '', '', '', 'Total:', formatCurrency(totalRevenue)]],
            footStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255], fontStyle: 'bold' } // Verde para total
        });

        doc.save(\`reporte_carwash_\${new Date().toISOString().split('T')[0]}.pdf\`);
        showToast('Reporte PDF descargado', 'success');
    } catch (e) {
        console.error(e);
        showToast('Error al generar PDF. Refresca la página y reintenta.', 'error');
    }
}
`;

c += exportFunc;
fs.writeFileSync('app.js', c, 'utf8');
console.log('Added exportToPDF');
