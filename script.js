const $=id=>document.getElementById(id);
let role="", user="guest", mode="free", cwd="/home/user", z=30, score=0;
let completed=new Set(), markedThreat=false, blockedIp=false;
let activeMission=null;

// ─── FILESYSTEM ───────────────────────────────────────────────────────────────
const dirs={
  "/home/user":["Documents","Downloads","Pictures","Projects","Logs","System","notes.txt"],
  "/home/user/Documents":["anime_notes.txt","cartoon_story.txt","password_hint.txt","daily_plan.md","phishing_email.txt"],
  "/home/user/Downloads":["readme_downloads.txt"],
  "/home/user/Pictures":["cute_robot.png","ninja_girl.jpg","space_kid.png"],
  "/home/user/Projects":["server_config.env","todo_security.txt","ddos_traffic.log"],
  "/home/user/Logs":["system_logs.log","suspicious_activity.log","auth.log","malware_scan.log"],
  "/home/user/System":["hostname","network.conf","processes.txt"]
};
const content={
  "notes.txt":"Welcome to CyberOS. This is a virtual system. Nothing here touches your real computer.",
  "anime_notes.txt":"Original characters only: Luna Byte, RoboMochi, Captain Nova. No copyrighted images used.",
  "cartoon_story.txt":"RoboMochi found a strange login attempt in the castle server logs.",
  "password_hint.txt":"Old hint found: dev password pattern may include 'mochi' + year. [CLUE: weak password habit]",
  "daily_plan.md":"1. Check auth logs\n2. Review server_config.env\n3. Block suspicious IP if needed",
  "phishing_email.txt":"FROM: admin-noreply@cyberos-security-alert.xyz\nTO: dev@company.com\nSUBJECT: URGENT: Your account will be suspended!\n\nClick here to verify: http://bit.ly/fake-login\n\n[CLUE: fake domain, urgency trick, suspicious link — this is a phishing email!]",
  "readme_downloads.txt":"Downloads from the fake Web Store appear here. They are simulated local items.",
  "server_config.env":"APP_ENV=training\nDB_USER=cyber_student\nDB_PASS=mochi2026!\nAPI_KEY=FAKE-TRAINING-KEY\n[CLUE: exposed config file — passwords should never be stored in plain text!]",
  "todo_security.txt":"TODO: rotate DB password, disable debug mode, review failed login attempts.",
  "ddos_traffic.log":"10:00:01 requests=14  ip=192.168.1.1\n10:00:01 requests=982 ip=10.0.0.99 ← SPIKE\n10:00:02 requests=1204 ip=10.0.0.99 ← SPIKE\n10:00:02 requests=1587 ip=10.0.0.99 ← SERVER OVERLOAD\n[CLUE: one IP sending thousands of requests/sec = DDoS attack pattern]",
  "system_logs.log":"09:05 boot complete\n09:11 user login success\n09:18 service webapp started",
  "suspicious_activity.log":"10:42 FAILED login user=admin ip=10.0.0.77\n10:43 FAILED login user=root  ip=10.0.0.77\n10:44 LOGIN SUCCESS user=dev  ip=10.0.0.77\n[CLUE: 2 failed then 1 success from same IP = brute force + unauthorized access!]",
  "auth.log":"Accepted password for user from 127.0.0.1\nFailed password for admin from 10.0.0.77\nFailed password for root from 10.0.0.77",
  "malware_scan.log":"[SCAN STARTED]\nchecking /tmp/update.sh ... CLEAN\nchecking /home/user/Downloads/unknown_patch.exe ... MALWARE DETECTED\nSignature: Trojan.FakeUpdater.B\nRecommendation: Quarantine immediately\n[CLUE: .exe files from unknown sources can be malware — never run untrusted executables!]",
  "hostname":"cyberos-training-vm",
  "network.conf":"ip=192.168.56.10\ngateway=192.168.56.1\nblocked_ips=[]",
  "processes.txt":"PID  NAME          CPU%  MEM%\n101  webapp        2.1   1.4\n102  sshd          0.0   0.2\n103  unknown_proc  98.7  45.2  ← SUSPICIOUS\n[CLUE: a process using 98.7% CPU with unknown name = possible insider malware or cryptominer!]",
  "cute_robot.png":"__IMAGE__robot",
  "ninja_girl.jpg":"__IMAGE__ninja",
  "space_kid.png":"__IMAGE__space"
};

