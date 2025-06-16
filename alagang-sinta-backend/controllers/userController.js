const { fetchLastId, generateNextId } = require('../utils/idGenerator');
const supabase = require('../supabaseClient');

//login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase
      .from('applicant_information')
      .select('*')
      .eq('applicant_email', email)
      .eq('applicant_password', password)
      .single();

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', data });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

//regis function
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('applicant_information')
      .select('applicant_email')
      .eq('applicant_email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate applicant ID
    const lastApplicantId = await fetchLastId('applicant_information', 'applicant_id');
    const applicant_id = generateNextId(lastApplicantId, 'AS');

    // Insert new user
    const { error: insertError } = await supabase
      .from('applicant_information')
      .insert([{
        applicant_id,
        applicant_email: email,
        applicant_password: password,
        applicant_name: name
      }]);

    if (insertError) {
      console.error('Registration error:', insertError);
      return res.status(500).json({ message: 'Error during registration' });
    }

    res.json({ message: 'Registration successful', applicant_id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};