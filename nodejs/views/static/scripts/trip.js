const autocompleteService = new google.maps.places.AutocompleteService();
const dayToColor = {
    1: 'purple',
    2: 'blue',
    3: 'green',
    4: 'yellow',
    5: 'orange',
    6: 'pink',
    7: 'red'
}
let GLOBAL_MAP = null;
let notSaved = true;
let isCreater = null;

// Models
const formatDateRange = (dateRange) => {
    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    const dateList = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
        dateList.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateList;
}
const fetchPlaceDetails = async (googleId) => {
    try {
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        const placeResult = await new Promise((resolve, reject) => {
            placesService.getDetails({ placeId: googleId }, function(placeResult, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(placeResult);
                } else {
                    reject('無法取得地點詳細資訊');
                }
            });
        });
        return placeResult;
    } catch (error) {
        console.error('錯誤:', error);
        throw error;
    }
}
const getAllMarkersWithPrefix = (prefix) => {
    const allMarkers = Object.keys(GLOBAL_MAP.getStyle().sources)
        .filter(sourceId => sourceId.startsWith(prefix))
        .map(sourceId => GLOBAL_MAP.getStyle().layers.filter(layer => layer.source === sourceId))
        .flat()
        .map(layer => layer.id);
    return allMarkers;
}
const compareTravelModes = async (start, end) => {
    const modes = ['walking', 'driving'];
    let fastestMode = '';
    let fastestTime = Infinity;
    let fastestRoute = null;
  
    for (const mode of modes) {
        try {
            const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/${mode}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${TB}`);
            const data = await response.json();
            const route = data.routes[0];
    
            if (route.duration < fastestTime) {
                fastestTime = route.duration;
                fastestMode = mode;
                fastestRoute = route;
            }
        } catch (error) {
            console.error(`Error for ${mode}:`, error);
        }
    }
  
    return { mode: fastestMode, time: fastestTime, route: fastestRoute };
}
const fetchRouteData = async (mode, start, end) => {
    const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/${mode}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${TB}`);
    const data = await response.json();
    const route = data.routes[0];
    return route
}
const formatTime = (seconds) =>  {
    let days = Math.floor(seconds / (3600 * 24));
    let hours = Math.floor((seconds % (3600 * 24)) / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    let result = '';

    if (days > 0) {
        result += `${days} day${days !== 1 ? 's' : ''} `;
    }
    if (hours > 0) {
        result += `${hours} hour${hours !== 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
        result += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
    }
    if (result == ''){
        result += 'Less than a minute'
    }

    return result.trim(); // 移除结果中的额外空格
}
const collectScheduleData = () => {
    let scheduleData = {
        "schedule": {},
        "duration": {}
    };
    const blockContainers = document.querySelectorAll('calcite-block');
    for(let i = 0; i < blockContainers.length; i++){
        scheduleData.schedule[i] = [];
        scheduleData.duration[i] = [];
        const siteContainer = document.querySelector(`#site-container-${i+1}`);
        const sites = siteContainer.querySelectorAll('calcite-list-item');
        const durations = siteContainer.querySelectorAll('div.duration');
        if(sites.length > 0){
            for(let j = 0; j < sites.length; j++){
                const siteValue = JSON.parse(sites[j].getAttribute('value'));
                scheduleData.schedule[i].push({
                    google_id: siteValue.googleId,
                    name: sites[j].getAttribute('label'),
                    address: sites[j].getAttribute('description'),
                    lat: siteValue.lat,
                    lng: siteValue.lng
                });
            }
        }
        if(durations.length > 0){
            for(let z = 0; z < durations.length; z++){
                const durationValue = JSON.parse(durations[z].getAttribute('value'));
                scheduleData.duration[i].push({
                    mode: durationValue.mode,
                    duration: durationValue.duration
                });
            }
        }
    }
    return scheduleData
}
const saveIntoDatabase = async (scheduleData, tripId, scheduleOld) => {
    const allEmptyArrays = Object.values(scheduleOld).every(arr => Array.isArray(arr) && arr.length === 0);
    if(allEmptyArrays && notSaved){
        const res = await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trip_id: tripId,
                schedule: scheduleData.schedule,
                duration: scheduleData.duration
            })
        });
        const json = await res.json();
        notSaved = null;
        return json
    }
    else{
        const res = await fetch('/api/schedule', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trip_id: tripId,
                schedule: scheduleData.schedule,
                duration: scheduleData.duration
            })
        });
        const json = await res.json();
        return json
    }
    
}
const checkAuthorization = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/user/auth', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if(res.status == 200){
        const json = await res.json();
        return json.user
    } else {
        return null
    }
};

