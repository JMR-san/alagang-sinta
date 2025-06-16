let currentPetCount = 1;
let container; // Declare container in global scope

document.addEventListener("DOMContentLoaded", () => {
    container = document.getElementById("currpets-container"); // Assign value to container
    const addBtn = document.getElementById("add-currpet");

    // Attach the click event
    addBtn.addEventListener("click", createMemberForm);

    // Optionally add one pet form on page load
    createMemberForm();
});

function createMemberForm() {
    const wrapper = document.createElement("div");
    wrapper.className = "currpet-form"; // <-- Used by JS to locate all current pet forms

    wrapper.innerHTML = `
        <div class="stacking">
            <div class="input-currspecies">
                <label for="currspecies-${currentPetCount}">Species</label>
                <input type="text" class="pet-species" id="currspecies-${currentPetCount}" placeholder="Dog" />
            </div>
            <div class="input-currage">
                <label for="currage-${currentPetCount}">Age</label>
                <input type="number" class="pet-age" id="currage-${currentPetCount}" placeholder="1" />
            </div>
            <div class="input-currgender">
                <label>Gender</label>
                <div class="form-row">
                    <label><input type="radio" name="currgender-${currentPetCount}" value="M" /> M</label>
                    <label><input type="radio" name="currgender-${currentPetCount}" value="F" /> F</label>
                </div>
            </div>
        </div>
        <div class="form-row">
            <label>Is your current pet rescued?</label>
            <label><input type="radio" name="currpetresc-${currentPetCount}" value="Yes"> Yes</label>
            <label><input type="radio" name="currpetresc-${currentPetCount}" value="No"> No</label>
        </div>
        <div class="form-row">
            <label>Is your current pet neutered/spayed?</label>
            <label><input type="radio" name="currpetneu-${currentPetCount}" value="Yes"> Yes</label>
            <label><input type="radio" name="currpetneu-${currentPetCount}" value="No"> No</label>
        </div>
        <div class="form-row">
            <label>Was your pet bred? (not adopted or rescued)</label>
            <label><input type="radio" name="currpetbred-${currentPetCount}" value="Yes"> Yes</label>
            <label><input type="radio" name="currpetbred-${currentPetCount}" value="No"> No</label>
        </div>
        <div class="stacking">
            <div class="input-vetname">
                <label for="vetname-${currentPetCount}">Your Veterinarian</label>
                <input type="text" class="vet-name" id="vetname-${currentPetCount}" placeholder="Dr. Santos" />
            </div>
            <div class="input-vetnum">
                <label for="vetnum-${currentPetCount}">Contact Number</label>
                <input type="text" class="vet-number" id="vetnum-${currentPetCount}" placeholder="099999999" />
            </div>
        </div>
    `;

    if (container) {
        container.appendChild(wrapper);
        currentPetCount++;
    } else {
        console.error('Container element not found');
    }
}
