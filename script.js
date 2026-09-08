/* ============================================================
   AUTHeNOVA
   AI-Based Fake Identity & Document Screening System
   COMPLETE JAVASCRIPT
============================================================ */


/* ============================================================
   1. APPLICATION STATE
============================================================ */

const state = {
  files: [],
  face: null,
  screenings: [],
  audit: [],
  sessions: 0
};


/* ============================================================
   2. HELPER
============================================================ */

const $ = id => document.getElementById(id);


/* ============================================================
   3. OFFICER ACCOUNTS
   DEMO ACCOUNTS
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
   4. CURRENT OFFICER
============================================================ */

let currentOfficer = null;


/* ============================================================
   5. LOGIN ELEMENTS
============================================================ */

const loginPage =
  document.getElementById("loginPage");

const mainApp =
  document.getElementById("mainApp");

const enterSystemBtn =
  document.getElementById("enterSystemBtn");

const loginOfficerId =
  document.getElementById("loginOfficerId");

const loginPassword =
  document.getElementById("loginPassword");

const loginError =
  document.getElementById("loginError");


/* ============================================================
   6. UPDATE OFFICER PROFILE
   This changes EVERYTHING according to logged-in account.
============================================================ */

function updateOfficerProfile(officer) {

  if (!officer) {
    return;
  }


  /* ----------------------------------------------------------
     HEADER
  ---------------------------------------------------------- */

  if ($("headerOfficerName")) {
    $("headerOfficerName").textContent =
      officer.name;
  }

  if ($("headerOfficerId")) {
    $("headerOfficerId").textContent =
      officer.ssbId;
  }

  if ($("headerAvatar")) {
    $("headerAvatar").textContent =
      officer.avatar;
  }


  /* ----------------------------------------------------------
     PROFILE DROPDOWN
  ---------------------------------------------------------- */

  if ($("menuOfficerName")) {
    $("menuOfficerName").textContent =
      officer.name;
  }

  if ($("menuOfficerId")) {
    $("menuOfficerId").textContent =
      officer.ssbId;
  }

  if ($("menuLocation")) {
    $("menuLocation").textContent =
      officer.location;
  }

  if ($("menuRole")) {
    $("menuRole").textContent =
      officer.role;
  }

  if ($("menuAvatar")) {
    $("menuAvatar").textContent =
      officer.avatar;
  }


  /* ----------------------------------------------------------
     PROFILE MODAL
  ---------------------------------------------------------- */

  if ($("profileOfficerName")) {
    $("profileOfficerName").textContent =
      officer.name;
  }

  if ($("profileOfficerId")) {
    $("profileOfficerId").textContent =
      officer.ssbId;
  }

  if ($("profileRole")) {
    $("profileRole").textContent =
      officer.role;
  }

  if ($("profileLocation")) {
    $("profileLocation").textContent =
      officer.location;
  }

  if ($("profileAccess")) {
    $("profileAccess").textContent =
      officer.access;
  }

  if ($("profileAvatar")) {
    $("profileAvatar").textContent =
      officer.avatar;
  }


  /* ----------------------------------------------------------
     AUTHENTICATION PAGE
  ---------------------------------------------------------- */

  if ($("officerId")) {
    $("officerId").value =
      officer.ssbId;
  }

}


/* ============================================================
   7. OPEN MAIN APPLICATION
============================================================ */

function openMainApp() {

  loginPage.style.display = "none";

  mainApp.style.display = "block";

}


/* ============================================================
   8. DOCUMENT NAVIGATION
============================================================ */

document.querySelectorAll(".nav-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    document
      .querySelectorAll(".nav-btn")
      .forEach(button => {
        button.classList.remove("active");
      });

    btn.classList.add("active");


    document
      .querySelectorAll(".page")
      .forEach(page => {
        page.classList.remove("active");
      });


    const targetPage =
      $(btn.dataset.page);

    if (targetPage) {
      targetPage.classList.add("active");
    }

  });

});


/* ============================================================
   9. DOCUMENT UPLOAD
============================================================ */

$("uploadBox").addEventListener(
  "click",
  () => {
    $("fileInput").click();
  }
);


/* ============================================================
   10. DRAG OVER
============================================================ */

$("uploadBox").addEventListener(
  "dragover",
  e => {

    e.preventDefault();

    $("uploadBox").style.background =
      "#eef3f7";

  }
);


/* ============================================================
   11. DRAG LEAVE
============================================================ */

$("uploadBox").addEventListener(
  "dragleave",
  () => {

    $("uploadBox").style.background =
      "";

  }
);


/* ============================================================
   12. DROP FILES
============================================================ */

