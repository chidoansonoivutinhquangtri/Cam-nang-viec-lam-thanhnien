/* NGUỒN CHÍNH: bảng tính Google Sheets đã "Xuất bản lên web" (đọc theo mã gid từng tab) */
const SHEET_ID="2PACX-1vSn0AtyF_KX4KDsx7C-fnh8vn53lk15is_kkpQUIhInZJNSQtE45JNauoE6iZXwOg";
/* NGUỒN DỰ PHÒNG: bảng tính cũ. Tab nào nguồn chính không đọc được sẽ thử nguồn này */
const SHEET_FALLBACK="2PACX-1vRMHUAzZd13d6MrOy9pwd8q9lxTAhY1cVgJUfnA-u5FV5avEUr6IsikIYifstXTlg";
const GIDS={
 [SHEET_ID]:{Viec_lam:"230969603",Viec_lam_ngoai_nuoc:"1085824233",Hoc_nghe:"589453524",Chinh_sach:"143254321",Tai_lieu:"528895512",Cau_hinh:"1175634921"},
 [SHEET_FALLBACK]:{Viec_lam:"1953909577",Viec_lam_ngoai_nuoc:"1580888890",Hoc_nghe:"128755950",Chinh_sach:"1368650882",Tai_lieu:"1324130142",Cau_hinh:"888523643"}};
const REFRESH_MS=120000,CK="cn_cache_v1";
const TABS={jobs:"Viec_lam",abroad:"Viec_lam_ngoai_nuoc",training:"Hoc_nghe",policies:"Chinh_sach",docs:"Tai_lieu",config:"Cau_hinh"};
const MARKETS=["Đài Loan","Nhật Bản","Hàn Quốc E8","Hàn Quốc E9","CHLB Đức"];
const DEF={link_website:"https://vieclam.quangtri.gov.vn",link_form:"https://forms.gle/mqFy5GHgbzFUMHB67",link_fanpage:"https://www.facebook.com/SGDVLquangtri",link_snv:"https://snv.quangtri.gov.vn",link_ttdvvl:"https://vieclam.quangtri.gov.vn/"};
const TT={jobs:"Thông tin việc làm hằng ngày",abroad:"Việc làm ngoài nước",training:"Học nghề",policies:"Chính sách hỗ trợ",docs:"Văn bản, biểu mẫu",reg:"Đăng ký lao động, việc làm trực tuyến"};
const T=k=>CFG["ten_"+k]||TT[k];

const SAMPLE={
 jobs:[{tieu_de:"Nhân viên hành chính – nhân sự",don_vi:"Doanh nghiệp tại Đông Hà",dia_diem:"Quảng Trị",muc_luong:"8 – 10 triệu",han_nop:"30/11/2026",loai:"Trong tỉnh",mo_ta:"Ví dụ mẫu. Thay bằng tin tuyển dụng thật trong Google Sheets.",link:"https://vieclam.quangtri.gov.vn"}],
 abroad:MARKETS.map(m=>({thi_truong:m,ten_don_hang:"Đơn hàng mẫu – "+m,nganh_nghe:"Cập nhật theo đơn hàng thực tế",mo_ta:"Ví dụ mẫu. Nhập đơn hàng thật vào tab Viec_lam_ngoai_nuoc."})),
 training:[{ten_khoa:"Sơ cấp nghề (dưới 3 tháng)",co_so:"Cơ sở giáo dục nghề nghiệp",thoi_gian:"Dưới 3 tháng",ho_tro:"Hỗ trợ học phí; 50.000đ/ngày ăn, sinh hoạt phí",mo_ta:"Thanh niên hoàn thành nghĩa vụ quân sự/CAND, tình nguyện... được hỗ trợ một lần."}],
 policies:[{nhom:"Học nghề",tieu_de:"Hỗ trợ đào tạo nghề cho thanh niên",doi_tuong:"Thanh niên hoàn thành nghĩa vụ quân sự hoặc nghĩa vụ tham gia Công an nhân dân; thanh niên tình nguyện hoàn thành nhiệm vụ.",noi_dung:"• Hỗ trợ đào tạo trình độ sơ cấp, đào tạo dưới 03 tháng\n• Tiền ăn, sinh hoạt phí: 50.000 đồng/người/ngày trong thời gian học",can_cu:"Luật Việc làm 74/2025/QH15; Nghị định 338/2025/NĐ-CP"}],
 docs:[{ten:"Luật Việc làm số 74/2025/QH15",loai:"Luật",so_hieu:"74/2025/QH15",ngay:"16/06/2025",tom_tat:"Hiệu lực từ 01/01/2026."}],
 config:[]};