// Controllers
class ApiController {
    static async getTrip(){
        const pathame = window.location.pathname;
        const tripNumber = pathame.match(/\d+/)[0];
        const response = await fetch(`/api/trip?number=${tripNumber}`)
        const res = await response.json();
        if(res.ok){
            return res
        }
        else{
            console.log(res.error);
        }
    }
}
class TitleController {
    static ready(tripData){
        renderTitle(tripData);
    }
}
class MapController {
    static async ready(city, schedule){
        renderMap(TB, city);
        setTimeout( async () => {
            for(let i = 0; i < Object.keys(schedule).length; i++){
                for(let j = 0; j < schedule[i].length; j++){
                    const day = i+1;
                    const color = dayToColor[day.toString()];
                    const order = j+1;
                    const name = schedule[i][j]['site.name'];
                    const googleId = schedule[i][j]['site.google_id'];
                    const lat = schedule[i][j]['site.lat'];
                    const lng = schedule[i][j]['site.lng'];
                    renderMapMarker(day, color, order, name, googleId, lat, lng);
                    const mode = schedule[i][j].mode;
                    if(mode){
                        const nextLat = schedule[i][j+1]['site.lat'];
                        const nextLng = schedule[i][j+1]['site.lng'];
                        const routeData = await fetchRouteData(mode, [lng, lat], [nextLng, nextLat]);
                        displayFastestRoute({route: routeData}, day, order+1);
                        hidden(`route-${day}-${order+1-0.5}`);
                    }
                }
            }
        }, 500);
    }
}
class BlockController {
    static ready(trip, schedule){
        const dateRange = [trip.start_date, trip.end_date];
        const dates = formatDateRange(dateRange);
        renderBlcok(dates, schedule);
    }
}
class ButtonController {
    static ready(tripId, scheduleOld){
        const saveBtn = document.querySelector('#save-btn');
        const saveOkDiv = document.querySelector('#save-ok')
        saveBtn.addEventListener('click', async () => {
            const scheduleData = collectScheduleData();
            const json = await saveIntoDatabase(scheduleData, tripId, scheduleOld);
            if(json.ok){
                saveOkDiv.classList.remove('hidden');
            }
        })
        const saveOkBtn = document.querySelector('#save-ok-btn');
        saveOkBtn.addEventListener('click', () => {
            saveOkDiv.classList.add('hidden');
        })
        const saveDoneBtn = document.querySelector('#save-done-btn');
        saveDoneBtn.addEventListener('click', () => {
            window.location.href = '/member';
        })
    }
}

