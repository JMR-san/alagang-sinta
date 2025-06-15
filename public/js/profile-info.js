// profile-info.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://bilyuymilatjhdfuerkw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbHl1eW1pbGF0amhkZnVlcmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTU4ODYsImV4cCI6MjA2NDYzMTg4Nn0.79Kl1ubGXdS1TVestMYm9iahpqDqpmJhwbfUqcZU5Rs'
const supabase = createClient(supabaseUrl, supabaseKey);


function setRadioValue(name, value) {
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  radios.forEach(r => r.checked = r.value === value);
}

function createEditableRow(containerId, item, type, fields, applicantId) {
  console.log('applicant_id:', applicantId);
  const div = document.createElement('div');
  div.className = 'item-row';
  div.dataset.id = item.id;

  fields.forEach(field => {
    const input = document.createElement('input');
    input.value = item[field] || '';
    input.dataset.field = field;
    input.className = `${type}-input`;
    div.appendChild(input);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async () => {
    if (item.id) {
      await supabase.from(type).delete().eq('id', item.id);
    }
    div.remove();
  });
  div.appendChild(deleteBtn);

  document.getElementById(containerId).appendChild(div);
}

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

  document.getElementById('emailadd').placeholder = profile.applicant_email || '';
  document.getElementById('password').placeholder = '********';
  document.getElementById('fullname').placeholder = profile.applicant_name || '';
  document.getElementById('age').placeholder = profile.applicant_age || '';
  document.getElementById('nationality').placeholder = profile.applicant_nationality || '';
  document.getElementById('address').placeholder = profile.applicant_address || '';
  document.getElementById('telphone').placeholder = profile.applicant_telephone || '';
  document.getElementById('mobilenum').placeholder = profile.applicant_mobileno || '';
  document.getElementById('occupation').placeholder = profile.applicant_occupation || '';

  setRadioValue('residence', profile.applicant_residence_type);
  setRadioValue('ownership', profile.applicant_residence_ownership);
  setRadioValue('allowedpets', profile.applicant_pets_allowed);
  setRadioValue('childbehave', profile.applicant_child_behavior);
  setRadioValue('visit', profile.applicant_permission);

  await loadEditableTable('members-container', applicantId, 'household_member', ['house_member_name', 'house_member_relationship', 'house_member_age']);
  await loadEditableTable('currpets-container', applicantId, 'current_pets', ['curr_pet_type', 'curr_pet_age', 'curr_pet_sex']);
  await loadEditableTable('pastpets-container', applicantId, 'past_pets', ['past_pet_type', 'past_pet_age', 'past_pet_status']);

  document.getElementById('edit-btn').addEventListener('click', () => {
    document.querySelectorAll('input').forEach(input => input.removeAttribute('readonly'));
    document.querySelector('.save-btn-holder').classList.remove('hidden');
  });

  document.getElementById('save-btn').addEventListener('click', async () => {
    const updates = {
      applicant_id: applicantId,
      applicant_email: document.getElementById('emailadd').value,
      applicant_name: document.getElementById('fullname').value,
      applicant_age: document.getElementById('age').value,
      applicant_nationality: document.getElementById('nationality').value,
      applicant_address: document.getElementById('address').value,
      applicant_telephone: document.getElementById('telphone').value,
      applicant_mobileno: document.getElementById('mobilenum').value,
      applicant_occupation: document.getElementById('occupation').value,
      applicant_residence_type: document.querySelector('input[name="residence"]:checked')?.value,
      applicant_residence_ownership: document.querySelector('input[name="ownership"]:checked')?.value,
      applicant_pets_allowed: document.querySelector('input[name="allowedpets"]:checked')?.value,
      applicant_child_behavior: document.querySelector('input[name="childbehave"]:checked')?.value,
      applicant_permission: document.querySelector('input[name="visit"]:checked')?.value,
      
    };

    await supabase
  .from('applicant_information')
  .upsert(updates, { onConflict: 'applicant_id' }); // ONLY IF Applicant_ID is the actual column name with a UNIQUE constraint
    // const { data, error } = await supabase
    //   .from('applicant_information')
    //   .update({ other_column: 'otherValue' })
    //   .eq('some_column', 'someValue')
    //   .select()


    for (const [type, fields] of [
  ['household_member', ['house_member_name', 'house_member_relationship', 'house_member_age']],
  ['current_pets', ['curr_pet_type', 'curr_pet_age', 'curr_pet_sex']],
  ['past_pets', ['past_pet_type', 'past_pet_age', 'past_pet_status']]
]) {
  const rows = document.querySelectorAll(`#${type.replace('_', '')}-container .item-row`);

  for (const row of rows) {
    const id = row.dataset.id;
    const item = {};
    row.querySelectorAll('input').forEach(input => {
      item[input.dataset.field] = input.value;
    });
    item.applicant_id = applicantId;

    if (id && id !== 'null' && id !== 'undefined') {
      await supabase.from(type).update(item).eq('id', id);
    } else {
      await supabase.from(type).insert(item);
    }
  }
}



    alert('Profile saved successfully.');
  });
});

async function loadEditableTable(containerId, applicantId, table, fields) {
  const { data, error } = await supabase.from(table).select('*').eq('applicant_id', applicantId);

  if (error) {
    console.error(`Error loading ${table}:`, error.message);
    return;
  }

  document.getElementById(containerId).innerHTML = '';

  if (data && data.length > 0) {
    data.forEach(item => createEditableRow(containerId, item, table, fields, applicantId));
  }

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add';
  addBtn.addEventListener('click', () => {
  const emptyItem = { id: null };
  fields.forEach(f => emptyItem[f] = '');
  createEditableRow(containerId, emptyItem, table, fields, applicantId);
});
  document.getElementById(containerId).appendChild(addBtn);
}