const PAGES=[
  ["home","🏠","Trang chủ","Trang chủ"],
  ["jobs","💼","Trong nước","Việc làm trong nước"],
  ["abroad","🌏","Ngoài nước","Việc làm ngoài nước"],
  ["training","🎓","Học nghề","Đào tạo & Học nghề"],
  ["policies","📋","Chính sách","Chính sách hỗ trợ"],
  ["docs","📄","Tài liệu","Văn bản & Biểu mẫu"]
];

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const U=u=>/^https?:\/\//i.test((u||"").trim())?u.trim():"";
let DATA={},CFG={},LIVE=false,filter="Tất cả",q="",RAW="";const SRCUSED={};

function parseCSV(t){const rows=[];let r=[],c="",inq=false;
 for(let i=0;i<t.length;i++){const ch=t[i];
  if(inq){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else inq=false}else c+=ch}
  else if(ch=='"')inq=true;
  else if(ch==","){r.push(c);c=""}
  else if(ch=="\n"){r.push(c);rows.push(r);r=[];c=""}
  else if(ch!="\r")c+=ch}
 if(c||r.length){r.push(c);rows.push(r)}
 const h=(rows.shift()||[]).map(x=>x.trim().toLowerCase());
 const out=rows.filter(r=>r.some(x=>x.trim())).map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||"").trim()])));out.h=h;return out}
const REQ={jobs:"tieu_de",abroad:"ten_don_hang",training:"ten_khoa",policies:"tieu_de",docs:"ten",config:"key"};
const TODAY=(()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const parseD=s=>{s=(s||"").trim();let m=/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(s);if(m)return new Date(+m[3],+m[2]-1,+m[1]);m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);return m?new Date(+m[1],+m[2]-1,+m[3]):null};
const isNew=s=>{const d=parseD(s);return !!d&&d<=TODAY&&(TODAY-d)/864e5<=3};
const expired=x=>{const d=parseD(x.han_nop);return !!d&&d<TODAY};
const FF=p=>p==="abroad"?"thi_truong":p==="policies"?"nhom":"loai";

async function loadTab(name,key){
 let err=new Error(name);
 for(const id of [SHEET_ID,SHEET_FALLBACK].filter(Boolean)){
  try{
   const gid=(GIDS[id]||{})[name];if(!gid)throw new Error(name);
   const u=`https://docs.google.com/spreadsheets/d/e/${id}/pub?gid=${gid}&single=true&output=csv&_=${Math.floor(Date.now()/60000)}`;
   const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),8000);
   const res=await fetch(u,{signal:ac.signal}).finally(()=>clearTimeout(tm));
   if(!res.ok)throw new Error(name);
   const rows=parseCSV(await res.text());if(!rows.h.includes(REQ[key]))throw new Error("sai tab "+name);
   SRCUSED[name]=id===SHEET_ID?"nguồn chính":"nguồn dự phòng";
   return rows.filter(r=>!/^(n|no|false|0|ẩn)$/i.test(r.hien_thi||""));
  }catch(e){err=e}
 }
 SRCUSED[name]="LỖI";throw err}

const bigImg=u=>{const m=/\/d\/([\w-]+)|[?&]id=([\w-]+)/.exec(u||"");return m?`https://drive.google.com/thumbnail?id=${m[1]||m[2]}&sz=w1400`:u};
function setBg(){const u=CFG.anh_nen_trang?bigImg(CFG.anh_nen_trang):"";document.body.style.setProperty("--bg-img",u?`url("${u}")`:"")}

function prepare(){
 Object.keys(TABS).forEach(k=>{const fb=(k==="policies"||k==="docs");if(!DATA[k]||(LIVE&&fb&&!DATA[k].length))DATA[k]=(LIVE&&!fb&&k!=="config")?[]:SAMPLE[k]});
 CFG={...DEF};(DATA.config||[]).forEach(r=>{if(r.key&&r.value)CFG[r.key.trim().toLowerCase()]=r.value});
 if(!LIVE&&!CFG.san_ngay){const t=new Date(TODAY);t.setDate(t.getDate()+10);CFG.san_ngay=String(t.getDate()).padStart(2,"0")+"/"+String(t.getMonth()+1).padStart(2,"0")+"/"+t.getFullYear();CFG.san_gio="08:00 – 11:30";CFG.san_dia_diem="Trung tâm Dịch vụ việc làm tỉnh Quảng Trị"}
 setBg()}

