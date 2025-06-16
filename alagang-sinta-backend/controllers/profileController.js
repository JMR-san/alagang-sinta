const supabase = require('../supabaseClient');

exports.getProfile = async (req, res) => {
  const applicantId = req.params.id;

  const { data: profile, error } = await supabase
    .from('applicant_information')
    .select('*')
    .eq('applicant_id', applicantId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }

  // Fetch other related tables
  const [household, currentPets, pastPets] = await Promise.all([
    supabase.from('household_member').select('*').eq('applicant_id', applicantId),
    supabase.from('current_pets').select('*').eq('applicant_id', applicantId),
    supabase.from('past_pets').select('*').eq('applicant_id', applicantId)
  ]);

  res.json({
    profile,
    household: household.data || [],
    currentPets: currentPets.data || [],
    pastPets: pastPets.data || []
  });
};
