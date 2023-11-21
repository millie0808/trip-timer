let GLOBAL_SITES = null;
let GLOBAL_SITE_GROUP_LIST = {};
let GLOBAL_MAP = null;
let GLOBAL_DATES = null;
const GLOBAL_SITE_TAG_LIST = { 1:'景點', 2:'餐廳', 3:'住宿' };

// Models
const fetchSites = async (cityId) => {
    const response = await fetch('/api/sites?cityId='+cityId);
    const sites = await response.json();
    return sites;
}
const addSiteToStorage = (siteSelected, day) => {
    let siteData = JSON.parse(localStorage.getItem('siteData'));
    if (Object.keys(siteData.site).includes(day.toString())) {
        siteData.site[day].push(siteSelected.id);
    } else {
        siteData.site[day] = [siteSelected.id];
    }
    localStorage.setItem('siteData', JSON.stringify(siteData));
}
const deleteSiteFromStorage = (siteName, day) => {
    let siteData = JSON.parse(localStorage.getItem('siteData'));
    const siteIdToBeDeleted = GLOBAL_SITES.find(site => site.name === siteName).id;
    if (Object.keys(siteData.site).includes(day.toString())) {
        const indexToDelete = siteData.site[day].indexOf(siteIdToBeDeleted);
        if (indexToDelete !== -1) {
            siteData.site[day].splice(indexToDelete, 1);
        }
    }
    localStorage.setItem('siteData', JSON.stringify(siteData));
}
const fetchTB = async () => {
    const response = await fetch('/api/t/b');
    const tb = await response.json();
    return tb;
}
const getMapFeature = (sitedId) => {
    const site = GLOBAL_SITES.find(site => site.id === sitedId);
    const feature = [
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [
                    site.lng, site.lat
                ]
            },
            'properties': {
                'title': site.name
            }
        }
    ];
    return feature
}
const createNewTrip = async (tripData, siteData) => {
    const response = await fetch('/api/trip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'city': tripData.city.id,
            'date': tripData.date,
            'site': siteData.site
        })
    });
    const newTrip = await response.json();
    return newTrip.trip
}
const getDate = (dateData) => {
    const startDate = dateData[0];
    const endDate = dateData[1];
    const dateArray = [];
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
        dateArray.push(new Date(currentDate).toISOString().slice(0, 10)); // 將日期格式化為 YYYY-MM-DD
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
}
const getDayBlockOpened = () => {
    const allDayBlock = document.querySelectorAll('calcite-block');
    return Array.from(allDayBlock).filter(dayBlock => dayBlock.hasAttribute('open'));
}
const preventInputSubmit = () => {
    const siteForm = document.querySelector('#site-form');
    siteForm.addEventListener('submit', (event) => {
        event.preventDefault();
    })
}

