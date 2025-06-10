
let pastPetCount = 1;
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("pastpets-container");
    const addBtn = document.getElementById("add-pastpet");

    // --- Pet-related elements ---
    document.getElementsByClassName('reminder-container');
    const radioButtons = document.querySelectorAll('input[name="haspastpets"]');
    const currPetsContainer = document.getElementById('pastpets-container');
    const addCurrPetButton = document.getElementById('add-pastpet');
    // --- End Pet-related elements ---

    function createMemberForm() {
        const wrapper = document.createElement("div");
        wrapper.className = "pastpet-form";

        wrapper.innerHTML = `
            <div class="stacking">
                <div class="input-pastspecies">
                    <label for="pastspecies">Species</label>
                    <input type="text" name="pastspecies" id="pastspecies" placeholder="Dog" />
                </div>
                <div class="input-pastage">
                    <label for="pastage">Age</label>
                    <input type="number" name="pastage" id="pastage" placeholder="1" />
                </div>
                <div class="input-paststatus">
                    <label>Status</label>
                    <div class="form-row">
                        <label><input type="radio" name="paststatus" id="paststatus" value="Deceased"/> Deceased</label>
                        <label><input type="radio" name="paststatus" id="paststatus" value="Rehomed"/> Rehomed</label>
                    </div>
                </div>
            </div>
            <div class="form-row">
                <label>Was your past pet rescued?</label>
                <label><input type="radio" name="pastpetresc" value="Yes"> Yes</label>
                <label><input type="radio" name="pastpetresc" value="No"> No</label>
            </div>
            <div class="form-row">
                <label>Was your past pet bred? (not adopted or rescued)</label>
                <label><input type="radio" name="pastpetbred" value="Yes"> Yes</label>
                <label><input type="radio" name="pastpetbred" value="No"> No</label>
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
