const forms = document.querySelectorAll("form")

forms.forEach(async (form) => {
  
  function insertErrorUnderField(inputElement, errorMsg) {
    let errElement = inputElement.nextElementSibling
    if (!errElement || errElement.id != `errorMsg-${inputElement.name}`) {
      errElement = document.createElement('span')
      errElement.classList.add("text-danger")
      errElement.id = `errorMsg-${inputElement.name}`
      errElement.innerText = errorMsg
      inputElement.insertAdjacentElement("afterend", errElement);
    } else if (errElement.id == `errorMsg-${inputElement.name}`) {
      errElement.innerText = `${errorMsg}`
    }
  }
  function removePreviousError() {
    const errorElements = form.querySelectorAll('[id^="errorMsg"]');
    for (const element of errorElements) {
      element.remove()
    }
  }

  function removeErrorFields() {
    const errElements = form.querySelectorAll('[id^="errorMsg-"]');
    errElements.forEach((ele) => ele.remove())
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    form.classList.add('was-validated')
    
    if (!form.checkValidity()) {
      return e.stopPropagation()
    }
    const formData = new FormData(form);

    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      redirect: "manual", // 👈 stop auto-follow
    });
    
    if (response.type === "opaqueredirect" || response.status === 0) {
      // This means the server responded with a redirect (302/303)
      window.location.href = response.url || form.action;
      return;
    }
    

    // Handle JSON responses (for API endpoints that don't redirect)
    const contentType = response.headers.get('content-type') || "";
    if (!contentType.includes('application/json')) {
      return
    }
    const res = await response.json();

    if (res.result) {
        removeErrorFields();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        Toastify({
          text: `${(res.message) ? ((form.dataset.formType) ? form.dataset.formType : "") + res.message : "Successful"}`,
          duration: parseInt(form.dataset.toastDuration) || 3000,
          gravity: form.dataset.toastGravity || "bottom",
          position: form.dataset.toastPosition || "right",
          close: form.dataset.toastClose === "close"
        }).showToast();
      
    } else {

        if ((!res.result && res.statusCode == 200)) {
          removeErrorFields()
          for (let errorField in res.payload) {
            const ele = form.querySelector(`input[name="${errorField}"]`);
            if (ele) {
              ele.classList.add("is-invalid");
              insertErrorUnderField(ele, res.payload[errorField].join(", "));
            }
          }
          form.classList.remove("was-validated");
        }

        Toastify({
          text: `Failed: ${res.message}`,
          style: {
            background: "linear-gradient(to right, #ab2f2fff, #a14444ff)"
          },
          duration: 3000,
          gravity: "bottom",
          position: "right",
          close: "close"
        }).showToast();
      
    }
  });
})
