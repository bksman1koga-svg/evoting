/* E-voting - data disimpan di localStorage browser */
const K='evote_osis_v1';
const def={school:{nama:'SMA Negeri 1 Kota Gajah',logo:'',kepsek:'',nipKepsek:'',pembina:'',nipPembina:''},paslon:[],siswa:[],guru:[],admin:{u:'admin',p:'admin123'}};
let db=JSON.parse(localStorage.getItem(K)||'null')||def;
let S={role:null,user:null,page:'dash',tab:'siswa',kelas:'',q:'',rk:'siswa',edit:null,foto:null,logo:null};
const $=s=>document.querySelector(s);
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){alert('Penyimpanan penuh. Gunakan gambar yang lebih kecil.')}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tm=t=>new Date(t).toLocaleString('id-ID');
const logo=()=>db.school.logo?`<img class="lg" src="${db.school.logo}" alt="Logo">`:'<span class="lg">🗳️</span>';
const voters=()=>[...db.siswa,...db.guru];
const kelasList=()=>[...new Set(db.siswa.map(x=>x.kelas))].filter(Boolean).sort();
const ksel=()=>`<select onchange="S.kelas=this.value;render()"><option value="">Semua Kelas</option>${kelasList().map(k=>`<option ${k==S.kelas?'selected':''}>${esc(k)}</option>`).join('')}</select>`;

function shrink(f,max,type,cb){const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);cb(c.toDataURL(type,.85))};i.src=r.result};r.readAsDataURL(f)}
function pic(el,key,max,type){if(el.files[0])shrink(el.files[0],max,type,d=>S[key]=d)}
function render(){$('#app').innerHTML=!S.role?landing():S.role=='admin'?admin():voter()}
function out(){S.role=null;S.user=null;render()}

/* ---------- Login ---------- */
function landing(){const t=S.tab;return `<div class="hero"><div class="brand">${logo()}<b>${esc(db.school.nama)}</b></div>
<h1>E-voting</h1><p>Pemilihan Ketua dan Wakil Ketua secara digital.</p><p class="slogan">Satu Suara, Satu Pilihan, mari bijak memilih, Jangan GOLPUT!!!</p>
${t=='hasil'?hasil():`<div class="card login"><div class="tabs">${[['siswa','Siswa'],['guru','Guru/Tendik'],['hasil','Hasil'],['admin','Admin']].map(x=>`<button class="${t==x[0]?'on':''}" onclick="S.tab='${x[0]}';render()">${x[1]}</button>`).join('')}</div>
${t=='admin'?`<input id="u" placeholder="Username" autocomplete="username"><input id="pw" type="password" placeholder="Password" autocomplete="current-password" onkeydown="if(event.key=='Enter')login()">`:`<input id="u" placeholder="${t=='siswa'?'Masukkan NIS':'Masukkan NIP / ID'}" onkeydown="if(event.key=='Enter')login()">`}
<button class="btn" onclick="login()">Masuk</button></div>`}</div>`}
const COL=[['#60a5fa','#2563eb'],['#c084fc','#9333ea'],['#34d399','#059669'],['#fbbf24','#f59e0b'],['#f87171','#dc2626'],['#22d3ee','#0891b2']];
function hasil(){const all=voters(),r=db.paslon.map(p=>({p,n:all.filter(x=>x.pilih===p.id).length})),s=r.reduce((a,b)=>a+b.n,0),mx=Math.max(1,...r.map(x=>x.n));
return `<div class="card glass hasil"><div class="hh"><div><h2>Hasil Pemilihan</h2><p>Persentase suara setiap pasangan calon</p></div><button class="ghost" onclick="S.tab='siswa';render()">Kembali</button></div>
<div class="cols">${r.map((x,i)=>{const c=COL[i%COL.length],pc=s?(x.n/s*100).toFixed(1):'0.0';return `<div class="col"><b>${pc}%</b><small>${x.n} suara</small><div class="bw"><div class="cb" style="height:${Math.max(3,x.n/mx*100)}%;background:linear-gradient(${c[0]},${c[1]})"></div></div><b>${esc(x.p.no)}</b><span>${esc(x.p.ketua)} &amp; ${esc(x.p.wakil)}</span></div>`}).join('')||'<p>Belum ada paslon.</p>'}</div><p class="tot">Total suara masuk: <b>${s}</b></p></div>`}
function login(){const t=S.tab,u=$('#u').value.trim();
if(t=='admin'){if(u==db.admin.u&&$('#pw').value==db.admin.p){S.role='admin';S.page='dash';render()}else alert('Username atau password salah.');return}
const x=db[t].find(a=>String(a.id)==u);if(!x)return alert('Data tidak ditemukan. Hubungi panitia untuk memeriksa data Anda.');S.role=t;S.user=x.id;render()}

