function toggleMenu() {
  const navMenu = document.getElementById('nav-menu');
  const sandwichIcon = document.querySelector('.menu-icon');

  if (navMenu.classList.contains('show')) {
    // Collapse the menu from left to right
    navMenu.classList.remove('show');
    navMenu.classList.add('hide-right');
    sandwichIcon.classList.remove('active'); // Optional: reset sandwich icon animation or style
  } else {
    // Expand the menu from right to left
    navMenu.classList.remove('hide-right');
    navMenu.classList.add('show');
    sandwichIcon.classList.add('active'); // Optional: animate sandwich icon or change style
  }
}

function toggleMenu() {
  const menu = document.getElementById("nav-menu");
  const overlay = document.getElementById("menu-overlay");

  menu.classList.toggle("show");
  overlay.classList.toggle("show");
}

