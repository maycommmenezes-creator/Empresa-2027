module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método inválido'});
 const url=process.env.SUPABASE_URL, secret=process.env.SUPABASE_SECRET_KEY, anon=process.env.SUPABASE_ANON_KEY;
 if(!url||!secret||!anon)return res.status(503).json({error:'Configuração incompleta'});
 const token=req.headers.authorization||'';
 if(!/^Bearer \S+$/.test(token))return res.status(401).json({error:'Sessão necessária'});
 const call=async(path,key,opts={})=>{const r=await fetch(url.replace(/\/$/,'')+path,{...opts,headers:{apikey:key,'Content-Type':'application/json',...(opts.headers||{})}});return {ok:r.ok,data:await r.json().catch(()=>null)}};
 try{
 const u=await call('/auth/v1/user',anon,{headers:{Authorization:token}});
 if(!u.ok||!u.data?.id)return res.status(401).json({error:'Sessão inválida'});
 const p=await call('/rest/v1/perfis_acesso?select=perfil,ativo&usuario_id=eq.'+encodeURIComponent(u.data.id),secret);
 if(!p.ok||p.data?.[0]?.perfil!=='administrador'||p.data[0].ativo!==true)return res.status(403).json({error:'Somente administrador ativo'});
 const {nome,email,perfil,grupos}=req.body||{};
 if(typeof nome!=='string'||!nome.trim()||nome.length>150||typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!['administrador','editor','visualizador'].includes(perfil)||!Array.isArray(grupos)||grupos.some(g=>!['Legacy','Econtábil','Premium'].includes(g))||(perfil!=='administrador'&&!grupos.length))return res.status(400).json({error:'Confira nome, e-mail, perfil e grupos'});
 const redirect='https://empresas2027onlinesupabasevercel.vercel.app/ativar';
 const invite=await call('/auth/v1/invite?redirect_to='+encodeURIComponent(redirect),secret,{method:'POST',body:JSON.stringify({email:email.trim(),data:{nome:nome.trim()}})});
 if(!invite.ok||!invite.data?.id)return res.status(400).json({error:'Convite não enviado. Confira se o e-mail já existe e a configuração de envio do Supabase.'});
 const saved=await call('/rest/v1/perfis_acesso',secret,{method:'POST',body:JSON.stringify({usuario_id:invite.data.id,nome:nome.trim(),perfil,ativo:true,grupos_autorizados:[...new Set(grupos)]})});
 if(!saved.ok)return res.status(409).json({error:'Convite enviado, mas perfil não criado. Usuário deve permanecer sem acesso; confira Authentication e perfis_acesso antes de repetir.'});
 return res.status(200).json({ok:true});
 }catch(e){return res.status(500).json({error:'Falha no servidor. Confira os registros antes de repetir.'});}
};
