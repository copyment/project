document.addEventListener("DOMContentLoaded", function () {
    // Simulate a delay (you can replace this with actual loading tasks)
    setTimeout(function () {
        // Hide the loading screen
        document.querySelector(".loader-container").style.display = "none";

        // Show your main content (you can replace this with your main content display logic)
        document.body.style.overflow = "auto"; // Re-enable scrolling
    }, 2000); // Change the delay time as needed (in milliseconds)
});
