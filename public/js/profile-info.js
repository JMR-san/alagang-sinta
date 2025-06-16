// profile-info.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://bilyuymilatjhdfuerkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbHl1eW1pbGF0amhkZnVlcmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTU4ODYsImV4cCI6MjA2NDYzMTg4Nn0.79Kl1ubGXdS1TVestMYm9iahpqDqpmJhwbfUqcZU5Rs'; // shortened for brevity
const supabase = createClient(supabaseUrl, supabaseKey);

let hasUnsavedChanges = false;

function parseOrNull(value) {
  const num = parseInt(value);
  return isNaN(num) ? null : num;
}

function cleanUpdates(obj) {
  const cleaned = {};
  for (const key in obj) {
    const val = obj[key];
    if (val !== '' && val !== undefined) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

function setRadioValue(name, value) {
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  radios.forEach(r => r.checked = r.value === value);
}

function createEditableRow(containerId, item, type, fields, applicantId) {
  const div = document.createElement('div');
  div.className = 'item-row';

  const idColumnMap = {
    household_member: 'house_member_id',
    current_pets: 'curr_pet_id',
    past_pets: 'past_pet_id'
  };
  const idColumn = idColumnMap[type];
  const recordId = item[idColumn];

  div.dataset.id = recordId;
  div.dataset.idColumn = idColumn;

  fields.forEach(field => {
    const input = document.createElement('input');
    input.value = item[field] || '';
    input.dataset.field = field;
    input.className = `${type}-input`;

    input.addEventListener('input', () => {
      hasUnsavedChanges = true;
    });

    div.appendChild(input);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async (e) => {
  e.preventDefault(); // NOW it works!
  hasUnsavedChanges = false; // allow delete
  const confirmDelete = confirm('Are you sure you want to delete this entry?');
  if (!confirmDelete) return;

  if (recordId && applicantId && idColumn) {
    const { error } = await supabase
      .from(type)
      .delete()
      .match({
        [idColumn]: recordId,
        applicant_id: applicantId
      });

    if (error) {
      console.error(`❌ Failed to delete from ${type}:`, error.message);
      alert('Failed to delete record. Check console for details.');
    } else {
      console.log(`✅ Deleted ${type} record ${recordId}`);
      div.remove();
    }
  }
});


  div.appendChild(deleteBtn);
  document.getElementById(containerId).appendChild(div);
}

window.addEventListener('beforeunload', function (e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const applicantId = localStorage.getItem('applicant_id');
  if (!applicantId) return;

  const { data: profile, error: profileError } = await supabase
    .from('applicant_information')
    .select('*')
    .eq('applicant_id', applicantId)
    .single();

  if (profileError || !profile) {
    console.error('Failed to fetch applicant profile:', profileError);
    alert('Could not load your profile. Please check if your email is correct.');
    return;
  }

  const inputs = [
    ['emailadd', 'applicant_email'],
    ['fullname', 'applicant_name'],
    ['age', 'applicant_age'],
    ['nationality', 'applicant_nationality'],
    ['address', 'applicant_address'],
    ['telphone', 'applicant_telephone'],
    ['mobilenum', 'applicant_mobileno'],
    ['occupation', 'applicant_occupation']
  ];

  inputs.forEach(([id, field]) => {
    const el = document.getElementById(id);
    el.placeholder = profile[field] || '';
    el.addEventListener('input', () => { hasUnsavedChanges = true; });
  });

  document.getElementById('password').placeholder = '********';

  setRadioValue('residence', profile.applicant_residence_type);
  setRadioValue('ownership', profile.applicant_residence_ownership);
  setRadioValue('allowedpets', profile.applicant_pets_allowed);
  setRadioValue('childbehave', profile.applicant_child_behavior);
  setRadioValue('visit', profile.applicant_permission);

  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      hasUnsavedChanges = true;
    });
  });

  await loadEditableTable('members-container', applicantId, 'household_member', ['house_member_name', 'house_member_relationship', 'house_member_age']);
  await loadEditableTable('currpets-container', applicantId, 'current_pets', ['curr_pet_type', 'curr_pet_age', 'curr_pet_sex']);
  await loadEditableTable('pastpets-container', applicantId, 'past_pets', ['past_pet_type', 'past_pet_age', 'past_pet_status']);

  let isEditing = false;

  document.getElementById('edit-btn').addEventListener('click', () => {
    isEditing = !isEditing;
    document.querySelectorAll('input').forEach(input => {
      if (isEditing) {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
      } else {
        input.setAttribute('readonly', true);
        input.setAttribute('disabled', true);
      }
    });
    document.querySelector('.save-btn-holder').classList.toggle('hidden', !isEditing);
  });

  document.getElementById('save-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    hasUnsavedChanges = false;

    const updates = {
      applicant_id: applicantId,
      applicant_email: document.getElementById('emailadd').value || profile.applicant_email,
      applicant_name: document.getElementById('fullname').value || profile.applicant_name,
      applicant_age: (() => {
        const ageInput = document.getElementById('age').value;
        return ageInput !== '' ? parseInt(ageInput) : profile.applicant_age;
      })(),
      applicant_nationality: document.getElementById('nationality').value || profile.applicant_nationality,
      applicant_address: document.getElementById('address').value || profile.applicant_address,
      applicant_telephone: document.getElementById('telphone').value || profile.applicant_telephone,
      applicant_mobileno: document.getElementById('mobilenum').value || profile.applicant_mobileno,
      applicant_occupation: document.getElementById('occupation').value || profile.applicant_occupation,
      applicant_residence_type: document.querySelector('input[name="residence"]:checked')?.value || profile.applicant_residence_type,
      applicant_residence_ownership: document.querySelector('input[name="ownership"]:checked')?.value || profile.applicant_residence_ownership,
      applicant_pets_allowed: document.querySelector('input[name="allowedpets"]:checked')?.value || profile.applicant_pets_allowed,
      applicant_child_behavior: document.querySelector('input[name="childbehave"]:checked')?.value || profile.applicant_child_behavior,
      applicant_permission: document.querySelector('input[name="visit"]:checked')?.value || profile.applicant_permission,
    };

    const cleanedUpdates = cleanUpdates(updates);

    const { data, error: updateError } = await supabase
      .from('applicant_information')
      .update(cleanedUpdates)
      .eq('applicant_id', applicantId)
      .select();

    if (updateError) {
      console.error('❌ Error updating applicant_information:', updateError.message);
      alert('Failed to save profile. Check the console for details.');
      return;
    }

    const containerMap = {
      household_member: 'members-container',
      current_pets: 'currpets-container',
      past_pets: 'pastpets-container'
    };

    for (const [type, fields] of [
      ['household_member', ['house_member_name', 'house_member_relationship', 'house_member_age']],
      ['current_pets', ['curr_pet_type', 'curr_pet_age', 'curr_pet_sex']],
      ['past_pets', ['past_pet_type', 'past_pet_age', 'past_pet_status']]
    ]) {
      const containerId = containerMap[type];
      const rows = document.querySelectorAll(`#${containerId} .item-row`);

      for (const row of rows) {
        const id = row.dataset.id;
        const item = {};
        row.querySelectorAll('input').forEach(input => {
          item[input.dataset.field] = input.value;
        });
        item.applicant_id = applicantId;

        if (id && id !== 'null' && id !== 'undefined') {
          const { error: updateSubError } = await supabase.from(type).update(item).eq(row.dataset.idColumn, id);
          if (updateSubError) {
            console.error(`Error updating ${type}:`, updateSubError);
          }
        } else {
          const { error: insertError } = await supabase.from(type).insert(item);
          if (insertError) {
            console.error(`Error inserting into ${type}:`, insertError);
          }
        }
      }
    }

    document.querySelectorAll('input').forEach(input => {
      input.setAttribute('readonly', true);
      input.setAttribute('disabled', true);
    });
    document.querySelector('.save-btn-holder').classList.add('hidden');
    isEditing = false;

    alert('Profile saved successfully.');
  });
});

