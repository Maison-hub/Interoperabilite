<?php

//$opts = array('http' => array('proxy'=> 'tcp://127.0.0.1:8080', 'request_fulluri'=> true), 'ssl' => array( 'verify_peer' => false, 'verify_peer_name' => false));
//$context = stream_context_create($opts);
//stream_context_set_default($opts);
if ($_SERVER['HTTP_HOST'] === 'webetu.iutnc.univ-lorraine.fr') {
    $opts = array('http' => array('proxy'=> 'tcp://127.0.0.1:8080', 'request_fulluri'=> true), 'ssl' => array( 'verify_peer' => false, 'verify_peer_name' => false));
    stream_context_set_default($opts);
}

$ipApiUrl = "http://ip-api.com/json";
$incidentUrl= "https://carto.g-ny.org/data/cifs/cifs_waze_v2.json";
$airQualityUrl = "https://services3.arcgis.com/Is0UwT37raQYl9Jj/arcgis/rest/services/ind_grandest/FeatureServer/0/query?where=lib_zone%3D'Nancy'&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=";
function createMeteoUrl($format = 'xml', $lon = 6.15083, $lat = 48.67103){
    $meteoApiUrl = "https://www.infoclimat.fr/public-api/gfs/";
    $meteoApiUrl .= $format."?_ll=".$lat.",".$lon;
    $meteoApiUrl .= "&_auth=ARsDFFIsBCZRfFtsD3lSe1Q8ADUPeVRzBHgFZgtuAH1UMQNgUTNcPlU5VClSfVZkUn8AYVxmVW0Eb1I2WylSLgFgA25SNwRuUT1bPw83UnlUeAB9DzFUcwR4BWMLYwBhVCkDb1EzXCBVOFQoUmNWZlJnAH9cfFVsBGRSPVs1UjEBZwNkUjIEYVE6WyYPIFJjVGUAZg9mVD4EbwVhCzMAMFQzA2JRMlw5VThUKFJiVmtSZQBpXGtVbwRlUjVbKVIuARsDFFIsBCZRfFtsD3lSe1QyAD4PZA%3D%3D&_c=19f3aa7d766b6ba91191c8be71dd1ab2";
    return $meteoApiUrl;
}

$adresseApiUrl = "https://api-adresse.data.gouv.fr/search";

//get the ip info with ip-api
$ipInfo = file_get_contents($ipApiUrl."/".$_SERVER['REMOTE_ADDR'], false);

$ipInfo = json_decode($ipInfo, true);
$client = ['useUserLocation' => true];

if ($ipInfo['status'] =='fail'){
    //get the longitude and latitude of the 6 boulevard charlemagne
    $client['useUserLocation'] = false;
    $adresseInfo = file_get_contents($adresseApiUrl."/".'?q=2ter+boulevard+charlemagne+nancy');
    $adresseInfo = json_decode($adresseInfo, true);
    $client['lon'] = $adresseInfo['features'][0]['geometry']['coordinates'][0];
    $client['lat'] = $adresseInfo['features'][0]['geometry']['coordinates'][1];
}
else{
    $client['lon'] = $ipInfo['lon'];
    $client['lat'] = $ipInfo['lat'];
}

//get gare loc
$gareLoc = ['lat' => '48.689704',
    'lon'=> '6.175703'
    ] ;

//$adresseGare = file_get_contents($adresseApiUrl."/".'?q=nancy+gare');
//$adresseGare = json_encode($adresseGare, true);
//$gare['lon'] = $adresseGare['features'][0]['geometry']['coordinates'][0];
//$gare['lat'] = $adresseGare['features'][0]['geometry']['coordinates'][1];

//get the meteo info with infoclimat
$meteoInfo = file_get_contents(createMeteoUrl('xml', $client['lon'], $client['lat']));
$meteoXml = new DOMDocument;
$meteoXml->loadXML($meteoInfo);

//apply meteo.xsl to the xml with XSLTProcessor::importStylesheet
$meteoXsl = new DOMDocument;
$meteoXsl->load('meteo.xsl');

$meteoXml = new DOMDocument;
$meteoXml->loadXML($meteoInfo);

$proc = new XSLTProcessor;
$proc->importStylesheet($meteoXsl);
$meteoInfo = $proc->transformToXML($meteoXml);

//get the incident info
$incidentInfo = file_get_contents($incidentUrl);
$incidentInfo = json_decode($incidentInfo, true);
$incidentJsonData = json_encode($incidentInfo);

