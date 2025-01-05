const url = `https://tabular-api.data.gouv.fr/api/resources/2963ccb5-344d-4978-bdd3-08aaf9efe514/data/`;

const meteoApi = document.getElementById("meteoApi");
const aLink = document.createElement("a");
aLink.href = url;
aLink.target = "_blank";
aLink.textContent = "API Covid";
meteoApi.appendChild(aLink);

console.log('covid.js loaded');
const ctx = document.getElementById('covidChart');
async function fetchCovidData() {
    let covidData = [];
    await fetch(url)
    .then(res => res.json())
    .then(data => {
        covidData = data.data.map(item => ({
            semaine: item.semaine,
            value: item.MAXEVILLE
        }));
    })
    .catch(error => {
        return [];
    });
    return covidData;
}

async function createCovidChart() {
    const data = await fetchCovidData();
    const labels = data.map(item => item.semaine);
    const values = data.map(item => item.value);
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Table d\'indicateur : ratio entre la concentration virale de SARS-CoV-2 (exprimée en cg/L et quantification réalisée à partir du gène E) et la concentration en azote ammoniacal (exprimée en mg de N/L).',
                data: values,
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        color: 'rgb(1,52,106)'
                    }
                }
            }
        }
    });
    document.querySelector(".chartContainer .loader").style.display = "none"
}

createCovidChart();
