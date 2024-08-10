// Back-to-Top Button Functionality
$(document).ready(function () {
    var btn = $('.back-to-top');

    // Show/hide the button when scrolling
    $(window).scroll(function () {
        if ($(window).scrollTop() > 300) {
            btn.fadeIn();
        } else {
            btn.fadeOut();
        }
    });

    // Scroll to top when the button is clicked
    btn.click(function () {
        $('html, body').animate({ scrollTop: 0 }, 100); // Adjusted duration for smoother scrolling
        return false;
    });
});


function SendMail() {
    var params = {
      from_name: document.getElementById("name").value,
      email_id: document.getElementById("email").value,
      message: document.getElementById("message").value
    };
    emailjs.send("service_8g3hafg", "template_p6u6o3f", params).then(
      function() {
        alert('Message sent successfully!');
      },
      function(error) {
        alert('Failed to send message. Please try again later.');
      }
    );
  }


document.addEventListener("DOMContentLoaded", function() {
    const menuIcon = document.getElementById('menu-icon');
    const menu = document.getElementById('menu');

    menuIcon.addEventListener('click', function() {
        menuIcon.classList.toggle('active');
        menu.classList.toggle('show');
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const projects = document.querySelectorAll('.project');

    const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: Array.from({ length: 101 }, (v, i) => i / 100) // Create thresholds from 0 to 1 in steps of 0.01
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const { target, intersectionRatio, boundingClientRect } = entry;

            // Calculate the distance from the center of the viewport
            const viewportHeight = window.innerHeight;
            const elementCenter = boundingClientRect.top + boundingClientRect.height / 2;
            const viewportCenter = viewportHeight / 2;
            const distanceFromCenter = Math.abs(viewportCenter - elementCenter);

            // Calculate scale based on the distance from the center
            let scale = 0.7 + (1 - distanceFromCenter / viewportCenter) * 0.3;
            scale = Math.max(0.7, Math.min(1, scale)); // Ensure scale is between 0.7 and 1

            // Apply the scale
            target.style.transform = `scale(${scale})`;

            // Adjust box shadow based on scale
            const shadowScale = (scale - 0.7) / 0.3; // Normalize scale between 0 and 1
            const boxShadow = `0 ${4 + 10 * shadowScale}px ${12 + 24 * shadowScale}px rgba(0, 0, 0, ${0.4 + 0.3 * shadowScale})`;
            target.style.boxShadow = boxShadow;

            // Optionally, you can toggle the 'in-view' class based on the intersectionRatio
            if (intersectionRatio > 0.5) {
                target.classList.add('in-view');
            } else {
                target.classList.remove('in-view');
            }
        });
    }, observerOptions);

    projects.forEach(project => {
        observer.observe(project);
    });
});



