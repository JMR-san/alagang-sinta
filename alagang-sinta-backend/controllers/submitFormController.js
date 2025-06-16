// controllers/submitFormController.js

const supabase = require('../supabaseClient');
const { fetchLastId, generateNextId } = require('../utils/idGenerator');

exports.submitForm = async (req, res) => {
  try {
    console.log('Incoming form data:', req.body);
    const {
      password,
      fullname,
      age,
      nationality,
      address,
      telphone,
      mobilenum,
      emailadd,
      occupation,
      residence,
      ownership,
      allowedpets,
      childbehave,
      visit,
      household_members
    } = req.body;

    // Validate required fields
    // if (!emailadd) {
    //   return res.status(400).json({ 
    //     message: 'Email is required',
    //     error: 'Email field is missing'
    //   });
    // }

    // Generate applicant ID
    const lastApplicantId = await fetchLastId('applicant_information', 'applicant_id');
    const applicant_id = generateNextId(lastApplicantId, 'AS');

    // Prepare applicant data
    const applicantData = {
      applicant_id,
      applicant_password: password,
      applicant_name: fullname,
      applicant_age: age,
      applicant_nationality: nationality,
      applicant_address: address,
      applicant_telephone: telphone,
      applicant_mobileno: mobilenum,
      applicant_email: emailadd,
      applicant_occupation: occupation,
      applicant_residence_type: residence,
      applicant_residence_ownership: ownership,
      applicant_pets_allowed: allowedpets,
      applicant_child_behavior: childbehave,
      applicant_permission: visit
    };

    console.log('Attempting to insert applicant data:', applicantData);

    // Insert applicant information
    const { error: applicantError } = await supabase
      .from('applicant_information')
      .insert([applicantData]);

    if (applicantError) {
      console.error('Error inserting applicant:', applicantError);
      console.error('Error details:', {
        code: applicantError.code,
        message: applicantError.message,
        details: applicantError.details,
        hint: applicantError.hint
      });
      return res.status(500).json({ 
        message: 'Error saving applicant information',
        error: applicantError.message,
        details: applicantError.details
      });
    }

    // Generate and insert household member IDs
    if (household_members && household_members.length > 0) {
      const lastMemberId = await fetchLastId('household_members', 'member_id');
      const member_id = generateNextId(lastMemberId, 'ASH');

      const memberData = {
        member_id,
        applicant_id,
        house_member_name: household_members[0].name,
        house_member_relationship: household_members[0].relationship,
        house_member_age: household_members[0].age,
        house_member_allergy: household_members[0].allergies,
        house_member_adoption: household_members[0].supportsAdoption
      };

      console.log('Attempting to insert household member data:', memberData);

      const { error: memberError } = await supabase
        .from('household_members')
        .insert([memberData]);

      if (memberError) {
        console.error('Error inserting household member:', memberError);
        console.error('Error details:', {
          code: memberError.code,
          message: memberError.message,
          details: memberError.details,
          hint: memberError.hint
        });
        return res.status(500).json({ 
          message: 'Error saving household member information',
          error: memberError.message,
          details: memberError.details
        });
      }
    }

    res.json({ message: 'Form submitted successfully', applicant_id });
  } catch (err) {
    console.error('Unexpected server error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error during form submission',
      error: err.message,
      stack: err.stack
    });
  }
};
