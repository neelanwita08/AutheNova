/* ============================================================
   OFFICER DEMO ACCOUNTS
============================================================ */

const officerAccounts = {

  "IND-123/25": {
    password: "123456",
    name: "Officer Arjun Sharma",
    ssbId: "SSB-ID-00214",
    location: "Panitanki, West Bengal",
    role: "Checkpoint Screening Officer",
    access: "Authorized",
    avatar: "A"
  },

  "IND-456/25": {
    password: "456789",
    name: "Officer Riya Sen",
    ssbId: "SSB-ID-00482",
    location: "Rupaidiha, Uttar Pradesh",
    role: "Senior Screening Officer",
    access: "Authorized",
    avatar: "R"
  },

  "IND-789/25": {
    password: "789012",
    name: "Officer Vikram Das",
    ssbId: "SSB-ID-00631",
    location: "Jaigaon, West Bengal",
    role: "Checkpoint Intelligence Officer",
    access: "Authorized",
    avatar: "V"
  },

  "IND-321/26": {
    password: "321654",
    name: "Officer Neha Gupta",
    ssbId: "SSB-ID-00817",
    location: "Sunauli, Uttar Pradesh",
    role: "Document Verification Officer",
    access: "Authorized",
    avatar: "N"
  }

};


/* ============================================================
   APPLICATION STATE
============================================================ */

const state = {

  files: [],

  face: null,

  screenings: [],

  audit: [],

  sessions: 0,

  currentOfficer: null

};


/* ============================================================
   HELPER
============================================================ */

const $ = id => document.getElementById(id);


/* ============================================================
   SAFE HTML ESCAPE
============================================================ */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ============================================================
   NAVIGATION
============================================================ */

document.querySelectorAll(".nav-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    document
      .querySelectorAll(".nav-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    document
      .querySelectorAll(".page")
      .forEach(page => page.classList.remove("active"));

    const targetPage = $(btn.dataset.page);

    if (targetPage) {
      targetPage.classList.add("active");
    }

  });

});


/* ============================================================
   DOCUMENT UPLOAD
============================================================ */

$("uploadBox").addEventListener("click", () => {

  $("fileInput").click();

});


/* ============================================================
   DRAG OVER
============================================================ */

$("uploadBox").addEventListener("dragover", event => {

  event.preventDefault();

  $("uploadBox").style.background = "#eef3f7";

});


/* ============================================================
   DRAG LEAVE
============================================================ */

$("uploadBox").addEventListener("dragleave", () => {

  $("uploadBox").style.background = "";

});


/* ============================================================
   DROP DOCUMENTS
============================================================ */

$("uploadBox").addEventListener("drop", event => {

  event.preventDefault();

  $("uploadBox").style.background = "";

  addFiles([...event.dataTransfer.files]);

});


/* ============================================================
   NORMAL FILE SELECTION
============================================================ */

$("fileInput").addEventListener("change", event => {

  addFiles([...event.target.files]);

});


/* ============================================================
   ADD DOCUMENTS
============================================================ */

function addFiles(files) {

  const validFiles = files.filter(file => {

    if (!file.type.startsWith("image/")) {

      return false;

    }

    return true;

  });


  validFiles.forEach(file => {

    const alreadyExists = state.files.some(existing =>

      existing.name === file.name &&
      existing.size === file.size

    );


    if (!alreadyExists) {

      state.files.push(file);

    }

  });


  renderQueue();

  updateScanButton();

}


/* ============================================================
   DOCUMENT QUEUE
============================================================ */

function renderQueue() {

  $("docQueue").innerHTML = state.files
    .map((file, index) => {

      const imageURL = URL.createObjectURL(file);

      return `

        <div class="doc-thumb">

          <img
            src="${imageURL}"
            alt="${escapeHTML(file.name)}"
          >

          <button
            class="thumb-remove"
            type="button"
            onclick="removeFile(${index})"
          >
            ×
          </button>

          <div class="thumb-label">
            ${escapeHTML(file.name)}
          </div>

        </div>

      `;

    })
    .join("");

}


/* ============================================================
   REMOVE DOCUMENT
============================================================ */

function removeFile(index) {

  if (
    index < 0 ||
    index >= state.files.length
  ) {
    return;
  }


  state.files.splice(index, 1);

  renderQueue();

  updateScanButton();

}


/* ============================================================
   UPDATE SCREENING BUTTON
============================================================ */