// ─── IMAGE DATA (inline SVG avatars so images always render) ──────────────────
const imageAssets={
  "cute_robot.png": `<div class="img-preview"><svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="30" width="50" height="40" rx="8" fill="#38bdf8"/><rect x="35" y="10" width="30" height="22" rx="6" fill="#60a5fa"/><circle cx="42" cy="42" r="6" fill="#0f172a"/><circle cx="58" cy="42" r="6" fill="#0f172a"/><circle cx="44" cy="42" r="2" fill="#38bdf8"/><circle cx="60" cy="42" r="2" fill="#38bdf8"/><rect x="43" y="54" width="14" height="4" rx="2" fill="#0f172a"/><rect x="15" y="38" width="12" height="6" rx="3" fill="#7dd3fc"/><rect x="73" y="38" width="12" height="6" rx="3" fill="#7dd3fc"/><rect x="35" y="70" width="10" height="18" rx="4" fill="#38bdf8"/><rect x="55" y="70" width="10" height="18" rx="4" fill="#38bdf8"/><rect x="47" y="5" width="6" height="8" rx="2" fill="#a78bfa"/></svg><div class="img-caption">🤖 RoboMochi — original fictional character</div></div>`,
  "ninja_girl.jpg": `<div class="img-preview"><svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="28" r="18" fill="#a78bfa"/><rect x="30" y="44" width="40" height="38" rx="8" fill="#7c3aed"/><rect x="28" y="44" width="8" height="28" rx="4" fill="#6d28d9"/><rect x="64" y="44" width="8" height="28" rx="4" fill="#6d28d9"/><rect x="36" y="80" width="12" height="14" rx="4" fill="#4c1d95"/><rect x="52" y="80" width="12" height="14" rx="4" fill="#4c1d95"/><rect x="32" y="22" width="36" height="14" rx="7" fill="#0f172a"/><ellipse cx="44" cy="29" rx="4" ry="3" fill="#818cf8"/><ellipse cx="56" cy="29" rx="4" ry="3" fill="#818cf8"/><rect x="22" y="48" width="16" height="4" rx="2" fill="#f59e0b" transform="rotate(-30 30 50)"/><rect x="62" y="48" width="16" height="4" rx="2" fill="#f59e0b" transform="rotate(30 70 50)"/></svg><div class="img-caption">🥷 Luna Byte — original fictional character</div></div>`,
  "space_kid.png": `<div class="img-preview"><svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="30" rx="22" ry="24" fill="#e2e8f0"/><ellipse cx="50" cy="30" rx="16" ry="18" fill="#bae6fd"/><circle cx="44" cy="28" r="3" fill="#0369a1"/><circle cx="56" cy="28" r="3" fill="#0369a1"/><path d="M 43 36 Q 50 42 57 36" stroke="#0369a1" stroke-width="2" fill="none"/><rect x="28" y="52" width="44" height="36" rx="10" fill="#f97316"/><rect x="15" y="56" width="14" height="8" rx="4" fill="#fb923c"/><rect x="71" y="56" width="14" height="8" rx="4" fill="#fb923c"/><rect x="36" y="86" width="12" height="10" rx="4" fill="#ea580c"/><rect x="52" y="86" width="12" height="10" rx="4" fill="#ea580c"/><circle cx="50" cy="64" r="8" fill="#fbbf24"/><text x="46" y="68" font-size="9" fill="#0f172a">★</text><ellipse cx="50" cy="16" rx="22" ry="6" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.6"/></svg><div class="img-caption">🚀 Captain Nova — original fictional character</div></div>`
};

let downloads=[
  {name:"dream_wallpaper.png",type:"image",icon:"🌌",safe:true},
  {name:"sample_auth_logs.log",type:"log",icon:"📜",safe:true},
  {name:"cute_cyber_pet.png",type:"image",icon:"🐾",safe:true},
  {name:"unknown_patch.exe",type:"binary",icon:"⚠️",safe:false}
];
let gallery=["cute_robot.png","ninja_girl.jpg","space_kid.png"];

// ─── MULTI-STORYLINE MISSIONS — ROLE SEPARATED ───────────────────────────────

// ATTACKER storylines: YOU are the hacker, doing the attacking
const attackerStorylines = {
  recon: {
    title:"🔍 Reconnaissance",
    color:"#f59e0b",
    intro:"You're a hacker scoping out the target system. Gather intel — find open ports, exposed configs, and weak credentials before launching your attack.",
    missions:[
      {id:"rc1", title:"Scan the target system", desc:"🖥️ Terminal: nmap\nScan open ports and services. You're looking for entry points — SSH on 22, webapp on 8080.", check:()=>completed.has("nmap_done")},
      {id:"rc2", title:"Find exposed credentials", desc:"📁 File Manager → Projects → server_config.env\nBingo — a config file left in plain text! DB password: mochi2026! — that's your way in.", check:()=>completed.has("config")},
      {id:"rc3", title:"Locate the phishing vector", desc:"📁 File Manager → Documents → phishing_email.txt\nStudy the phishing email template. Understand the social engineering tactics used.", check:()=>completed.has("phishing_email")}
    ]
  },
  bruteforce: {
    title:"🔓 Brute Force Login",
    color:"#ef4444",
    intro:"Time to crack into the system. You'll run a brute force attack against the login — hammer it with password guesses until it gives in.",
    missions:[
      {id:"bf1", title:"Confirm attack surface", desc:"🖥️ Terminal: nmap\nConfirm SSH is running on port 22. That's your attack surface.", check:()=>completed.has("nmap_done")},
      {id:"bf2", title:"Run the brute force attack", desc:"🖥️ Terminal: bruteforce\nSimulate a dictionary attack against the SSH login. Watch the failed attempts pile up.", check:()=>completed.has("bruteforce_done")},
      {id:"bf3", title:"Gain access", desc:"🖥️ Terminal: exploit\nUse the cracked credentials to log in. You're in! Now move quietly.", check:()=>completed.has("exploit_done")}
    ]
  },
  exfiltration: {
    title:"📤 Data Exfiltration",
    color:"#a78bfa",
    intro:"You're inside the system. Your mission: steal sensitive data — the database password, API keys, and logs — without triggering alarms.",
    missions:[
      {id:"ex1", title:"Hunt for sensitive files", desc:"📁 File Manager → Projects → server_config.env\nFound: DB credentials and API key. Copy these — they're your treasure.", check:()=>completed.has("config")},
      {id:"ex2", title:"Check auth logs for user accounts", desc:"📁 File Manager → Logs → auth.log\nRead the auth logs. Identify user accounts and access patterns.", check:()=>completed.has("auth_log")},
      {id:"ex3", title:"Exfiltrate the data", desc:"🖥️ Terminal: exfil\nSimulate sending the stolen credentials out of the network. Mission success.", check:()=>completed.has("exfil_done")}
    ]
  },
  ddos_attack: {
    title:"💥 DDoS Attack",
    color:"#22c55e",
    intro:"Flood the target server until it goes offline. One IP, thousands of requests per second — you're launching a Denial of Service attack.",
    missions:[
      {id:"da1", title:"Identify the target server", desc:"📁 File Manager → System → network.conf\nTarget confirmed: 192.168.56.10 running webapp on port 8080.", check:()=>completed.has("network_conf")},
      {id:"da2", title:"Study the attack pattern", desc:"📁 File Manager → Projects → ddos_traffic.log\nReview the DDoS log — understand what request spike looks like.", check:()=>completed.has("ddos_traffic")},
      {id:"da3", title:"Launch the DDoS", desc:"🖥️ Terminal: ddos\nUnleash the flood. Server traffic spikes to 1587 req/sec. It's overwhelmed.", check:()=>completed.has("ddos_done")}
    ]
  }
};

