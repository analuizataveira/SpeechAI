const { createServer } = require('https');
const { readFileSync } = require('fs');
const { join } = require('path');
const serve = require('serve');

// Configuração para servir PWA com HTTPS
const options = {
    port: 3000,
    host: '0.0.0.0', // Permite acesso de outros dispositivos na rede
    cors: true,
    single: true,
    https: {
        key: readFileSync(join(__dirname, 'localhost-key.pem')),
        cert: readFileSync(join(__dirname, 'localhost.pem'))
    }
};

console.log('🚀 Servindo PWA em https://localhost:3000');
console.log('📱 Para acessar no mobile, use o IP da sua máquina');
console.log('💡 Exemplo: https://192.168.1.100:3000');

serve(join(__dirname, 'dist'), options);
