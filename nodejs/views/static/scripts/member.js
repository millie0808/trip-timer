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

const fetchTripData = async (userId) => {
    const res = await fetch(`/api/trips?userId=${userId}`);
    if(res.status == 200){
        const json = await res.json();        
        return json.trips
    }
}

const calculateDaysDifference = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDifference = Math.abs(endDate - startDate);
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference+1
}

const renderTrips = async (tripData, userData) => {
    const tripContainer = document.querySelector('#trips-container');
    tripData.forEach(async trip => {
        const tripDiv = document.createElement('div');
        tripDiv.classList.add('redirect-trip', 'relative', 'flex', 'min-h-[15rem]', 'flex-col', 'justify-center', 'rounded-lg');
        const photoUrl = `https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-${trip['city.img']}`;
        const days = calculateDaysDifference(trip.start_date, trip.end_date);
        const displayDays = days > 1 ? `${days} days` : days === 1 ? `${days} day` : 'No days';
        const avatarImg = userData.avatar ? (userData.avatar.startsWith('http') ? userData.avatar : `https://test-s3-pic.s3.ap-southeast-1.amazonaws.com/${userData.avatar}`) : '/images/user.png';
        tripDiv.innerHTML = `
            <div class="redirect-trip flex h-[12rem] w-full cursor-pointer items-start rounded-lg bg-cover bg-center p-4 shadow-[inset_0px_-168px_117px_-128px_rgba(0,0,0,0.40)] transition-all" style="background-image: url('${photoUrl}');"></div>
            <div class="redirect-trip flex flex-col justify-start">
                <div class="mt-2 flex items-center gap-2 text-start">
                    <div class="w-6 h-6">
                        <img src="${avatarImg}" class="rounded-full">
                    </div>
                    <h3 class="line-clamp-1 max-w-full text-base font-medium lg:text-xl">${trip['city.name']}, ${trip['city.country']}</h3>
                </div>
                <div class="mt-2 flex items-center gap-2 text-left text-[14px]">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <span>${trip.start_date}</span>
                    </div>
                    <div>•</div>
                    <span>${displayDays} </span>
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
    const memberBtn = document.querySelector('#member-btn');
    const signOutBtn = document.querySelector('#sign-out-btn');
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
        window.location.href = '/';
    } else {
        const avatarOnNav = document.querySelector('#nav-avatar');
        const memberBtn = document.querySelector('#member-btn');
        const signOutBtn = document.querySelector('#sign-out-btn');
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
        const tripData = await fetchTripData(userData.id);
        renderTrips(tripData, userData);
    }
})