// PROTECTOR storylines: YOU are the defender, stopping the attacks
const protectorStorylines = {
  phishing_defense: {
    title:"🎯 Phishing Response",
    color:"#f59e0b",
    intro:"A phishing email hit your company inbox. Your job: find it fast, identify the red flags, and warn users before anyone clicks the link.",
    missions:[
      {id:"ph1", title:"Find the phishing email", desc:"📁 File Manager → Documents → phishing_email.txt\nLook for: fake domain (.xyz), urgency language, suspicious link.", check:()=>completed.has("phishing_email")},
      {id:"ph2", title:"Analyze the threat", desc:"🖥️ Terminal: analyze\nDocument the attack vector — fake domain, social engineering, deceptive URL.", check:()=>completed.has("ip")},
      {id:"ph3", title:"Report & warn users", desc:"🖥️ Terminal: report\nGenerate an incident report and send a company-wide alert. Threat neutralized.", check:()=>completed.has("report")}
    ]
  },
  brute_defense: {
    title:"🛡️ Stop the Brute Force",
    color:"#ef4444",
    intro:"Someone is hammering your SSH login with thousands of password attempts. Detect it, find the source, and lock them out before they break in.",
    missions:[
      {id:"bd1", title:"Read the auth logs", desc:"📁 File Manager → Logs → suspicious_activity.log\nYou'll see repeated FAILED logins from 10.0.0.77 — classic brute force!", check:()=>completed.has("ip")},
      {id:"bd2", title:"Deploy firewall rule", desc:"🖥️ Terminal: firewall block 10.0.0.77\nDrop all traffic from that IP at the firewall — before they succeed.", check:()=>completed.has("firewall_done")},
      {id:"bd3", title:"Block & document the incident", desc:"📜 Log Viewer → Mark as Malicious → Block IP\nMark the IP, block it, log the incident for the security team.", check:()=>markedThreat&&blockedIp}
    ]
  },
  malware_defense: {
    title:"🦠 Malware Containment",
    color:"#22c55e",
    intro:"A Trojan was found in Downloads and a rogue process is burning 98% CPU. Hunt it down, quarantine it, and stop the spread.",
    missions:[
      {id:"md1", title:"Review malware scan results", desc:"📁 File Manager → Logs → malware_scan.log\nTrojan.FakeUpdater.B detected in Downloads. Note the filename.", check:()=>completed.has("malware_scan")},
      {id:"md2", title:"Kill the suspicious process", desc:"📁 File Manager → System → processes.txt\nFind the unknown_proc eating 98.7% CPU — that's your malware running.", check:()=>completed.has("processes")},
      {id:"md3", title:"Quarantine & confirm clean", desc:"🖥️ Terminal: scan\nIsolate the infected file. Run a full scan to confirm the threat is contained.", check:()=>completed.has("scanned")}
    ]
  },
  incident_response: {
    title:"🚨 Incident Response",
    color:"#a78bfa",
    intro:"Full breach in progress. The attacker is inside. Contain the damage, cut off access, patch the hole, and file the report.",
    missions:[
      {id:"ir1", title:"Find the breach point", desc:"📁 File Manager → Projects → server_config.env\nDB password in plain text — that's the entry point. Must be patched now.", check:()=>completed.has("config")},
      {id:"ir2", title:"Identify & mark the attacker", desc:"📜 Log Viewer → Analyze Logs\nTrace the intrusion to IP 10.0.0.77. Mark it as malicious immediately.", check:()=>markedThreat},
      {id:"ir3", title:"Deploy firewall & block access", desc:"🖥️ Terminal: firewall block 10.0.0.77\nCut off the attacker at the network layer — no more access.", check:()=>completed.has("firewall_done")},
      {id:"ir4", title:"File the incident report", desc:"🖥️ Terminal: report\nDocument everything: entry point, attacker IP, actions taken. Send to security team.", check:()=>blockedIp&&completed.has("report")}
    ]
  }
};

// Active storyline set based on role
function getStorylines(){ return role==="attacker" ? attackerStorylines : protectorStorylines; }

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>{s.classList.remove("active");s.classList.add("hidden")});
  $(id).classList.remove("hidden");$(id).classList.add("active");
}

document.querySelectorAll(".mode-card[data-role]").forEach(b=>b.onclick=()=>{
  role=b.dataset.role;
  showScreen("modeSelect");
});

$("backToLanding").onclick=()=>showScreen("landing");

$("pickMissions").onclick=()=>{mode="story";applySetupTheme();showScreen("setup")};
$("pickFree").onclick=()=>{mode="free";applySetupTheme();showScreen("setup")};

