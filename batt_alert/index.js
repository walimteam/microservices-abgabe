const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://mqtt-broker');

client.on('connect', () => {
    client.subscribe('batt/alert', (err) => {
        if (err) {
            console.error('Fehler beim Abonnieren des Topics:', err);
        } else {
            console.log('Abonniert: batt/alert');
        }
    });
});

client.on('message', (topic, message) => {
    console.log(`Alert empfangen von ${topic}: ${message.toString()}`);
});
