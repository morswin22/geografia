// utils
let debug = false;
function post(path, data) {
    const request = new XMLHttpRequest();
    request.open("POST", path, true);
    request.setRequestHeader('Content-type', "application/json");
    request.addEventListener('readystatechange',e=>{
        if (debug) console.log(e);
    });
    request.send(data);
}

// mapName
let mapName = document.querySelector('#mapName');
const mapNameDefault = mapName.innerHTML;

mapName.addEventListener('keydown', e=>{
    if (e.key == 'Enter') {
        mapName.classList.remove('enter');
        e.preventDefault();
        if (!(mapName.innerHTML.length == 0 || mapName.innerHTML == mapNameDefault)) {
            let todo = confirm('Do you want to load map elements?');
            if (todo) {
                fetch(`/api/get/${mapName.innerHTML}`).then(async res=>{
                    mapName.classList.add('enter');
                    let json = await res.json();
                    mapElements = json.elements;
                    mapBg.value = json.background;
                    loadBackground();
                    displayElements();
                }).catch(console.error);
            }
        }
    }
});

mapName.addEventListener('focus', e=>{
    if (mapName.innerHTML == mapNameDefault) {
        mapName.innerHTML = '';
    }
    mapName.classList.add('focused');
});

mapName.addEventListener('blur', e=>{
    if (mapName.innerHTML.length == 0) {
        mapName.innerHTML = mapNameDefault;
    }
    setTimeout(()=>{
        mapName.classList.remove('focused');
    }, 100);
});

let avaibleMapNames = [];
let mapAvaible = document.querySelector('#mapAvaible');
async function getAvaibleMaps() {
    let res = await(await fetch('/api/getAvaibleMaps')).json();
    for (let name of res) {
        let elem = document.createElement('div');
        elem.innerHTML = name;
        elem.addEventListener('click', e=>{
            mapName.innerHTML = name;
        });
        mapAvaible.appendChild(elem);
    }
}
getAvaibleMaps();

function res() {
    let ref = mapName.getBoundingClientRect();
    mapAvaible.style.top = `${ref.bottom}px`;
    mapAvaible.style.left = `${ref.left}px`;
}
window.addEventListener('resize', res);
res();

// map
let mapElements = [];
function displayElements() {
    map.innerHTML = '';
    for (let element of mapElements) {
        let elem = document.createElement('div');
        elem.innerHTML = element.symbol;
        elem.setAttribute('data-content', element.name);
        elem.style.top = `${element.y}px`;
        elem.style.left = `${element.x}px`;
        map.appendChild(elem);
    }
}

let map = document.querySelector('#map');
let mapRef = map.getBoundingClientRect();
map.addEventListener('click', e=>{
    let x = e.pageX - mapRef.x;
    let y = e.pageY - mapRef.y;
    
    let query = prompt('Add new element').split('/');
    let symbol = query[0];
    let name = query[1];

    mapElements.push({x,y,symbol,name});
    displayElements();
});

// mapBg
let mapBg = document.querySelector('#mapBg');
function loadBackground() {
    let bg = mapBg.value;
    map.style.backgroundImage = 'none';
    fetch(`/api/get/${mapName.innerHTML}`).then(res=>{
        map.style.backgroundImage = `url(/backgrounds/${bg})`;
    }).catch(console.error);
}
(async()=>{
    let res = await (await fetch('/api/loadMaps')).json();
    for(let file of res) {
        let elem = document.createElement('option');
        elem.innerHTML = file;
        mapBg.appendChild(elem);
    }
    mapBg.value = 'europe.jpg'; // default value
    loadBackground();
})();
mapBg.addEventListener('change', e=> {
    loadBackground();
});

// mapSave
let mapSave = document.querySelector('#mapSave');
mapSave.addEventListener('click', e=>{
    if (!(mapName.innerHTML.length == 0 || mapName.innerHTML == mapNameDefault)) {
        post(`/api/set`, JSON.stringify({
            name: mapName.innerHTML,
            elements: mapElements,
            background: mapBg.value
        }));
    }
})