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

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    errorEl.classList.add("d-none");
    successEl.classList.add("d-none");

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    // Client-side validation
    if (name.length < 2 || name.length > 80) {
      form.classList.add("was-validated");
      return showError("Please enter your name (2–80 characters).");
    }
    if (!isValidEmail(email) || email.length > 254) {
      form.classList.add("was-validated");
      return showError("Please enter a valid email address.");
    }
    if (message.length < 10 || message.length > 2000) {
      form.classList.add("was-validated");
      return showError("Please enter a message (10–2000 characters).");
    }
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return showError("Please fix the highlighted fields.");
    }

    // Disable button to prevent double submits
    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
      const formData = new FormData(form);

      // Honeypot support (if you included it in the HTML)
      // If you didn't add the hidden "company" field, this does nothing.
      // formData.set("company", form.company?.value || "");

      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          "Form could not be submitted. Please try again.";
        throw new Error(msg);
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
