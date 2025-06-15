// ✅ add-member.js, add-curr-pets.js, and add-pastpets.js merged pattern

import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key');

// GLOBAL UTILITY FOR SAVING & DELETING
window.saveEntry = async function (btn, type, id = null) {
  const form = btn.closest(".entry-form");
  const inputs = form.querySelectorAll("input, select");
  const userResp = await supabase.auth.getUser();
  const user = userResp.data.user;

  let payload = { user_id: user.id };
  let table = '';

  if (type === 'member') {
    table = 'household_members';
    payload.name = inputs[0].value;
    payload.relationship = inputs[1].value;
    payload.age = parseInt(inputs[2].value);
    payload.allergies = inputs[3].checked;
    payload.supports_adoption = inputs[4].checked;
  } else if (type === 'currpet') {
    table = 'current_pets';
    payload.species = inputs[0].value;
    payload.age = parseInt(inputs[1].value);
    payload.gender = inputs[2].checked ? 'M' : 'F';
    payload.rescued = inputs[4].checked;
    payload.neutered = inputs[5].checked;
    payload.bred = inputs[6].checked;
    payload.vet_name = inputs[7].value;
    payload.vet_contact = inputs[8].value;
  } else if (type === 'pastpet') {
    table = 'past_pets';
    payload.species = inputs[0].value;
    payload.age = parseInt(inputs[1].value);
    payload.status = inputs[2].checked ? 'Deceased' : 'Rehomed';
    payload.rescued = inputs[4].checked;
    payload.bred = inputs[5].checked;
  }

  const result = id
    ? await supabase.from(table).update(payload).eq("id", id)
    : await supabase.from(table).insert(payload);

  if (result.error) alert("Error saving");
  else location.reload();
};

window.deleteEntry = async function (btn, type, id) {
  const table = {
    member: "household_members",
    currpet: "current_pets",
    pastpet: "past_pets"
  }[type];

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) alert("Delete failed");
  else location.reload();
};

// HOUSEHOLD MEMBERS
export async function loadMembers() {
  const container = document.getElementById("members-container");
  const userResp = await supabase.auth.getUser();
  const user = userResp.data.user;
  const { data } = await supabase.from("household_members").select("*").eq("user_id", user.id);
  container.innerHTML = "";
  data.forEach(m => {
    const div = document.createElement("div");
    div.className = "entry-form";
    div.innerHTML = `
      <input type="text" value="${m.name}" placeholder="Name" />
      <input type="text" value="${m.relationship}" placeholder="Relationship" />
      <input type="number" value="${m.age}" placeholder="Age" />
      <label><input type="checkbox" ${m.allergies ? 'checked' : ''}/> Allergies</label>
      <label><input type="checkbox" ${m.supports_adoption ? 'checked' : ''}/> Supports Adoption</label>
      <button onclick="saveEntry(this, 'member', ${m.id})">Save</button>
      <button onclick="deleteEntry(this, 'member', ${m.id})">Delete</button>
    `;
    container.appendChild(div);
  });
}

// CURRENT PETS
export async function loadCurrPets() {
  const container = document.getElementById("currpets-container");
  const userResp = await supabase.auth.getUser();
  const user = userResp.data.user;
  const { data } = await supabase.from("current_pets").select("*").eq("user_id", user.id);
  container.innerHTML = "";
  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "entry-form";
    div.innerHTML = `
      <input type="text" value="${p.species}" placeholder="Species" />
      <input type="number" value="${p.age}" placeholder="Age" />
      <label><input type="radio" name="gender-${p.id}" ${p.gender === 'M' ? 'checked' : ''}/> M</label>
      <label><input type="radio" name="gender-${p.id}" ${p.gender === 'F' ? 'checked' : ''}/> F</label>
      <label><input type="checkbox" ${p.rescued ? 'checked' : ''}/> Rescued</label>
      <label><input type="checkbox" ${p.neutered ? 'checked' : ''}/> Neutered</label>
      <label><input type="checkbox" ${p.bred ? 'checked' : ''}/> Bred</label>
      <input type="text" value="${p.vet_name}" placeholder="Vet Name" />
      <input type="text" value="${p.vet_contact}" placeholder="Vet Contact" />
      <button onclick="saveEntry(this, 'currpet', ${p.id})">Save</button>
      <button onclick="deleteEntry(this, 'currpet', ${p.id})">Delete</button>
    `;
    container.appendChild(div);
  });
}

// PAST PETS
export async function loadPastPets() {
  const container = document.getElementById("pastpets-container");
  const userResp = await supabase.auth.getUser();
  const user = userResp.data.user;
  const { data } = await supabase.from("past_pets").select("*").eq("user_id", user.id);
  container.innerHTML = "";
  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "entry-form";
    div.innerHTML = `
      <input type="text" value="${p.species}" placeholder="Species" />
      <input type="number" value="${p.age}" placeholder="Age" />
      <label><input type="radio" name="status-${p.id}" ${p.status === 'Deceased' ? 'checked' : ''}/> Deceased</label>
      <label><input type="radio" name="status-${p.id}" ${p.status === 'Rehomed' ? 'checked' : ''}/> Rehomed</label>
      <label><input type="checkbox" ${p.rescued ? 'checked' : ''}/> Rescued</label>
      <label><input type="checkbox" ${p.bred ? 'checked' : ''}/> Bred</label>
      <button onclick="saveEntry(this, 'pastpet', ${p.id})">Save</button>
      <button onclick="deleteEntry(this, 'pastpet', ${p.id})">Delete</button>
    `;
    container.appendChild(div);
  });
}

// INITIAL LOADS
window.addEventListener('DOMContentLoaded', () => {
  loadMembers();
  loadCurrPets();
  loadPastPets();
});
