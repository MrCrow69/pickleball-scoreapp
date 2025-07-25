// Initialize Supabase client (insert your keys here)
const supabaseUrl = 'https://hrimjsmcsnuforyowtqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyaW1qc21jc251Zm9yeW93dHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjUzNDksImV4cCI6MjA2OTAwMTM0OX0.X1eQF6-kup5YUY_XpccV_7n6Nb8GXgSbAZ5uvGIfEOs';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function saveMatch(teamA, teamB, scoreA, scoreB) {
  const { data, error } = await supabase
    .from('matches')
    .insert([{ teamA, teamB, scoreA, scoreB }])
    .select()
    .single();

  if (error) {
    console.error('Error saving match:', error);
    return null;
  }
  return data; // Contains the inserted match record including id
}
async function onMatchFinish(teamA, teamB, scoreA, scoreB) {
  const match = await saveMatch(teamA, teamB, scoreA, scoreB);
  if (!match) return;

  const matchUrl = `${window.location.origin}/match.html?id=${match.id}`;
  
  // Generate QR code for matchUrl
  const qrDiv = document.getElementById('qrcode');
  qrDiv.innerHTML = ''; // Clear previous
  new QRCode(qrDiv, {
    text: matchUrl,
    width: 200,
    height: 200,
  });

  // Show or update UI with this QR code
  document.getElementById('qr-popup').style.display = 'block';
}