/* ---------- Halaman pemilih ---------- */
function voter(){const x=db[S.role].find(a=>a.id==S.user);
return `<div class="top"><div class="brand">${logo()}<b>${esc(db.school.nama)}</b></div><div>${esc(x.nama)} <button class="ghost" onclick="out()">Keluar</button></div></div>
<div class="wrap"><h2>${x.voted?'Suara Anda sudah tercatat. Terima kasih! ✅':'Pilih pasangan calon Anda'}</h2><div class="grid">
${db.paslon.map(p=>`<div class="card pc"><span class="no">${esc(p.no)}</span>${p.foto?`<img src="${p.foto}" alt="Foto paslon ${esc(p.no)}">`:''}<h3>${esc(p.ketua)} &amp; ${esc(p.wakil)}</h3><h4>Visi</h4><p class="pre">${esc(p.visi)}</p><h4>Misi</h4><p class="pre">${esc(p.misi)}</p>${x.voted?'':`<button class="btn" onclick="vote(${p.id})">Pilih No. ${esc(p.no)}</button>`}</div>`).join('')||'<p>Belum ada paslon. Hubungi panitia.</p>'}</div></div>`}
function vote(id){const x=db[S.role].find(a=>a.id==S.user),p=db.paslon.find(a=>a.id==id);
if(x.voted||!confirm(`Pilih ${p.ketua} & ${p.wakil}? Pilihan tidak dapat diubah.`))return;
x.voted=true;x.pilih=id;x.waktu=Date.now();save();render()}

/* ---------- Admin ---------- */
const MENU=[['dash','📊','Dashboard'],['paslon','🧑‍🤝‍🧑','Data Paslon'],['siswa','🎓','Data Siswa'],['guru','👩‍🏫','Data Guru'],['riwayat','🕘','Riwayat Pemilih'],['grafik','📈','Grafik'],['set','⚙️','Pengaturan']];
function admin(){return `<nav class="side"><div class="brand">${logo()}<b>E-voting</b></div>${MENU.map(m=>`<a class="${S.page==m[0]?'on':''}" onclick="S.page='${m[0]}';S.q='';S.kelas='';S.edit=null;render()">${m[1]} ${m[2]}</a>`).join('')}<a onclick="out()">🚪 Keluar</a></nav><main>${PAGES[S.page]()}</main>`}