$("uploadBox").addEventListener(
  "drop",
  e => {

    e.preventDefault();

    $("uploadBox").style.background =
      "";

    addFiles(
      [...e.dataTransfer.files]
    );

  }
);


/* ============================================================
   13. NORMAL FILE SELECTION
============================================================ */

$("fileInput").addEventListener(
  "change",
  e => {

    addFiles(
      [...e.target.files]
    );

  }
);


/* ============================================================
   14. ADD DOCUMENTS
============================================================ */

function addFiles(files) {

  files
    .filter(file =>
      file.type.startsWith("image/")
    )
    .forEach(file => {

      const alreadyExists =
        state.files.some(
          existing =>
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
   15. DOCUMENT QUEUE
============================================================ */

function renderQueue() {

  $("docQueue").innerHTML =
    state.files
      .map((file, index) => {

        const imageURL =
          URL.createObjectURL(file);


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
   16. REMOVE DOCUMENT
============================================================ */

function removeFile(index) {

  state.files.splice(index, 1);

  renderQueue();

  updateScanButton();

}


/* ============================================================
   17. UPDATE SCAN BUTTON
============================================================ */

function updateScanButton() {

  $("scanBtn").disabled =
    state.files.length === 0;

}


/* ============================================================
   18. FACE UPLOAD
============================================================ */

$("faceUploadBox").addEventListener(
  "click",
  () => {

    $("faceInput").click();

  }
);


/* ============================================================
   19. FACE PHOTO SELECTION
============================================================ */

$("faceInput").addEventListener(
  "change",
  e => {

    const file =
      e.target.files[0];


    if (!file) {
      return;
    }


    if (!file.type.startsWith("image/")) {

      alert(
        "Please select a valid image."
      );

      $("faceInput").value = "";

      return;

    }


    state.face = file;


    const previewURL =
      URL.createObjectURL(file);


    $("facePreview").src =
      previewURL;


    $("facePreviewContainer")
      .style.display = "block";

  }
);


/* ============================================================
   20. REMOVE FACE PHOTO
============================================================ */

$("removeFaceBtn").addEventListener(
  "click",
  () => {

    removeFace();

  }
);


function removeFace() {

  state.face = null;

  $("faceInput").value = "";

  $("facePreview")
    .removeAttribute("src");

  $("facePreviewContainer")
    .style.display = "none";

}


/* ============================================================
   21. ESCAPE HTML
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
   22. DOCUMENT TYPE DETECTION
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


  if (n.includes("permit")) {

    return "Travel Permit";

  }


  return [

    "National ID",
    "Passport",
    "Visa",
    "National ID"

  ][
    state.files.length % 4
  ];

}


/* ============================================================
   23. RISK CALCULATION
   Demo calculation only.
============================================================ */

function riskFor(index) {

  return 8 + (
    (
      index * 17 +
      state.files.length * 7
    ) % 48
  );

}


/* ============================================================
   24. DECISION
============================================================ */

function decision(risk) {

  return risk < 30
    ? "CLEARED"
    : "FLAGGED";

}


/* ============================================================
   25. HASH
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
   26. SCREENING BUTTON
============================================================ */

$("scanBtn").addEventListener(
  "click",
  runScreening
);


/* ============================================================
   27. RUN SCREENING
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


        const id =
          (
            type === "Passport"
              ? "P"
              : type === "Visa"
                ? "V"
                : "ID"
          ) +
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

          file

        };


        state.screenings.unshift(
          item
        );


        state.audit.unshift({

          ...item,

          officer:
            currentOfficer
              ? currentOfficer.name
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


  $("resultsCard")
    .style.display = "block";

}


/* ============================================================
   28. SUMMARY
============================================================ */

function renderSummary(results) {

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


  const level =
    avg < 30
      ? "LOW"
      : avg < 55
        ? "MEDIUM"
        : "HIGH";


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


      <div
        class="risk-score ${cls}"
      >
        ${avg}/100
      </div>


      <span
        class="risk-label ${cls}-label"
      >
        ${level} RISK
      </span>


      <p
        class="sub"
        style="
          margin-top:10px;
          margin-bottom:0;
        "
      >

        ${
          flagged
            ? "Manual review recommended for flagged document(s)."
            : "No high-risk anomaly detected in this demonstration."
        }

      </p>

    </div>

  `;

}


/* ============================================================
   29. DOCUMENT RESULTS
============================================================ */

function renderResults(results) {

  $("resultsArea").innerHTML =
    results
      .map(item => {

        const imageURL =
          URL.createObjectURL(
            item.file
          );


        return `

          <div class="doc-result-card">


            <div class="doc-result-header">

              <img
                src="${imageURL}"
                alt="${escapeHTML(item.file.name)}"
              >


              <div class="doc-result-title">

                <b>
                  ${item.type}
                </b>

                <small>
                  ${escapeHTML(item.file.name)}
                </small>

              </div>


              <span
                class="risk-label ${
                  item.dec === "CLEARED"
                    ? "low-label"
                    : "high-label"
                }"
              >

                ${item.dec}

              </span>

            </div>



            <div class="pipeline-mini">

              <span class="tag ok">
                OCR
              </span>

              <span class="tag ok">
                Field Check
              </span>

              <span class="tag ok">
                Format
              </span>

              <span
                class="tag ${
                  item.risk > 29
                    ? "flag"
                    : "ok"
                }"
              >
                Fraud Risk
              </span>

              <span class="tag ok">
                Face Match
              </span>

            </div>



            <div class="fields">


              <div class="field ok">

                <b>
                  Document Number
                </b>

                ${item.id}

              </div>


              <div class="field">

                <b>
                  Detected Type
                </b>

                ${item.type}

              </div>


              <div class="field ok">

                <b>
                  Data Integrity
                </b>

                Consistent

              </div>


              <div
                class="field ${
                  item.risk > 29
                    ? "alert"
                    : "ok"
                }"
              >

                <b>
                  Risk Assessment
                </b>

                ${
                  item.risk < 30
                    ? "Low anomaly"
                    : "Review recommended"
                }

              </div>


            </div>



            <div class="doc-risk-row">

              <span class="muted">
                AI confidence
              </span>


              <span
                class="score ${
                  item.risk > 29
                    ? "high"
                    : "low"
                }"
              >

                ${100 - item.risk}%

              </span>

            </div>


          </div>

        `;

      })
      .join("");

}


/* ============================================================
   30. DASHBOARD
============================================================ */

function updateDashboard() {


  $("statTotal").textContent =
    state.screenings.length;


  $("statGenuine").textContent =
    state.screenings.filter(
      item =>
        item.dec === "CLEARED"
    ).length;


  $("statFlagged").textContent =
    state.screenings.filter(
      item =>
        item.dec === "FLAGGED"
    ).length;


  $("statSessions").textContent =
    state.sessions;



  /* ----------------------------------------------------------
     RECENT SCREENINGS
  ---------------------------------------------------------- */

  $("recentTableBody").innerHTML =

    state.screenings
      .slice(0, 8)
      .map(item => `

        <tr>

          <td>
            ${item.time}
          </td>

          <td>
            ${item.type}
          </td>

          <td>
            ${item.id}
          </td>

          <td
            class="${
              item.risk < 30
                ? "low"
                : "high"
            }"
          >
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



  /* ----------------------------------------------------------
     AUDIT TRAIL
  ---------------------------------------------------------- */

  $("auditTableBody").innerHTML =

    state.audit
      .slice(0, 12)
      .map(
        (item, index) => `

          <tr>

            <td>
              #${state.audit.length - index}
            </td>

            <td>
              ${item.time}
            </td>

            <td>
              ${escapeHTML(item.officer)}
            </td>

            <td>
              ${item.type}
            </td>

            <td>
              ${item.dec}
            </td>

            <td>
              ${item.hash}
            </td>

          </tr>

        `
      )
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
   31. AUTHENTICATION DEMO
============================================================ */

$("loginBtn").addEventListener(
  "click",
  () => {

    const id =
      $("officerId")
        .value
        .trim();


    const pin =
      $("officerPin")
        .value
        .trim();


    const valid =
      id.length > 0 &&
      pin.length > 0;


    $("loginStatus").textContent =
      valid
        ? "Authentication successful — demo session active."
        : "Enter Officer ID and PIN.";


    $("loginStatus").className =
      "status-msg " +
      (
        valid
          ? "ok"
          : "fail"
      );

  }
);


/* ============================================================
   32. DIGILOCKER DEMO
============================================================ */

$("digilockerBtn").addEventListener(
  "click",
  () => {

    const ref =
      $("digilockerRef")
        .value
        .trim();


    const valid =
      ref.length > 0;


    $("digilockerStatus").textContent =
      valid
        ? "DigiLocker verification response received — demo only."
        : "Enter a document reference number.";


    $("digilockerStatus").className =
      "status-msg " +
      (
        valid
          ? "ok"
          : "fail"
      );

  }
);


/* ============================================================
   33. RESET EVERYTHING
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

        Upload documents and run screening to see
        the combined identity verification summary.

      </p>

    `;


    $("resultsCard")
      .style.display = "none";


    $("scanBtn").disabled = true;


    updateDashboard();

  }
);


/* ============================================================
   34. PROFILE MENU
============================================================ */

const profileBtn =
  document.getElementById("profileBtn");

const profileMenu =
  document.getElementById("profileMenu");

const myProfileBtn =
  document.getElementById("myProfileBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const profileModal =
  document.getElementById("profileModal");

const closeProfile =
  document.getElementById("closeProfile");


/* ============================================================
   35. OPEN PROFILE MENU
============================================================ */

profileBtn.addEventListener(
  "click",
  e => {

    e.stopPropagation();

    profileMenu.classList.toggle(
      "show"
    );

  }
);


/* ============================================================
   36. CLOSE PROFILE MENU
============================================================ */

document.addEventListener(
  "click",
  e => {

    if (
      !profileMenu.contains(e.target) &&
      e.target !== profileBtn
    ) {

      profileMenu.classList.remove(
        "show"
      );

    }

  }
);


/* ============================================================
   37. OPEN PROFILE MODAL
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
   38. CLOSE PROFILE MODAL
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
   39. CLOSE MODAL BY BACKGROUND
============================================================ */

profileModal.addEventListener(
  "click",
  e => {

    if (
      e.target === profileModal
    ) {

      profileModal.classList.remove(
        "show"
      );

    }

  }
);


/* ============================================================
   40. SECURE LOGIN
============================================================ */

enterSystemBtn.addEventListener(
  "click",
  () => {


    const officerId =
      loginOfficerId
        .value
        .trim()
        .toUpperCase();


    const password =
      loginPassword
        .value
        .trim();



    /* --------------------------------------------------------
       EMPTY CHECK
    -------------------------------------------------------- */

    if (!officerId || !password) {

      loginError.textContent =
        "Please enter both Officer ID and Password / PIN.";

      return;

    }



    /* --------------------------------------------------------
       OFFICER ID FORMAT
    -------------------------------------------------------- */

    const officerIdPattern =
      /^IND-\d{3}\/\d{2}$/;


    if (
      !officerIdPattern.test(
        officerId
      )
    ) {

      loginError.textContent =
        "Invalid Officer ID format. Use IND-123/25.";

      return;

    }



    /* --------------------------------------------------------
       PIN FORMAT
    -------------------------------------------------------- */

    const pinPattern =
      /^\d{6}$/;


    if (
      !pinPattern.test(
        password
      )
    ) {

      loginError.textContent =
        "Password / PIN must contain exactly 6 numbers.";

      return;

    }



    /* --------------------------------------------------------
       FIND ACCOUNT
    -------------------------------------------------------- */

    const officer =
      officerAccounts[
        officerId
      ];


    if (!officer) {

      loginError.textContent =
        "Officer account not found.";

      return;

    }



    /* --------------------------------------------------------
       PASSWORD CHECK
    -------------------------------------------------------- */

    if (
      officer.password !== password
    ) {

      loginError.textContent =
        "Incorrect Password / PIN.";

      return;

    }



    /* --------------------------------------------------------
       SUCCESS
    -------------------------------------------------------- */

    currentOfficer = {

      ...officer,

      officerId: officerId

    };


    /* Save account in browser session */

    sessionStorage.setItem(
      "autheNovaOfficer",
      JSON.stringify(
        currentOfficer
      )
    );


    /* Update all profile information */

    updateOfficerProfile(
      currentOfficer
    );


    /* Open system */

    loginError.textContent = "";

    openMainApp();

  }
);


/* ============================================================
   41. ENTER KEY LOGIN
============================================================ */

[
  loginOfficerId,
  loginPassword

].forEach(input => {

  input.addEventListener(
    "keydown",
    e => {

      if (
        e.key === "Enter"
      ) {

        enterSystemBtn.click();

      }

    }
  );

});


/* ============================================================
   42. LOGOUT
============================================================ */

logoutBtn.addEventListener(
  "click",
  () => {


    currentOfficer = null;


    sessionStorage.removeItem(
      "autheNovaOfficer"
    );


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
   43. RESTORE LOGGED-IN OFFICER
============================================================ */

const savedOfficer =
  sessionStorage.getItem(
    "autheNovaOfficer"
  );


if (savedOfficer) {

  try {

    currentOfficer =
      JSON.parse(
        savedOfficer
      );


    updateOfficerProfile(
      currentOfficer
    );


    openMainApp();


  } catch (error) {

    console.error(
      "Unable to restore officer session:",
      error
    );


    sessionStorage.removeItem(
      "autheNovaOfficer"
    );

  }

}


/* ============================================================
   44. INITIAL DASHBOARD
============================================================ */

updateDashboard();


/* ============================================================
   45. INITIAL SCAN BUTTON
============================================================ */

updateScanButton();