async function init(silent){
 if(!silent){try{const c=JSON.parse(localStorage.getItem(CK)||"null");if(c&&c.d){RAW=JSON.stringify(c.d);DATA=c.d;LIVE=true;prepare();render(true)}}catch(e){}}
 const cached=!!RAW,k=Object.keys(TABS),nd={};
 const res=await Promise.all(k.map(x=>loadTab(TABS[x],x).catch(()=>null)));
 k.forEach((x,i)=>{if(res[i])nd[x]=res[i]});
 if(!res.slice(0,5).some(Boolean)){if(!RAW){DATA={};LIVE=false;prepare();render(true)}return}
 const s=JSON.stringify(nd);if(s===RAW)return;
 RAW=s;try{localStorage.setItem(CK,JSON.stringify({d:nd}))}catch(e){}
 DATA=nd;LIVE=true;prepare();render(!cached)}

const cur=()=>(location.hash.slice(1)||"home");
function render(top){
 const p=cur();
 const isDesk=window.innerWidth>=900;
 $("#nav").innerHTML=`
   <div class="sb-brand">
     <img src="images/logo-doan.webp" alt="Logo Đoàn">
     <div class="sb-brand-txt"><span>ĐOÀN TNCS HỒ CHÍ MINH</span><b>SỞ NỘI VỤ TỈNH QUẢNG TRỊ</b></div>
   </div>
   <div class="sb-links">
     ${PAGES.map(([k,i,lm,ld])=>`<a href="#${k}" ${k===p?'aria-current="page"':''}><span class="nav-ic" aria-hidden="true">${i}</span><span class="nav-lbl">${isDesk?ld:lm}</span></a>`).join("")}
   </div>
   <div class="sb-foot">Đoàn TNCS Hồ Chí Minh<br><b>Sở Nội vụ tỉnh Quảng Trị</b></div>`;
 let h=LIVE?"":`<div class="note">Đang hiển thị dữ liệu mẫu. Dữ liệu thật sẽ hiện sau khi kết nối bảng tính Google Sheets.</div>`;
 if(/[?&]debug/.test(location.search))h+=`<div class="note"><b>Kiểm tra kết nối</b> (bỏ ?debug khỏi địa chỉ để ẩn):<br>${Object.keys(TABS).map(k=>esc(TABS[k])+": "+esc(SRCUSED[TABS[k]]||"chưa đọc")).join("<br>")}</div>`;
 h+=p==="home"?home():list(p);
 h+=`<footer>${esc(CFG.don_vi||"")}</footer>`;
 $("#app").innerHTML=h;
 const s=$("#s");if(s)s.oninput=e=>{q=e.target.value;const pos=q.length;render();const n=$("#s");n.focus();n.setSelectionRange(pos,pos)};
 document.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{filter=b.dataset.f;render()});
 if(top)window.scrollTo(0,0)}

