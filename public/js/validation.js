const form = document.getElementById('form')
const username_input = document.getElementById('username-input')
const password_input = document.getElementById('password-input')
const fullname_input = document.getElementById('fullname-input')

form.addEventListener('submit', (e) => {
    let errors = []
    
    if(fullname_input){
        errors = getSignupFormsErrors()
    } else {
        errors = getLoginFormErrors(username_input.value, password_input.value)
    }

    if (errors.length > 0){
        e.preventDefault()
        error_message.innerText = errors.join(". ")
    }
e.preventDefault();

  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;

  fetch("/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({username, password})
  })
.then((res) => {
  // Instead of res.json(), get text to see raw response
  return res.text();
})
.then((data) => {
  console.log("Raw Server Response:", data); // Log the raw response
  // Try to parse as JSON manually if you expect it
  try {
    const jsonData = JSON.parse(data);
    if (jsonData.success) {
      window.location.href = "/pages/homepage.html";
    } else {
      document.getElementById("error_message").innerText = jsonData.message;
    }
  } catch (e) {
    console.error("Failed to parse JSON:", e, "Raw data:", data);
    document.getElementById("error_message").innerText = "Server returned invalid response.";
  }
})
.catch((error) => {
  console.error("Login Error:", error);
  document.getElementById("error_message").innerText = "Something went wrong.";
});
});


function getLoginFormErrors(username, password){
    let errors = []

    if (username === '' || username == null){
        errors.push('Username is required')
        username_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    return errors;
}