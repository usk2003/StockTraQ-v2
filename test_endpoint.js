const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'fetch_indices.py');
console.log('Script Path:', scriptPath);

const pythonProcess = spawn('python', [scriptPath]);

let dataString = '';
let errorString = '';

pythonProcess.stdout.on('data', (data) => {
  dataString += data.toString();
});

pythonProcess.stderr.on('data', (data) => {
  errorString += data.toString();
});

pythonProcess.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  if (code !== 0) {
    console.error('Error:', errorString);
  } else {
    console.log('Output:', dataString);
  }
});
