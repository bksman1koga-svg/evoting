import {sql,getSet,wrap,fail} from "./_lib.js";
const paslonList=()=>sql`SELECT p.id::float8 AS id,p.no,p.ketua,p.wakil,p.foto,p.visi,p.misi,(SELECT count(*)::int FROM voters v WHERE v.pilih=p.id) AS n FROM paslon p ORDER BY p.id`;
export default wrap(async(b,req,res)=>{
 if(b.action==="info"){const st=await getSet();return res.json({school:{nama:st.nama,logo:st.logo},paslon:await paslonList()});}
 const role=b.role,id=String(b.id||"").trim();
 if(!["siswa","guru"].includes(role)||!id)fail("Data tidak lengkap");
 const r=await sql`SELECT id,nama,kelas,voted FROM voters WHERE role=${role} AND id=${id} LIMIT 1`;
 if(b.action==="login"){if(!r.length)fail("Data tidak ditemukan. Hubungi panitia untuk memeriksa data Anda.",404);return res.json({id:r[0].id,nama:r[0].nama,kelas:r[0].kelas,voted:!!r[0].voted});}
 if(b.action==="vote"){
  if(!r.length)fail("Data tidak ditemukan.",404);
  const pid=Number(b.paslon),p=await sql`SELECT 1 FROM paslon WHERE id=${pid}`;if(!p.length)fail("Paslon tidak valid");
  const u=await sql`UPDATE voters SET voted=true,pilih=${pid},waktu=${Date.now()} WHERE role=${role} AND id=${id} AND voted=false RETURNING id`;
  if(!u.length)fail("Suara Anda sudah tercatat sebelumnya.",409);
  return res.json({ok:true});}
 fail("Aksi tidak dikenal");
});
