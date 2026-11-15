const fs = require('fs');

let c = fs.readFileSync('app.js', 'utf8');

c = c.replace(/csvContent \+= "Fecha,Hora,Vehículo,Placa,Cliente,Teléfono,Servicio,Precio,Duración,Notas\\\\n";/, 'csvContent += "Fecha,Hora,Vehículo,Cliente,Teléfono,Servicio,Precio,Duración,Notas\\\\n";');

c = c.replace(/const plate = s\.plate \? s\.plate\.replace\(\/,\\/g, ' '\) : '';\s*const client/, 'const client');

c = c.replace(/\\"\$\{dateStr\}\\",\\"\$\{timeStr\}\\",\\"\$\{car\}\\",\\"\$\{plate\}\\",\\"\$\{client\}\\"/, '\\"\\${dateStr}\\",\\"\\${timeStr}\\",\\"\\${car}\\",\\"\\${client}\\"');

c = c.replace(/return \[\s*dateStr \+ ' ' \+ timeStr,\s*s\.carModel \|\| 'N\/A',\s*s\.plate \|\| '',\s*s\.clientName,/, `return [
                dateStr + ' ' + timeStr,
                s.carModel || 'N/A',
                s.clientName,`);

c = c.replace(/head: \[\['Fecha y Hora', 'Vehículo', 'Placa', 'Cliente', 'Teléfono', 'Servicio', 'Precio'\]\],/, `head: [['Fecha y Hora', 'Vehículo', 'Cliente', 'Teléfono', 'Servicio', 'Precio']],`);

c = c.replace(/foot: \[\['', '', '', '', '', 'Total:', formatCurrency\(totalRevenue\)\]\],/, `foot: [['', '', '', '', 'Total:', formatCurrency(totalRevenue)]],`);

fs.writeFileSync('app.js', c, 'utf8');
console.log('Removed Placa from exports');
