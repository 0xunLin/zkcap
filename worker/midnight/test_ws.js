import WebSocket from 'ws';
const ws = new WebSocket('ws://127.0.0.1:8088/api/v1/graphql/ws');
ws.on('open', () => { console.log('v1 open'); ws.close(); });
ws.on('error', (e) => console.log('v1 error', e.message));

const ws4 = new WebSocket('ws://127.0.0.1:8088/api/v4/v1/graphql/ws');
ws4.on('open', () => { console.log('v4 open'); ws4.close(); });
ws4.on('error', (e) => console.log('v4 error', e.message));