function updateScanButton() {

  $("scanBtn").disabled =
    state.files.length === 0;

}


/* ============================================================
   FACE PHOTO UPLOAD
============================================================ */

$("faceUploadBox").addEventListener("click", () => {

  $("faceInput").click();

});


/* ============================================================
   FACE PHOTO SELECTION
============================================================ */

$("faceInput").addEventListener("change", event => {

  const file = event.target.files[0];

  if (!file) {
    return;
  }


  if (!file.type.startsWith("image/")) {

    alert("Please select a valid image.");

    $("faceInput").value = "";

    return;

  }


  state.face = file;


  const previewURL =
    URL.createObjectURL(file);


  $("facePreview").src =
    previewURL;


  $("facePreviewContainer").style.display =
    "block";

});


/* ============================================================
   REMOVE FACE PHOTO
============================================================ */

$("removeFaceBtn").addEventListener("click", () => {

  removeFace();

});


function removeFace() {

  state.face = null;

  $("faceInput").value = "";

  $("facePreview").removeAttribute("src");

  $("facePreviewContainer").style.display =
    "none";

}


/* ============================================================
   DOCUMENT TYPE DETECTION
============================================================ */

function detectType(name) {

  const n =
    name.toLowerCase();


  if (n.includes("passport")) {

    return "Passport";

  }


  if (n.includes("visa")) {

    return "Visa";

  }


  if (
    n.includes("license") ||
    n.includes("licence")
  ) {

    return "Driving Licence";

  }


  if (
    n.includes("permit")
  ) {

    return "Travel Permit";

  }


  if (
    n.includes("aadhaar") ||
    n.includes("aadhar") ||
    n.includes("adhar")
  ) {

    return "Aadhaar Card";

  }


  return [
    "National ID",
    "Passport",
    "Visa",
    "Aadhaar Card"
  ][
    state.files.length % 4
  ];

}


/* ============================================================
   RISK CALCULATION
   DEMO / SIMULATED AI

   Files containing:
   fake
   tampered
   forged
   suspicious
   invalid

   intentionally receive HIGH risk for presentation demos.
============================================================ */

function riskFor(index) {

  const file =
    state.files[index];


  if (!file) {

    return 20;

  }


  const filename =
    file.name.toLowerCase();


  const suspiciousWords = [

    "fake",
    "tampered",
    "forged",
    "suspicious",
    "invalid",
    "fraud"

  ];


  const suspicious =
    suspiciousWords.some(word =>
      filename.includes(word)
    );


  if (suspicious) {

    return 75 +
      (
        (index * 7) % 21
      );

  }


  /*
    Normal documents receive
    predictable low-to-medium scores.
  */

  return 8 +
    (
      (index * 17 +
       state.files.length * 7 +
       state.sessions * 3) % 22
    );

}


/* ============================================================
   INDIVIDUAL DECISION
============================================================ */

function decision(risk) {

  return risk < 30
    ? "CLEARED"
    : "FLAGGED";

}


/* ============================================================
   HASH
   Demo integrity identifier only.
============================================================ */

function hash(value) {

  let h = 2166136261;


  for (
    let i = 0;
    i < value.length;
    i++
  ) {

    h ^= value.charCodeAt(i);

    h = Math.imul(
      h,
      16777619
    );

  }


  return (

    "00000000" +
    (h >>> 0).toString(16)

  ).slice(-8).toUpperCase();

}


/* ============================================================
   SCREENING BUTTON
============================================================ */

$("scanBtn").addEventListener(
  "click",
  runScreening
);


/* ============================================================
   RUN SCREENING
============================================================ */

function runScreening() {

  if (!state.files.length) {

    return;

  }


  state.sessions++;


  const now =
    new Date();


  const results =
    state.files.map(
      (file, index) => {

        const type =
          detectType(file.name);


        const risk =
          riskFor(index);


        const dec =
          decision(risk);


        const prefix =

          type === "Passport"
            ? "P"

            : type === "Visa"
              ? "V"

              : type === "Driving Licence"
                ? "DL"

                : type === "Travel Permit"
                  ? "TP"

                  : "ID";


        const id =
          prefix +
          String(
            100000 +
            index +
            state.sessions
          );


        const item = {

          time:
            now.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit"
              }
            ),

          type,

          id,

          risk,

          dec,

          file,

          faceMatch:
            state.face
              ? "SIMULATED"
              : "NOT PROVIDED",

          integrity:
            risk >= 75
              ? "Review Required"
              : "Consistent"

        };


        state.screenings.unshift(
          item
        );


        state.audit.unshift({

          ...item,

          officer:
            state.currentOfficer
              ? state.currentOfficer.name
              : "Officer on Duty",

          hash:
            hash(
              file.name +
              now.getTime() +
              index
            )

        });


        return item;

      }
    );


  renderSummary(results);

  renderResults(results);

  updateDashboard();


  $("resultsCard").style.display =
    "block";

}


