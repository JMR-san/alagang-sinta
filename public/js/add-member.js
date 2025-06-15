document.addEventListener("DOMContentLoaded", () => {
  document.getElementsByClassName('reminder-container');
  const container = document.getElementById("members-container");
  const addBtn = document.getElementById("add-member");

  function createMemberForm() {
    const wrapper = document.createElement("div");
    wrapper.className = "member-form";

    wrapper.innerHTML = `
      <div class="form-group">
        <label>Name</label>
        <input type="text" placeholder="Enter name" id="member-name-input"/>
      </div>
      <div class="form-group">
        <label>Relationship</label>
        <input type="text" placeholder="Enter relationship" id="relationship-input"/>
      </div>
      <div class="form-group">
        <label>Age</label>
        <input type="number" placeholder="Enter age" id="member-age-input"/>
      </div>
      <div class="checkbox-group">
        <label><input type="checkbox" id="allergies-input"/> Has Allergies</label>
        <label><input type="checkbox" id="support-input"/> Supports Adoption</label>
      </div>
    `;

    container.appendChild(wrapper);
  }

  addBtn.addEventListener("click", createMemberForm);

  // Initialize with one member form
  createMemberForm();
});