function applySetupTheme(){
  if(role==="attacker"){
    $("setupTitle").textContent="⚔️ Attacker Session";
    $("setupDesc").textContent="You'll be hacking a simulated system. Everything is virtual — no real systems are touched.";
    $("setupCard").style.borderTop="3px solid #ef4444";
    $("createSession").textContent="Launch Attack Session";
    $("guestSession").textContent="Quick Start as Guest Hacker";
  } else {
    $("setupTitle").textContent="🛡️ Protector Session";
    $("setupDesc").textContent="You'll be defending a simulated system. Detect threats, block attackers, protect the network.";
    $("setupCard").style.borderTop="3px solid #22c55e";
    $("createSession").textContent="Launch Defense Session";
    $("guestSession").textContent="Quick Start as Guest Defender";
  }
}

$("backToMode").onclick=()=>showScreen("modeSelect");

$("createSession").onclick=()=>{
  let u=$("username").value.trim(),p=$("pin").value.trim();
  if(!u||p.length<4){$("authMsg").textContent="Enter username and 4 digit demo PIN.";return}
  localStorage.setItem("cyberosUser",u); user=u; boot();
};
$("guestSession").onclick=()=>{user="guest";boot()};

$("backToModeBtn").onclick=()=>{
  $("desktop").classList.add("hidden");
  showScreen("modeSelect");
};

// ─── BOOT ─────────────────────────────────────────────────────────────────────
function boot(){
  showScreen("boot");
  const lines=["checking virtual disk...","loading safe simulation mode...","starting desktop compositor...","mounting fake filesystem...","no real system access enabled...","ready."];
  let i=0;$("bootLines").innerHTML="";
  const t=setInterval(()=>{
    $("bootLines").innerHTML+="> "+lines[i]+"<br>";
    $("bootFill").style.width=((i+1)/lines.length*100)+"%";
    i++;
    if(i>=lines.length){clearInterval(t);setTimeout(showDesktop,500)}
  },280);
}

function showDesktop(){
  $("boot").classList.remove("active");$("boot").classList.add("hidden");
  $("desktop").classList.remove("hidden");
  // Role badge theming
  if(role==="attacker"){
    $("roleBadge").textContent="⚔️ ATTACKER";
    $("roleBadge").style.background="#ef444433";
    $("roleBadge").style.color="#fca5a5";
    document.body.dataset.role="attacker";
    // Log viewer: attacker sees recon info, not defense buttons
    $("logWindowTitle").textContent="🔍 Target Intel";
    $("analyzeLogsBtn").textContent="🔍 Scan Target System";
    document.querySelectorAll(".prot-only").forEach(b=>b.style.display="none");
  } else {
    $("roleBadge").textContent="🛡️ PROTECTOR";
    $("roleBadge").style.background="#22c55e33";
    $("roleBadge").style.color="#86efac";
    document.body.dataset.role="protector";
    $("logWindowTitle").textContent="📜 Log Viewer & Defense";
    $("analyzeLogsBtn").textContent="📊 Analyze Logs";
    document.querySelectorAll(".prot-only").forEach(b=>b.style.display="");
  }
  $("modeBadge").textContent=mode==="story"?"MISSIONS":"FREE EXPLORE";
  $("modeBadge").style.background=mode==="story"?"#f59e0b33":"#38bdf833";
  $("modeBadge").style.color=mode==="story"?"#fde68a":"#7dd3fc";
  toast("Welcome "+user+". Everything is virtual and safe.");
  renderAll();
  openApp("missions");
  openApp("terminal");
  print("CyberOS virtual shell. Type help.");
}

// ─── WINDOW MANAGEMENT ────────────────────────────────────────────────────────
document.querySelectorAll("[data-open]").forEach(x=>x.onclick=()=>openApp(x.dataset.open));
document.querySelectorAll(".window").forEach(w=>{
  w.querySelector(".close").onclick=()=>w.classList.add("hidden");
  w.querySelector(".min").onclick=()=>w.classList.add("hidden");
  w.addEventListener("mousedown",()=>w.style.zIndex=++z);
  drag(w);
});
function drag(w){let h=w.querySelector(".window-head"),dx=0,dy=0,down=false;h.onmousedown=e=>{down=true;dx=e.clientX-w.offsetLeft;dy=e.clientY-w.offsetTop;w.style.zIndex=++z};document.addEventListener("mousemove",e=>{if(!down)return;w.style.left=Math.max(0,Math.min(innerWidth-120,e.clientX-dx))+"px";w.style.top=Math.max(38,Math.min(innerHeight-80,e.clientY-dy))+"px"});document.addEventListener("mouseup",()=>down=false)}
function openApp(id){$(id).classList.remove("hidden");$(id).style.zIndex=++z;renderAll();}
function toast(msg){let d=document.createElement("div");d.className="toast";d.textContent=msg;$("toast").appendChild(d);setTimeout(()=>d.remove(),3500)}
function addScore(n,msg){score+=n;$("scoreBadge").textContent="Score: "+score;if(msg)toast("+"+n+" "+msg)}
function pathJoin(base,name){return base=="/"?"/"+name:base+"/"+name}
function fileName(path){return path.split("/").pop()}

// ─── RENDER ALL ───────────────────────────────────────────────────────────────
function renderAll(){renderFiles();renderMissions();renderLogs();renderBrowser();renderGallery();$("notesArea").value=localStorage.getItem("cyberosNotes")||"Incident notes:\n- ";$("clock").textContent=new Date().toLocaleTimeString();}
setInterval(()=>$("clock")&&($("clock").textContent=new Date().toLocaleTimeString()),1000);
$("notesArea").oninput=()=>localStorage.setItem("cyberosNotes",$("notesArea").value);

