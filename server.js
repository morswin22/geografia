const fs = require('fs');
const mapbg = 'data/backgrounds/';
const mapsJson = 'data/maps.json';

const express = require('express');
const app = express();

app.use(express.json());

app.use(express.static('root/'));
app.use(express.static('data/'));

app.get('/api/get/:name', (req, res)=>{
    let maps = JSON.parse(fs.readFileSync(mapsJson));
    let requested = req.params.name;
    if (maps[requested]) {
        res.send(JSON.stringify({
            background: maps[requested].background,
            elements: maps[requested].elements
        }));
    } else {
        res.send(JSON.stringify({
            background:"europe.jpg",
            elements: []
        }));
    }
});

app.post('/api/set', (req, res)=>{
    if (req.body.name && req.body.elements) {

        let maps = JSON.parse(fs.readFileSync(mapsJson));
        maps[req.body.name] = {
            elements: req.body.elements,
            background: req.body.background
        };
        fs.writeFileSync(mapsJson,JSON.stringify(maps));

        res.send(true);

    } else {
        res.send(false);
    }
});

app.get('/api/loadMaps', (req,res)=>{
    res.send(JSON.stringify(fs.readdirSync(mapbg)));
})

app.get('/api/getAvaibleMaps', (req,res)=>{
    let m = [];
    for (let i in JSON.parse(fs.readFileSync(mapsJson))) {
        m.push(i);
    }
    res.send(JSON.stringify(m));
})

app.listen(80);