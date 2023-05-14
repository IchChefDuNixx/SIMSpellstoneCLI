const http = require('http');
const script = require("C:\\Users\\Felix\\Desktop\\SIMSpellstoneCLI\\dist\\simulator_stripped.min.js");

const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Parse the URL to get the parameters
  const urlParams = new URL(req.url, `http://${hostname}:${port}`).searchParams;
  const deck1 = urlParams.get('deck1');
  const deck2 = urlParams.get('deck2');
  const use_tower = urlParams.get('use_tower') === 'true'; // Convert to boolean
  const bges = urlParams.get('bges');
  const numsims = parseInt(urlParams.get('numsims')) || 999; // Convert to number, default to 999 if not provided

  try {
    const result = script.startsim(deck1, deck2, use_tower, bges, numsims);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Simulation result: ${JSON.stringify(result)}`);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`Error executing script: ${port}:${err}`);
    return;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
