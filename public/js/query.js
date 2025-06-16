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
    applicant_password: document.getElementById("password-input").value,
    applicant_name: document.getElementById("fullname-input").value,
    applicant_age: parseInt(document.getElementById("age-input").value),
    applicant_nationality: document.getElementById("nationality-input").value,
    applicant_address: document.getElementById("address-input").value,
    applicant_telephone: document.getElementById("telphone-input").value,
    applicant_mobileno: document.getElementById("mobilenum-input").value,
    applicant_email: document.getElementById("emailadd-input").value,
    applicant_occupation: document.getElementById("occupation-input").value,
    applicant_residence_type: document.querySelector('input[name="residence"]:checked')?.value,
    applicant_residence_ownership: document.querySelector('input[name="ownership"]:checked')?.value,
    applicant_pets_allowed: document.querySelector('input[name="allowedpets"]:checked')?.value,
    applicant_child_behavior: document.querySelector('input[name="childbehave"]:checked')?.value,
    applicant_permission: document.querySelector('input[name="visit"]:checked')?.value,
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
