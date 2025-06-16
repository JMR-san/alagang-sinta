// profile-info.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://bilyuymilatjhdfuerkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbHl1eW1pbGF0amhkZnVlcmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTU4ODYsImV4cCI6MjA2NDYzMTg4Nn0.79Kl1ubGXdS1TVestMYm9iahpqDqpmJhwbfUqcZU5Rs'; // shortened for brevity
const supabase = createClient(supabaseUrl, supabaseKey);

let hasUnsavedChanges = false;
async function getBatchIds(tableName, columnName, prefix, count, digits = 4) {
  try {
    const response = await fetch('/api/generate-ids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tableName,
        columnName,
        prefix,
        count,
        digits
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate IDs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.ids;
  } catch (error) {
    console.error('Error generating IDs:', error);
    throw error;
  }
}
function parseOrNull(value) {
  const num = parseInt(value, 10);
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

  fields.forEach((field) => {
  const input = document.createElement('input'); // <-- declare input here
  input.value = item[field] || '';
  input.defaultValue = input.value; // <-- this was causing the error
  input.dataset.field = field;
  input.className = `${type}-input`;
  input.addEventListener('input', () => { hasUnsavedChanges = true; });
  div.appendChild(input);

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

   document.getElementById('save-btn').addEventListener("click", async () => {
    const nameInput = document.getElementById('name');
    const addressInput = document.getElementById('address');
    const emailInput = document.getElementById('email');
    const applicantIdInput = document.getElementById('applicantId');
    const passwordInput = document.getElementById('password');
    const ageInput = document.getElementById('age');
    const nationalityInput = document.getElementById('nationality');
    const telephoneInput = document.getElementById('telphone');
    const mobileInput = document.getElementById('mobilenum');
    const occupationInput = document.getElementById('occupation');
    const residenceTypeInput = document.querySelector('input[name="residence"]:checked');
    const ownershipTypeInput = document.querySelector('input[name="ownership"]:checked');
    const petsAllowedInput = document.querySelector('input[name="allowedpets"]:checked');
    const childBehaviorInput = document.querySelector('input[name="childbehave"]:checked');
    const permissionInput = document.querySelector('input[name="visit"]:checked');

    let finalApplicantId = applicantIdInput ? applicantIdInput.value : '';

    try {
      // If we don't have an ID, try to get it from localStorage
      if (!finalApplicantId) {
        finalApplicantId = localStorage.getItem('applicant_id');
      }

      // If we still don't have an ID, this is a new record
      if (!finalApplicantId) {
        // For new records, require email and password
        if (!emailInput?.value) {
          throw new Error('Email is required for new records');
        }
        if (!passwordInput?.value) {
          throw new Error('Password is required for new records');
        }

        const applicantData = {
          applicant_name: nameInput?.value || '',
          applicant_address: addressInput?.value || '',
          applicant_email: emailInput.value,
          applicant_password: passwordInput.value,
          applicant_age: ageInput?.value ? parseInt(ageInput.value) || null : null,
          applicant_nationality: nationalityInput?.value || '',
          applicant_telephone: telephoneInput?.value || '',
          applicant_mobileno: mobileInput?.value || '',
          applicant_occupation: occupationInput?.value || '',
          applicant_residence_type: residenceTypeInput?.value || '',
          applicant_residence_ownership: ownershipTypeInput?.value || '',
          applicant_pets_allowed: petsAllowedInput?.value || '',
          applicant_child_behavior: childBehaviorInput?.value || '',
          applicant_permission: permissionInput?.value || ''
        };

        // Generate a new applicant_id with the correct prefix
        const ids = await getBatchIds('applicant_information', 'applicant_id', 'AS', 1);
        if (!ids || ids.length === 0) {
          throw new Error('Failed to generate applicant_id');
        }
        finalApplicantId = ids[0];
        
        // Add the generated ID to the data
        applicantData.applicant_id = finalApplicantId;
        
        const { data, error } = await supabase.from('applicant_information').insert(applicantData).select();
        if (error) throw error;
        if (data && data[0]) {
          if (applicantIdInput) applicantIdInput.value = finalApplicantId;
          localStorage.setItem('applicant_id', finalApplicantId);
        }
      } else {
        // For updates, only include fields that have values
        const updateData = {};
        if (nameInput?.value) updateData.applicant_name = nameInput.value;
        if (addressInput?.value) updateData.applicant_address = addressInput.value;
        if (emailInput?.value) updateData.applicant_email = emailInput.value;
        if (passwordInput?.value) updateData.applicant_password = passwordInput.value;
        if (ageInput?.value) updateData.applicant_age = parseInt(ageInput.value) || null;
        if (nationalityInput?.value) updateData.applicant_nationality = nationalityInput.value;
        if (telephoneInput?.value) updateData.applicant_telephone = telephoneInput.value;
        if (mobileInput?.value) updateData.applicant_mobileno = mobileInput.value;
        if (occupationInput?.value) updateData.applicant_occupation = occupationInput.value;
        if (residenceTypeInput?.value) updateData.applicant_residence_type = residenceTypeInput.value;
        if (ownershipTypeInput?.value) updateData.applicant_residence_ownership = ownershipTypeInput.value;
        if (petsAllowedInput?.value) updateData.applicant_pets_allowed = petsAllowedInput.value;
        if (childBehaviorInput?.value) updateData.applicant_child_behavior = childBehaviorInput.value;
        if (permissionInput?.value) updateData.applicant_permission = permissionInput.value;

        // Only update if we have changes
        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase.from('applicant_information').update(updateData).eq('applicant_id', finalApplicantId);
          if (error) throw error;
        }
      }

      if (!finalApplicantId) {
        throw new Error('Failed to get valid applicant_id');
      }

      // Handle household members
      const householdWrappers = document.querySelectorAll('.household-member');
      for (const wrapper of householdWrappers) {
        const id = wrapper.dataset.id;
        const item = {
          house_member_name: wrapper.querySelector('.member-name')?.value || null,
          house_member_relationship: wrapper.querySelector('.member-relationship')?.value || null,
          house_member_age: parseOrNull(wrapper.querySelector('.member-age')?.value),
          house_member_allergy: wrapper.querySelector('.member-allergies')?.checked || false,
          house_member_adoption: wrapper.querySelector('.member-supports')?.checked || false,
          applicant_id: finalApplicantId
        };

        if (id) {
          // Update existing household member
          const { error } = await supabase.from('household_member').update(item).eq('house_member_id', id);
          if (error) throw error;
        } else {
          // Generate new ID for household member
          const ids = await getBatchIds('household_member', 'house_member_id', 'ASH', 1);
          if (!ids || ids.length === 0) {
            throw new Error('Failed to generate household member ID');
          }
          item.house_member_id = ids[0];
          
          // Insert new household member
          const { error } = await supabase.from('household_member').insert(item);
          if (error) throw error;
        }
      }

      // Handle current pets
      const currentPetWrappers = document.querySelectorAll('.current-pets');
      for (const wrapper of currentPetWrappers) {
        const id = wrapper.dataset.id;
        const genderInput = wrapper.querySelector('input[name^="currgender-"]:checked');
        const rescueInput = wrapper.querySelector('input[name^="currpetresc-"]:checked');
        const neuteredInput = wrapper.querySelector('input[name^="currpetneu-"]:checked');
        const breedInput = wrapper.querySelector('input[name^="currpetbred-"]:checked');

        // Handle veterinarian information first
        const vetName = wrapper.querySelector('.vet-name')?.value || '';
        const vetContact = wrapper.querySelector('.vet-number')?.value || '';
        
        // Generate vet ID and create record even if no info provided
        const vetIds = await getBatchIds('veterinarian_information', 'vet_id', 'ASV', 1, 4);
        if (!vetIds || vetIds.length === 0) {
          throw new Error('Failed to generate veterinarian ID');
        }
        const vetId = vetIds[0];
        console.log('Generated vet ID:', vetId, 'Length:', vetId.length);

        // Always create a veterinarian record with valid data
        const vetData = {
          vet_id: vetId,
          vet_name: vetName.trim() || 'Unknown', // Ensure no whitespace
          vet_contact_no: vetContact.trim() || 'N/A' // Ensure no whitespace
        };
        console.log('Vet data being sent:', vetData);

        // First try to insert the veterinarian record
        const { error: vetError } = await supabase.from('veterinarian_information').insert(vetData);
        if (vetError) {
          console.error('Vet insert error:', vetError);
          // If insert fails, try to update
          const { error: updateError } = await supabase.from('veterinarian_information').upsert(vetData);
          if (updateError) {
            console.error('Vet update error:', updateError);
            throw updateError;
          }
        }

        // Then handle current pet information
        const item = {
          current_pet_type: wrapper.querySelector('.pet-species')?.value || '',
          current_pet_age: parseOrNull(wrapper.querySelector('.pet-age')?.value),
          current_pet_sex: genderInput?.value || null,
          is_current_pet_rescued: rescueInput?.value || 'No', // Default to 'No' if not specified
          is_current_pet_neutered: neuteredInput?.value || 'No', // Default to 'No' if not specified
          is_current_pet_breed: breedInput?.value || 'No', // Default to 'No' if not specified
          vet_id: vetId, // Link to the veterinarian record we just created
          applicant_id: finalApplicantId
        };

        if (id) {
          const { error } = await supabase.from('current_pets').update(item).eq('current_pet_id', id);
          if (error) throw error;
        } else {
          // Generate current pet ID with the correct format (ASC prefix)
          const ids = await getBatchIds('current_pets', 'current_pet_id', 'ASC', 1, 4); // Remove hyphen from prefix
          if (!ids || ids.length === 0) {
            throw new Error('Failed to generate current pet ID');
          }
          item.current_pet_id = ids[0];
          
          const { error } = await supabase.from('current_pets').insert(item);
          if (error) throw error;
        }
      }

      // Handle past pets
      const pastPetWrappers = document.querySelectorAll('.past-pets');
      for (const wrapper of pastPetWrappers) {
        const id = wrapper.dataset.id;
        const statusInput = wrapper.querySelector('input[name^="paststatus-"]:checked');

        const item = {
          past_pet_type: wrapper.querySelector('.past-species')?.value || '',
          past_pet_age: parseOrNull(wrapper.querySelector('.past-age')?.value),
          past_pet_status: statusInput?.value || null,
          applicant_id: finalApplicantId
        };

        if (id) {
          const { error } = await supabase.from('past_pets').update(item).eq('past_pet_id', id);
          if (error) throw error;
        } else {
          const ids = await getBatchIds('past_pets', 'past_pet_id', 'ASP', 1);
          if (!ids || ids.length === 0) {
            throw new Error('Failed to generate past pet ID');
          }
          item.past_pet_id = ids[0];
          
          const { error } = await supabase.from('past_pets').insert(item);
          if (error) throw error;
        }
      }

      alert("Application saved successfully!");
    } catch (error) {
      console.error('Error saving application:', error);
      alert("Error saving application: " + error.message);
    }
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
  wrapper.className = "household-member";
  wrapper.dataset.id = item.house_member_id || '';


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
      <label><input type="checkbox" class="member-allergies" ${item.house_member_allergy ? 'checked' : ''}/> Has Allergies</label>
      <label><input type="checkbox" class="member-supports" ${item.house_member_adoption ? 'checked' : ''}/> Supports Adoption</label>
    </div>
  `;
  container.appendChild(wrapper);
}

let currentPetCount = 1;

function createCurrentPetForm(container, item = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "current-pets";
  wrapper.dataset.id = item.curr_pet_id || '';

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
      <label><input type="radio" name="currpetresc-${currentPetCount}" value="Yes"> Yes</label>
      <label><input type="radio" name="currpetresc-${currentPetCount}" value="No"> No</label>
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

let pastPetCount = 0;

function createPastPetForm(container, item = {}) {
  pastPetCount++;
  const wrapper = document.createElement("div");
  wrapper.className = "past-pets";
  wrapper.dataset.id = item.past_pet_id || '';

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
  `;
  container.appendChild(wrapper);
  pastPetCount++;
}
function getApplicantIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('applicant_id');
}