//get the air quality info
$airQualityData = file_get_contents($airQualityUrl);
$airQualityArray = json_decode($airQualityData, true);
$jsonAirQualityData = $airQualityArray;

function calculateAverageAirQuality($data) {
    $totalQuality = 0;
    $count = 0;

    // Parcourir les entités pour extraire les valeurs pertinentes
    foreach ($data['features'] as $feature) {
        $attributes = $feature['attributes'];

        // Remplacez 'air_quality' par le nom réel du champ correspondant dans vos données
        if (isset($attributes['code_qual'])) {
            $totalQuality += $attributes['code_qual'];
            $count++;
        }
    }

    // Calculer la moyenne
    return $count > 0 ? $totalQuality / $count : null;
}

$averageQuality = calculateAverageAirQuality($jsonAirQualityData);


?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <!--Leaflet css-->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
    <!--Leaflet js-->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
    <title>Car or not to car 🚗</title>
</head>
    <body>
        <section class="hero">
            <h1>Car or not to car 🚗</h1>

            <?php if ($client['useUserLocation'] == false): ?>
                <p>Nous n'arrivons pas à vous localiser. Nous prenons donc la localisation 6 boulevard charlemagne, Nancy</p>
            <?php else: ?>
                <p>Votre localisation est <?=$client['lon']?>, <?=$client['lat']?></p>
            <?php endif; ?>
        </section>

        <div class="echeances">
            <?= $meteoInfo ?>
        </div>

        <section id="sec2">
            <div id="map"></div>
            <div id="airQuality">
                <div class="nb">
                    <?= json_encode(round($averageQuality, 1)) ?>
                </div>
                <div>
                    La qualité de l'air est:
                </div>
                <div class="text">
                    <?php if ($averageQuality < 1): ?>
                        <div class="vgood">
                            Très bonne
                        </div>
                    <?php elseif ($averageQuality < 2): ?>
                        <div class="good">
                            Bonne
                        </div>
                    <?php elseif ($averageQuality < 3): ?>
                        <div class="bad">
                            Mauvaise
                        </div>
                    <?php else: ?>
                        <div class="vbad">
                            Très mauvaise
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </section>

        <section class="link">
            <div class="content">
                <span>
                    Les Api utilisé dans cette page sont:
                </span>
                <ul>
                    <li>
                        <a href="<?= $adresseApiUrl ?>">
                            Adresse
                        </a>
                    </li>
                    <li>
                        <a href="<?= $incidentUrl ?>">
                            Incident Nancy
                        </a>
                    </li>
                    <li>
                        <a href="<?= $airQualityUrl ?>">
                            Qualité de l'air
                        </a>
                    </li>
                    <li>
                        <a href="<?= createMeteoUrl('xml', $client['lon'], $client['lat']) ?>">
                            Météo
                        </a>
                    </li>
                </ul>
            </div>
        </section>

        <script>
            const map = L.map('map').setView([<?=$client['lat']?>, <?= $client['lon'] ?>], 13);

            var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
                minZoom: 0,
                maxZoom: 20,
                attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                ext: 'png'
            });

            Stadia_AlidadeSmoothDark.addTo(map);

            // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            //     maxZoom: 19,
            //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            // }).addTo(map);

            var incidents = <?= $incidentJsonData?>;

            var greenIcon = L.icon({
                iconUrl: './assets/markerGreen.svg',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
            });

            var redIcon = L.icon({
                iconUrl: './assets/markerRed.svg',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
            });

            var gareIcon = L.icon({
                iconUrl: './assets/gare.png',
                iconSize: [42, 54],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
            });

            incidents.incidents.forEach(function(incident) {
                console.log(incident);
                var coords = incident.location.polyline.split(' ');
                var lat = parseFloat(coords[0]);
                var lon = parseFloat(coords[1]);

                L.marker([lat, lon], {icon: redIcon}).addTo(map)
                    .bindPopup('<b>' + incident.short_description + '</b><br>' + incident.description);
            });

            L.marker([<?=$gareLoc['lat']?>, <?= $gareLoc['lon'] ?>], {icon: gareIcon}).addTo(map)
                .bindPopup('La gare de Nancy');

            console.log('<?= json_encode($gareLoc) ?>')

            L.marker([<?=$client['lat']?>, <?= $client['lon'] ?>], {icon: greenIcon}).addTo(map)
                .bindPopup('Vous êtes localisé ici');

        </script>
    </body>


</html>

