const url = `https://tabular-api.data.gouv.fr/api/resources/2963ccb5-344d-4978-bdd3-08aaf9efe514/data/`;

async function fetchCovidData() {
    fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        return [];
    });
}

fetchCovidData()