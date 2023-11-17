fetch('/api/cities')
    .then(response => response.json())
    .then(cityData => {
        const cityInput = document.querySelector('#city-input');
        cityData.forEach(city => {
            const cityItem = document.createElement('calcite-combobox-item');
            cityItem.setAttribute('value', city.name_eng+', '+city.id+', '+city.country_eng);
            cityItem.setAttribute('text-label', city.name_eng+', '+city.country_eng);
            cityInput.appendChild(cityItem);
        });
        const tripData = JSON.parse(localStorage.getItem('tripData'));
        if(tripData){
            // Taiwan 的部分待修改
            const cityItem = cityInput.querySelector(`calcite-combobox-item[text-label='${tripData.city.name}, Taiwan']`)[0];
            cityItem.setAttribute('selected', '');
            datePicker.value = tripData.date;
        }
    })

const cityContainer = document.querySelector('#city-container');
const cityInput = document.querySelector('#city-input');
const cityWarning = cityContainer.querySelector('.warning-text');
const dateContainer = document.querySelector('#date-container');
const datePicker = document.querySelector('calcite-input-date-picker');
const dateWarning = dateContainer.querySelector('.warning-text');
const tripForm = document.querySelector('#trip-form');

tripForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    // 檢查資料
    if(!cityInput.value || !datePicker.value[0] || !datePicker.value[1]){
        if(!cityInput.value){
            cityWarning.classList.remove('none');
        }
        if(!cityInput.value){
            cityWarning.classList.remove('none');
        }
        return false;
    }
    localStorage.setItem('tripData', JSON.stringify({
        city: {
            id: parseInt(cityInput.value.split(', ')[1], 10),
            name: cityInput.value.split(', ')[0]
        },
        date: datePicker.value
    }));
    window.location.href = '/trip/site';
})

cityInput.addEventListener('calciteComboboxChange', () => {
    cityWarning.classList.add('none');
    console.log(cityInput.value);
})

datePicker.addEventListener('calciteInputDatePickerChange', () => {
    dateWarning.classList.add('none');
})

// // fetch api (create new trip)
    // try{
    //     const response = await fetch('/api/trip', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             'city': cityInput.value.split(', ')[0],
    //             'date': datePicker.value
    //         })
    //     });
    //     const resData = await response.json();
    //     if(!resData.ok){
    //         // 請求失敗
    //         console.error('Error:', resData.error);
    //     }
    //     else{
    //         // 請求成功
    //     }
    // }
    // catch (error) {
    //     console.error('Error submitting trip:', error);
    // }   