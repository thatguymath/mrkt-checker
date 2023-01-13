const fs = require('fs');

// Input data
/* const data = `
204.191.2.68	8080
`; */
//var data = JSON.parse(data2)

const data = fs.readFileSync('http_proxies.txt').toString().replace(/\r/g,'');

// Split the data into lines
const lines = data.split('\n');

// Create an empty array to store the JSON objects
const proxiesJson = [];

// Iterate over the lines
lines.forEach((line) => {
    // Split the line by the tab
    const parts = line.split(':');
    // Assign the IP to the 'host' variable and the number following it to the 'port' variable
    const protocol = 'http'
    const host = parts[0];
    const port = parts[1];
    const username = parts[2];
    const password = parts[3];
    // Create a JSON object
    const proxyJson = { protocol, host, port, auth: {username, password} };
    // Append the JSON object to the array
    proxiesJson.push(proxyJson);
});

// Write the array of JSON objects to a file
fs.writeFileSync('proxies.json', JSON.stringify(proxiesJson, null, 4));
console.log('File written successfully');