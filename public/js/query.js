document.getElementById("adoption-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const members = Array.from(document.querySelectorAll(".member-form")).map(form => ({
    name: form.querySelector(".member-name").value,
    relationship: form.querySelector(".member-relationship").value,
    age: parseInt(form.querySelector(".member-age").value),
    allergies: form.querySelector(".member-allergies").checked,
    supportsAdoption: form.querySelector(".member-supports").checked
  }));

  const data = {
    password: document.getElementById("password-input").value,
    fullname: document.getElementById("fullname-input").value,
    age: parseInt(document.getElementById("age-input").value),
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
    visit: document.querySelector('input[name="visit"]:checked')?.value,
    household_members: members
  };

  try {
    const response = await fetch('http://localhost:3000/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Server responded with ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log('Form submitted successfully:', result);
    alert('Form submitted successfully!');
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('There was an error submitting the form.');
  }
});
