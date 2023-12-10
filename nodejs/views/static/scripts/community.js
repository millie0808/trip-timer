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
const fetchTripData = async () => {
    const res = await fetch('/api/trips');
    if( res.status == 200){
        const json = await res.json();
        return json
    }
}
const calculateDaysDifference = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDifference = Math.abs(endDate - startDate);
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference+1
}
const renderTrips = async (tripData) => {
    const tripContainer = document.querySelector('#trips-container');
    tripData.forEach(async trip => {
        const tripDiv = document.createElement('div');
        tripDiv.classList.add('redirect-trip', 'relative', 'flex', 'min-h-[15rem]', 'flex-col', 'justify-center', 'rounded-lg');
        const photoUrl = `https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-${trip['city.img']}`;
        const days = calculateDaysDifference(trip.start_date, trip.end_date);
        const displayDays = days > 1 ? `${days} days` : days === 1 ? `${days} day&nbsp;&nbsp;` : 'No days';
        const avatarImg = trip['user.avatar'] ? (trip['user.avatar'].startsWith('http') ? trip['user.avatar'] : `https://test-s3-pic.s3.ap-southeast-1.amazonaws.com/${trip['user.avatar']}`) : '/images/user.png';
        const tripName = trip.name || 'NONAME';
        tripDiv.innerHTML = `
            <div class="group relative cursor-pointer">
            <div class="redirect-trip flex h-[12rem] w-full cursor-pointer items-start rounded-lg bg-cover bg-center p-4 shadow-[inset_0px_-168px_117px_-128px_rgba(0,0,0,0.40)] transition-all" style="background-image: url('${photoUrl}');"></div>
                <div class="mt-2">
                    <h2 class="mb-1 line-clamp-1 text-lg font-medium group-hover:underline">${tripName}</h2>
                    <p class="line-clamp-2 text-sm text-gray-700">📍  ${trip['city.name']}, ${trip['city.country']}</p>
                </div>
                <div class="mt-5 flex items-center justify-between md:mt-3">
                    <div class="flex items-center gap-1">
                        <img src="${avatarImg}" alt="" class="h-6 w-6 rounded-full">
                        <span class="line-clamp-1 text-sm">${trip['user.name']}</span>
                    </div>
                    <div class="flex items-center gap-1 w-[85px]">
                        <span class="text-sm whitespace-nowrap">${displayDays}</span>
                        <span>•</span>
                        <svg class="text-sm text-red-400" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path fill="currentColor" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"></path>
                        </svg>
                        <span class="text-sm">0</span>
                    </div>
                </div>
            </div>
        `;
        tripDiv.addEventListener('click', () => {
            window.location.href = `/trip/${trip.number}`;
        });
        tripContainer.appendChild(tripDiv);
    })
}

document.addEventListener('click', (event) => {
    const avatarOnNav = document.querySelector('#nav-avatar');
    const signOutBtn = document.querySelector('#sign-out-btn');
    const memberBtn = document.querySelector('#member-btn');
    const clickedInsideComponent = avatarOnNav.contains(event.target);
    if (!clickedInsideComponent) {
        signOutBtn.classList.add('hidden');
        memberBtn.classList.add('hidden');
    } else {
        if(signOutBtn.classList.contains('hidden')){
            signOutBtn.classList.remove('hidden');
            memberBtn.classList.remove('hidden');
        } else {
            signOutBtn.classList.add('hidden');
            memberBtn.classList.add('hidden');
        }
    }
})
document.addEventListener('DOMContentLoaded', async () => {
    const userData = await checkAuthorization();
    if(!userData){
        const loginBtn = document.querySelector('#nav-sign-in-btn');
        loginBtn.classList.remove('hidden');
        const startPlanningBtns = document.querySelector('#start-btn-on-nav');
        startPlanningBtns.addEventListener('click', () => {
                openloginContainer();
        })
    }
    else {
        const avatarOnNav = document.querySelector('#nav-avatar');
        const signOutBtn = document.querySelector('#sign-out-btn');
        const memberBtn = document.querySelector('#member-btn');
        avatarOnNav.classList.remove('hidden');
        avatarOnNav.src = userData.avatar ? (userData.avatar.startsWith('http') ? userData.avatar : `https://test-s3-pic.s3.ap-southeast-1.amazonaws.com/${userData.avatar}`) : '/images/user.png';
        signOutBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if(token){
                localStorage.removeItem('token');
            } else {
                const res = await fetch('/api/user/auth/google/out', { method: 'DELETE' });
                if(res.status != 200){
                    return
                }
            }
            location.reload();
        })
        memberBtn.addEventListener('click', () => {
            window.location.href = '/member';
        })
        const startPlanningBtns = document.querySelectorAll('.start-btn');
        startPlanningBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = '/trip/new';
            })
        });
    }

    const tripData = await fetchTripData();
    renderTrips(tripData.trips);
})