const http = require('http');

const endpoints = [
    '/api/public/sectores',
    '/api/public/totales',
    '/api/public/municipios'
];

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`\n--- Response from ${path} ---`);
                console.log(`Status Code: ${res.statusCode}`);
                try {
                    const parsedData = JSON.parse(data);
                    // Print only first 2 items if array to avoid flooding output
                    if (Array.isArray(parsedData)) {
                        console.log('Result (first 2 items):', JSON.stringify(parsedData.slice(0, 2), null, 2));
                        console.log(`Total items: ${parsedData.length}`);
                    } else {
                        console.log('Result:', JSON.stringify(parsedData, null, 2));
                    }
                } catch (e) {
                    console.log('Raw Response:', data);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`Error requesting ${path}:`, error.message);
            resolve(); // Resolve anyway to continue
        });

        req.end();
    });
}

async function runTests() {
    console.log('Starting verification...');
    // Wait a bit for server to be ready if it was just started (though it should be running)
    await new Promise(resolve => setTimeout(resolve, 2000));

    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
    console.log('\nVerification complete.');
}

runTests();
