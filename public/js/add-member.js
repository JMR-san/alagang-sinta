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
        <input type="text" placeholder="Enter name" />
      </div>
      <div class="form-group">
        <label>Relationship</label>
        <input type="text" placeholder="Enter relationship" />
      </div>
      <div class="form-group">
        <label>Age</label>
        <input type="number" placeholder="Enter age" />
      </div>
      <div class="checkbox-group">
        <label><input type="checkbox" /> Has Allergies</label>
        <label><input type="checkbox" /> Supports Adoption</label>
      </div>
    `;

    container.appendChild(wrapper);
  }

  addBtn.addEventListener("click", createMemberForm);

  // Initialize with one member form
  createMemberForm();
});
