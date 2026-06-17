import https from 'https';

const data = JSON.stringify({
  name: 'Test Name',
  phone: '252611234567',
  gender: 'male',
  email: 'test' + Math.random() + '@example.com',
  password: 'Password123!'
});

const options = {
  hostname: 'baafin.onrender.com',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
