const tripData = JSON.parse(localStorage.getItem('tripData'));
const siteData = JSON.parse(localStorage.getItem('siteData'));

if(!tripData){
    window.location.href = '/trip/new';
}
else{
    document.querySelector('body').classList.remove('none');
    if(!siteData){
        localStorage.setItem('siteData', JSON.stringify({'cityId': tripData.city.id, 'site': {}}));
    }
    // 如果重新選了城市，local storage 就刪除原先的 siteData，建立新的
    else{
        if(siteData.cityId != tripData.city.id){
            localStorage.removeItem('siteData');
            localStorage.setItem('siteData', JSON.stringify({'cityId': tripData.city.id, 'site': {}}));
        }
    }
}
