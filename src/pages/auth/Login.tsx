// ... imports
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    // 1. Auth Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // 2. Auth Serveur local (pour le PDF)
    const res = await fetch('http://localhost:4242/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.token) localStorage.setItem('token', data.token); // INDISPENSABLE

    navigate('/dashboard');
  } catch (err: any) {
    alert(err.message);
  } finally { setLoading(false); }
};