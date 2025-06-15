// submit-form.js
document.addEventListener("DOMContentLoaded", () => {
    // Select the form element
    const form = document.querySelector(".form-information");
    // Select the button that triggers the form submission
    const signUpButton = document.querySelector(".btn-sign-up");
    // Select an element to display messages to the user (e.g., success or error)
    const messageDisplay = document.getElementById("error_message"); // Assuming you have an element with this ID in your form

    // Function to collect all form data
    function collectFormData() {
        const formData = {};

        // Collect data from applicant information
        formData.applicant = {
            username: document.getElementById("username-input").value,
            password: document.getElementById("password-input").value,
            fullName: document.getElementById("fullname-input").value,
            age: document.getElementById("age-input").value,
            nationality: document.getElementById("nationality-input").value,
            address: document.getElementById("address-input").value,
            telephone: document.getElementById("telphone-input").value,
            mobileNumber: document.getElementById("mobilenum-input").value,
            emailAddress: document.getElementById("emailadd-input").value,
            occupation: document.getElementById("occupation-input").value,
            residenceType: document.querySelector('input[name="residence"]:checked')?.value || '',
            ownershipType: document.querySelector('input[name="ownership"]:checked')?.value || '',
            allowedPets: document.querySelector('input[name="allowedpets"]:checked')?.value || '',
            childBehave: document.querySelector('input[name="childbehave"]:checked')?.value || '',
            permissionToVisit: document.querySelector('input[name="visit"]:checked')?.value || ''
        };

        // Collect household members data
        formData.members = [];
        document.querySelectorAll("#members-container .member-form").forEach(memberForm => {
            formData.members.push({
                name: memberForm.querySelector("#member-name-input")?.value || '',
                relationship: memberForm.querySelector("#relationship-input")?.value || '',
                age: memberForm.querySelector("#member-age-input")?.value || '',
                hasAllergies: memberForm.querySelector("#allergies-input")?.checked || false,
                supportsAdoption: memberForm.querySelector("#support-input")?.checked || false
            });
        });

        // Collect current pets data
        formData.currentPets = [];
        if (document.querySelector('input[name="hascurrpets"]:checked')?.value === 'yes') {
            document.querySelectorAll("#currpets-container .currpet-form").forEach(currPetForm => {
                formData.currentPets.push({
                    species: currPetForm.querySelector('[name="currspecies"]')?.value || '',
                    age: currPetForm.querySelector('[name="currage"]')?.value || '',
                    gender: currPetForm.querySelector('input[name="currgender"]:checked')?.value || '',
                    isRescued: currPetForm.querySelector('input[name="currpetresc"]:checked')?.value === 'Yes',
                    isNeuteredSpayed: currPetForm.querySelector('input[name="currpetneu"]:checked')?.value === 'Yes',
                    isBred: currPetForm.querySelector('input[name="currpetbred"]:checked')?.value === 'Yes',
                    vetName: currPetForm.querySelector('[name="vetname"]')?.value || '',
                    vetContact: currPetForm.querySelector('[name="vetnum"]')?.value || ''
                });
            });
        }

        // Collect past pets data
        formData.pastPets = [];
        if (document.querySelector('input[name="haspastpets"]:checked')?.value === 'yes') {
            document.querySelectorAll("#pastpets-container .pastpet-form").forEach(pastPetForm => {
                formData.pastPets.push({
                    species: pastPetForm.querySelector('[name="pastspecies"]')?.value || '',
                    age: pastPetForm.querySelector('[name="pastage"]')?.value || '',
                    status: pastPetForm.querySelector('input[name="paststatus"]:checked')?.value || '',
                    isRescued: pastPetForm.querySelector('input[name="pastpetresc"]:checked')?.value === 'Yes',
                    isBred: pastPetForm.querySelector('input[name="pastpetbred"]:checked')?.value === 'Yes'
                });
            });
        }

        return formData;
    }

    // Function to display messages to the user
    function displayMessage(message, isError = false) {
        if (messageDisplay) {
            messageDisplay.textContent = message;
            messageDisplay.style.color = isError ? "red" : "green";
            messageDisplay.style.display = "block"; // Make sure it's visible
            setTimeout(() => {
                messageDisplay.style.display = "none"; // Hide after some time
            }, 5000);
        }
    }

    // Event listener for form submission
    signUpButton.addEventListener("click", async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Basic client-side validation (add more robust validation as needed)
        // You can integrate your 'validation.js' here if it's purely client-side
        if (!form.checkValidity()) {
            displayMessage("Please fill in all required fields.", true);
            form.reportValidity(); // Shows browser's default validation messages
            return;
        }

        // Collect all form data
        const data = collectFormData();

        // --- CREATE operation (POST request) ---
        try {
            const response = await fetch("/api/applications", { // Hypothetical API endpoint for applications
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data), // Send data as JSON
            });

            // Check if the request was successful (status code 2xx)
            if (response.ok) {
                const result = await response.json();
                displayMessage("Application submitted successfully!", false);
                console.log("Success:", result);
                // Optionally redirect or clear form here
                form.reset(); // Clear the form after successful submission
                // Re-initialize dynamic forms if needed
                document.getElementById('members-container').innerHTML = `<div class="reminder-container"><p>List all members (excluding pets) of the household, including children.</p></div>`;
                document.getElementById('currpets-container').innerHTML = `<div class="reminder-container"><p>If yes, please give us the following details:</p></div>`;
                document.getElementById('pastpets-container').innerHTML = `<div class="reminder-container"><p>If yes, please give us the following details:</p></div>`;
                // Trigger initial form creation functions from add-member.js, add-curr-pets.js, add-pastpets.js if they are exported or globally accessible
                // For example, if createMemberForm() is global: createMemberForm();
                // Or reload the page to reset everything
                // window.location.reload();
            } else {
                const errorData = await response.json();
                displayMessage(`Error submitting application: ${errorData.message || response.statusText}`, true);
                console.error("Error response from server:", errorData);
            }
        } catch (error) {
            displayMessage("Network error or server unavailable. Please try again.", true);
            console.error("Fetch error:", error);
        }
    });

    // --- READ operation (GET request - example) ---
    // This function would fetch data, e.g., to display existing applications or user profiles.
    async function fetchApplications() {
        try {
            const response = await fetch("/api/applications"); // Hypothetical API endpoint
            if (response.ok) {
                const applications = await response.json();
                console.log("Fetched applications:", applications);
                // Render applications on the page (e.g., in a table or list)
            } else {
                console.error("Failed to fetch applications:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        }
    }

    // Call fetchApplications() on page load if you want to display data immediately
    // fetchApplications();


    // --- UPDATE operation (PUT/PATCH request - example) ---
    // This function would send updated data for an existing record.
    async function updateApplication(applicationId, updatedData) {
        try {
            const response = await fetch(`/api/applications/${applicationId}`, { // Endpoint with ID
                method: "PUT", // Or PATCH for partial updates
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const result = await response.json();
                displayMessage("Application updated successfully!", false);
                console.log("Update successful:", result);
                // Re-fetch or update UI
            } else {
                const errorData = await response.json();
                displayMessage(`Error updating application: ${errorData.message || response.statusText}`, true);
                console.error("Error updating:", errorData);
            }
        } catch (error) {
            displayMessage("Network error during update. Please try again.", true);
            console.error("Update error:", error);
        }
    }

    // Example usage (would be triggered by an edit form submission)
    // const someApplicationId = "123";
    // const newApplicantData = { emailAddress: "newemail@example.com" };
    // updateApplication(someApplicationId, { applicant: newApplicantData });


    // --- DELETE operation (DELETE request - example) ---
    // This function would send a request to delete a record.
    async function deleteApplication(applicationId) {
        try {
            const response = await fetch(`/api/applications/${applicationId}`, { // Endpoint with ID
                method: "DELETE",
            });

            if (response.ok) {
                displayMessage("Application deleted successfully!", false);
                console.log(`Application ${applicationId} deleted.`);
                // Remove item from UI
            } else {
                const errorData = await response.json();
                displayMessage(`Error deleting application: ${errorData.message || response.statusText}`, true);
                console.error("Error deleting:", errorData);
            }
        } catch (error) {
            displayMessage("Network error during delete. Please try again.", true);
            console.error("Delete error:", error);
        }
    }

    // Example usage (would be triggered by a delete button click)
    // const applicationIdToDelete = "456";
    // deleteApplication(applicationIdToDelete);
});