// ─── FILE MANAGER ─────────────────────────────────────────────────────────────
function renderFiles(){
  const folders=Object.keys(dirs);
  $("folderList").innerHTML=folders.map(f=>`<div class="${f===cwd?'active':''}" onclick="cwd='${f}';renderFiles();updatePrompt()">${f.replace('/home/user','~')}</div>`).join("");
  $("filePath").textContent=cwd;
  let list=dirs[cwd]||[];
  $("fileGrid").innerHTML=list.map(n=>{
    let isDir=dirs[pathJoin(cwd,n)];
    let isImg=n.match(/\.(png|jpg|jpeg|gif|webp)$/i);
    return `<div class="file-card" onclick="selectFile('${n}')">${isDir?'📁':isImg?'🖼️':'📄'}<br><b>${n}</b><small>${isDir?' folder':isImg?' image':' file'}</small></div>`;
  }).join("");
}

window.selectFile=function(n){
  let p=pathJoin(cwd,n);
  if(dirs[p]){cwd=p;renderFiles();updatePrompt();return}

  // Image rendering — show actual SVG preview
  if(imageAssets[n]){
    $("filePreview").innerHTML=imageAssets[n];
    $("filePreview").classList.add("has-image");
    // Mark gallery clue
    if(!completed.has("gallery_"+n)){completed.add("gallery_"+n);addScore(30,"image viewed");}
    return;
  }

  let txt=content[n]||"(empty)";
  $("filePreview").textContent=txt;
  $("filePreview").classList.remove("has-image");
  selectSideEffects(n,txt);
  renderMissions();
}

// ─── MISSIONS ─────────────────────────────────────────────────────────────────
function renderMissions(){
  let html="";
  const activeStorylines = getStorylines();
  if(mode==="free"){
    if(role==="attacker"){
      html=`<div class="mission-header attacker-header"><h2>⚔️ Attacker — Free Mode</h2>
      <p class="mission-intro">🕵️ You're the hacker. Explore the target system freely — dig through files, find credentials, run attack commands. Everything is simulated.</p></div>
      <div class="mission-divider">Attack Commands</div>
      <div class="action-grid">
        <button class="decision atk-btn" onclick="runAttackAction('nmap')">🔍 Run nmap scan</button>
        <button class="decision atk-btn" onclick="runAttackAction('bruteforce')">🔓 Brute force login</button>
        <button class="decision atk-btn" onclick="runAttackAction('exploit')">💀 Exploit vulnerability</button>
        <button class="decision atk-btn" onclick="runAttackAction('exfil')">📤 Exfiltrate data</button>
        <button class="decision atk-btn" onclick="runAttackAction('ddos')">💥 Launch DDoS</button>
      </div>
      <div class="mission-divider">Attack Status</div>
      <div class="status-row"><span>System scanned:</span><b>${completed.has("nmap_done")?"✅ Yes":"⬜ Not yet"}</b></div>
      <div class="status-row"><span>Credentials stolen:</span><b>${completed.has("config")?"✅ Yes":"⬜ Not yet"}</b></div>
      <div class="status-row"><span>Data exfiltrated:</span><b>${completed.has("exfil_done")?"✅ Yes":"⬜ Not yet"}</b></div>`;
    } else {
      html=`<div class="mission-header"><h2>🛡️ Protector — Free Mode</h2>
      <p class="mission-intro">🧠 You're the defender. Monitor logs, block threats, set up firewalls — protect the system from attackers. Explore freely.</p></div>
      <div class="mission-divider">Defense Actions</div>
      <div class="action-grid">
        <button class="decision" onclick="decision('mark')">🚩 Mark 10.0.0.77 as malicious</button>
        <button class="decision" onclick="decision('block')">🛡️ Block IP 10.0.0.77</button>
        <button class="decision" onclick="runFirewall()">🔥 Deploy firewall rule</button>
        <button class="decision" onclick="decision('ignore')">❌ Ignore threat (−50pts)</button>
      </div>
      <div class="mission-divider">Defense Status</div>
      <div class="status-row"><span>Threat identified:</span><b>${markedThreat?"✅ Yes":"⬜ Not yet"}</b></div>
      <div class="status-row"><span>IP blocked:</span><b>${blockedIp?"✅ Yes":"⬜ Not yet"}</b></div>
      <div class="status-row"><span>Firewall active:</span><b>${completed.has("firewall_done")?"✅ Yes":"⬜ Not yet"}</b></div>`;
    }
  } else {
    // Story missions — show storyline picker if none selected
    if(!activeMission){
      let pickerTitle = role==="attacker" ? "Choose Your Attack" : "Choose Your Defense Mission";
      let pickerIntro = role==="attacker"
        ? "Each mission is a different hacking technique. Pick one — recon, brute force, data theft, or DDoS. Execute the attack step by step."
        : "Each mission is a real cyber threat scenario. Pick one and defend the system against it — step by step.";
      html=`<div class="mission-header ${role==="attacker"?"attacker-header":""}"><h2>${pickerTitle}</h2>
      <p class="mission-intro">${pickerIntro}</p></div>
      <div class="storyline-grid">`;
      Object.entries(activeStorylines).forEach(([key,s])=>{
        html+=`<button class="storyline-card" style="--accent:${s.color}" onclick="selectStoryline('${key}')">
          <div class="story-title">${s.title}</div>
          <div class="story-intro">${s.intro}</div>
        </button>`;
      });
      html+=`</div>`;
    } else {
      const s=activeStorylines[activeMission];
      const missions=s.missions;
      const allDone=missions.every(m=>m.check());
      html=`<div class="mission-header ${role==="attacker"?"attacker-header":""}" style="border-left:3px solid ${s.color};padding-left:12px">
        <button class="back-mission-btn" onclick="activeMission=null;renderMissions()">← All Missions</button>
        <h2>${s.title}</h2>
        <p class="mission-intro">${s.intro}</p>
      </div>`;
      if(allDone) html+=`<div class="mission-complete-banner">🎉 Mission Complete! +300 bonus points!</div>`;
      missions.forEach((m,i)=>{
        let done=m.check();
        let locked=i>0&&!missions[i-1].check()&&!done;
        html+=`<div class="mission-card ${done?'done':''} ${locked?'locked':''}">
          <div class="mission-card-head">
            <span class="mission-num">${done?'✅':locked?'🔒':role==="attacker"?'⚔️':'🛡️'} Step ${i+1}</span>
            <b>${m.title}</b>
          </div>
          <div class="mission-steps">${m.desc.replace(/\n/g,'<br>')}</div>
        </div>`;
      });
      if(role==="attacker"){
        html+=`<div class="mission-divider">Attack Commands</div>
        <div class="action-grid">
          <button class="decision atk-btn" onclick="runAttackAction('nmap')">🔍 nmap scan</button>
          <button class="decision atk-btn" onclick="runAttackAction('bruteforce')">🔓 Brute force</button>
          <button class="decision atk-btn" onclick="runAttackAction('exploit')">💀 Exploit</button>
          <button class="decision atk-btn" onclick="runAttackAction('exfil')">📤 Exfil data</button>
          <button class="decision atk-btn" onclick="runAttackAction('ddos')">💥 DDoS</button>
        </div>`;
      } else {
        html+=`<div class="mission-divider">Defense Actions</div>
        <div class="action-grid">
          <button class="decision" onclick="decision('mark')">🚩 Mark 10.0.0.77 as malicious</button>
          <button class="decision" onclick="decision('block')">🛡️ Block IP</button>
          <button class="decision" onclick="runFirewall()">🔥 Deploy firewall rule</button>
        </div>`;
      }
    }
  }
  $("missionContent").innerHTML=html;
}

