let currentSlide = 0;

function startSlideshow() {
    const slides = document.querySelectorAll('.pet-image-holder');
    if (slides.length <= 1) return;

    slides[currentSlide].classList.add('active');

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 3000); // Change slide every 3 seconds
}

// Wait until images are loaded before starting the slideshow
window.addEventListener("load", () => {
    startSlideshow();
});