const PAGES={
dash(){const a=[...db.siswa.map(x=>({...x,t:'Siswa'})),...db.guru.map(x=>({...x,t:'Guru'}))],v=a.filter(x=>x.voted),rec=[...v].sort((a,b)=>b.waktu-a.waktu).slice(0,8);
return `<h2>Dashboard</h2><div class="stats">${[['Jumlah Siswa',db.siswa.length],['Jumlah Guru/Tendik',db.guru.length],['Sudah Memilih',v.length],['Belum Memilih',a.length-v.length],['Partisipasi',(a.length?Math.round(v.length/a.length*100):0)+'%']].map(s=>`<div class="card st"><small>${s[0]}</small><b>${s[1]}</b></div>`).join('')}</div>
<div class="card"><h3>Aktivitas Terbaru</h3>${rec.map(x=>`<div class="act"><span>${esc(x.nama)} <i>(${x.t}${x.kelas?' '+esc(x.kelas):''}) telah memilih</i></span><small>${tm(x.waktu)}</small></div>`).join('')||'<p>Belum ada yang memilih.</p>'}</div>`},
paslon(){const e=db.paslon.find(p=>p.id==S.edit)||{};
return `<h2>Data Paslon</h2><div class="card form"><input id="pn" placeholder="No. urut" value="${esc(e.no)}"><input id="pk" placeholder="Nama Ketua" value="${esc(e.ketua)}"><input id="pw2" placeholder="Nama Wakil Ketua" value="${esc(e.wakil)}">
<label>Foto paslon (JPG/PNG)<input type="file" accept="image/jpeg,image/png" onchange="pic(this,'foto',500,'image/jpeg')"></label><textarea id="pv" placeholder="Visi">${esc(e.visi)}</textarea><textarea id="pm" placeholder="Misi (satu poin per baris)">${esc(e.misi)}</textarea>
<button class="btn" onclick="savePas()">${e.id?'Simpan perubahan':'Tambah paslon'}</button></div>
<div class="grid">${db.paslon.map(p=>`<div class="card pc"><span class="no">${esc(p.no)}</span>${p.foto?`<img src="${p.foto}" alt="">`:''}<h3>${esc(p.ketua)} &amp; ${esc(p.wakil)}</h3><p class="pre">${esc(p.visi)}</p><div class="bar"><button class="ghost" onclick="S.edit=${p.id};render()">Ubah</button><button class="ghost" onclick="delPas(${p.id})">Hapus</button></div></div>`).join('')}</div>`},
siswa:()=>dp('siswa'),guru:()=>dp('guru'),
riwayat(){const t=S.rk,L=t=='siswa',d=db[t].filter(x=>x.voted&&(!S.kelas||x.kelas==S.kelas)).sort((a,b)=>a.waktu-b.waktu),s=db.school;
return `<div class="noprint"><h2>Riwayat Pemilih</h2><div class="card bar"><div class="tabs"><button class="${L?'on':''}" onclick="S.rk='siswa';render()">Riwayat Siswa</button><button class="${!L?'on':''}" onclick="S.rk='guru';S.kelas='';render()">Riwayat Guru</button></div>${L?ksel():''}<button class="btn" onclick="print()">🖨️ Cetak PDF</button></div></div>
<div class="card tw"><div class="kop">${logo()}<div><b>${esc(s.nama)}</b><br>Riwayat Pemilih ${L?'Siswa'+(S.kelas?' Kelas '+esc(S.kelas):''):'Guru/Tendik'} - Pemilihan OSIS</div></div>
<table><tr><th>No</th><th>${L?'NIS':'NIP'}</th><th>Nama</th>${L?'<th>Kelas</th>':''}<th>Waktu memilih</th></tr>${d.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.id)}</td><td>${esc(x.nama)}</td>${L?`<td>${esc(x.kelas)}</td>`:''}<td>${tm(x.waktu)}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada data.</td></tr>'}</table>
<div class="ttd"><div>Pembina OSIS<br><br><br><br><b>${esc(s.pembina)}</b><br>NIP. ${esc(s.nipPembina)}</div><div>Kepala Sekolah<br><br><br><br><b>${esc(s.kepsek)}</b><br>NIP. ${esc(s.nipKepsek)}</div></div></div>`},
grafik(){const all=voters(),r=db.paslon.map(p=>({p,n:all.filter(x=>x.pilih===p.id).length})),s=r.reduce((a,b)=>a+b.n,0);
return `<h2>Grafik Perolehan Suara</h2><div class="card">${r.map(({p,n})=>{const pc=s?(n/s*100).toFixed(1):0;return `<div class="gr"><div class="gl"><b>No. ${esc(p.no)} - ${esc(p.ketua)} &amp; ${esc(p.wakil)}</b><span>${n} suara (${pc}%)</span></div><div class="bg"><div class="fl" style="width:${pc}%"></div></div></div>`}).join('')||'<p>Tambahkan paslon terlebih dahulu.</p>'}<p>Total suara masuk: <b>${s}</b></p></div>`},
set(){const s=db.school;return `<h2>Pengaturan</h2><div class="card form"><label>Nama sekolah<input id="sn" value="${esc(s.nama)}"></label>
<label>Logo sekolah (JPG/PNG)<input type="file" accept="image/jpeg,image/png" onchange="pic(this,'logo',200,'image/png')"></label>
<label>Nama Kepala Sekolah<input id="sk" value="${esc(s.kepsek)}"></label><label>NIP Kepala Sekolah<input id="sp" value="${esc(s.nipKepsek)}"></label>
<label>Nama Pembina Guru<input id="sb" value="${esc(s.pembina)}"></label><label>NIP Pembina<input id="sq" value="${esc(s.nipPembina)}"></label>
<label>Password admin baru (kosongkan jika tidak diganti)<input id="ap" type="password"></label>
<button class="btn" onclick="saveSet()">Simpan pengaturan</button><button class="ghost" onclick="rst()">Reset semua suara</button></div>`}};

