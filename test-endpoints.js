
const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
    const endpoints = [
        '/api/salons/featured',
        '/api/salons/approved',
        '/api/salons/approved?openNow=true',
        '/api/salons/approved?offersMobile=true'
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await fetch(`${BASE_URL}${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                const count = Array.isArray(data) ? data.length : (data.salons ? data.salons.length : 'unknown');
                console.log(`✅ ${endpoint}: ${count} items`);
            } else {
                console.log(`❌ ${endpoint}: Failed with status ${res.status}`);
            }
        } catch (e) {
            console.log(`❌ ${endpoint}: Error - ${e.message}`);
        }
    }
}

testEndpoints();
