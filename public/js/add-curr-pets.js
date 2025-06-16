function createMemberForm() {
    const wrapper = document.createElement("div");
    wrapper.className = "current-pet"; // <-- IMPORTANT for JS to find

    wrapper.innerHTML = `
        <div class="stacking">
            <div class="input-currspecies">
                <label for="currspecies">Species</label>
                <input type="text" class="pet-species" placeholder="Dog" />
            </div>
            <div class="input-currage">
                <label for="currage">Age</label>
                <input type="number" class="pet-age" placeholder="1" />
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
                <label for="vetname">Your Veterinarian</label>
                <input type="text" class="vet-name" placeholder="Dr. Santos" />
            </div>
            <div class="input-vetnum">
                <label for="vetnum">Contact Number</label>
                <input type="text" class="vet-number" placeholder="099999999" />
            </div>
        </div>
    `;

    container.appendChild(wrapper);
    currentPetCount++;
}
