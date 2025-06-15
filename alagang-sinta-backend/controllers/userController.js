const supabase = require('../supabaseClient');
const { generateCustomId } = require('../utils/idGenerator');

//login function
// In controllers/userController.js
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from('applicant_information')
    .select('*')
    .eq('applicant_email', email)
    .eq('applicant_password', password)
    .single(); // Only works if email+password combo is truly unique

  if (error || !data) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Return the applicant ID and name/email
  res.json({
    applicant_id: data.applicant_id,
    applicant_email: data.applicant_email,
    applicant_name: data.applicant_name
  });
};



//regis function
exports.register = async (req, res) => {
  try {
    const applicant_id = await generateCustomId('applicant_information', 'applicant_id', 'AS-');

    const {
      username, password, name, age, nationality,
      address, telephone, mobileno, email,
      occupation, residenceType, ownershipType, residenceDuration
    } = req.body;

    const {error} = await supabase
      .from('applicant_information')
      .insert({
        applicant_id,
        applicant_username: username,
        applicant_password: password,
        applicant_name: name,
        applicant_age: age,
        applicant_nationality: nationality,
        applicant_address: address,
        applicant_telephone: telephone,
        applicant_mobileno: mobileno,
        applicant_email: email,
        applicant_occupation: occupation,
        applicant_residence_type: residenceType,
        applicant_residence_ownership: ownershipType,
        applicant_residence_duration: residenceDuration
      });

    if (error) throw error;

    res.status(201).json({ message: 'Registration successful!', applicant_id });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Registration failed.' });
  }
};