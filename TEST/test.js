document.getElementById("elementID").innerHTML = "Hello World!";
let age = prompt("Your age?","0"); 
document.getElementById("elementID").innerHTML = age;

fetch('./test.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        // 'data' is already a JavaScript object
        console.log(data);
        // You can now use the 'data' object
        // Example: document.getElementById("anotherElement").innerHTML = data.someProperty;
    })
    .catch(error => {
        console.error('Error fetching JSON:', error);
    });

    