window.selectStoryline=function(key){activeMission=key;addScore(0,"");renderMissions();}

window.runAttackAction=function(cmd){
  openApp("terminal");
  run(cmd);
}

window.runFirewall=function(){
  openApp("terminal");
  run("firewall block 10.0.0.77");
}

window.decision=function(type){
  if(type==="ignore"){score=Math.max(0,score-50);$("scoreBadge").textContent="Score: "+score;toast("-50 Ignoring threats is risky.");}
  if(type==="mark"){markedThreat=true;addScore(150,"threat marked");}
  if(type==="block"){if(!markedThreat){toast("Analyze/mark it first for full score.");score=Math.max(0,score-20)}else{blockedIp=true;addScore(200,"IP blocked")}}
  // Bonus for completing storyline
  if(activeMission){
    const activeStorylines = getStorylines();
    const s=activeStorylines[activeMission];
    if(s&&s.missions.every(m=>m.check())&&!completed.has("story_complete_"+activeMission)){
      completed.add("story_complete_"+activeMission);addScore(300,"Mission complete!");
    }
  }
  renderMissions();renderLogs();
}

// ─── LOGS ─────────────────────────────────────────────────────────────────────
function renderLogs(){
  if(role==="attacker"){
    $("logContent").textContent=
      "=== TARGET SYSTEM RECON ===\n"+
      content["system_logs.log"]+"\n\n"+
      "=== AUTH LOG (potential usernames) ===\n"+
      content["auth.log"]+"\n\n"+
      "=== NETWORK CONFIG ===\n"+
      content["network.conf"]+"\n\n"+
      "Attack Status:\nnmap_done="+completed.has("nmap_done")+"\nbruteforce="+completed.has("bruteforce_done")+"\nexfil="+completed.has("exfil_done");
  } else {
    $("logContent").textContent=
      "=== SYSTEM LOGS ===\n"+
      content["system_logs.log"]+"\n\n"+
      "=== SUSPICIOUS ACTIVITY ===\n"+
      content["suspicious_activity.log"]+"\n\n"+
      "Defense Status:\nThreat marked="+markedThreat+"\nIP blocked="+blockedIp+"\nFirewall="+completed.has("firewall_done");
  }
}
$("analyzeLogsBtn").onclick=()=>{
  if(role==="attacker"){
    completed.add("nmap_done");addScore(100,"system analyzed");toast("Target recon complete. Found: SSH:22, webapp:8080");
  } else {
    completed.add("ip");addScore(120,"logs analyzed");
  }
  renderAll();
}
$("markIpBtn").onclick=()=>decision("mark");
$("blockIpBtn").onclick=()=>decision("block");

