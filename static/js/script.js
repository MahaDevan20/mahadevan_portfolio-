// Dark Mode / Light Mode Toggle (Tailwind CSS)
(function () {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Function to get icons
  function getIcons() {
    return {
      sunIcon: document.querySelector(".sun-icon"),
      moonIcon: document.querySelector(".moon-icon"),
    };
  }

  // Function to update icon visibility
  function updateIcons(isDark) {
    const { sunIcon, moonIcon } = getIcons();
    if (isDark) {
      // Dark mode: show moon, hide sun
      if (sunIcon) {
        sunIcon.style.opacity = "0";
        sunIcon.style.pointerEvents = "none";
      }
      if (moonIcon) {
        moonIcon.style.opacity = "1";
        moonIcon.style.pointerEvents = "auto";
      }
    } else {
      // Light mode: show sun, hide moon
      if (sunIcon) {
        sunIcon.style.opacity = "1";
        sunIcon.style.pointerEvents = "auto";
      }
      if (moonIcon) {
        moonIcon.style.opacity = "0";
        moonIcon.style.pointerEvents = "none";
      }
    }
  }

  // Get saved theme preference or default to light mode
  const savedTheme = localStorage.getItem("theme") || "light";

  // Apply saved theme on page load
  if (savedTheme === "dark") {
    html.classList.add("dark");
    updateIcons(true);
  } else {
    html.classList.remove("dark");
    updateIcons(false);
  }

  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const isDark = html.classList.contains("dark");
      if (isDark) {
        html.classList.remove("dark");
        localStorage.setItem("theme", "light");
        updateIcons(false);
      } else {
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
        updateIcons(true);
      }
    });
  }
})();

// Scroll to top button visibility
window.addEventListener("scroll", function () {
  const scrollTop = document.getElementById("scrollTop");
  if (window.pageYOffset > 300) {
    scrollTop.classList.remove("opacity-0", "invisible");
    scrollTop.classList.add("opacity-100", "visible");
  } else {
    scrollTop.classList.remove("opacity-100", "visible");
    scrollTop.classList.add("opacity-0", "invisible");
  }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Toast Notification System (Tailwind CSS)
function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");

  const bgColor =
    type === "success"
      ? "bg-green-500 dark:bg-green-600"
      : "bg-red-500 dark:bg-red-600";

  toast.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-xl max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove("translate-x-full", "opacity-0");
    toast.classList.add("translate-x-0", "opacity-100");
  }, 10);

  // Remove toast after animation
  setTimeout(() => {
    toast.classList.remove("translate-x-0", "opacity-100");
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// Form Validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateForm(name, email, message) {
  const errors = {};

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long.";
  }

  // Email validation
  if (!email || !validateEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  // Message validation
  if (!message || message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters long.";
  }

  return errors;
}

function displayFieldError(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (errorMessage) {
    field.setAttribute("aria-invalid", "true");
    field.classList.add("border-red-500", "dark:border-red-400");
    field.classList.remove(
      "border-gray-300",
      "dark:border-gray-600",
      "border-blue-600",
      "dark:border-blue-400"
    );
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.classList.remove("hidden");
    }
  } else {
    field.setAttribute("aria-invalid", "false");
    field.classList.remove("border-red-500", "dark:border-red-400");
    field.classList.add("border-gray-300", "dark:border-gray-600");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.add("hidden");
    }
  }
}

function clearAllErrors() {
  ["name", "email", "message"].forEach((fieldId) => {
    displayFieldError(fieldId, "");
  });
}

// Real-time validation
document.addEventListener("DOMContentLoaded", function () {
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const messageField = document.getElementById("message");

  if (nameField) {
    nameField.addEventListener("blur", function () {
      const errors = validateForm(this.value, "", "");
      displayFieldError("name", errors.name || "");
    });
  }

  if (emailField) {
    emailField.addEventListener("blur", function () {
      const errors = validateForm("", this.value, "");
      displayFieldError("email", errors.email || "");
    });
  }

  if (messageField) {
    messageField.addEventListener("blur", function () {
      const errors = validateForm("", "", this.value);
      displayFieldError("message", errors.message || "");
    });
  }

  // Clear errors on input
  [nameField, emailField, messageField].forEach((field) => {
    if (field) {
      field.addEventListener("input", function () {
        if (this.classList.contains("error")) {
          displayFieldError(this.id, "");
        }
      });
    }
  });
});

// Contact form submission
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const submitButton = document.getElementById("submit-btn");
    const btnText = submitButton.querySelector(".btn-text");
    const btnSpinner = submitButton.querySelector(".btn-spinner");
    const formMessage = document.getElementById("form-message");

    // Clear previous errors and messages
    clearAllErrors();
    formMessage.textContent = "";
    formMessage.className = "form-message hidden p-4 rounded-lg text-sm";
    formMessage.classList.add("hidden");

    // Validate form
    const errors = validateForm(name, email, message);
    if (Object.keys(errors).length > 0) {
      // Display validation errors
      Object.keys(errors).forEach((field) => {
        displayFieldError(field, errors[field]);
      });
      showToast("Please fix the errors in the form.", "error");
      return;
    }

    // Disable button and show loading state
    submitButton.disabled = true;
    btnText.textContent = "Sending...";
    btnSpinner.classList.remove("hidden");
    btnSpinner.style.display = "inline-block";

    // Send data to Flask backend
    fetch("/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          this.reset();
          clearAllErrors();
        } else {
          showToast(data.message, "error");
          formMessage.textContent = data.message;
          formMessage.className =
            "form-message p-4 rounded-lg text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700";
          formMessage.classList.remove("hidden");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        const errorMsg =
          "Sorry, there was an error sending your message. Please try again later or contact me directly at mahadevannair16@gmail.com";
        showToast(errorMsg, "error");
        formMessage.textContent = errorMsg;
        formMessage.className =
          "form-message p-4 rounded-lg text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700";
        formMessage.classList.remove("hidden");
      })
      .finally(() => {
        // Re-enable button
        submitButton.disabled = false;
        btnText.textContent = "Send Message";
        btnSpinner.classList.add("hidden");
        btnSpinner.style.display = "none";
      });
  });
}

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe all sections for fade-in animation
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".section > .container > *");
  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(section);
  });
});
