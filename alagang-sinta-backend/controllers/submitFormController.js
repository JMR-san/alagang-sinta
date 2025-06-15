// controllers/submitFormController.js

const supabase = require('../supabaseClient');
const { generateCustomId } = require('../utils/idGenerator');

exports.submitForm = async (req, res) => {
  try {
    const formData = req.body;
    console.log('Incoming form data:', formData);

    // ✅ Generate applicant ID
    const applicantId = await generateCustomId('applicant_information', 'applicant_id', 'AS');

    // ✅ Insert applicant
    const { error: insertError } = await supabase
      .from('applicant_information')
      .insert([{
        applicant_id: applicantId,
        applicant_email: formData.emailadd,
        applicant_password: formData.password,
        applicant_name: formData.fullname,
        applicant_age: formData.age,
        applicant_nationality: formData.nationality,
        applicant_address: formData.address,
        applicant_telephone: formData.telphone,
        applicant_mobileno: formData.mobilenum,
        applicant_occupation: formData.occupation,
        applicant_residence_type: formData.residence,
        applicant_residence_ownership: formData.ownership,
        applicant_pets_allowed: formData.allowedpets,
        applicant_child_behavior: formData.childbehave,
        applicant_permission: formData.visit
      }]);

    if (insertError) {
      console.error('Error inserting applicant:', insertError);
      return res.status(500).json({ message: insertError.message });
    }

    // ✅ Insert household members with generated IDs
    if (formData.household_member && formData.household_member.length > 0) {
      const membersWithId = [];

      for (const member of formData.household_member) {
        const houseMemberId = await generateCustomId('household_member', 'house_member_id', 'ASH');

        membersWithId.push({
          house_member_id: houseMemberId,
          household_member_name: member.name,
          household_member_relationship: member.relationship,
          household_member_age: member.age,
          household_member_has_allergies: member.allergies,
          household_member_supports_adoption: member.supportsAdoption,
          applicant_id: applicantId
        });
      }

      const { error: householdError } = await supabase
        .from('household_member')
        .insert(membersWithId);

      if (householdError) {
        console.error('Error inserting household members:', householdError);
        return res.status(500).json({ message: householdError.message });
      }
    }

    res.status(200).json({ message: 'Form submitted successfully!' });

  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ message: 'Unexpected server error' });
  }
};