// Views
const renderSiteInput = (sites) => {
    const siteInput = document.querySelector('#site-input');
    Object.values(GLOBAL_SITE_TAG_LIST).forEach(tagName => {
        const siteItemGroup = document.createElement('calcite-combobox-item-group');
        siteItemGroup.setAttribute('label', tagName);
        siteInput.appendChild(siteItemGroup);
    })
    const siteItemGroups = siteInput.querySelectorAll('calcite-combobox-item-group');
    let siteItemGroupList = {};
    siteItemGroups.forEach(group => {
        const tagName = group.getAttribute('label');
        if (!siteItemGroupList[tagName]) {
            siteItemGroupList[tagName] = [];
        }
        siteItemGroupList[tagName].push(group);
    });
    sites.forEach(site => {
        const tagName = GLOBAL_SITE_TAG_LIST[site.tag_id];
        const siteItemGroup = siteItemGroupList[tagName][0];
        const siteItem = document.createElement('calcite-combobox-item');
        siteItem.setAttribute('value', `{"id": ${site.id}, "name": "${site.name}", "address": "${site.address}", "lat": ${site.lat}, "lng": ${site.lng}, "tag_id": ${site.tag_id}}`);
        siteItem.setAttribute('text-label', site.name);
        siteItemGroup.appendChild(siteItem);
    });
    //
    setTimeout(() => {
        const shadow = siteInput.shadowRoot;
        const parentDiv = shadow.querySelector('div[role=combobox]');
        observerForClosingSiteInput.observe(parentDiv, { attributes: true, attributeOldValue: true });
    }, 350);
}
const renderTitle = (cityName) => {
    const titleCitySpan = document.querySelector('#title_city-name');
    titleCitySpan.textContent = cityName;
    const titleSpan = document.querySelector('#title');
    titleSpan.classList.remove('none');
}
const disableSiteItemSelected = (siteIdList) => {
    const siteInput = document.querySelector('#site-input');
    const items = siteInput.querySelectorAll('calcite-combobox-item');
    siteIdList.forEach(id => {
        items.forEach(item => {
            const itemId = JSON.parse(item.getAttribute('value')).id;
            if (itemId === id) {
                item.setAttribute('disabled', '');
            }
        });
    })
}
const renderSite = (sitesInStorage) => {
    // 顯示 local storage siteData 紀錄
    if(sitesInStorage != {}){
        for(const day in sitesInStorage){
            sitesInStorage[day].forEach(siteId => {
                addToList(siteId, day);
            })
        }
    }
}
const addToList = (siteId, day) => {
    const site = GLOBAL_SITES.filter(site => [siteId].includes(site.id))[0];
    const tagName = GLOBAL_SITE_TAG_LIST[site.tag_id];
    const siteGroup = document.querySelector(`.day-${day}-group[heading='${tagName}']`);
    const siteEle = document.createElement('calcite-list-item');
    siteEle.setAttribute('label', site.name);
    siteEle.setAttribute('value', site.id);
    if(site.address != 'null'){
        siteEle.setAttribute('description', site.address);
    }
    siteEle.setAttribute('closable', '');
    observerForDeletingSite.observe(siteEle, { attributes: true });
    siteGroup.appendChild(siteEle);
}
const removeValueInInput = () => {
    setTimeout(() => {
        const siteInput = document.querySelector('#site-input');
        const shadow = siteInput.shadowRoot;
        const parentDiv = shadow.querySelector('div[role=combobox]');
        const childDiv = parentDiv.querySelector('div[class="grid-input"]');
        const grandchildDiv = childDiv.querySelector('.input-wrap.input-wrap--single');
        const textEle = grandchildDiv.querySelector('span');
        if(textEle){
            grandchildDiv.removeChild(textEle);
        }
        const inputEle = grandchildDiv.querySelector('input');
        if(inputEle){
            inputEle.classList.remove("input--hidden");
        }
        const buttonEle = parentDiv.querySelector('button');
        if (buttonEle && buttonEle.parentNode === parentDiv) {
            parentDiv.removeChild(buttonEle);
        }
    }, 5);
}
const observerForDeletingSite = new MutationObserver(mutationsList => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'closed') {
            const siteDeleted = mutation.target;
            const siteIdDeleted = siteDeleted.getAttribute('value');
            const siteNameDeleted = siteDeleted.getAttribute('label');
            enableSiteItemDeleted(siteNameDeleted);
            const dayBlcokOpened = getDayBlockOpened()[0];
            const day = parseInt(dayBlcokOpened.getAttribute('id').match(/\d+/)[0]);
            deleteSiteFromStorage(siteNameDeleted, day);
            renderDeletingMapMarker(siteIdDeleted);
        }
    }
});
const observerForClosingSiteInput = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') {
            const ele = mutation.target;
            const isOpened = ele.getAttribute('aria-expanded');
            if(isOpened === 'false'){
                removeValueInInput();
            }
        }
    });
});
const enableSiteItemDeleted = (siteName) => {
    const siteItemDeleted = document.querySelector(`calcite-combobox-item[text-label='${siteName}']`);
    siteItemDeleted.removeAttribute('disabled');
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
        for(const day in siteData){
            renderMapMarker(siteData[day]);
        }
    })
}
const renderMapMarker = (siteIdList) => {
    // Add points
    siteIdList.forEach(id => {
        const markerId = 'siteMarker'+id.toString();
        GLOBAL_MAP.addSource(markerId, {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': getMapFeature(id)
            }
        })
        GLOBAL_MAP.addLayer({
            'id': markerId,
            'type': 'symbol',
            'source': markerId,
            'layout': {
                'icon-image': 'purple-marker',
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
    })
}
const renderDeletingMapMarker = (siteId) => {
    const markerId = 'siteMarker'+siteId.toString();
    GLOBAL_MAP.removeLayer(markerId);
    GLOBAL_MAP.removeSource(markerId);
}
const renderPageButton = () => {
    const backBtn = document.querySelector('#back-btn');
    backBtn.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = '/trip/new';
    })
    const nextBtn = document.querySelector('#next-btn');
    nextBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const tripData = JSON.parse(localStorage.getItem('tripData'));
        const siteData = JSON.parse(localStorage.getItem('siteData'));
        if(!siteData.site || Object.keys(siteData.site).length === 0){
            showWarningText('Please select at least one spot', 'warning-site');
        }
        else{
            const newTrip = await createNewTrip(tripData, siteData);
            window.location.href = '/trip/'+newTrip.number;
        }
    })
}
const showWarningText = (warningText, warningDivId) => {
    const warningDiv = document.querySelector(`#${warningDivId}`);
    warningDiv.textContent = warningText;
    warningDiv.classList.remove('none');
}
const hideWarningText = (warningDivId) => {
    const warningDiv = document.querySelector(`#${warningDivId}`);
    warningDiv.classList.add('none');
}
const renderDay = (dates) => {
    const dayBlock = document.querySelector('#day-block-container');
    dates.forEach((element, index) => {
        const dayEle = document.createElement('calcite-block');
        const dayBlockId = `day-${index+1}-block`;
        dayEle.setAttribute('collapsible', '');
        dayEle.setAttribute('heading', `Day ${index+1} ,  ${element}`);
        dayEle.setAttribute('id', dayBlockId);
        dayEle.addEventListener('click', () => {
            closeOtherDayBlcoks(dayEle);
            hideWarningText('warning-day');
        })
        dayBlock.appendChild(dayEle);
        renderSiteList(dayBlockId);
    })
}
const closeOtherDayBlcoks = (dayBlcokOpened) => {
    const allDayBlock = document.querySelectorAll('calcite-block'); 
    const dayBlockToBeClosed = Array.from(allDayBlock).filter(dayBlock => dayBlock !== dayBlcokOpened);
    dayBlockToBeClosed.forEach(dayBlock => {
        const hasOpenAttribute = dayBlock.hasAttribute('open');
        if(hasOpenAttribute){
            dayBlock.removeAttribute('open');
        }
    })
}
const renderSiteList = (dayBlockId) => {
    const dayBlock = document.querySelector(`#${dayBlockId}`);
    const day = dayBlockId.match(/\d+/)[0];
    const listEle = document.createElement('calcite-list');
    listEle.setAttribute('id', `day-${day}-list`);
    dayBlock.appendChild(listEle);
    Object.values(GLOBAL_SITE_TAG_LIST).forEach(tagName => {
        const siteGroup = document.createElement('calcite-list-item-group');
        siteGroup.setAttribute('heading', tagName);
        const day = parseInt(dayBlockId.match(/\d+/)[0]);
        siteGroup.setAttribute('class', `day-${day}-group`);
        listEle.appendChild(siteGroup);
    })
}