// Views
const renderTitle = (tripData) => {
    const titleNameSpan = document.querySelector('#title_trip-name');
    if(!tripData.name){
        titleNameSpan.textContent = 'NONAME';
    } else {
        titleNameSpan.textContent = tripData.name;
    }
    const titleCitySpan = document.querySelector('#title_city-name');
    if(tripData.city.country){
        titleCitySpan.textContent = tripData.city.name+', '+tripData.city.country;
    }
    else{
        titleCitySpan.textContent = tripData.city.name;
    }
    const titleSpan = document.querySelector('#title');
    titleSpan.classList.remove('none');
    const titleDateSpan = document.querySelector('#title_date');
    titleDateSpan.textContent = tripData.start_date+' ～ '+tripData.end_date;
    titleDateSpan.parentNode.classList.remove('none');
}
const renderMap = (TB, city) => {
    mapboxgl.accessToken = TB;
    GLOBAL_MAP = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/millie000/clp3so68d00fj01pwcmi1al20/draft',
        center: [city.lng, city.lat],
        zoom: 9
    });
    GLOBAL_MAP.on('load', () => {
        Object.keys(dayToColor).forEach(key => {
            const color = dayToColor[key];
            for(let i = 1; i < 10;i ++){
                GLOBAL_MAP.loadImage(
                    `/images/map-markers/${color}-marker-${i}.png`,
                    (error, image) => {
                        if (error) throw error;
                        GLOBAL_MAP.addImage(`${color}-marker-${i}`, image);
                    }
                );
            }
        });
        // 需修改
        // for(const day in siteData){
        //     renderMapMarker(siteData[day]);
        // }
    })
}
const renderMapMarker = (day, color, order, name, googleId, lat, lng) => {
    // Add points
    const markerId = `siteMarker-${day}-${order}`;
    GLOBAL_MAP.addSource(markerId, {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            lng, lat
                        ]
                    },
                    'properties': {
                        'title': name,
                        'group': `day-${day}`
                    }
                }
            ]
        }
    })
    GLOBAL_MAP.addLayer({
        'id': markerId,
        'type': 'symbol',
        'source': markerId,
        'layout': {
            'icon-image': `${color}-marker-${order}`,
            // icon always display
            'icon-allow-overlap': true,
            'text-optional': true,
            // get the title name from the source's "title" property
            'text-field': ['get', 'title'],
            'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
        }
    });
}
const renderBlcok = async (dates, schedule) => {
    const blockContainer = document.querySelector('#day-block-container');
    for(let i = 0; i < dates.length; i++){
        //
        // const timeDiv = document.createElement('calcite-label');
        // timeDiv.setAttribute('layout', 'inline');
        // timeDiv.textContent = 'Start time'
        // const timePicker = document.createElement('calcite-input-time-picker');
        // timeDiv.append(timePicker);
        //
        const blockDiv = document.createElement('calcite-block');
        blockDiv.setAttribute('collapsible', '');
        blockDiv.setAttribute('heading', `Day ${i+1} ,  ${dates[i]}`);
        blockDiv.addEventListener('calciteBlockBeforeOpen', () => {
            // 地圖顯示該天
            showMarkersAndRoutesByGroup(`day-${i+1}`);
            //
            const allBlocks = document.querySelectorAll('calcite-block');
            const otherBlocks = Array.from(allBlocks).filter(block => block !== blockDiv);
            otherBlocks.forEach(block => {
                block.removeAttribute('open');
            })
        });
        //
        const siteContainer = document.createElement('calcite-list');
        siteContainer.id = `site-container-${i+1}`;
        // 顯示存過的景點
        for(let j = 0; j < schedule[i].length; j++){
            const siteExistedDiv = document.createElement('div');
            siteExistedDiv.classList.add('flex');
            siteExistedDiv.classList.add('items-center');
            siteExistedDiv.id = `site-${i+1}-${schedule[i][j].site_order+1}`;
            const siteExistedOrder = document.createElement('img');
            const color = dayToColor[ i + 1 ];
            siteExistedOrder.setAttribute('src', `/images/map-markers/${color}-marker-${schedule[i][j].site_order + 1}.png`);
            const siteExistedEle = document.createElement('calcite-list-item');
            const name = schedule[i][j]['site.name'];
            const address = schedule[i][j]['site.address'];
            const lat = schedule[i][j]['site.lat'];
            const lng = schedule[i][j]['site.lng'];
            const googleId = schedule[i][j]['site.google_id'];
            siteExistedEle.setAttribute('label', name);
            siteExistedEle.setAttribute('description', address);
            siteExistedEle.setAttribute('value', `{"lat":${lat},"lng":${lng},"googleId":"${googleId}"}`);
            siteExistedEle.classList.add('w-full');
            if(isCreater && j == schedule[i].length-1){
                siteExistedEle.setAttribute('closable', '');
            }
            siteExistedDiv.appendChild(siteExistedOrder);
            siteExistedDiv.appendChild(siteExistedEle);
            siteContainer.appendChild(siteExistedDiv);
            const duration = schedule[i][j].duration;
            const mode = schedule[i][j].mode;
            if(duration){
                const predictTimeDiv = document.createElement('div');
                predictTimeDiv.classList.add('flex');
                predictTimeDiv.classList.add('items-center');
                predictTimeDiv.classList.add('duration');
                predictTimeDiv.setAttribute('value', `{"mode":"${mode}","duration":${duration}}`)
                predictTimeDiv.style.gap = '10px';
                predictTimeDiv.style.padding = '0 0 0 30px';
                const modeImg = document.createElement('img');
                modeImg.style.width = '25px';
                modeImg.style.height = '25px';
                modeImg.src = `/images/${mode}.png`;
                const timeEle = document.createElement('div');
                timeEle.classList.add('text-sm');
                timeEle.textContent = formatTime(duration);
                timeEle.classList.add('align-middle');
                predictTimeDiv.appendChild(modeImg);
                predictTimeDiv.appendChild(timeEle);
                siteContainer.appendChild(predictTimeDiv);
            }
            observerOnSiteDeleted.observe(siteExistedEle, { attributes: true, attributeFilter: ['closed'] });
        }
        // 
        const inputDiv = document.createElement('calcite-input');
        const resultContainer = document.createElement('calcite-list');
        if(isCreater){
            inputDiv.id = `site-input-${i+1}`;
            inputDiv.setAttribute('placeholder', 'Search spots');
            resultContainer.id = `site-result-${i+1}`;
            resultContainer.setAttribute('selection-mode', 'single');
            resultContainer.setAttribute('selection-appearance', 'border');
            inputDiv.addEventListener('input', () => {
                const inputText = inputDiv.value;
                if(!inputText){
                    resultContainer.classList.add('none');
                    return
                }
                resultContainer.classList.remove('none');
                autocompleteService.getPlacePredictions({ 
                    input: inputText,
                }, (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        resultContainer.innerHTML = ''; // 清空先前的建議
                        // 將建議顯示在 city-result div 中
                        predictions.forEach(prediction => {
                            if(prediction.structured_formatting.secondary_text){
                                const suggestion = document.createElement('calcite-list-item');
                                suggestion.setAttribute('label', prediction.structured_formatting.main_text);
                                suggestion.setAttribute('description', prediction.structured_formatting.secondary_text);
                                suggestion.setAttribute('googleId', prediction.place_id);
                                resultContainer.appendChild(suggestion);
                            }
                        });
                    }
                });
                resultContainer.classList.remove('none');
            })
            resultContainer.addEventListener('calciteListChange', () => {
                setTimeout( async () => {
                    resultContainer.classList.add('none');
                    inputDiv.value = '';
                    // 判斷是哪天
                    const selected = resultContainer.querySelector('calcite-list-item[selected]');
                    const day = parseInt(resultContainer.id.match(/\d+/)[0]);
                    const siteDiv = document.createElement('div');
                    siteDiv.classList.add('flex');
                    siteDiv.classList.add('items-center');
                    // 判斷是第幾個
                    let allSites = siteContainer.querySelectorAll('calcite-list-item:not([closed])');
                    let order = allSites.length + 1 || 1;
                    // 關掉上一個的叉叉
                    if(order != 1){
                        const previousSite = allSites[order - 2];
                        previousSite.removeAttribute('closable');
                    }
                    siteDiv.id = `site-${day}-${order}`;
                    const siteOrder = document.createElement('img');
                    const color = dayToColor[day % 7];
                    siteOrder.setAttribute('src', `/images/map-markers/${color}-marker-${order}.png`);
                    const siteEle = document.createElement('calcite-list-item');
                    const name = selected.getAttribute('label')
                    siteEle.setAttribute('label', name);
                    siteEle.setAttribute('description', selected.getAttribute('description'));
                    // 經緯度資料
                    const placeDetails = await fetchPlaceDetails(selected.getAttribute('googleId'));
                    // siteEle.setAttribute('value', ``)
                    siteEle.setAttribute('closable', '');
                    const googleId = placeDetails.place_id;
                    const lat = placeDetails.geometry.location.lat();
                    const lng = placeDetails.geometry.location.lng();
                    siteEle.setAttribute('value', `{"lat":${lat},"lng":${lng},"googleId":"${googleId}"}`);
                    siteEle.classList.add('w-full');
                    // 地圖顯示
                    renderMapMarker(day, color, order, name, googleId, lat, lng);
                    // 偵測關閉
                    observerOnSiteDeleted.observe(siteEle, { attributes: true, attributeFilter: ['closed'] });
                    siteDiv.appendChild(siteOrder);
                    siteDiv.appendChild(siteEle);
                    siteContainer.appendChild(siteDiv);
                    // 增加預估時間
                    if(order != 1){
                        const previousSiteEle = siteEle.parentElement.previousElementSibling.querySelector('calcite-list-item');
                        const previousValue = JSON.parse(previousSiteEle.getAttribute('value'));
                        const previousLat = previousValue.lat;
                        const previousLng = previousValue.lng;
                        const fastestRouteData = await compareTravelModes([previousLng, previousLat], [lng, lat]);
                        // 地圖顯示路線
                        displayFastestRoute(fastestRouteData, day, order);
                        //
                        const predictTimeDiv = document.createElement('div');
                        predictTimeDiv.classList.add('flex');
                        predictTimeDiv.classList.add('items-center');
                        predictTimeDiv.classList.add('duration');
                        predictTimeDiv.setAttribute('value', `{"mode":"${fastestRouteData.mode}","duration":${fastestRouteData.time}}`)
                        predictTimeDiv.style.gap = '10px';
                        predictTimeDiv.style.padding = '0 0 0 30px';
                        const modeImg = document.createElement('img');
                        modeImg.style.width = '25px';
                        modeImg.style.height = '25px';
                        modeImg.src = `/images/${fastestRouteData.mode}.png`;
                        const timeEle = document.createElement('div');
                        timeEle.classList.add('text-sm');
                        timeEle.textContent = formatTime(fastestRouteData.time);
                        timeEle.classList.add('align-middle');
                        predictTimeDiv.appendChild(modeImg);
                        predictTimeDiv.appendChild(timeEle);
                        siteContainer.insertBefore(predictTimeDiv, siteDiv);
                    }
                }, 100);
            })
        }
        //
        // blockDiv.appendChild(timeDiv);
        blockDiv.appendChild(siteContainer);
        if(isCreater){
            blockDiv.appendChild(inputDiv);
            blockDiv.appendChild(resultContainer);
        }
        blockContainer.appendChild(blockDiv);
    }
    observeOnAllBlocksClosed();
}
const visible = (markerId) => GLOBAL_MAP.setLayoutProperty(markerId, 'visibility', 'visible');
const hidden = (markerId) => GLOBAL_MAP.setLayoutProperty(markerId, 'visibility', 'none');
const showMarkersAndRoutesByGroup = (group) => {
    const allMarkers = getAllMarkersWithPrefix('siteMarker-');

    allMarkers.forEach((markerId) => {
        const properties = GLOBAL_MAP.getSource(markerId)._data.features[0].properties;
        if (properties.group === group) {
            visible(markerId);
        } else {
            hidden(markerId);
        }
    });

    const allRoutes = getAllMarkersWithPrefix('route-');
    allRoutes.forEach((routeId) => {
        const properties = GLOBAL_MAP.getSource(routeId)._data.properties;
        if (properties.group === group) {
            visible(routeId);
        } else {
            hidden(routeId);
        }
    });
}
const observeOnAllBlocksClosed = () => {
    const blocks = document.querySelectorAll('calcite-block');
    const observer = new MutationObserver(() => {
        let allClosed = true;
        blocks.forEach((block) => {
            if (block.getAttribute('open') !== null) {
                allClosed = false;
            }
        });
        if (allClosed) {
            const visible = (markerId) => GLOBAL_MAP.setLayoutProperty(markerId, 'visibility', 'visible');
            const allMarkers = getAllMarkersWithPrefix('siteMarker-');
            allMarkers.forEach((markerId) => {
                visible(markerId);
            });
            const allRoutes = getAllMarkersWithPrefix('route-');
            allRoutes.forEach((routeId) => {
                hidden(routeId);
            });
        }
    });
    blocks.forEach((block) => {
        observer.observe(block, { attributes: true, attributeFilter: ['open'] });
    });
}
const renderDeletingMapMarkerAndRoute = (googleId, day, order) => {
    const markerId = `siteMarker-${day}-${order}`;
    GLOBAL_MAP.removeLayer(markerId);
    GLOBAL_MAP.removeSource(markerId);
    if( order != 1){
        const routeId = `route-${day}-${order - 0.5}`;
        GLOBAL_MAP.removeLayer(routeId);
        GLOBAL_MAP.removeSource(routeId);
    }
}
const observerOnSiteDeleted = new MutationObserver(mutationsList => {
    mutationsList.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'closed') {
            const closedElement = mutation.target;
            const parentDiv = closedElement.parentElement;
            const timeDiv = parentDiv.previousElementSibling;
            if (timeDiv) {
                const prevSiblingDiv = timeDiv.previousElementSibling;
                const prevListItem = prevSiblingDiv.querySelector('calcite-list-item');
                if (prevListItem) {
                    prevListItem.setAttribute('closable', '');
                }
            }
            // 刪除 map marker and route
            const googleId = JSON.parse(closedElement.getAttribute('value')).googleId;
            const day = parentDiv.id.split('-')[1];
            const order = parentDiv.id.split('-')[2];
            renderDeletingMapMarkerAndRoute(googleId, day, order);
            parentDiv.remove();
            if (timeDiv) {
                timeDiv.remove();
            }
        }
    });
})
const displayFastestRoute = async (routeData, day, order) => {
    const layerId = `route-${day}-${order - 0.5}`; 
    GLOBAL_MAP.addSource(layerId, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {
                'group': `day-${day}`
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': routeData.route.geometry.coordinates
            }
        }
    });
    GLOBAL_MAP.addLayer({
        'id': layerId,
        'type': 'line',
        'source': layerId,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#888',
            'line-width': 3
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const userData = await checkAuthorization();
    const res = await ApiController.getTrip();
    if(userData.id == res.trip.user.id){
        isCreater = true;
    }
    TitleController.ready(res.trip);
    BlockController.ready(res.trip, res.schedule);
    await MapController.ready(res.trip.city, res.schedule);
    ButtonController.ready(res.trip.id, res.schedule);
})

const TB = 'pk.eyJ1IjoibWlsbGllMDAwIiwiYSI6ImNscDVobGtubTFvY3oyanM2cHByaWkweGsifQ.-qwsHrc8ZD9p7hlmf61GLQ';
const TG = 'AIzaSyDfcgUuaRdlfkJiGDxuXLGORQ07D-6zqls'