/* ============================================================
   SUMMARY
============================================================ */

function renderSummary(results) {

  if (!results.length) {
    return;
  }


  const flagged =
    results.filter(
      item =>
        item.dec === "FLAGGED"
    ).length;


  const total =
    results.length;


  const avg =
    Math.round(
      results.reduce(
        (sum, item) =>
          sum + item.risk,
        0
      ) / total
    );


  let level;


  if (avg < 30) {

    level = "LOW";

  }
  else if (avg < 55) {

    level = "MEDIUM";

  }
  else {

    level = "HIGH";

  }


  const cls =
    level.toLowerCase();


  $("summaryArea").innerHTML = `

    <div class="summary-grid">

      <div class="summary-box">

        <div class="num">
          ${total}
        </div>

        <small>
          Documents analysed
        </small>

      </div>


      <div class="summary-box">

        <div class="num ${
          flagged
            ? "high"
            : "low"
        }">

          ${
            flagged
              ? flagged
              : total
          }

        </div>

        <small>

          ${
            flagged
              ? "Items flagged"
              : "Items cleared"
          }

        </small>

      </div>

    </div>


    <div class="overall-risk">

      <small class="muted">
        COMBINED RISK SCORE
      </small>


      <div class="risk-score ${cls}">
        ${avg}/100
      </div>


      <div class="risk-label ${cls}">
        ${level}
      </div>


      <small class="muted">

        ${
          level === "LOW"
            ? "Identity screening indicates low risk."
            : level === "MEDIUM"
              ? "Additional verification is recommended."
              : "High-risk indicators detected. Manual review recommended."
        }

      </small>

    </div>

  `;

}


/* ============================================================
   RESULTS
============================================================ */

function renderResults(results) {

  $("resultsArea").innerHTML = results
    .map(item => {

      const riskClass =
        item.risk < 30
          ? "low"
          : item.risk < 55
            ? "medium"
            : "high";


      const decisionClass =
        item.dec === "CLEARED"
          ? "low"
          : "high";


      return `

        <div class="doc-result-card">

          <div class="doc-result-head">

            <div>

              <span class="eyebrow">
                ${escapeHTML(item.type)}
              </span>

              <h3>
                ${escapeHTML(item.id)}
              </h3>

            </div>


            <span class="risk-label ${decisionClass}">
              ${item.dec}
            </span>

          </div>


          <div class="fields">

            <div>

              <small>
                Risk Score
              </small>

              <b class="${riskClass}">
                ${item.risk}/100
              </b>

            </div>


            <div>

              <small>
                Decision
              </small>

              <b>
                ${item.dec}
              </b>

            </div>


            <div>

              <small>
                Face Match
              </small>

              <b>

                ${
                  item.faceMatch === "SIMULATED"
                    ? "SIMULATED"
                    : "NOT PROVIDED"
                }

              </b>

            </div>


            <div>

              <small>
                Data Integrity
              </small>

              <b>
                ${item.integrity}
              </b>

            </div>

          </div>


          <div class="pipeline-mini">

            <span class="tag">
              Document Scan
            </span>

            <span class="tag">
              ${
                item.faceMatch === "SIMULATED"
                  ? "Face Match • Demo"
                  : "Face Match • N/A"
              }
            </span>

            <span class="tag">
              Integrity Check
            </span>

            <span class="tag">
              AI Risk • Simulated
            </span>

          </div>


          ${
            item.risk >= 75
              ? `
                <div class="demo-note">
                  ⚠ Demo high-risk condition detected.
                  Manual review recommended.
                </div>
              `
              : ""
          }

        </div>

      `;

    })
    .join("");

}


/* ============================================================
   DASHBOARD
============================================================ */