// Controllers
class TitleController {
    static ready(cityName) {
        renderTitle(cityName);
    }
}
class SiteInputController {
    static async ready(cityId, siteData) {
        GLOBAL_SITES = await fetchSites(cityId);
        renderSiteInput(GLOBAL_SITES);
        disableSiteItemSelected(siteData.siteId);
    }
}
class DayController {
    static async ready(dateData) {
        const GLOBAL_DATES = getDate(dateData);
        renderDay(GLOBAL_DATES);
        // GLOBAL_DATES.forEach((element, index) => {
        //     SiteController.ready()
        // })
    }
}
class SiteController {
    static ready(siteData){
        renderSite(siteData.site);
    }
}
class MapController {
    static async ready(city, siteData){
        const TB = await fetchTB();
        renderMap(TB, city, siteData);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    preventInputSubmit();
    //
    const tripData = JSON.parse(localStorage.getItem('tripData'));
    const siteData = JSON.parse(localStorage.getItem('siteData')) || {};
    if (!siteData.hasOwnProperty('siteId')) {
        siteData.siteId = [];
    }
    //
    const cityName = tripData.city.name;
    TitleController.ready(cityName);
    //
    const cityId = tripData.city.id;
    await SiteInputController.ready(cityId, siteData);
    //
    DayController.ready(tripData.date);
    //
    SiteController.ready(siteData);
    //
    const siteInput = document.querySelector('#site-input');
    siteInput.addEventListener('calciteComboboxChange', () => {
        if(siteInput.value){
            const dayBlockOpened = getDayBlockOpened()[0];
            if(dayBlockOpened){
                const day = parseInt(dayBlockOpened.getAttribute('id').match(/\d+/)[0]);
                const siteSelected = JSON.parse(siteInput.value);
                addSiteToStorage(siteSelected, day);
                addToList(siteSelected.id, day);
                disableSiteItemSelected([siteSelected.id]);
                removeValueInInput();
                renderMapMarker([siteSelected.id]);
                hideWarningText('warning-site');
            }
            else{
                showWarningText('Please select a day', 'warning-day');
            }
        }
    })
    //
    renderPageButton();
    //
    await MapController.ready(tripData.city, siteData.site);
})