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

  document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.main-image'); // Select all main images
    const dots = document.querySelectorAll('.dot'); // Select all dots
    let currentIndex = 0; // Track the current visible image
    const totalImages = 3; // Only consider the first three images for auto-slide
    let autoSlideInterval; // Store the auto-slide interval
    let autoSlideActive = true; // Track auto-slide status
    let dotsHighlightActive = true; // Track dot highlight status

    // Function to show a specific image with fade effect
    function showImage(index) {
        images.forEach((image, i) => {
            if (i === index) {
                image.style.display = 'block'; // Ensure the image is visible
                image.classList.add('fade-in');
                image.classList.remove('fade-out');
            } else {
                image.classList.add('fade-out');
                image.classList.remove('fade-in');
                // Set timeout to hide the image after the fade-out effect is done
                setTimeout(() => {
                    image.style.display = 'none'; // Hide after fade-out animation
                }, 100); // Match the CSS transition duration
            }
        });

        if (dotsHighlightActive) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index); // Highlight the active dot
            });
        }

        currentIndex = index; // Update the current index
    }

    // Start auto slide functionality (restricted to the first three images)
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % totalImages; // Cycle through indices 0, 1, 2
            showImage(nextIndex);
        }, 500000); // Change image every 5 seconds
        autoSlideActive = true;
    }

    // Stop auto slide functionality
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideActive = false;
    }

    // Disable dot highlighting
    function disableDotHighlight() {
        dotsHighlightActive = false;
        dots.forEach(dot => dot.classList.remove('active')); // Remove all dot highlights
    }

    // Enable dot highlighting
    function enableDotHighlight() {
        dotsHighlightActive = true;
        showImage(currentIndex); // Reapply highlight to the current index
    }

    // Dot click functionality
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index')); // Get the index from the dot's data attribute
            showImage(index); // Show the corresponding image
            if (!autoSlideActive) {
                startAutoSlide(); // Resume auto-sliding when a dot is clicked
            }
            enableDotHighlight(); // Resume dot highlighting
        });
    });

    // Add event listener to buttons to stop auto-slide and disable dot highlighting
    document.querySelectorAll('.switch-btn').forEach(button => {
        button.addEventListener('click', () => {
            stopAutoSlide(); // Stop auto-slide when a button is clicked
            disableDotHighlight(); // Stop dot highlighting
        });
    });

    // Initialize
    showImage(0); // Show the first image initially
    startAutoSlide(); // Start auto-sliding with the first three images
});