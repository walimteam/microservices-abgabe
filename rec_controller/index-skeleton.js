var mqtt = require('mqtt');
var Topic = 'SWS/#'; //subscribe to all topics from postapp



//var client  = mqtt.connect('mqtt://127.0.0.1');
var client = mqtt.connect('mqtt://mqtt-broker');

//var client  = mqtt.connect('mqtt://localhost:1883');

//client.on('connect', mqtt_connect);
/*client.on('connect', () => {
    console.log('Verbunden mit dem MQTT-Broker');

    // Testnachricht senden
    client.publish('drone/test', 'Verbindungstest erfolgreich');
    console.log('Testnachricht wurde gesendet');
});*/
/*
client.on('connect', () => {
    console.log('Verbindung erfolgreich hergestellt');
    client.publish('test/topic', 'Verbindungstest');
    console.log('Testnachricht gesendet');
});*/

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
}

function mqtt_close(err)
{
	console.log("Close MQTT");
    if (err) {console.log(err);}
}