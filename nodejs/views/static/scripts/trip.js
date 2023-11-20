let GLOBAL_MAP = null;

const fetchTB = async () => {
    const response = await fetch('/api/t/b');
    const tb = await response.json();
    return tb;
}
const renderMap = (TB, city, siteData) => {
    mapboxgl.accessToken = TB;
    GLOBAL_MAP = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/millie000/clp3so68d00fj01pwcmi1al20/draft',
        center: [city.lng, city.lat],
        zoom: 9.5
    });
    GLOBAL_MAP.on('load', () => {
        GLOBAL_MAP.loadImage(
            '/images/map-markers/purple-marker.png',
            (error, image) => {
                if (error) throw error;
                GLOBAL_MAP.addImage('purple-marker', image);
            }
        );
        // 需修改
        // for(const day in siteData){
        //     renderMapMarker(siteData[day]);
        // }
    })
}

const renderTitle = (res) => {
    const titleCitySpan = document.querySelector('#title_city-name');
    titleCitySpan.textContent = res.trip.city.name_eng+', '+res.trip.city.country_eng;
    const titleSpan = document.querySelector('#title');
    titleSpan.classList.remove('none');
    const titleDateSpan = document.querySelector('#title_date');
    titleDateSpan.textContent = res.trip.start_date+' -> '+res.trip.end_date;
    titleDateSpan.parentNode.classList.remove('none');
}

class MapController {
    static async ready(city, siteData){
        const TB = await fetchTB();
        renderMap(TB, city, siteData);
    }
}

document.addEventListener('DOMContentLoaded', async() => {
    const pathame = window.location.pathname;
    const tripNumber = pathame.match(/\d+/)[0];
    const response = await fetch(`/api/trip?number=${tripNumber}`)
    const res = await response.json();
    renderTitle(res);
    // 需修改
    const tripData = JSON.parse(localStorage.getItem('tripData'));
    const siteData = JSON.parse(localStorage.getItem('siteData')) || {};
    await MapController.ready(tripData.city, siteData.site);
})