function updateDashboard() {

  const total =
    state.screenings.length;


  const cleared =
    state.screenings.filter(
      item =>
        item.dec === "CLEARED"
    ).length;


  const flagged =
    state.screenings.filter(
      item =>
        item.dec === "FLAGGED"
    ).length;


  /*
    Update common dashboard counters
    if the corresponding IDs exist.
  */

  const possibleTotalIds = [
    "totalDocuments",
    "documentsScreened",
    "totalScreened",
    "screenedCount"
  ];


  possibleTotalIds.forEach(id => {

    const element = $(id);

    if (element) {
      element.textContent = total;
    }

  });


  const possibleClearedIds = [
    "clearedDocuments",
    "clearedCount",
    "totalCleared"
  ];


  possibleClearedIds.forEach(id => {

    const element = $(id);

    if (element) {
      element.textContent = cleared;
    }

  });


  const possibleFlaggedIds = [
    "flaggedDocuments",
    "flaggedCount",
    "totalFlagged"
  ];


  possibleFlaggedIds.forEach(id => {

    const element = $(id);

    if (element) {
      element.textContent = flagged;
    }

  });


  renderScreeningTable();

  renderAuditTable();

}


/* ============================================================
   SCREENING TABLE
============================================================ */

function renderScreeningTable() {

  const body =
    $("screeningTableBody");


  if (!body) {
    return;
  }


  body.innerHTML =
    state.screenings
      .slice(0, 12)
      .map(item => `

        <tr>

          <td>
            ${escapeHTML(item.time)}
          </td>


          <td>
            ${escapeHTML(item.type)}
          </td>


          <td>
            ${escapeHTML(item.id)}
          </td>


          <td class="${
            item.risk < 30
              ? "low"
              : item.risk < 55
                ? "medium"
                : "high"
          }">

            ${item.risk}/100

          </td>


          <td>

            <span
              class="risk-label ${
                item.dec === "CLEARED"
                  ? "low-label"
                  : "high-label"
              }"
            >

              ${item.dec}

            </span>

          </td>

        </tr>

      `)
      .join("")


      ||

      `

        <tr>

          <td
            colspan="5"
            class="muted"
          >

            No screenings yet —
            run a check from Screening.

          </td>

        </tr>

      `;

}


/* ============================================================
   AUDIT TABLE
============================================================ */

function renderAuditTable() {

  const body =
    $("auditTableBody");


  if (!body) {
    return;
  }


  body.innerHTML =
    state.audit
      .slice(0, 12)
      .map((item, index) => `

        <tr>

          <td>
            #${state.audit.length - index}
          </td>


          <td>
            ${escapeHTML(item.time)}
          </td>


          <td>
            ${escapeHTML(item.officer)}
          </td>


          <td>
            ${escapeHTML(item.type)}
          </td>


          <td>
            ${escapeHTML(item.dec)}
          </td>


          <td>
            ${escapeHTML(item.hash)}
          </td>

        </tr>

      `)
      .join("")


      ||

      `

        <tr>

          <td
            colspan="6"
            class="muted"
          >

            No audit records yet.

          </td>

        </tr>

      `;

}


/* ============================================================
   AUTHENTICATION DEMO
============================================================ */

$("loginBtn").addEventListener(
  "click",
  () => {

    const officerId =
      $("officerId").value.trim();


    const pin =
      $("officerPin").value.trim();


    const account =
      officerAccounts[officerId];


    if (!officerId || !pin) {

      $("loginStatus").textContent =
        "Enter Officer ID and PIN.";

      $("loginStatus").className =
        "status-msg fail";

      return;

    }


    if (!account) {

      $("loginStatus").textContent =
        "Officer ID not recognized in demo system.";

      $("loginStatus").className =
        "status-msg fail";

      return;

    }


    if (account.password !== pin) {

      $("loginStatus").textContent =
        "Incorrect PIN for this demo account.";

      $("loginStatus").className =
        "status-msg fail";

      return;

    }


    $("loginStatus").textContent =
      "Authentication successful — demo session active.";

    $("loginStatus").className =
      "status-msg ok";

  }
);


/* ============================================================
   DIGILOCKER DEMO
============================================================ */

$("digilockerBtn").addEventListener(
  "click",
  () => {

    const reference =
      $("digilockerRef").value.trim();


    if (!reference) {

      $("digilockerStatus").textContent =
        "Enter a document reference number.";

      $("digilockerStatus").className =
        "status-msg fail";

      return;

    }


    $("digilockerStatus").textContent =
      "DigiLocker demo verification response received — no live API connection.";

    $("digilockerStatus").className =
      "status-msg ok";

  }
);


