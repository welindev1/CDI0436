const http = require('http');

http.get('http://localhost:3001/asistencias/reporte/ausencias?fechaInicio=2026-06-01&fechaFin=2026-06-30', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const json = JSON.parse(data);
    if (json.registros) {
       console.log('Registros count:', json.registros.length);
       if (json.registros.length > 0) {
         console.log('First:', json.registros[0]);
       }
    } else {
       console.log(json);
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
