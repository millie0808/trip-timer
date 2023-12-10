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
}

document.addEventListener('DOMContentLoaded', async () => {
    const userData = await checkAuthorization();
    if(!userData){
        const mainComponent = document.querySelector('main');
        mainComponent.classList.remove('hidden');
        const startPlanningBtns = document.querySelectorAll('.start-btn');
        startPlanningBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                openloginContainer();
            })
        })
        const loginBtnOnNav = document.querySelector('#nav-sign-in-btn');
        loginBtnOnNav.classList.remove('hidden');
    } else {
        window.location.href = '/member';
    }
})