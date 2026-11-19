import {sql,getSet,wrap,fail,hash} from "./_lib.js";
export default wrap(async(b,req,res)=>{
 const st=await getSet(),h=req.headers;
 if(h["x-admin-user"]!=="admin"||hash(h["x-admin-pass"]||"")!==st.passHash)fail("Username atau password salah.",401);
 const role=b.role,chk=()=>{if(!["siswa","guru"].includes(role))fail("Role tidak valid")};
 switch(b.action){
 case"load":{const{passHash,...school}=st;
  const paslon=await sql`SELECT id::float8 AS id,no,ketua,wakil,foto,visi,misi FROM paslon ORDER BY id`;
  const v=await sql`SELECT role,id,nama,kelas,voted,pilih::float8 AS pilih,waktu::float8 AS waktu FROM voters ORDER BY nama`;
  const mk=r=>v.filter(x=>x.role===r).map(({role,...x})=>x);
  return res.json({school,paslon,siswa:mk("siswa"),guru:mk("guru")});}
 case"savePas":{const p=b.p||{};if(!p.id||!p.ketua||!p.wakil)fail("Data paslon tidak lengkap");
  await sql`INSERT INTO paslon(id,no,ketua,wakil,foto,visi,misi) VALUES(${p.id},${p.no||""},${p.ketua},${p.wakil},${p.foto||""},${p.visi||""},${p.misi||""}) ON CONFLICT (id) DO UPDATE SET no=EXCLUDED.no,ketua=EXCLUDED.ketua,wakil=EXCLUDED.wakil,foto=EXCLUDED.foto,visi=EXCLUDED.visi,misi=EXCLUDED.misi`;
  return res.json({ok:true});}
 case"delPas":await sql`DELETE FROM paslon WHERE id=${b.id}`;return res.json({ok:true});
 case"clrPas":await sql`DELETE FROM paslon`;return res.json({ok:true});
 case"impVoters":{chk();const m=new Map();(Array.isArray(b.list)?b.list:[]).forEach(x=>{if(x&&x.id&&x.nama)m.set(String(x.id).trim(),x)});
  const ids=[...m.keys()],nm=ids.map(i=>String(m.get(i).nama)),kl=ids.map(i=>String(m.get(i).kelas??""));
  if(ids.length)await sql`INSERT INTO voters(role,id,nama,kelas) SELECT ${role}::text,* FROM unnest(${ids}::text[],${nm}::text[],${kl}::text[]) ON CONFLICT (role,id) DO UPDATE SET nama=EXCLUDED.nama,kelas=EXCLUDED.kelas`;
  return res.json({n:ids.length});}
 case"addVoter":{chk();const id=String(b.id||"").trim();if(!id||!b.nama)fail("Data tidak lengkap");
  const r=await sql`INSERT INTO voters(role,id,nama,kelas) VALUES(${role},${id},${b.nama},${b.kelas||""}) ON CONFLICT DO NOTHING RETURNING id`;
  if(!r.length){const e=await sql`SELECT nama FROM voters WHERE role=${role} AND id=${id}`;fail(`ID ${id} sudah terdaftar atas nama ${e[0]?.nama||""}.`,409)}
  return res.json({ok:true});}
 case"delVoter":chk();await sql`DELETE FROM voters WHERE role=${role} AND id=${String(b.id)}`;return res.json({ok:true});
 case"clrVoters":chk();await sql`DELETE FROM voters WHERE role=${role}`;return res.json({ok:true});
 case"rst":await sql`UPDATE voters SET voted=false,pilih=NULL,waktu=NULL`;return res.json({ok:true});
 case"saveSet":{const n={...st},i=b.school||{};["nama","kepsek","nipKepsek","pembina","nipPembina","logo"].forEach(k=>{if(typeof i[k]==="string")n[k]=i[k]});
  if(b.newPass)n.passHash=hash(b.newPass);
  await sql`UPDATE settings SET data=${JSON.stringify(n)}::jsonb WHERE id=1`;return res.json({ok:true});}
 default:fail("Aksi tidak dikenal");}
});
