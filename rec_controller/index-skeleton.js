const mongoose = require('mongoose');
require('dotenv').config();
var mqtt = require('mqtt');
var Topic = 'SWS/#'; //subscribe to all topics from postapp



const dbUser = process.env.MONGO_USER || '';
const dbPass = process.env.MONGO_PASS || '';
const dbHost = process.env.MONGO_HOST || 'localhost';
const dbPort = process.env.MONGO_PORT || '27017';
const dbName = process.env.MONGO_DB || 'rec_data';

console.log('MongoDB-Verbindung wird hergestellt:', dbHost, dbPort, dbName);
console.log('User und Passwort:', dbUser, dbPass);

const dbUrl = dbUser && dbPass
    ? `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`
    : `mongodb://${dbHost}:${dbPort}/${dbName}`;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB-Verbindung hergestellt');
}).catch((err) => {
    console.error('Fehler bei der Verbindung zu MongoDB:', err);
});

const vehicleSchema = new mongoose.Schema({
    timestamp: String,
    locid: String,
    gpslatitude: Number,
    gpslongitude: Number,
    km_since_start: Number,
    km_since_pickup: Number,
    time_since_pickup: Number,
    delivered: Boolean,
    battery_level: Number
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

//var client  = mqtt.connect('mqtt://127.0.0.1');
var client = mqtt.connect('mqtt://mqtt-broker');

//var client  = mqtt.connect('mqtt://localhost:1883');


client.on('connect', () => {
    console.log('Receiver: Verbindung erfolgreich hergestellt');
    client.subscribe(Topic, (err) => {
        if (err) {
            console.error('Receiver: Fehler beim Abonnieren des Topics:', err);
        } else {
            console.log('Receiver: Erfolgreich abonniert:', Topic);
        }
    });
});


client.on('error', (err) => {
    console.error('Fehler bei der MQTT-Verbindung:', err);
});

client.on('reconnect', mqtt_reconnect);
//client.on('error', mqtt_error);
client.on('message', mqtt_messsageReceived);
client.on('close', mqtt_close);

function mqtt_connect()
{
    console.log("Connecting MQTT");
    client.subscribe(Topic, mqtt_subscribe);
}

function mqtt_subscribe(err, granted)
{
    console.log("Subscribed to " + Topic);
    if (err) {console.log(err);}
}

function mqtt_reconnect(err)
{
    console.log("Reconnect MQTT");
    if (err) {console.log(err);}
}

function mqtt_error(err)
{
    console.log("Error!");
	if (err) {console.log(err);}
}

function after_publish()
{
	//do nothing
}

function mqtt_messsageReceived(topic, message, packet)
{
    console.log('Topic=' +  topic + '  Message=' + message);
    const data = JSON.parse(message.toString());

    const vehicleEntry = new Vehicle(data);
    vehicleEntry.save()
        .then(() => {
            console.log('Daten in MongoDB gespeichert');
        })
        .catch((err) => {
            console.error('Fehler beim Speichern der Daten:', err);
        });

    // Prüfen des Batteriestands und Senden eines Alerts
    if (data.battery_level !== undefined && data.battery_level < 30) {
        client.publish('batt/alert', `Battery level low: ${data.battery_level}%`);
        console.log(`Battery Alert gesendet: ${data.battery_level}%`);
    }
}

function mqtt_close(err)
{
	console.log("Close MQTT");
    if (err) {console.log(err);}
}