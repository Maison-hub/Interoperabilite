console.log('meteo.js loaded');

function createMeteoUrl(format = 'json', lon = 6.15083, lat = 48.67103) {
    let meteoApiUrl = "https://www.infoclimat.fr/public-api/gfs/";
    meteoApiUrl += `${format}?_ll=${lat},${lon}`;
    meteoApiUrl += "&_auth=ARsDFFIsBCZRfFtsD3lSe1Q8ADUPeVRzBHgFZgtuAH1UMQNgUTNcPlU5VClSfVZkUn8AYVxmVW0Eb1I2WylSLgFgA25SNwRuUT1bPw83UnlUeAB9DzFUcwR4BWMLYwBhVCkDb1EzXCBVOFQoUmNWZlJnAH9cfFVsBGRSPVs1UjEBZwNkUjIEYVE6WyYPIFJjVGUAZg9mVD4EbwVhCzMAMFQzA2JRMlw5VThUKFJiVmtSZQBpXGtVbwRlUjVbKVIuARsDFFIsBCZRfFtsD3lSe1QyAD4PZA%3D%3D&_c=19f3aa7d766b6ba91191c8be71dd1ab2";
    return meteoApiUrl;
}

async function fetchMeteoData(url) {
    console.log('Fetching meteo data...', url);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function createMeteoHtml(data) {
    const container = document.createElement('div');

    Object.keys(data).slice(5, 25).forEach(key => {
        const echeance = data[key];
        console.log(echeance);
        const echeanceDiv = document.createElement('div');
        echeanceDiv.className = 'echeance';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'header';

        const timestamp = key;
        const hourSpan = document.createElement('span');
        hourSpan.className = 'hour';
        hourSpan.textContent = `${timestamp.substring(11, 13)}h `;
        headerDiv.appendChild(hourSpan);

        const dateSpan = document.createElement('span');
        dateSpan.className = 'date';
        dateSpan.textContent = `${timestamp.substring(8, 10)}/${timestamp.substring(5, 7)}/${timestamp.substring(0, 4)}`;
        headerDiv.appendChild(dateSpan);

        echeanceDiv.appendChild(headerDiv);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';

        const temperatureDiv = document.createElement('div');
        temperatureDiv.className = 'temperature';
        const tempLevel = echeance.temperature.sol - 273.15;
        if (tempLevel < 0) {
            temperatureDiv.innerHTML = '<span class="bad">❄️ Froid</span>';
        } else if (tempLevel > 20) {
            temperatureDiv.innerHTML = '<span>🔥 Chaud</span>';
        } else {
            temperatureDiv.innerHTML = '<span>🌡️Tempéré</span>';
        }
        infoDiv.appendChild(temperatureDiv);

        const pluieDiv = document.createElement('div');
        pluieDiv.className = 'pluie';
        if (echeance.pluie > 8) {
            pluieDiv.innerHTML = '<span class="bad">🌧️ Pluie</span>';
        } else {
            pluieDiv.innerHTML = '<span>☀️ Pas de pluie</span>';
        }
        infoDiv.appendChild(pluieDiv);

        const neigeDiv = document.createElement('div');
        neigeDiv.className = 'risque_neige';
        if (echeance.risque_neige > 0) {
            neigeDiv.innerHTML = '<span class="bad">❄️ Neige</span>';
        } else {
            neigeDiv.innerHTML = '<span>☀️ Pas de neige</span>';
        }
        infoDiv.appendChild(neigeDiv);

        const ventDiv = document.createElement('div');
        ventDiv.className = 'vent_moyen';
        const ventLevel = echeance.vent_moyen[0];
        if (ventLevel > 20) {
            ventDiv.innerHTML = '<span class="bad">💨 Vent fort</span>';
        } else {
            ventDiv.innerHTML = '<span>🍃 Vent léger</span>';
        }
        infoDiv.appendChild(ventDiv);

        echeanceDiv.appendChild(infoDiv);
        container.appendChild(echeanceDiv);
    });

    return container.innerHTML;
}

async function displayMeteoData(url) {
    const data = await fetchMeteoData(url);
    if (data) {
        console.log(data);
        const meteoHtml = createMeteoHtml(data);
        document.querySelector('#meteo').innerHTML = meteoHtml;
    }
}

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

async function success(position) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const meteoUrl = createMeteoUrl("json", userLon, userLat);
    await displayMeteoData(meteoUrl);
}

function error(err) {
    console.warn(`ERREUR (${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);