const WD=["Chủ nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
function cal(){
 const ds=String(CFG.san_ngay||"").split(/[;|\n,]+/).map(parseD).filter(Boolean).sort((a,b)=>a-b);
 if(!ds.length)return "";
 const d=ds.find(x=>x>=TODAY)||ds[ds.length-1],diff=Math.round((d-TODAY)/864e5);
 const st=diff<0?"past":diff===0?"today":diff<=7?"soon":"";
 const bd=diff<0?"Đã diễn ra":diff===0?"HÔM NAY":diff===1?"Ngày mai":"Còn "+diff+" ngày";
 const info=(CFG.san_gio?`<span>⏰ ${esc(CFG.san_gio)}</span>`:"")+(CFG.san_dia_diem?`<span>📍 ${esc(CFG.san_dia_diem)}</span>`:"");
 const lk=U(CFG.san_link);
 const body=`<div class="ct">📅 ${esc(CFG.san_ten||"Sàn giao dịch việc làm")} · ${diff<0?"Phiên gần nhất":"Phiên sắp tới"}</div>
  <div class="box"><div class="m">THÁNG ${d.getMonth()+1} · ${d.getFullYear()}</div><div class="d">${String(d.getDate()).padStart(2,"0")}</div><div class="w">${WD[d.getDay()]}</div></div>
  ${info?`<div class="info">${info}</div>`:""}
  <div class="cal-foot"><span class="badge2">${bd}</span>${lk?`<span class="more">Xem chi tiết ›</span>`:""}</div>`;
 return lk?`<a class="tile cal ${st}" href="${esc(lk)}" target="_blank" rel="noopener">${body}</a>`:`<div class="tile cal ${st}">${body}</div>`}

function home(){
 const n=k=>(DATA[k]||[]).length,act=k=>(DATA[k]||[]).filter(x=>!expired(x)).length;
 const t=(h,i,s,c="")=>`<a class="tile h ${c}" href="#${h}"><div class="ic">${i}</div><div><b>${esc(T(h))}</b><span class="s">${s}</span></div></a>`;
 const C=cal(),L=k=>esc(U(CFG[k])||"#");
 return `<div class="grid">
 ${t("jobs","💼",act("jobs")+" tin đang tuyển","hero"+(C?" w2":""))}
 ${C}
 ${t("abroad","🌏","Đài Loan, Nhật, Hàn, Đức · "+act("abroad")+" đơn","c1")}
 ${t("training","🎓",n("training")+" khóa học đào tạo","c2")}
 ${t("policies","📋",n("policies")+" chính sách hỗ trợ","c3")}
 ${t("docs","📄",n("docs")+" văn bản, biểu mẫu","c4")}
 <div class="tile reg"><b style="margin-top:0">${esc(T("reg"))}</b><span class="s">Xem việc làm trong tỉnh, đăng ký lao động và tìm việc qua các kênh sau.</span>
  <div class="row"><a class="btn" href="${L("link_website")}" target="_blank" rel="noopener">Website việc làm Quảng Trị</a><a class="btn alt" href="${L("link_form")}" target="_blank" rel="noopener">Đăng ký tìm việc làm trực tuyến</a><a class="btn alt" href="${L("link_fanpage")}" target="_blank" rel="noopener">Fanpage Sàn giao dịch việc làm</a></div></div>
 <div class="tile contact"><div class="ct"><div class="ic" aria-hidden="true">🌐</div><b>LIÊN HỆ HỖ TRỢ</b></div>
  <div class="row"><a class="btn" href="${L("link_snv")}" target="_blank" rel="noopener">Website Sở Nội vụ tỉnh Quảng Trị</a><a class="btn alt" href="${L("link_ttdvvl")}" target="_blank" rel="noopener">Website Trung tâm Dịch vụ việc làm</a></div></div>
 </div>`}

const ready=(a,keys)=>a.filter(r=>!q||keys.some(k=>(r[k]||"").toLowerCase().includes(q.toLowerCase())));
const btn=(u,t)=>U(u)?`<a class="btn" href="${esc(U(u))}" target="_blank" rel="noopener">${t}</a>`:"";
const meta=a=>`<div class="meta">${a.filter(Boolean).map(esc).join(" · ")}</div>`;
const line=(l,v)=>v?`<p class="pl"><b>${l}:</b> ${esc(v)}</p>`:"";
const sec=(l,v)=>v?`<p class="pl"><b>${l}</b>\n${esc(v)}</p>`:"";

function list(p){
 if(!DATA[p])return"";
 const rows=DATA[p];
 let out=`<h2>${esc(T(p))}</h2>`;
 if(p==="policies")out+=`<div class="note">Thông tin tóm tắt từ các văn bản đã nêu ở từng mục, mang tính tham khảo. Vui lòng xem văn bản gốc trong mục Tài liệu hoặc liên hệ để được hướng dẫn cụ thể.</div>`;
 if(p==="abroad")out+=`<div class="note">Chỉ đăng ký qua doanh nghiệp được Bộ Nội vụ cấp Giấy phép hoạt động dịch vụ đưa người lao động đi làm việc ở nước ngoài. Cảnh giác với các khoản thu sai quy định. Liên hệ UBND xã, phường, đặc khu hoặc Sở Nội vụ để được tư vấn và hỗ trợ chi phí.</div>`;
 out+=`<div class="bar"><input type="search" id="s" placeholder="Tìm kiếm..." value="${esc(q)}" aria-label="Tìm kiếm">`;
 const f=FF(p),filt=["jobs","docs","abroad","policies"].includes(p);
 if(filt){
  const opts=["Tất cả",...new Set([...(p==="abroad"?MARKETS:[]),...rows.map(r=>r[f]).filter(Boolean)])];
  out+=opts.map(o=>`<button class="chip" data-f="${esc(o)}" aria-pressed="${o===filter}">${esc(o)}</button>`).join("")}
 out+="</div>";
 let r=rows;
 if(p==="jobs"||p==="abroad")r=r.filter(x=>!expired(x));
 if(p==="jobs")r=[...r].sort((a,b)=>(parseD(b.ngay_dang)||0)-(parseD(a.ngay_dang)||0));
 if(filt)r=r.filter(x=>filter==="Tất cả"||x[f]===filter);
 const keys={jobs:["tieu_de","don_vi","dia_diem","mo_ta","trinh_do"],abroad:["ten_don_hang","nganh_nghe","doanh_nghiep","mo_ta"],training:[ ucap="ten_khoa","co_so","mo_ta","dia_diem"],policies:["tieu_de","doi_tuong","noi_dung","nhom","dieu_kien","ho_so"],docs:["ten","loai","so_hieu","tom_tat"]}[p];
 r=ready(r,keys);
 if(!r.length)return out+`<div class="empty">Chưa có nội dung phù hợp. Hãy thử từ khóa khác.</div>`;
 const card={
  jobs:x=>`<div class="item">${isNew(x.ngay_dang)?'<span class="badge new">Mới</span>':""}<h3>${esc(x.tieu_de)}</h3>${meta([x.don_vi,x.dia_diem,x.muc_luong,x.so_luong&&"SL: "+x.so_luong,x.han_nop&&"Hạn nộp: "+x.han_nop])}${line("Yêu cầu",x.trinh_do)}${line("Liên hệ",x.lien_he)}${x.mo_ta?`<p class="pl">${esc(x.mo_ta)}</p>`:""}${x.ngay_dang?`<div class="meta" style="margin-top:6px">Đăng ngày ${esc(x.ngay_dang)}</div>`:""}${btn(x.link,"Xem chi tiết")}</div>`,
  abroad:x=>`<div class="item"><span class="badge">${esc(x.thi_truong)}</span><h3>${esc(x.ten_don_hang)}</h3>${meta([x.nganh_nghe,x.so_luong&&"SL: "+x.so_luong,x.gioi_tinh,x.do_tuoi&&"Tuổi: "+x.do_tuoi,x.dia_diem_lam_viec])}${line("Thu nhập",x.muc_luong)}${line("Chi phí dự kiến",x.chi_phi)}${line("Doanh nghiệp",x.doanh_nghiep)}${line("Hạn đăng ký",x.han_nop)}${x.mo_ta?`<p>${esc(x.mo_ta)}</p>`:""}${btn(x.link,"Xem chi tiết / đăng ký")}</div>`,
  training:x=>`<div class="item"><h3>${esc(x.ten_khoa)}</h3>${meta([x.co_so,x.dia_diem,x.thoi_gian,x.khai_giang&&"Khai giảng: "+x.khai_giang])}${line("Học phí",x.hoc_phi)}${line("Hỗ trợ",x.ho_tro)}${x.mo_ta?`<p class="pl">${esc(x.mo_ta)}</p>`:""}${btn(x.link,"Đăng ký / tìm hiểu")}</div>`,
  policies:x=>`<div class="item">${x.nhom?`<span class="badge">${esc(x.nhom)}</span>`:""}<h3>${esc(x.tieu_de)}</h3>${line("Đối tượng",x.doi_tuong)}${x.noi_dung?`<p class="pl">${esc(x.noi_dung)}</p>`:""}${(x.dieu_kien||x.ho_so||x.noi_nop)?`<details><summary>Điều kiện, hồ sơ, nơi nộp</summary>${sec("Điều kiện",x.dieu_kien)}${sec("Hồ sơ",x.ho_so)}${sec("Nơi nộp, thời hạn, lưu ý",x.noi_nop)}</details>`:""}${x.can_cu?`<div class="meta" style="margin-top:8px">Căn cứ: ${esc(x.can_cu)}</div>`:""}${btn(x.link,"Xem thêm")}</div>`,
  docs:x=>`<div class="item"><h3>${esc(x.ten)}</h3>${meta([x.loai,x.so_hieu,x.ngay])}${x.tom_tat?`<p class="pl">${esc(x.tom_tat)}</p>`:""}${btn(x.link_pdf,"Mở / tải PDF")}</div>`}[p];
 return out+`<div class="cards">${r.map(card).join("")}</div>`}

addEventListener("hashchange",()=>{filter="Tất cả";q="";render(true)});
let wasDesk=window.innerWidth>=900;
addEventListener("resize",()=>{const d=window.innerWidth>=900;if(d!==wasDesk){wasDesk=d;render()}});
init();
let LASTLOAD=Date.now();
const softRefresh=()=>{if(document.hidden||(document.activeElement&&document.activeElement.id==="s"))return;LASTLOAD=Date.now();init(true).catch(()=>{})};
setInterval(softRefresh,REFRESH_MS);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&Date.now()-LASTLOAD>60000)softRefresh()});