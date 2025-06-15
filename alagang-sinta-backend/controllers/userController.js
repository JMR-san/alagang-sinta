const supabase = require('./supabaseClient');
const { generateCustomId } = require('../utils/idGenerator');

//login function
exports.login = async (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required.' });
  }

  const {data, error} = await supabase
    .from('applicant_information')
    .select('*')
    .eq('applicant_username', username)
    .single();

  if (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Login failed.' });
  }

  if (!data || data.applicant_password !== password) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const { applicant_password, ...safeUser } = data;
  res.status(200).json({ message: 'Login successful!', user: safeUser });
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