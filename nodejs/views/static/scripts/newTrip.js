const fetchCityDetails = async (googleId) => {
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
};
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

const fetchPhotosByLocation = async (searchTerm) => {
    try {
        const accessKey = 'kT2EZ5b_a9FUuvOq_qpI70obXSuXVgG-LVES8WtF8vE';
        const searchTermSpecific = `${searchTerm} famous tourist place`;
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${searchTermSpecific}&page=1&per_page=1&client_id=${accessKey}`);
        const data = await response.json();
        const photoUrl = data.results[0].urls.small_s3;
        const startIndex = photoUrl.indexOf("photo-") + "photo-".length;
        const result = photoUrl.substring(startIndex);
        return result
    } catch (error) {
        console.error('Error fetching photos:', error);
    }
}

const fetchCityContinent = async (lat, lng) => {
    try {
        const accessKey = 'c6ee8d11a4d7473f8d1674530cd1002f';
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${accessKey}`);
        const data = await response.json();
        const continent = data.results[0].components.continent;
        return continent
    } catch (error) {
        console.error('Error fetching photos:', error);
    }
}

document.addEventListener('click', (event) => {
    const avatarOnNav = document.querySelector('#nav-avatar');
    const signOutBtn = document.querySelector('#sign-out-btn');
    const clickedInsideComponent = avatarOnNav.contains(event.target);
    if (!clickedInsideComponent) {
        signOutBtn.classList.add('hidden');
    } else {
        if(signOutBtn.classList.contains('hidden')){
            signOutBtn.classList.remove('hidden');
        } else {
            signOutBtn.classList.add('hidden');
        }
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    const userData = await checkAuthorization();
    if(!userData){
        window.location.href = '/';
    }
    else {
        const avatarOnNav = document.querySelector('#nav-avatar');
        const signOutBtn = document.querySelector('#sign-out-btn');
        avatarOnNav.classList.remove('hidden');
        avatarOnNav.src = userData.avatar ? (userData.avatar.startsWith('http') ? userData.avatar : `https://test-s3-pic.s3.ap-southeast-1.amazonaws.com/${userData.avatar}`) : '/images/user.png';
        signOutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            location.reload();
        })
        const startPlanningBtns = document.querySelectorAll('.start-btn');
        startPlanningBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = '/trip/new';
            })
        });
    }
    // 自動搜尋
    const autocompleteService = new google.maps.places.AutocompleteService();
    const input = document.getElementById('city-input');
    input.addEventListener('input', () => {
        const inputText = input.value;
        if(!inputText){
            cityResultDiv.classList.add('none');
        }
        else{
            // 使用 AutocompleteService 取得建議
            autocompleteService.getPlacePredictions({ 
                input: inputText, 
                types: ['administrative_area_level_1'],
                language: 'en'
            }, function(predictions, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    cityResultDiv.innerHTML = ''; // 清空先前的建議
                    // 將建議顯示在 city-result div 中
                    predictions.forEach(prediction => {
                        const suggestion = document.createElement('calcite-list-item');
                        suggestion.setAttribute('label', prediction.description);
                        suggestion.setAttribute('googleId', prediction.place_id);
                        cityResultDiv.appendChild(suggestion);
                    });
                }
            });
            cityResultDiv.classList.remove('none');
        }
    });
    // 選取 消失
    cityResultDiv.addEventListener('calciteListChange', () => {
        setTimeout(() => {
            const cityDivSelected = document.querySelector('calcite-list-item[selected]');
            input.value = cityDivSelected.getAttribute('label');
            input.setAttribute('googleId', cityDivSelected.getAttribute('googleId'));
            cityResultDiv.classList.add('none');
        }, 100);
    })
})


const cityContainer = document.querySelector('#city-container');
const cityInput = document.querySelector('#city-input');
const cityWarning = cityContainer.querySelector('.warning-text');
const dateContainer = document.querySelector('#date-container');
const datePicker = document.querySelector('calcite-input-date-picker');
const dateWarning = dateContainer.querySelector('.warning-text');
const tripForm = document.querySelector('#trip-form');
const cityResultDiv = document.getElementById('city-results');
const tripNameInput = document.querySelector('#trip-name-input');

const userData = await checkAuthorization();
if(!userData){
    window.location.href = '/';
}
tripForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    //
    cityResultDiv.classList.add('none');
    // 檢查資料
    if(!cityInput.value || !datePicker.value){
        if(!cityInput.value){
            cityWarning.classList.remove('none');
            return false;
        }
        if(!datePicker.value){
            dateWarning.classList.remove('none');
        }
        else if(!datePicker.value[0] || !datePicker.value[1]){
            dateWarning.classList.remove('none');
        }
        return false;
    }
    else if(datePicker.value){
        if(!datePicker.value[0] || !datePicker.value[1]){
            dateWarning.classList.remove('none');
            return false;
        }
    }
    //
    const googleId = cityInput.getAttribute('googleId');
    if(!googleId){
        document.querySelector('#city-wrong-warning').classList.remove('none');
        return false
    }
    const cityDetails = await fetchCityDetails(googleId);
    const [city, country] = cityInput.value.split(', ');
    const lng = cityDetails.geometry.location.lng();
    const lat = cityDetails.geometry.location.lat()
    const cityContinent = await fetchCityContinent(lat, lng);
    const cityImg = await fetchPhotosByLocation(`${city}`);
    const cityData = {
        google_id: googleId,
        name: city,
        country: country,
        lat: lat,
        lng: lng,
        continent: cityContinent,
        img: cityImg
    }
    const response = await fetch('/api/trip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            city: cityData,
            date: datePicker.value,
            name: tripNameInput.value,
            userId: userData.id,
        })
    })
    const res = await response.json();
    if(res.ok){
        const tripNumber = res.trip.number;
        window.location.href = '/trip/'+tripNumber;
    }
    else{
        console.log(res.error);
    }
})

cityInput.addEventListener('calciteInputInput', () => {
    cityWarning.classList.add('none');
    document.querySelector('#city-wrong-warning').classList.add('none');
})

datePicker.addEventListener('calciteInputDatePickerChange', () => {
    dateWarning.classList.add('none');
})
