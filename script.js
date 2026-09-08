const state={files:[],face:null,screenings:[],audit:[],sessions:0};
const $=id=>document.getElementById(id);
document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$(btn.dataset.page).classList.add("active");}));
$("uploadBox").addEventListener("click",()=>$("fileInput").click());
$("uploadBox").addEventListener("dragover",e=>{e.preventDefault();$("uploadBox").style.background="#eef3f7"});
$("uploadBox").addEventListener("dragleave",()=>{$("uploadBox").style.background=""});
$("uploadBox").addEventListener("drop",e=>{e.preventDefault();$("uploadBox").style.background="";addFiles([...e.dataTransfer.files])});
$("fileInput").addEventListener("change",e=>addFiles([...e.target.files]));
$("faceUploadBox").addEventListener("click",()=>$("faceInput").click());
$("faceInput").addEventListener("change",e=>{state.face=e.target.files[0];if(state.face){$("facePreview").src=URL.createObjectURL(state.face);$("facePreview").style.display="block"}});
function addFiles(files){files.filter(f=>f.type.startsWith("image/")).forEach(f=>{if(!state.files.some(x=>x.name===f.name&&x.size===f.size))state.files.push(f)});renderQueue();$("scanBtn").disabled=state.files.length===0}
function renderQueue(){$("docQueue").innerHTML=state.files.map((f,i)=>`<div class="doc-thumb"><img src="${URL.createObjectURL(f)}"><button class="thumb-remove" onclick="removeFile(${i})">×</button><div class="thumb-label">${f.name}</div></div>`).join("")}
function removeFile(i){state.files.splice(i,1);renderQueue();$("scanBtn").disabled=state.files.length===0}
function detectType(name){const n=name.toLowerCase();if(n.includes("passport"))return"Passport";if(n.includes("visa"))return"Visa";if(n.includes("license")||n.includes("licence"))return"Driving Licence";if(n.includes("permit"))return"Travel Permit";return["National ID","Passport","Visa","National ID"][state.files.length%4]}
function riskFor(i){return 8+((i*17+state.files.length*7)%48)}
function decision(r){return r<30?"CLEARED":"FLAGGED"}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return("00000000"+(h>>>0).toString(16)).slice(-8).toUpperCase()}
$("scanBtn").addEventListener("click",runScreening);
function runScreening(){if(!state.files.length)return;state.sessions++;const now=new Date();const results=state.files.map((f,i)=>{const type=detectType(f.name),risk=riskFor(i),dec=decision(risk),id=(type==="Passport"?"P":type==="Visa"?"V":"ID")+String(100000+i+state.sessions);const item={time:now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}),type,id,risk,dec,file:f};state.screenings.unshift(item);state.audit.unshift({...item,officer:"Officer on Duty",hash:hash(f.name+now.getTime()+i)});return item});renderSummary(results);renderResults(results);updateDashboard();$("resultsCard").style.display="block"}
function renderSummary(results){const flagged=results.filter(x=>x.dec==="FLAGGED").length,total=results.length,avg=Math.round(results.reduce((a,b)=>a+b.risk,0)/total);const level=avg<30?"LOW":avg<55?"MEDIUM":"HIGH";const cls=level.toLowerCase();$("summaryArea").innerHTML=`<div class="summary-grid"><div class="summary-box"><div class="num">${total}</div><small>Documents analysed</small></div><div class="summary-box"><div class="num ${flagged?'high':'low'}">${flagged?flagged:total}</div><small>${flagged?"Items flagged":"Items cleared"}</small></div></div><div class="overall-risk"><small class="muted">COMBINED RISK SCORE</small><div class="risk-score ${cls}">${avg}/100</div><span class="risk-label ${cls}-label">${level} RISK</span><p class="sub" style="margin-top:10px;margin-bottom:0">${flagged?"Manual review recommended for flagged document(s).":"No high-risk anomaly detected in this demonstration."}</p></div>`}
function renderResults(results){$("resultsArea").innerHTML=results.map(x=>`<div class="doc-result-card"><div class="doc-result-header"><img src="${URL.createObjectURL(x.file)}"><div class="doc-result-title"><b>${x.type}</b><small>${x.file.name}</small></div><span class="risk-label ${x.dec==="CLEARED"?"low-label":"high-label"}">${x.dec}</span></div><div class="pipeline-mini"><span class="tag ok">OCR</span><span class="tag ok">Field Check</span><span class="tag ok">Format</span><span class="tag ${x.risk>29?"flag":"ok"}">Fraud Risk</span><span class="tag ok">Face Match</span></div><div class="fields"><div class="field ok"><b>Document Number</b>${x.id}</div><div class="field"><b>Detected Type</b>${x.type}</div><div class="field ok"><b>Data Integrity</b>Consistent</div><div class="field ${x.risk>29?"alert":"ok"}"><b>Risk Assessment</b>${x.risk<30?"Low anomaly":"Review recommended"}</div></div><div class="doc-risk-row"><span class="muted">AI confidence</span><span class="score ${x.risk>29?"high":"low"}">${100-x.risk}%</span></div></div>`).join("")}
function updateDashboard(){$("statTotal").textContent=state.screenings.length;$("statGenuine").textContent=state.screenings.filter(x=>x.dec==="CLEARED").length;$("statFlagged").textContent=state.screenings.filter(x=>x.dec==="FLAGGED").length;$("statSessions").textContent=state.sessions;$("recentTableBody").innerHTML=state.screenings.slice(0,8).map(x=>`<tr><td>${x.time}</td><td>${x.type}</td><td>${x.id}</td><td class="${x.risk<30?"low":"high"}">${x.risk}/100</td><td><span class="risk-label ${x.dec==="CLEARED"?"low-label":"high-label"}">${x.dec}</span></td></tr>`).join("")||`<tr><td colspan="5" class="muted">No screenings yet — run a check from Screening.</td></tr>`;$("auditTableBody").innerHTML=state.audit.slice(0,12).map((x,i)=>`<tr><td>#${state.audit.length-i}</td><td>${x.time}</td><td>${x.officer}</td><td>${x.type}</td><td>${x.dec}</td><td>${x.hash}</td></tr>`).join("")||`<tr><td colspan="6" class="muted">No audit records yet.</td></tr>`}
$("loginBtn").addEventListener("click",()=>{const ok=$("officerId").value.trim()&&$("officerPin").value.trim();$("loginStatus").textContent=ok?"Authentication successful — demo session active.":"Enter Officer ID and PIN."; $("loginStatus").className="status-msg "+(ok?"ok":"fail")});
$("digilockerBtn").addEventListener("click",()=>{const ok=$("digilockerRef").value.trim();$("digilockerStatus").textContent=ok?"DigiLocker verification response received — demo only.":"Enter a document reference number."; $("digilockerStatus").className="status-msg "+(ok?"ok":"fail")});
$("resetBtn").addEventListener("click",()=>{state.files=[];state.face=null;state.screenings=[];state.audit=[];state.sessions=0;$("fileInput").value="";$("faceInput").value="";$("facePreview").style.display="none";$("docQueue").innerHTML="";$("summaryArea").innerHTML='<p class="placeholder">Upload documents and run screening to see the combined identity verification summary.</p>';$("resultsCard").style.display="none";$("scanBtn").disabled=true;updateDashboard()});
updateDashboard();

