module.exports = function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!url || !key) {
    res.status(200).send("window.EMPRESAS_CONFIG = {erro: 'Configure SUPABASE_URL e SUPABASE_ANON_KEY na Vercel.'};");
    return;
  }
  res.status(200).send('window.EMPRESAS_CONFIG = ' + JSON.stringify({supabaseUrl:url, supabaseAnonKey:key}) + ';');
};
