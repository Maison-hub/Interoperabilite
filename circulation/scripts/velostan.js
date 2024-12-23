let infoUrl="https://api.cyclocity.fr/contracts/nancy/gbfs/station_information.json";
let stationUrl="https://api.cyclocity.fr/contracts/nancy/gbfs/station_status.json";

console.log('velostan.js loaded');

var macarte = null;
function initMap() {
    // Créer l'objet "macarte" et l'insèrer dans l'élément HTML qui a l'ID "map"
    macarte = L.map('map').setView([48.682797,6.175], 13);
    // Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer. Ici, openstreetmap.fr
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        // Il est toujours bien de laisser le lien vers la source des données
        attribution: 'données © OpenStreetMap/ODbL - rendu OSM France',
        minZoom: 1,
        maxZoom: 20
    }).addTo(macarte);
}
initMap();
Promise.all([
    fetch(infoUrl).then(response =>{
        if(! response.ok){
            alert("Service indiponnible veillez recharger la page")
            return "erreur"
        }
        return response.json()
    }),
    fetch(stationUrl).then(response =>{
        if(! response.ok){
            alert("Service indiponnible veillez recharger la page")
            return "erreur"
        }
        return response.json()
    })
]).then((data) => {
    const stas = data[0].data.stations;
    const placeStations=data[1].data.stations;

    console.log(stas);

    // const markerPlan = L.icon({
    //     iconSize: [40, 40],
    //     iconAnchor: [22, 55],
    //     popupAnchor: [-3, -50],
    // });
    for(let i = 0; i<stas.length; i++) {
        //get the placeStations with the id of stas[i].station_id
        const currStas = stas[i];
        const infostas = placeStations.filter(placeStation => placeStation.station_id === currStas.station_id)[0];
        console.log(infostas);
        L.marker([currStas.lat, currStas.lon]).addTo(macarte)
            .bindPopup(`<strong>${currStas.name}</strong><br></br>${infostas.num_docks_available} places disponibles<br></br>${infostas.num_bikes_available} vélos disponibles`);}
});