/* ============================================================
   RESET EVERYTHING
============================================================ */

$("resetBtn").addEventListener(
  "click",
  () => {

    state.files = [];

    state.face = null;

    state.screenings = [];

    state.audit = [];

    state.sessions = 0;


    $("fileInput").value = "";

    $("faceInput").value = "";


    $("facePreview")
      .removeAttribute("src");


    $("facePreviewContainer")
      .style.display = "none";


    $("docQueue").innerHTML = "";


    $("summaryArea").innerHTML = `

      <p class="placeholder">

        Upload documents and run screening
        to see the combined identity
        verification summary.

      </p>

    `;


    $("resultsCard").style.display =
      "none";


    $("resultsArea").innerHTML = "";


    $("scanBtn").disabled =
      true;


    updateDashboard();

  }
);


/* ============================================================
   SECURE LOGIN ELEMENTS
============================================================ */

const loginPage =
  document.getElementById(
    "loginPage"
  );


const mainApp =
  document.getElementById(
    "mainApp"
  );


const enterSystemBtn =
  document.getElementById(
    "enterSystemBtn"
  );


const loginOfficerId =
  document.getElementById(
    "loginOfficerId"
  );


const loginPassword =
  document.getElementById(
    "loginPassword"
  );


const loginError =
  document.getElementById(
    "loginError"
  );


/* ============================================================
   UPDATE OFFICER PROFILE
============================================================ */

function updateOfficerProfile(
  officer
) {

  if (!officer) {
    return;
  }


  /*
    Header
  */

  if ($("headerOfficerName")) {

    $("headerOfficerName")
      .textContent = officer.name;

  }


  if ($("headerOfficerId")) {

    $("headerOfficerId")
      .textContent = officer.ssbId;

  }


  if ($("headerAvatar")) {

    $("headerAvatar")
      .textContent = officer.avatar;

  }


  /*
    Profile dropdown
  */

  if ($("menuOfficerName")) {

    $("menuOfficerName")
      .textContent = officer.name;

  }


  if ($("menuOfficerId")) {

    $("menuOfficerId")
      .textContent = officer.ssbId;

  }


  if ($("menuLocation")) {

    $("menuLocation")
      .textContent = officer.location;

  }


  if ($("menuRole")) {

    $("menuRole")
      .textContent =
        officer.role;

  }


  if ($("menuAvatar")) {

    $("menuAvatar")
      .textContent =
        officer.avatar;

  }


  /*
    Full profile modal
  */

  if ($("profileOfficerName")) {

    $("profileOfficerName")
      .textContent =
        officer.name;

  }


  if ($("profileOfficerId")) {

    $("profileOfficerId")
      .textContent =
        officer.ssbId;

  }


  if ($("profileRole")) {

    $("profileRole")
      .textContent =
        officer.role;

  }


  if ($("profileLocation")) {

    $("profileLocation")
      .textContent =
        officer.location;

  }


  if ($("profileAccess")) {

    $("profileAccess")
      .textContent =
        officer.access;

  }


  if ($("profileAvatar")) {

    $("profileAvatar")
      .textContent =
        officer.avatar;

  }

}


/* ============================================================
   OPEN MAIN APPLICATION
============================================================ */

function openMainApp(
  officer
) {

  if (officer) {

    state.currentOfficer =
      officer;

    updateOfficerProfile(
      officer
    );

    sessionStorage.setItem(
      "autheNovaOfficer",
      JSON.stringify(officer)
    );

  }


  loginPage.style.display =
    "none";


  mainApp.style.display =
    "block";


  sessionStorage.setItem(
    "autheNovaLoggedIn",
    "true"
  );

}


/* ============================================================
   LOGIN VALIDATION
============================================================ */

function validateLogin() {

  const officerId =
    loginOfficerId.value.trim();


  const password =
    loginPassword.value.trim();


  /*
    Empty fields
  */

  if (!officerId || !password) {

    loginError.textContent =
      "Please enter both Officer ID and Password / PIN.";

    return false;

  }


  /*
    Officer ID format
  */

  const idPattern =
    /^IND-\d{3}\/\d{2}$/;


  if (!idPattern.test(officerId)) {

    loginError.textContent =
      "Invalid Officer ID format. Use IND-123/25.";

    return false;

  }


  /*
    PIN format
  */

  const pinPattern =
    /^\d{6}$/;


  if (!pinPattern.test(password)) {

    loginError.textContent =
      "Password / PIN must contain exactly 6 numbers.";

    return false;

  }


  /*
    Find officer account
  */

  const officer =
    officerAccounts[officerId];


  if (!officer) {

    loginError.textContent =
      "Officer ID not found in the AutheNova demo system.";

    return false;

  }


  /*
    Check password
  */

  if (
    officer.password !== password
  ) {

    loginError.textContent =
      "Incorrect Password / PIN.";

    return false;

  }


  /*
    Successful login
  */

  loginError.textContent = "";

  openMainApp(officer);

  return true;

}


