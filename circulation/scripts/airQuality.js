const airQualityUrl = "https://services3.arcgis.com/Is0UwT37raQYl9Jj/arcgis/rest/services/ind_grandest/FeatureServer/0/query?where=lib_zone%3D'Nancy'&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token="

const airQualityApi = document.getElementById("airQualityApi");
const aLinkQ = document.createElement("a");
aLinkQ.textContent = "API Qualité de l'air";
aLinkQ.href = airQualityUrl;
aLinkQ.target = "_blank"
airQualityApi.appendChild(aLinkQ);

async function fetchAirQualityData() {
    const response = await fetch(airQualityUrl);
    const data = await response.json();
    return data;
}

function calculateAverageAirQuality(data) {
    let totalQuality = 0;
    let count = 0;

    data.features.forEach(feature => {
        const attributes = feature.attributes;
        if (attributes.code_qual !== undefined) {
            totalQuality += attributes.code_qual;
            count++;
        }
    });

    return count > 0 ? totalQuality / count : null;
}

function updateAirQualityDiv(averageQuality) {
    const airQualityDiv = document.getElementById('airQuality');
    let qualityText = '';
    let qualityImage = '';

    if (averageQuality < 1) {
        qualityText = 'Très bonne';
        qualityImage = './assets/icon/good_qual.png';
    } else if (averageQuality < 2) {
        qualityText = 'Bonne';
        qualityImage = './assets/icon/mid_qual.png';
    } else if (averageQuality < 3) {
        qualityText = 'Mauvaise';
        qualityImage = './assets/icon/bad_qual.png';
    } else {
        qualityText = 'Très mauvaise';
        qualityImage = './assets/icon/bad_qual.png';
    }

    airQualityDiv.innerHTML = `
        <div class="nb">${averageQuality.toFixed(1)}</div>
        <div>La qualité de l'air est:</div>
        <div class="text">${qualityText}</div>
        <img src="${qualityImage}" alt="${qualityText}">
    `;
}

async function displayAirQuality() {
    const data = await fetchAirQualityData();
    const averageQuality = calculateAverageAirQuality(data);
    updateAirQualityDiv(averageQuality);
    document.querySelector('#airQuality .loader').style.display = 'none';
}

displayAirQuality();