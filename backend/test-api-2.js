const http = require('http');

http.get('http://localhost:3001/asistencias/reporte/ausencias?fechaInicio=2026-06-03&fechaFin=2026-06-03', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const json = JSON.parse(data);
    if (json.registros) {
       console.log('Registros count today:', json.registros.length);
    } else {
       console.log(json);
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
