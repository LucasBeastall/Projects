const themeMap = {
    dark: "light",
    light: "solar",
    solar: "dark"
};

const theme = localStorage.getItem('theme')
    || (tmp = Object.keys(themeMap)[0],
        localStorage.setItem('theme', tmp),
        tmp);
const bodyClass = document.body.classList;
bodyClass.add(theme);

function toggleTheme() {
    const current = localStorage.getItem('theme');
    const next = themeMap[current];

    bodyClass.replace(current, next);
    localStorage.setItem('theme', next);
}

document.getElementById('themeButton').onclick = toggleTheme;


function rotateLogo() {
    // Get the checkbox and logo elements
    const checkbox = document.getElementById('check');
    const logo = document.querySelector('.logo svg');

    // Rotate the logo based on the checked state of the checkbox
    if (checkbox.checked) {
        logo.classList.add('rotated');
    } else {
        logo.classList.remove('rotated');
    }
}


const checkbox = document.getElementById('check');
checkbox.addEventListener('change', rotateLogo);


const navbar = document.querySelector('.navbar');
const toggle = document.querySelector('.toggle');
const linkTextElements = document.querySelectorAll('.link-text');


toggle.addEventListener('change', function () {
    if (this.checked) {
        navbar.style.width = '16rem';
        document.querySelector('main').style.marginLeft = '16rem';
        document.querySelector('.logo svg').style.marginLeft = '12rem';
        document.querySelector('.logo-text').style.left = '0px';
        linkTextElements.forEach(function (linkText) {
            linkText.style.display = 'inline';
        });

    } else {
        navbar.style.width = '';
        document.querySelector('main').style.marginLeft = '';
        document.querySelector('.logo svg').style.marginLeft = '';
        document.querySelector('.logo-text').style.left = '';
        linkTextElements.forEach(function (linkText) {
            linkText.style.display = '';
        });
    }
});



