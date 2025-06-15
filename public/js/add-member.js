document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("members-container");
  const addBtn = document.getElementById("add-member");

  function createMemberForm() {
    const wrapper = document.createElement("div");
    wrapper.className = "member-form household-member"; // added `household-member` for easier data collection

    wrapper.innerHTML = `
      <div class="form-group">
        <label>Name</label>
        <input type="text" class="member-name" placeholder="Enter name" />
      </div>
      <div class="form-group">
        <label>Relationship</label>
        <input type="text" class="member-relationship" placeholder="Enter relationship" />
      </div>
      <div class="form-group">
        <label>Age</label>
        <input type="number" class="member-age" placeholder="Enter age" />
      </div>
      <div class="checkbox-group">
        <label><input type="checkbox" class="member-allergies" /> Has Allergies</label>
        <label><input type="checkbox" class="member-supports" /> Supports Adoption</label>
      </div>
    `;

    container.appendChild(wrapper);
  }

  addBtn.addEventListener("click", (e) => {
    e.preventDefault(); // prevent form submission
    createMemberForm();
  });

  // Initialize with one member form
  createMemberForm();
});
