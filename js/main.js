(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const btn = document.getElementById("contactSubmitBtn");
  const successEl = document.getElementById("contactSuccess");
  const errorEl = document.getElementById("contactError");

  const showError = (msg) => {
    errorEl.textContent = msg;
    errorEl.classList.remove("d-none");
    successEl.classList.add("d-none");
  };

  const showSuccess = () => {
    errorEl.classList.add("d-none");
    successEl.classList.remove("d-none");
  };

  const isValidEmail = (email) => {
    // Practical email check (not RFC-perfect, but solid)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Reset messages
    errorEl.classList.add("d-none");
    successEl.classList.add("d-none");

    // Grab values
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    // Custom validation messages
    let customError = "";
    if (name.length < 2 || name.length > 80) customError = "Please enter your name (2–80 characters).";
    else if (!isValidEmail(email) || email.length > 254) customError = "Please enter a valid email address.";
    else if (message.length < 10 || message.length > 2000) customError = "Please enter a message (10–2000 characters).";

    // Bootstrap visual validation
    if (customError) {
      form.classList.add("was-validated");
      showError(customError);
      return;
    }

    // HTML5 validation (required/minlength/etc)
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showError("Please fix the highlighted fields.");
      return;
    }

    // Disable button to prevent double-submits
    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
      const formData = new FormData(form);

      const res = await fetch("contact.php", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      showSuccess();
      form.reset();
      form.classList.remove("was-validated");
    } catch (err) {
      showError(err.message || "Could not send your message. Please try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Send Message";
    }
  });
})();
