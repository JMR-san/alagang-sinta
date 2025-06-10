document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".form-information");
    const formMessageDiv = document.getElementById("form-message");

    // Function to display messages to the user
    function displayMessage(message, type) {
        formMessageDiv.textContent = message;
        formMessageDiv.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800'); // Clear previous styles
        if (type === 'success') {
            formMessageDiv.classList.add('bg-green-100', 'text-green-800'); // Tailwind for success styling
        } else if (type === 'error') {
            formMessageDiv.classList.add('bg-red-100', 'text-red-800'); // Tailwind for error styling
        }
        formMessageDiv.classList.remove('hidden'); // Make sure it's visible
        // You might want to hide the message after a few seconds
        setTimeout(() => {
            formMessageDiv.classList.add('hidden');
        }, 5000); 
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Initialize an empty object to store all form data
        const formData = {
            // No need to add applicationId or timestamp here; the backend will handle it.
        };

        // 1. Applicant Information
        formData.applicantInformation = {
            username: document.getElementById("username").value,
            password: document.getElementById("password").value,
            fullName: document.getElementById("fullname").value,
            age: document.getElementById("age").value,
            nationality: document.getElementById("nationality").value,
            address: document.getElementById("address").value,
            telephone: document.getElementById("telphone").value,
            mobileNumber: document.getElementById("mobilenum").value,
            emailAddress: document.getElementById("emailadd").value,
            occupation: document.getElementById("occupation").value,
            residenceType: document.querySelector('input[name="residence"]:checked') ? document.querySelector('input[name="residence"]:checked').value : '',
            ownershipType: document.querySelector('input[name="ownership"]:checked') ? document.querySelector('input[name="ownership"]:checked').value : '',
            permissionToKeepPets: document.querySelector('input[name="allowedpets"]:checked') ? document.querySelector('input[name="allowedpets"]:checked').value : '',
            childrenBehaveWithAnimals: document.querySelector('input[name="childbehave"]:checked') ? document.querySelector('input[name="childbehave"]:checked').value : '', 
            permissionToVisitHome: document.querySelector('input[name="visit"]:checked') ? document.querySelector('input[name="visit"]:checked').value : '', 
        };

        // 2. Household Members
        formData.householdMembers = [];
        const memberForms = document.querySelectorAll("#members-container .member-form");
        memberForms.forEach((memberForm) => {
            formData.householdMembers.push({
                name: memberForm.querySelector('input[type="text"][placeholder="Enter name"]') ? memberForm.querySelector('input[type="text"][placeholder="Enter name"]').value : '',
                relationship: memberForm.querySelector('input[type="text"][placeholder="Enter relationship"]') ? memberForm.querySelector('input[type="text"][placeholder="Enter relationship"]').value : '',
                age: memberForm.querySelector('input[type="number"][placeholder="Enter age"]') ? memberForm.querySelector('input[type="number"][placeholder="Enter age"]').value : '',
                hasAllergies: memberForm.querySelector('input[type="checkbox"]:nth-of-type(1)') ? memberForm.querySelector('input[type="checkbox"]:nth-of-type(1)').checked : false,
                supportsAdoption: memberForm.querySelector('input[type="checkbox"]:nth-of-type(2)') ? memberForm.querySelector('input[type="checkbox"]:nth-of-type(2)').checked : false,
            });
        });

        // 3. Current Pets
        formData.currentPets = [];
        const hasCurrentPetsRadio = document.querySelector('input[name="hascurrpets"]:checked');
        if (hasCurrentPetsRadio && hasCurrentPetsRadio.value === 'yes') {
            const currPetForms = document.querySelectorAll("#currpets-container .currpet-form");
            currPetForms.forEach((petForm) => {
                formData.currentPets.push({
                    species: petForm.querySelector('input[name="currspecies"]') ? petForm.querySelector('input[name="currspecies"]').value : '',
                    age: petForm.querySelector('input[name="currage"]') ? petForm.querySelector('input[name="currage"]').value : '',
                    gender: petForm.querySelector('input[name="currgender"]:checked') ? petForm.querySelector('input[name="currgender"]:checked').value : '',
                    isRescued: petForm.querySelector('input[name="currpetresc"]:checked') ? petForm.querySelector('input[name="currpetresc"]:checked').value : '',
                    isNeuteredSpayed: petForm.querySelector('input[name="currpetneu"]:checked') ? petForm.querySelector('input[name="currpetneu"]:checked').value : '',
                    wasBred: petForm.querySelector('input[name="currpetbred"]:checked') ? petForm.querySelector('input[name="currpetbred"]:checked').value : '',
                    veterinarianName: petForm.querySelector('input[name="vetname"]') ? petForm.querySelector('input[name="vetname"]').value : '',
                    veterinarianContact: petForm.querySelector('input[name="vetnum"]') ? petForm.querySelector('input[name="vetnum"]').value : '',
                });
            });
        }

        // 4. Past Pets
        formData.pastPets = [];
        const hasPastPetsRadio = document.querySelector('input[name="haspastpets"]:checked');
        if (hasPastPetsRadio && hasPastPetsRadio.value === 'yes') {
            const pastPetForms = document.querySelectorAll("#pastpets-container .pastpet-form");
            pastPetForms.forEach((petForm) => {
                formData.pastPets.push({
                    species: petForm.querySelector('input[name="pastspecies"]') ? petForm.querySelector('input[name="pastspecies"]').value : '',
                    age: petForm.querySelector('input[name="pastage"]') ? petForm.querySelector('input[name="pastage"]').value : '',
                    status: petForm.querySelector('input[name="paststatus"]:checked') ? petForm.querySelector('input[name="paststatus"]:checked').value : '',
                    isRescued: petForm.querySelector('input[name="pastpetresc"]:checked') ? petForm.querySelector('input[name="pastpetresc"]:checked').value : '',
                    wasBred: petForm.querySelector('input[name="pastpetbred"]:checked') ? petForm.querySelector('input[name="pastpetbred"]:checked').value : '',
                });
            });
        }
        
        console.log("Collected Form Data:", formData);

        // Send the data to your Node.js server
        try {
            // *** IMPORTANT CHANGE HERE: Updated the fetch URL to be relative ***
            const response = await fetch('/submit-application', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Application submitted successfully:', result);
                displayMessage('Application submitted successfully! Your ID: ' + result.applicationId, 'success');
                form.reset(); // Resets all form fields
            } else {
                console.error('Failed to submit application:', response.statusText);
                displayMessage('Failed to submit application. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            displayMessage('An error occurred. Please try again later.', 'error');
        }
    });
});