// ─── BROWSER / DOWNLOADS ──────────────────────────────────────────────────────
function renderBrowser(){
  $("downloadList").innerHTML=downloads.map((d,i)=>`<div class="download-card">
    <div class="avatar">${d.icon}</div>
    <b>${d.name}</b>
    <p>${d.safe?'Safe training file':'⚠️ Suspicious — for protector practice only'}</p>
    <button onclick="downloadItem(${i})">Download</button>
  </div>`).join("");
}
window.downloadItem=function(i){
  let d=downloads[i],bar=$("downloadProgress"),span=bar.querySelector("span");
  if(!d.safe)toast("⚠️ Warning: This file looks suspicious!");
  bar.classList.remove("hidden");span.style.width="0";let p=0;
  let t=setInterval(()=>{p+=20;span.style.width=p+"%";if(p>=100){clearInterval(t);bar.classList.add("hidden");dirs["/home/user/Downloads"].push(d.name);content[d.name]=d.type==="image"?`__IMAGE__download_${i}`:`Downloaded sample file: ${d.name}`;if(d.type==="image")gallery.push(d.name);toast(d.name+" downloaded to Downloads");renderAll();}},150);
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
function renderGallery(){
  $("galleryGrid").innerHTML=gallery.map(g=>{
    if(imageAssets[g]){
      return `<div class="photo-card">${imageAssets[g]}</div>`;
    }
    // Fallback for downloaded images
    let emoji=g.includes("dream")?"🌌":g.includes("pet")?"🐾":"🖼️";
    return `<div class="photo-card"><div class="big">${emoji}</div><b>${g}</b><small>downloaded asset</small></div>`;
  }).join("");
}

// ─── TERMINAL ─────────────────────────────────────────────────────────────────
function print(s,cls=""){let d=document.createElement("div");d.innerHTML=s;$("terminalOut").appendChild(d);$("terminalOut").scrollTop=$("terminalOut").scrollHeight}
function updatePrompt(){$("prompt").textContent=`${user}@cyberos:${cwd.replace('/home/user','~')}$`}
updatePrompt();

$("terminalInput").addEventListener("keydown",e=>{
  if(e.key!=="Enter")return;
  let raw=e.target.value.trim();e.target.value="";
  if(!raw)return;
  print(`<span style="color:#38bdf8">${$("prompt").textContent}</span> ${raw}`);
  run(raw);
});

function resolve(p){if(!p||p==="~")return"/home/user"; if(p.startsWith("/"))return p; if(p===".."){let a=cwd.split("/");a.pop();return a.join("/")||"/"} return pathJoin(cwd,p)}

function run(raw){
  let [cmd,...args]=raw.split(/\s+/);
  // ── Shared commands ──
  if(cmd==="help"){
    if(role==="attacker"){
      print("⚔️ <b>Attacker Commands:</b><br>nmap — scan target for open ports<br>bruteforce — run password brute force attack<br>exploit — exploit a vulnerability<br>exfil — exfiltrate stolen data<br>ddos — launch DDoS attack<br>grep &lt;pattern&gt; &lt;file&gt; — search file<br>cat &lt;file&gt; — read a file<br>ls / cd / pwd / whoami / date / clear");
    } else {
      print("🛡️ <b>Protector Commands:</b><br>analyze — analyze logs for threats<br>scan — run malware scan<br>firewall block &lt;ip&gt; — block an IP at firewall<br>report — generate incident report<br>grep &lt;pattern&gt; &lt;file&gt; — search logs<br>cat &lt;file&gt; — read a file<br>ls / cd / pwd / whoami / date / clear");
    }
  }
  else if(cmd==="missions") print("Tip: Open the Missions window (🎯) to see your objectives.");
  else if(cmd==="pwd") print(cwd);
  else if(cmd==="whoami") print(user+" ("+role+")");
  else if(cmd==="date") print(new Date().toString());
  else if(cmd==="clear") $("terminalOut").innerHTML="";
  else if(cmd==="ls"){let p=resolve(args[0]);print((dirs[p]||[]).join("  ")||"not a directory");}
  else if(cmd==="cd"){let p=resolve(args[0]);if(dirs[p]){cwd=p;updatePrompt();print("changed directory to "+cwd)}else print("cd: no such directory");}
  else if(cmd==="cat"){
    let target=args.join(" ");let name=fileName(target);
    if(content[name]){
      if(content[name].startsWith("__IMAGE__")){
        print(`[This is an image file: ${name}. Open File Manager → Gallery to view it visually.]`);
      } else {
        print(content[name].replaceAll("\n","<br>"));selectSideEffects(name,content[name]);
      }
    } else print("cat: file not found");
  }
  else if(cmd==="grep"){
    let pat=args[0],name=args[1];let txt=content[fileName(name)]||"";
    let lines=txt.split("\n").filter(l=>l.toLowerCase().includes((pat||"").toLowerCase()));
    print(lines.join("<br>")||"no matches");
    if(lines.join("").includes("10.0.0.77")){completed.add("ip");addScore(120,"suspicious IP found");renderAll();}
    if(lines.join("").includes("SPIKE")){completed.add("ddos_ip");addScore(120,"DDoS pattern detected");renderAll();}
  }
  // ── ATTACKER commands ──
  else if(cmd==="nmap"){
    completed.add("nmap_done");addScore(100,"target scanned");
    print("<span style='color:#f59e0b'>⚔️ NMAP SCAN — 192.168.56.10</span><br>PORT     STATE  SERVICE<br>22/tcp   open   ssh (OpenSSH 8.2)<br>8080/tcp open   http (webapp v2.1)<br>3306/tcp open   mysql<br><span style='color:#4ade80'>[ATTACK] Entry points found: SSH port 22, webapp port 8080</span>");
    renderAll();
  }
  else if(cmd==="bruteforce"){
    if(!completed.has("nmap_done")){print("<span style='color:#f87171'>Run nmap first to identify targets.</span>");return;}
    completed.add("bruteforce_done");addScore(150,"brute force executed");
    print("<span style='color:#f59e0b'>⚔️ BRUTE FORCE — ssh admin@192.168.56.10</span><br>Trying admin:password ... FAIL<br>Trying admin:123456 ... FAIL<br>Trying dev:mochi2026! ... <span style='color:#4ade80'>SUCCESS ✓</span><br><span style='color:#4ade80'>[ATTACK] Credentials cracked: dev / mochi2026!</span><br>Hint: The password was exposed in server_config.env");
    renderAll();
  }
  else if(cmd==="exploit"){
    if(!completed.has("bruteforce_done")&&!completed.has("config")){print("<span style='color:#f87171'>Find credentials first — brute force or read server_config.env</span>");return;}
    completed.add("exploit_done");addScore(200,"system exploited");
    print("<span style='color:#f59e0b'>⚔️ EXPLOIT — logging in as dev</span><br>ssh dev@192.168.56.10 -p 22<br>Password: mochi2026!<br><span style='color:#4ade80'>[ATTACK] Access granted. You are now inside the system.</span><br>Navigate carefully — don't trigger the IDS.");
    renderAll();
  }
  else if(cmd==="exfil"){
    if(!completed.has("config")){print("<span style='color:#f87171'>Steal credentials first — read server_config.env</span>");return;}
    completed.add("exfil_done");addScore(250,"data exfiltrated");
    print("<span style='color:#f59e0b'>⚔️ EXFILTRATION</span><br>Packaging: server_config.env, auth.log, DB credentials...<br>Sending to attacker C2 server 203.0.113.99...<br><span style='color:#4ade80'>[ATTACK] Data exfiltrated successfully. Mission complete.</span><br>Data stolen: DB_PASS=mochi2026!, API_KEY, user list");
    renderAll();
  }
  else if(cmd==="ddos"){
    completed.add("ddos_done");addScore(200,"DDoS launched");
    print("<span style='color:#f59e0b'>⚔️ DDoS FLOOD — target: 192.168.56.10:8080</span><br>Sending 14 req/s ... normal<br>Ramping up to 982 req/s ...<br>Escalating to 1204 req/s ...<br>1587 req/s — <span style='color:#4ade80'>SERVER OVERLOADED ✓</span><br>Target webapp is now offline.");
    renderAll();
  }
  // ── PROTECTOR commands ──
  else if(cmd==="scan"){
    completed.add("scanned");addScore(100,"malware scan run");
    print("🔍 <b>MALWARE SCAN — cyberos-training-vm</b><br>Checking /tmp... CLEAN<br>Checking /home/user/Downloads/unknown_patch.exe...<br><span style='color:#f87171'>⚠️ TROJAN DETECTED: Trojan.FakeUpdater.B</span><br>Action: File quarantined.<br><span style='color:#4ade80'>✅ System is now clean.</span>");
    renderAll();
  }
  else if(cmd==="analyze"){
    completed.add("ip");addScore(120,"log pattern detected");
    print("📊 <b>LOG ANALYSIS</b><br>Pattern: repeated FAILED logins from 10.0.0.77<br>10:42 FAILED — admin<br>10:43 FAILED — root<br>10:44 <span style='color:#f87171'>SUCCESS — dev (SUSPICIOUS!)</span><br>Verdict: Brute force attack from 10.0.0.77. Mark and block immediately.");
    renderAll();
  }
  else if(cmd==="firewall"){
    let action=args[0],ip=args[1];
    if(action==="block"&&ip){
      completed.add("firewall_done");blockedIp=true;addScore(200,"firewall rule deployed");
      print(`🔥 <b>FIREWALL</b><br>Rule added: DROP all traffic from ${ip}<br>iptables -A INPUT -s ${ip} -j DROP<br><span style='color:#4ade80'>✅ IP ${ip} is now blocked at the network level.</span>`);
      renderAll();
    } else {
      print("Usage: firewall block &lt;ip&gt;<br>Example: firewall block 10.0.0.77");
    }
  }
  else if(cmd==="protect"){
    if(role==="protector"){decision("block");print("🛡️ Protection action executed.");}
    else print(cmd+": command not found. Type <b>help</b>.");
  }
  else if(cmd==="report"){
    if(role==="protector"){
      completed.add("report");addScore(250,"incident report filed");
      print("📋 <b>INCIDENT REPORT</b><br>━━━━━━━━━━━━━━━━━━━━━━━━<br>Entry Point: Exposed DB credentials in server_config.env<br>Attacker IP: 10.0.0.77<br>Attack Type: Brute force + unauthorized access<br>Actions taken: "+(blockedIp?"IP blocked via firewall":"⚠️ IP not yet blocked")+(markedThreat?" | Threat marked":"")+"<br>Status: "+(blockedIp&&markedThreat?"✅ CONTAINED":"⚠️ PARTIALLY CONTAINED")+"<br>━━━━━━━━━━━━━━━━━━━━━━━━");
    } else {
      print(cmd+": command not available for attackers. You steal data, not report it!");
    }
    renderAll();
  }
  else print(cmd+": command not found. Type <b>help</b> for available commands.");
}

function selectSideEffects(name,txt){
  if(name==="server_config.env"&&!completed.has("config")){
    completed.add("config");
    if(role==="attacker") addScore(150,"credentials stolen!");
    else addScore(150,"exposed config found");
  }
  if(name==="suspicious_activity.log"&&!completed.has("ip")){completed.add("ip");addScore(120,"suspicious IP found");}
  if(name==="phishing_email.txt"&&!completed.has("phishing_email")){completed.add("phishing_email");completed.add("phishing_domain");addScore(100,"phishing email found");}
  if(name==="ddos_traffic.log"&&!completed.has("ddos_traffic")){completed.add("ddos_traffic");completed.add("ddos_ip");addScore(100,"DDoS log found");}
  if(name==="malware_scan.log"&&!completed.has("malware_scan")){completed.add("malware_scan");addScore(100,"malware log found");}
  if(name==="processes.txt"&&!completed.has("processes")){completed.add("processes");addScore(80,"suspicious process found");}
  if(name==="auth.log"&&!completed.has("auth_log")){completed.add("auth_log");addScore(80,role==="attacker"?"user accounts identified":"auth log reviewed");}
  if(name==="network.conf"&&!completed.has("network_conf")){completed.add("network_conf");addScore(80,role==="attacker"?"target IP confirmed":"network config reviewed");}
  if(txt.includes("10.0.0.77")&&!completed.has("ip")){completed.add("ip");addScore(120,"suspicious IP found");}
  renderAll();
}
