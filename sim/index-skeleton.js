// Skeleton eines simulationsprogramm um Testdaten zu erzeuge
//   das simulationsprogramm soll erweitert werden, um alle Daten die in der Aufgabenstellung
//   beschrieben sind zu erzeugen und zu senden
// change history

const express = require('express');
const app = express();

const cors = require('cors'); 
app.use(cors());

// required to handle the request body
app.use(express.json());

// add mqtt support
var mqtt    = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
//var client = mqtt.connect('mqtt://192.168.65.3:30083');

client.on('connect', () => {
  console.log('Simulation: Verbindung erfolgreich hergestellt');
});

client.on('reconnect', () => {
  console.log('Simulation: Versuche, erneut zu verbinden');
});

client.on('close', () => {
  console.log('Simulation: Verbindung geschlossen');
});

client.on('error', (err) => {
  console.error('Simulation: Fehler bei der Verbindung:', err);
});


const axios = require('axios');

// parameter für die Übermittlung der Testdaten
var timeinterval = 5;
var locid = 'dhbw1';
var simanzahl = 5;
var sensortype = 'G';
var min = 48.6;
var max = 8.6;
var value = min;
const args = process.argv.slice(2);

if (args[0] == '?') {
  console.log('arg0 = timeinterval in dem die Daten gesendet werden in sec');
  console.log('arg1 = unique id of drone - 6 stellig');
  console.log('arg2 = Anzahl der Daten in Zyklen - 2stellig');
  console.log('arg3 = identifier type of messaurement - gpsd= gps data, diss=Distanz seit Start, disp=Distanz seit Warenaufnahme, batt=Ladezustand Batterie, time=Zeit seit Warenaufnahme, delivered=Zustellung erfolgt');
  console.log('arg4 = start value');
  console.log('arg5 = end value');
  console.log('bsp =npm start 10 dhbw-1 5 gpsd 48.6 8.6');
  console.log('bsp will send every 10 sec a gps value of 48.6 and 8.6 incremented by 0.1 on each message');
  process.exit();
}

if ((args.length) == 6) {
  timeinterval = args[0];
  locid = args[1];
  simanzahl = args[2];
  datatype = args[3];
  min = parseFloat(args[4]);
  max = parseFloat(args[5]);
} else {
    console.log("Wrong no of arguemts ");
    console.log('arg0 = timeinterval in dem die Daten gesendet werden in sec');
    console.log('arg1 = unique id of drone - 6 stellig');
    console.log('arg2 = Anzahl der Daten in Zyklen - 2stellig');
    console.log('arg3 = identifier type of messaurement - gpsd= gps data, diss=Distanz seit Start, disp=Distanz seit Warenaufnahme, batt=Ladezustand Batterie, time=Zeit seit Warenaufnahme, delivered=Zustellung erfolgt');
    console.log('arg4 = start value');
    console.log('arg5 = end value');
    console.log('bsp =npm start 10 dhbw-1 5 gpsd 48.6 8.6');
    console.log('bsp will send every 10 sec a gps value of 48.6 and 8.6 incremented by 0.1 on each message');
   
    process.exit();    
}

var mqttmsg = {};
var i=0;
var myinterval;
console.log('min', min);

function intervalFunc() {

  if (i == simanzahl - 1) {
    clearInterval(this);
  }
  console.log('value =', value);
  // sende Daten

  mqttmsg['timestamp'] = new Date().toISOString();
  mqttmsg['locid'] = locid;
  console.log('datatype = ', datatype);
  // handle GPS Data
  if (datatype == 'gpsd') {
    if (i == 0) {
      console.log('i=', i);
      gpslatitude = parseFloat(args[4]);
      gpslongitude = parseFloat(args[5]);
      value = 0;
    }
    // sending gps data
    // min value = gps longtitude, max value = gps latitude
    mqttmsg['gpslatitude'] = gpslatitude + value;
    mqttmsg['gpslongitude'] = gpslongitude + value;
    mqttopic = 'SWS/' + locid + '/G';
    value = value + 0.1;
  }
  //km seit Start
  if (datatype == 'diss') {
    if (i == 0) {
      min, value = args[4];
      max = args[5];
    }

    if (value >= max)
      value = max;
    else
      value = min + (i / 10);

    value = Math.min(value, max);
    mqttmsg['km_since_start'] = value;
    mqttopic = 'SWS/' + locid + '/D';
    value += 0.1;

  }
  //km seit Warenaufnahme
  if (datatype == 'disp') {
    if (i == 0) {
      min = parseFloat(args[4]);
      max = parseFloat(args[5]);
      value = min;
    }
    value = Math.min(value, max);
    mqttmsg['km_since_pickup'] = value;
    mqttopic = 'SWS/' + locid + '/P';
    value += 0.1;
  }

  //Zeit seit Warenaufnahme
  if (datatype == 'time') {
    if (i == 0) {
      min = parseFloat(args[4]);
      max = parseFloat(args[5]);
      value = min;
    }
    value = Math.min(value, max);
    mqttmsg['time_since_pickup'] = value;
    mqttopic = 'SWS/' + locid + '/T';
    value += timeinterval / 60;
  }

  // Delivered
  if (datatype == 'delivered') {
    if (i == 0) {
      min = parseFloat(args[4]);
      max = parseFloat(args[5]);
      value = min;
    }
    if (value >= max) {
      mqttmsg['delivered'] = true;
    } else {
      mqttmsg['delivered'] = false;
    }
    value += 1;
    mqttopic = 'SWS/' + locid + '/L';
  }

  // Ladestand Batterie
  if (datatype == 'batt') {
    // beim ersten Schleifendurchlauf werden die Anfangswerte von den Aufrufparametern geladen
    if (i == 0) {
      max = parseFloat(args[4]);
      min = parseFloat(args[5]);
      value = max;
    }

    // variation in den Werten
    if (value <= min) {
      value = min;
    } else {
      value -= (i/10);
    }
    value = Math.max(value, min);
    mqttmsg['battery_level'] = value;
    mqttopic = 'SWS/' + locid + '/B';
  }
    console.log('value =', value);
    console.log('mqttopic =', mqttopic);
    console.log('mqtt msg', JSON.stringify(mqttmsg));
    if(!client.connected){
        console.log('MQTT not connected');
        return;
    }
    client.publish(mqttopic, JSON.stringify(mqttmsg));
    i++;

}
app.listen(4000, () =>{
  myinterval = setInterval(intervalFunc, timeinterval * 1000);

  console.log('Listening on port 4000')
});