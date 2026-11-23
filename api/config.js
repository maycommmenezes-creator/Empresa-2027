module.exports = function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');

  res.status(200).send(
    'window.EMPRESAS_CONFIG = ' +
    JSON.stringify({
      supabaseUrl: url,
      supabaseAnonKey: key
    }) + ';'
  );
};
