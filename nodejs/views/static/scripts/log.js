function closeloginContainer() {
    loginContainer.style.display = 'none';
}
function openloginContainer() {
    loginContainer.style.display = 'flex';
    signUpContainer.style.display = 'none';
}
function opensignUpContainer() {
    loginContainer.style.display = 'none';
    signUpContainer.style.display = 'flex';
}
function closesignUpContainer() {
    signUpContainer.style.display = 'none';
}

const signUpContainer = document.querySelector('#sign-up-container');
const loginContainer = document.querySelector('#sign-in-container'); 

const closeSignInBtn = document.querySelector('#close-sign-in');
closeSignInBtn.addEventListener('click', closeloginContainer);

const signInBtns = document.querySelectorAll('.sign-in-btn');
signInBtns.forEach(btn => {
    btn.addEventListener('click', openloginContainer);
})

const signUpBtn = document.querySelector('#sign-up-btn');
signUpBtn.addEventListener('click', opensignUpContainer);

const closeSignUpBtn = document.querySelector('#close-sign-up');
closeSignUpBtn.addEventListener('click', closesignUpContainer);

const signUpForm = document.querySelector('#sign-up-form');
const emailSignUpWarningDiv = document.querySelector('#sign-up-email-warning');
signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    emailSignUpWarningDiv.classList.add('hidden');
    const formData = new FormData(signUpForm);
    const res = await fetch('/api/user', {
        method: 'POST',
        body: formData
    });
    if(res.status == 400){ 
        emailSignUpWarningDiv.classList.remove('hidden');
    }
    const json = await res.json();
    if(json.ok){
        location.reload();
    }
});

const signInForm = document.querySelector('#sign-in-form');
const emailSignInWarningDiv = document.querySelector('#sign-in-email-warning');
const passwordSignInWarningDiv = document.querySelector('#sign-in-password-warning');
const emailSignInInput = document.querySelector('#sign-in-email');
const passwordSignInInput = document.querySelector('#sign-in-password');
signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    emailSignInWarningDiv.classList.add('hidden');
    passwordSignInWarningDiv.classList.add('hidden');
    const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: emailSignInInput.value,
            password: passwordSignInInput.value 
        })
    });
    if(res.status == 404){
        emailSignInWarningDiv.classList.remove('hidden');
    } else if (res.status == 401) {
        passwordSignInWarningDiv.classList.remove('hidden');
    }
    const json = await res.json();
    if(json.ok){
        localStorage.setItem('token', json.token);
        const currentPath = window.location.pathname;
        console.log(currentPath);
        if (currentPath == '/community'){
            window.location.reload();
        } else{
            window.location.href = '/member';
        }
    }
});

const googleBtn = document.querySelector('#google-sign-in-btn');
googleBtn.addEventListener('click', async () => {
    const res = await fetch('/api/user/auth/google');
    const json = await res.json();
    if(res.status == 200){
        const authURL = json.url;
        window.location.href = authURL;
    }
})


