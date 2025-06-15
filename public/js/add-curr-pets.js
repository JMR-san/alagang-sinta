
let currentPetCount = 1;
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("currpets-container");
    const addBtn = document.getElementById("add-currpet");

    // --- Pet-related elements ---
    const radioButtons = document.querySelectorAll('input[name="hascurrpets"]');
    const currPetsContainer = document.getElementById('currpets-container');
    const addCurrPetButton = document.getElementById('add-currpet');
    // --- End Pet-related elements ---

    function createMemberForm() {
        const wrapper = document.createElement("div");
        wrapper.className = "currpet-form";

        wrapper.innerHTML = `
            <div class="stacking">
                <div class="input-currspecies">
                    <label for="currspecies">Species</label>
                    <input type="text" name="currspecies" id="currspecies-input" placeholder="Dog" />
                </div>
                <div class="input-currage">
                    <label for="currage">Age</label>
                    <input type="number" name="currage" id="currage-input" placeholder="1" />
                </div>
                <div class="input-currgender">
                    <label>Gender</label>
                    <div class="form-row">
                        <label><input type="radio" name="currgender" id="" value="M"/> M</label>
                        <label><input type="radio" name="currgender" id="" value="F"/> F</label>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <label>Is your current pet rescued?</label>
                <label><input type="radio" name="currpetresc" value="Yes"> Yes</label>
                <label><input type="radio" name="currpetresc" value="No"> No</label>
            </div>
            <div class="form-row">
                <label>Is your current pet neutered/spayed?</label>
                <label><input type="radio" name="currpetneu" value="Yes"> Yes</label>
                <label><input type="radio" name="currpetneu" value="No"> No</label>
            </div>
            <div class="form-row">
                <label>Was your pet bred? (not adopted or rescued)</label>
                <label><input type="radio" name="currpetbred" value="Yes"> Yes</label>
                <label><input type="radio" name="currpetbred" value="No"> No</label>
            </div>
            <div class="stacking">
                <div class="input-vetname">
                    <label for="vetname">Your Veterinarian</label>
                    <input type="text" name="vetname" id="vetname-input" placeholder="Dr. Santos" />
                </div>
                <div class="input-vetnum">
                    <label for="vetnum">Contact Number</label>
                    <input type="text" name="vetnum" id="vetnum-input" placeholder="1" />
                </div>
            </div>
        `;

        container.appendChild(wrapper);
    }

    // --- Pet-related function and event listeners ---
    function updateVisibility() {
        let selectedValue = null;
        radioButtons.forEach(radio => {
            if (radio.checked) {
                selectedValue = radio.value;
            }
        });

        if (selectedValue === 'yes') {
            currPetsContainer.style.display = 'block'; // Or 'flex', 'grid', etc.
            addCurrPetButton.style.display = 'block';
        } else {
            currPetsContainer.style.display = 'none';
            addCurrPetButton.style.display = 'none';
        }
    }

    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateVisibility);
    });

    // Initial check when the page loads
    updateVisibility();
    // --- End Pet-related function and event listeners ---

    addBtn.addEventListener("click", createMemberForm);

    // Initialize with one member form
    createMemberForm();
});
