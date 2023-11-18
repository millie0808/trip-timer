let GLOBAL_SITES = null;
let GLOBAL_SITE_GROUP_LIST = {};
let GLOBAL_MAP = null;
const GLOBAL_SITE_TAG_LIST = { 1:'景點', 2:'餐廳', 3:'住宿' };

// Models
const fetchSites = async (cityId) => {
    const response = await fetch('/api/sites?cityId='+cityId);
    const sites = await response.json();
    return sites;
}
const addSiteToStorage = (siteSelected) => {
    const siteData = JSON.parse(localStorage.getItem('siteData'));
    let siteIdData = siteData.siteId || [];
    const siteIdToBeStorage = siteSelected.id;
    if (!siteIdData.includes(siteIdToBeStorage)) {
        siteIdData.push(siteIdToBeStorage);
        localStorage.setItem('siteData', JSON.stringify({ ...siteData, 'siteId': siteIdData}));
        console.log('已加入數字到列表中:', siteIdData);
    }
    else{
        console.log('此景點已選取，無法重複添加。')
    }
}
const deleteSiteFromStorage = (siteName) => {
    const siteData = JSON.parse(localStorage.getItem('siteData'));
    const siteIdToBeDeleted = GLOBAL_SITES.find(site => site.name === siteName).id;
    let newSiteIdData = siteData.siteId.filter(id => id !== siteIdToBeDeleted);
    if(newSiteIdData.length == 1){
        newSiteIdData = [];
    }
    localStorage.setItem('siteData', JSON.stringify({...siteData, 'siteId': newSiteIdData}));
    console.log('已從列表中移除數字:', newSiteIdData);
}
const fetchTB = async () => {
    const response = await fetch('/api/t/b', { method: 'POST' });
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
    }, 300);
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
    const siteDiv = document.querySelector('#site');
    Object.values(GLOBAL_SITE_TAG_LIST).forEach(tagName => {
        const siteGroup = document.createElement('calcite-list-item-group');
        siteGroup.setAttribute('heading', tagName);
        siteDiv.appendChild(siteGroup);
    })
    // 儲存 GLOBAL_SITE_GROUP_LIST (內含elements)
    const siteGroups = siteDiv.querySelectorAll('calcite-list-item-group');
    siteGroups.forEach(group => {
        const tagName = group.getAttribute('heading');
        if (!GLOBAL_SITE_GROUP_LIST[tagName]) {
            GLOBAL_SITE_GROUP_LIST[tagName] = [];
        }
        GLOBAL_SITE_GROUP_LIST[tagName].push(group);
    });
    // 顯示 local storage siteData 紀錄
    if(sitesInStorage != []){
        sitesInStorage.forEach(id => {
            addToList(id);
        })
    }
}
const addToList = (siteId) => {
    const site = GLOBAL_SITES.filter(site => [siteId].includes(site.id))[0];
    const tagName = GLOBAL_SITE_TAG_LIST[site.tag_id];
    const siteGroup = GLOBAL_SITE_GROUP_LIST[tagName][0];
    const siteEle = document.createElement('calcite-list-item');
    siteEle.setAttribute('label', site.name);
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
            const siteNameDeleted = siteDeleted.getAttribute('label');
            enableSiteItemDeleted(siteNameDeleted);
            deleteSiteFromStorage(siteNameDeleted);
            renderDeletingMapMarker(siteNameDeleted);
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
const renderMap = (TB, city, siteIdList) => {
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
        renderMapMarker(siteIdList);
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
const renderDeletingMapMarker = (siteName) => {
    const siteId = GLOBAL_SITES.find(site => site.name === siteName).id;
    const markerId = 'siteMarker'+siteId.toString();
    GLOBAL_MAP.removeLayer(markerId);
    GLOBAL_MAP.removeSource(markerId);
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
class SiteController {
    static ready(siteData){
        renderSite(siteData.siteId);
    }
}
class MapController {
    static async ready(city, siteIdList){
        const TB = await fetchTB();
        renderMap(TB, city, siteIdList);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
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
    SiteController.ready(siteData);
    //
    const siteInput = document.querySelector('#site-input');
    siteInput.addEventListener('calciteComboboxChange', () => {
        if(siteInput.value){
            const siteSelected = JSON.parse(siteInput.value);
            addSiteToStorage(siteSelected);
            disableSiteItemSelected([siteSelected.id]);
            addToList(siteSelected.id);
            removeValueInInput();
            renderMapMarker([siteSelected.id]);
        }
    })
    //
    await MapController.ready(tripData.city, siteData.siteId);
})