const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testExercises() {
    try {
        console.log('🔐 Fazendo login como paciente...\n');

        // 1. Login
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'paciente@teste.com',
            password: 'senha123'
        });

        const token = loginResponse.data.access_token;
        console.log('✅ Login realizado com sucesso!');
        console.log(`Token: ${token.substring(0, 50)}...\n`);

        // 2. Buscar todas as listas de exercícios
        console.log('📋 Buscando listas de exercícios disponíveis...\n');
        const listsResponse = await axios.get(`${API_URL}/exercise-lists`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const lists = listsResponse.data;
        console.log(`✅ Encontradas ${lists.length} lista(s) de exercícios:\n`);

        // 3. Para cada lista, mostrar os exercícios
        for (const list of lists) {
            console.log('─'.repeat(60));
            console.log(`📚 Lista: ${list.title}`);
            console.log(`   ID: ${list.id}`);
            console.log(`   Tipo: ${list.diffType?.description || 'N/A'}`);
            console.log(`   Dificuldade: ${list.difficultyLevel}`);
            console.log(`   Médico: ${list.doctor?.name || 'N/A'}`);

            if (list.items && list.items.length > 0) {
                console.log(`\n   Exercícios (${list.items.length}):`);
                list.items
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .forEach((item, index) => {
                        console.log(`   ${index + 1}. ${item.exercise?.text || 'N/A'}`);
                    });
            } else {
                console.log('   ⚠️  Nenhum exercício encontrado nesta lista');
            }
            console.log('');
        }

        // 4. Buscar detalhes de uma lista específica (se houver)
        if (lists.length > 0) {
            const firstListId = lists[0].id;
            console.log('─'.repeat(60));
            console.log(`\n🔍 Buscando detalhes da primeira lista (ID: ${firstListId})...\n`);

            const detailResponse = await axios.get(`${API_URL}/exercise-lists/${firstListId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const detail = detailResponse.data;
            console.log('📝 Detalhes completos:');
            console.log(JSON.stringify(detail, null, 2));
        }

    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testExercises();

