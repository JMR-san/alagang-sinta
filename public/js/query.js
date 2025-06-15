document.getElementById("adoption-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const data = {
      username: document.getElementById("username-input").value,
      password: document.getElementById("password-input").value,
      fullname: document.getElementById("fullname-input").value,
      age: document.getElementById("age-input").value,
      nationality: document.getElementById("nationality-input").value,
      address: document.getElementById("address-input").value,
      telphone: document.getElementById("telphone-input").value,
      mobilenum: document.getElementById("mobilenum-input").value,
      emailadd: document.getElementById("emailadd-input").value,
      occupation: document.getElementById("occupation-input").value,
      residence: document.querySelector('input[name="residence"]:checked')?.value,
      ownership: document.querySelector('input[name="ownership"]:checked')?.value,
      allowedpets: document.querySelector('input[name="allowedpets"]:checked')?.value,
      childbehave: document.querySelector('input[name="childbehave"]:checked')?.value,
      visit: document.querySelector('input[name="visit"]:checked')?.value
    };

    const response = await fetch("http://localhost:3000/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);
  });