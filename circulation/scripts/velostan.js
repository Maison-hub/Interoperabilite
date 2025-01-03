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
    // Vérifier si le navigateur supporte la géolocalisation
    const redIcon = L.icon({
        iconUrl: './assets/marker/markerMoi.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            // Ajouter un marqueur à la position de l'utilisateur
            L.marker([userLat, userLon], {icon: redIcon}).addTo(macarte)
                .bindPopup('Vous êtes ici')
                .openPopup();
            // Centrer la carte sur la position de l'utilisateur
            macarte.setView([userLat, userLon], 13);
        }, function(error) {
            console.error('Erreur de géolocalisation: ' + error.message);
        });
    } else {
        console.error('La géolocalisation n\'est pas supportée par ce navigateur.');
    }
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


    const markerPlan = L.icon({
        iconUrl: './assets/marker/marker.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    for(let i = 0; i<stas.length; i++) {
        //get the placeStations with the id of stas[i].station_id
        const currStas = stas[i];
        const infostas = placeStations.filter(placeStation => placeStation.station_id === currStas.station_id)[0];
        L.marker([currStas.lat, currStas.lon], {icon: markerPlan}).addTo(macarte)
            .bindPopup(`<strong>${currStas.name}</strong><br></br>${infostas.num_docks_available} places disponibles<br></br>${infostas.num_bikes_available} vélos disponibles`);
    }
});