// Initial secure login screen
const loginPage = document.getElementById("loginPage");
const mainApp = document.getElementById("mainApp");
const enterSystemBtn = document.getElementById("enterSystemBtn");
const loginOfficerId = document.getElementById("loginOfficerId");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

function openMainApp(){
  loginPage.style.display = "none";
  mainApp.style.display = "block";
  sessionStorage.setItem("autheNovaLoggedIn","true");
}
if(sessionStorage.getItem("autheNovaLoggedIn")==="true"){
  openMainApp();
}
enterSystemBtn.addEventListener("click",()=>{
  if(!loginOfficerId.value.trim() || !loginPassword.value.trim()){
    loginError.textContent="Please enter both Officer ID and Password / PIN.";
    return;
  }
  loginError.textContent="";
  openMainApp();
});
[loginOfficerId,loginPassword].forEach(input=>input.addEventListener("keydown",e=>{
  if(e.key==="Enter") enterSystemBtn.click();
}));

// Profile menu, Your Profile modal, and logout
const profileBtn=document.getElementById("profileBtn");
const profileMenu=document.getElementById("profileMenu");
const myProfileBtn=document.getElementById("myProfileBtn");
const logoutBtn=document.getElementById("logoutBtn");
const profileModal=document.getElementById("profileModal");
const closeProfile=document.getElementById("closeProfile");

profileBtn.addEventListener("click",(e)=>{e.stopPropagation();profileMenu.classList.toggle("show")});
document.addEventListener("click",(e)=>{if(!profileMenu.contains(e.target)&&e.target!==profileBtn)profileMenu.classList.remove("show")});
myProfileBtn.addEventListener("click",()=>{profileMenu.classList.remove("show");profileModal.classList.add("show")});
closeProfile.addEventListener("click",()=>profileModal.classList.remove("show"));
profileModal.addEventListener("click",(e)=>{if(e.target===profileModal)profileModal.classList.remove("show")});

logoutBtn.addEventListener("click",()=>{
  sessionStorage.removeItem("autheNovaLoggedIn");
  profileMenu.classList.remove("show");
  mainApp.style.display="none";
  loginPage.style.display="flex";
  loginOfficerId.value="";
  loginPassword.value="";
  loginError.textContent="";
});