function savePas(){const e=db.paslon.find(p=>p.id==S.edit),o={no:$('#pn').value,ketua:$('#pk').value,wakil:$('#pw2').value,visi:$('#pv').value,misi:$('#pm').value};
if(!o.ketua||!o.wakil)return alert('Isi nama ketua dan wakil ketua.');
if(e){Object.assign(e,o);if(S.foto)e.foto=S.foto}else db.paslon.push({id:Date.now(),foto:S.foto||'',...o});
S.foto=null;S.edit=null;save();render()}
function delPas(id){if(confirm('Hapus paslon ini?')){db.paslon=db.paslon.filter(p=>p.id!=id);save();render()}}
function saveSet(){const s=db.school;Object.assign(s,{nama:$('#sn').value,kepsek:$('#sk').value,nipKepsek:$('#sp').value,pembina:$('#sb').value,nipPembina:$('#sq').value});
if(S.logo){s.logo=S.logo;S.logo=null}if($('#ap').value)db.admin.p=$('#ap').value;save();alert('Pengaturan disimpan.');render()}
function rst(){if(confirm('Hapus semua suara yang sudah masuk?')){voters().forEach(x=>{x.voted=false;x.pilih=null;x.waktu=null});save();render()}}

/* ---------- Data siswa & guru ---------- */
function dp(t){const L=t=='siswa',d=db[t].filter(x=>(!S.kelas||x.kelas==S.kelas)&&(!S.q||(x.nama+x.id).toLowerCase().includes(S.q.toLowerCase())));
return `<h2>Data ${L?'Siswa':'Guru/Tendik'}</h2><div class="card bar"><label class="btn">📤 Upload Excel<input hidden type="file" accept=".xlsx,.xls,.csv" onchange="imp(this,'${t}')"></label><button class="ghost" onclick="tpl('${t}')">Unduh template</button>${L?ksel():''}
<input placeholder="Cari nama atau ${L?'NIS':'NIP'}, lalu tekan Enter" value="${esc(S.q)}" onchange="S.q=this.value;render()"><button class="ghost" onclick="clr('${t}')">Hapus semua</button></div>
<div class="card tw"><table><tr><th>No</th><th>${L?'NIS':'NIP'}</th><th>Nama</th>${L?'<th>Kelas</th>':''}<th>Status</th></tr>${d.slice(0,300).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.id)}</td><td>${esc(x.nama)}</td>${L?`<td>${esc(x.kelas)}</td>`:''}<td>${x.voted?'✅ Sudah memilih':'⏳ Belum'}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada data. Upload file Excel untuk memulai.</td></tr>'}</table><small>${d.length} data${d.length>300?' (menampilkan 300 pertama)':''}</small></div>`}
function imp(el,t){const f=el.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const w=XLSX.read(r.result,{type:'array'}),rows=XLSX.utils.sheet_to_json(w.Sheets[w.SheetNames[0]]);let n=0;
rows.forEach(o=>{const g=k=>{const key=Object.keys(o).find(z=>z.toLowerCase().includes(k));return key?String(o[key]).trim():''};
const id=g(t=='siswa'?'nis':'nip'),nama=g('nama');if(!id||!nama)return;const d=t=='siswa'?{id,nama,kelas:g('kelas')}:{id,nama},ex=db[t].find(a=>a.id==id);
if(ex)Object.assign(ex,d);else db[t].push(d);n++});save();alert(n+' data berhasil diimpor.');render()};r.readAsArrayBuffer(f)}
function tpl(t){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(t=='siswa'?[['NIS','Nama','Kelas'],['1001','Contoh Siswa','X-1']]:[['NIP','Nama'],['198001012005011001','Contoh Guru']]),'Data');XLSX.writeFile(wb,'template_'+t+'.xlsx')}
function clr(t){if(confirm('Hapus semua data?')){db[t]=[];save();render()}}

render();