/* ============================================================
   REMEMBER LOGIN
============================================================ */

const savedOfficer =
  sessionStorage.getItem(
    "autheNovaOfficer"
  );


if (
  sessionStorage.getItem(
    "autheNovaLoggedIn"
  ) === "true" &&
  savedOfficer
) {

  try {

    const officer =
      JSON.parse(savedOfficer);


    const validOfficer =
      Object.values(
        officerAccounts
      ).some(
        account =>
          account.ssbId ===
          officer.ssbId
      );


    if (validOfficer) {

      openMainApp(
        officer
      );

    }
    else {

      sessionStorage.removeItem(
        "autheNovaLoggedIn"
      );

      sessionStorage.removeItem(
        "autheNovaOfficer"
      );

    }

  }
  catch (error) {

    sessionStorage.removeItem(
      "autheNovaLoggedIn"
    );

    sessionStorage.removeItem(
      "autheNovaOfficer"
    );

  }

}


/* ============================================================
   LOGIN BUTTON
============================================================ */

enterSystemBtn.addEventListener(
  "click",
  validateLogin
);


/* ============================================================
   ENTER KEY LOGIN
============================================================ */

[
  loginOfficerId,
  loginPassword

].forEach(input => {

  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        validateLogin();

      }

    }
  );

});


/* ============================================================
   PROFILE MENU
============================================================ */

const profileBtn =
  document.getElementById(
    "profileBtn"
  );


const profileMenu =
  document.getElementById(
    "profileMenu"
  );


const myProfileBtn =
  document.getElementById(
    "myProfileBtn"
  );


const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );


const profileModal =
  document.getElementById(
    "profileModal"
  );


const closeProfile =
  document.getElementById(
    "closeProfile"
  );


/* ============================================================
   OPEN PROFILE MENU
============================================================ */

profileBtn.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    profileMenu.classList.toggle(
      "show"
    );

  }
);


/* ============================================================
   CLOSE PROFILE MENU
   OUTSIDE CLICK
============================================================ */

document.addEventListener(
  "click",
  event => {

    if (
      !profileMenu.contains(
        event.target
      ) &&
      event.target !== profileBtn
    ) {

      profileMenu.classList.remove(
        "show"
      );

    }

  }
);


/* ============================================================
   OPEN PROFILE MODAL
============================================================ */

myProfileBtn.addEventListener(
  "click",
  () => {

    profileMenu.classList.remove(
      "show"
    );


    profileModal.classList.add(
      "show"
    );

  }
);


/* ============================================================
   CLOSE PROFILE MODAL
============================================================ */

closeProfile.addEventListener(
  "click",
  () => {

    profileModal.classList.remove(
      "show"
    );

  }
);


/* ============================================================
   CLOSE MODAL BY BACKGROUND CLICK
============================================================ */

profileModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      profileModal
    ) {

      profileModal.classList.remove(
        "show"
      );

    }

  }
);


/* ============================================================
   ESCAPE KEY
============================================================ */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      profileMenu.classList.remove(
        "show"
      );

      profileModal.classList.remove(
        "show"
      );

    }

  }
);


/* ============================================================
   LOGOUT
============================================================ */

logoutBtn.addEventListener(
  "click",
  () => {

    sessionStorage.removeItem(
      "autheNovaLoggedIn"
    );


    sessionStorage.removeItem(
      "autheNovaOfficer"
    );


    state.currentOfficer =
      null;


    profileMenu.classList.remove(
      "show"
    );


    profileModal.classList.remove(
      "show"
    );


    mainApp.style.display =
      "none";


    loginPage.style.display =
      "flex";


    loginOfficerId.value =
      "";


    loginPassword.value =
      "";


    loginError.textContent =
      "";

  }
);


/* ============================================================
   INITIALIZE
============================================================ */

updateScanButton();

updateDashboard();