async function loadEditableTable(containerId, applicantId, table, fields) {
  const { data, error } = await supabase.from(table).select('*').eq('applicant_id', applicantId);
  if (error) {
    console.error(`Error loading ${table}:`, error.message);
    return;
  }

  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (data && data.length > 0) {
    data.forEach(item => {
      if (table === 'household_member') createHouseholdForm(container, item);
      else if (table === 'current_pets') createCurrentPetForm(container, item);
      else if (table === 'past_pets') createPastPetForm(container, item);
    });
  }

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add';
  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (table === 'household_member') createHouseholdForm(container, {});
    else if (table === 'current_pets') createCurrentPetForm(container, {});
    else if (table === 'past_pets') createPastPetForm(container, {});
  });
  container.appendChild(addBtn);
}

function createHouseholdForm(container, item = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "member-form household-member";

  wrapper.innerHTML = `
    <div class="form-group">
      <label>Name</label>
      <input type="text" class="member-name" value="${item.house_member_name || ''}" />
    </div>
    <div class="form-group">
      <label>Relationship</label>
      <input type="text" class="member-relationship" value="${item.house_member_relationship || ''}" />
    </div>
    <div class="form-group">
      <label>Age</label>
      <input type="number" class="member-age" value="${item.house_member_age || ''}" />
    </div>
    <div class="checkbox-group">
      <label><input type="checkbox" class="member-allergies" ${item.allergies ? 'checked' : ''}/> Has Allergies</label>
      <label><input type="checkbox" class="member-supports" ${item.supports_adoption ? 'checked' : ''}/> Supports Adoption</label>
    </div>
  `;
  container.appendChild(wrapper);
}

let currentPetCount = 1;

function createCurrentPetForm(container, item = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "current-pet";

  wrapper.innerHTML = `
    <div class="stacking">
      <div class="input-currspecies">
        <label>Species</label>
        <input type="text" class="pet-species" value="${item.curr_pet_type || ''}" />
      </div>
      <div class="input-currage">
        <label>Age</label>
        <input type="number" class="pet-age" value="${item.curr_pet_age || ''}" />
      </div>
      <div class="input-currgender">
        <label>Gender</label>
        <div class="form-row">
          <label><input type="radio" name="currgender-${currentPetCount}" value="M" ${item.curr_pet_sex === 'M' ? 'checked' : ''}/> M</label>
          <label><input type="radio" name="currgender-${currentPetCount}" value="F" ${item.curr_pet_sex === 'F' ? 'checked' : ''}/> F</label>
        </div>
      </div>
    </div>
    <div class="form-row">
      <label>Is your current pet rescued?</label>
      <label><input type="radio" name="currresc-${currentPetCount}" value="Yes"> Yes</label>
      <label><input type="radio" name="currresc-${currentPetCount}" value="No"> No</label>
    </div>
    <div class="stacking">
      <div class="input-vetname">
        <label>Your Veterinarian</label>
        <input type="text" class="vet-name" value="${item.vet_name || ''}" />
      </div>
      <div class="input-vetnum">
        <label>Contact Number</label>
        <input type="text" class="vet-number" value="${item.vet_contact || ''}" />
      </div>
    </div>
  `;
  container.appendChild(wrapper);
  currentPetCount++;
}

function createPastPetForm(container, item = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "pastpet-form";

  wrapper.innerHTML = `
    <div class="stacking">
      <div class="input-pastspecies">
        <label>Species</label>
        <input type="text" class="past-species" value="${item.past_pet_type || ''}" />
      </div>
      <div class="input-pastage">
        <label>Age</label>
        <input type="number" class="past-age" value="${item.past_pet_age || ''}" />
      </div>
      <div class="input-paststatus">
        <label>Status</label>
        <div class="form-row">
          <label><input type="radio" name="paststatus-${pastPetCount}" value="Deceased" ${item.past_pet_status === 'Deceased' ? 'checked' : ''}/> Deceased</label>
          <label><input type="radio" name="paststatus-${pastPetCount}" value="Rehomed" ${item.past_pet_status === 'Rehomed' ? 'checked' : ''}/> Rehomed</label>
        </div>
      </div>
    </div>
    <div class="form-row">
      <label>Was your past pet rescued?</label>
      <label><input type="radio" name="pastresc-${pastPetCount}" value="Yes"> Yes</label>
      <label><input type="radio" name="pastresc-${pastPetCount}" value="No"> No</label>
    </div>
  `;
  container.appendChild(wrapper);
  pastPetCount++;
}

document.getElementById("save-btn").addEventListener("click", async () => {
  const applicantId = getApplicantIdFromURL(); // Make sure this function is defined

  const householdData = Array.from(document.querySelectorAll(".household-member")).map(form => ({
    applicant_id: applicantId,
    house_member_name: form.querySelector(".member-name")?.value || "",
    house_member_relationship: form.querySelector(".member-relationship")?.value || "",
    house_member_age: parseInt(form.querySelector(".member-age")?.value) || null,
    allergies: form.querySelector(".member-allergies")?.checked || false,
    supports_adoption: form.querySelector(".member-supports")?.checked || false,
  }));

  const currentPetsData = Array.from(document.querySelectorAll(".current-pet")).map((form, index) => ({
    applicant_id: applicantId,
    curr_pet_type: form.querySelector(".pet-species")?.value || "",
    curr_pet_age: parseInt(form.querySelector(".pet-age")?.value) || null,
    curr_pet_sex: form.querySelector(`input[name="currgender-${index + 1}"]:checked`)?.value || null,
    curr_pet_rescued: form.querySelector(`input[name="currresc-${index + 1}"]:checked`)?.value === "Yes",
    vet_name: form.querySelector(".vet-name")?.value || "",
    vet_contact: form.querySelector(".vet-number")?.value || "",
  }));

  const pastPetsData = Array.from(document.querySelectorAll(".pastpet-form")).map((form, index) => ({
    applicant_id: applicantId,
    past_pet_type: form.querySelector(".past-species")?.value || "",
    past_pet_age: parseInt(form.querySelector(".past-age")?.value) || null,
    past_pet_status: form.querySelector(`input[name="paststatus-${index + 1}"]:checked`)?.value || "",
    past_pet_rescued: form.querySelector(`input[name="pastresc-${index + 1}"]:checked`)?.value === "Yes",
  }));

  // Clear and insert
  try {
    await Promise.all([
      supabase.from("household_member").delete().eq("applicant_id", applicantId),
      supabase.from("current_pets").delete().eq("applicant_id", applicantId),
      supabase.from("past_pets").delete().eq("applicant_id", applicantId),
    ]);

    const { error: houseErr } = await supabase.from("household_member").insert(householdData);
    const { error: currErr } = await supabase.from("current_pets").insert(currentPetsData);
    const { error: pastErr } = await supabase.from("past_pets").insert(pastPetsData);

    if (houseErr || currErr || pastErr) {
      console.error("Save failed:", houseErr || currErr || pastErr);
      alert("There was an error saving the form. Please try again.");
    } else {
      alert("Form saved successfully!");
    }
  } catch (err) {
    console.error("Unexpected save error:", err);
    alert("Unexpected error. Please check the console.");
  }
});

