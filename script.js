/* ============================================================
   AUTHeNOVA APPLICATION STATE
============================================================ */

const state = {
  files: [],
  face: null,
  screenings: [],
  audit: [],
  sessions: 0
};


/* ============================================================
   HELPER
============================================================ */

const $ = id => document.getElementById(id);


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
      .forEach(p => p.classList.remove("active"));

    $(btn.dataset.page).classList.add("active");

  });

});


/* ============================================================
   DOCUMENT UPLOAD
============================================================ */

$("uploadBox").addEventListener("click", () => {
  $("fileInput").click();
});


/* Drag over */

$("uploadBox").addEventListener("dragover", e => {

  e.preventDefault();

  $("uploadBox").style.background = "#eef3f7";

});


/* Drag leave */

$("uploadBox").addEventListener("dragleave", () => {

  $("uploadBox").style.background = "";

});


/* Drop */

$("uploadBox").addEventListener("drop", e => {

  e.preventDefault();

  $("uploadBox").style.background = "";

  addFiles([...e.dataTransfer.files]);

});


/* Normal file selection */

$("fileInput").addEventListener("change", e => {

  addFiles([...e.target.files]);

});


/* ============================================================
   ADD DOCUMENTS
============================================================ */

function addFiles(files) {

  files
    .filter(file => file.type.startsWith("image/"))
    .forEach(file => {

      const alreadyExists = state.files.some(
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

  state.files.splice(index, 1);

  renderQueue();

  updateScanButton();

}


/* ============================================================
   UPDATE SCREENING BUTTON
============================================================ */

function updateScanButton() {

  $("scanBtn").disabled = state.files.length === 0;

}


/* ============================================================
   FACE UPLOAD
============================================================ */

$("faceUploadBox").addEventListener("click", () => {

  $("faceInput").click();

});


/* ============================================================
   FACE PHOTO SELECTION
============================================================ */

$("faceInput").addEventListener("change", e => {

  const file = e.target.files[0];

  if (!file) {
    return;
  }


  /* Validate image */

  if (!file.type.startsWith("image/")) {

    alert("Please select a valid image.");

    $("faceInput").value = "";

    return;
  }


  /* Store face */

  state.face = file;


  /* Create preview URL */

  const previewURL = URL.createObjectURL(file);


  /* Set image source */

  $("facePreview").src = previewURL;


  /* Show preview container */

  $("facePreviewContainer").style.display = "block";

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

  $("facePreviewContainer").style.display = "none";

}


/* ============================================================
   ESCAPE HTML
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
   DOCUMENT TYPE DETECTION
============================================================ */

function detectType(name) {

  const n = name.toLowerCase();

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
  ][state.files.length % 4];

}


/* ============================================================
   RISK CALCULATION
============================================================ */

function riskFor(index) {

  return 8 + (
    (index * 17 + state.files.length * 7) % 48
  );

}


/* ============================================================
   DECISION
============================================================ */

function decision(risk) {

  return risk < 30
    ? "CLEARED"
    : "FLAGGED";

}


/* ============================================================
   HASH
============================================================ */

function hash(value) {

  let h = 2166136261;

  for (let i = 0; i < value.length; i++) {

    h ^= value.charCodeAt(i);

    h = Math.imul(h, 16777619);

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


  const now = new Date();


  const results = state.files.map(
    (file, index) => {

      const type = detectType(file.name);

      const risk = riskFor(index);

      const dec = decision(risk);


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

        time: now.toLocaleTimeString(
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


      state.screenings.unshift(item);


      state.audit.unshift({

        ...item,

        officer: "Officer on Duty",

        hash: hash(
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

  $("resultsCard").style.display = "block";

}


/* ============================================================
   SUMMARY
============================================================ */

function renderSummary(results) {

  const flagged =
    results.filter(
      item => item.dec === "FLAGGED"
    ).length;


  const total = results.length;


  const avg = Math.round(
    results.reduce(
      (sum, item) => sum + item.risk,
      0
    ) / total
  );


  const level =
    avg < 30
      ? "LOW"
      : avg < 55
        ? "MEDIUM"
        : "HIGH";


  const cls = level.toLowerCase();


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

        <div class="num ${flagged ? "high" : "low"}">

          ${flagged ? flagged : total}

        </div>

        <small>

          ${flagged
            ? "Items flagged"
            : "Items cleared"}

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

      <span class="risk-label ${cls}-label">
        ${level} RISK
      </span>

      <p
        class="sub"
        style="margin-top:10px;margin-bottom:0"
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
   DOCUMENT RESULTS
============================================================ */

function renderResults(results) {

  $("resultsArea").innerHTML =
    results
      .map(item => {

        const imageURL =
          URL.createObjectURL(item.file);


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
   DASHBOARD
============================================================ */

function updateDashboard() {

  $("statTotal").textContent =
    state.screenings.length;


  $("statGenuine").textContent =
    state.screenings.filter(
      item => item.dec === "CLEARED"
    ).length;


  $("statFlagged").textContent =
    state.screenings.filter(
      item => item.dec === "FLAGGED"
    ).length;


  $("statSessions").textContent =
    state.sessions;


  /* Recent screenings */

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


  /* Audit */

  $("auditTableBody").innerHTML =
    state.audit
      .slice(0, 12)
      .map((item, index) => `

        <tr>

          <td>
            #${state.audit.length - index}
          </td>

          <td>
            ${item.time}
          </td>

          <td>
            ${item.officer}
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

    const ok =
      $("officerId").value.trim() &&
      $("officerPin").value.trim();


    $("loginStatus").textContent =
      ok
        ? "Authentication successful — demo session active."
        : "Enter Officer ID and PIN.";


    $("loginStatus").className =
      "status-msg " +
      (ok ? "ok" : "fail");

  }
);


/* ============================================================
   DIGILOCKER DEMO
============================================================ */

$("digilockerBtn").addEventListener(
  "click",
  () => {

    const ok =
      $("digilockerRef").value.trim();


    $("digilockerStatus").textContent =
      ok
        ? "DigiLocker verification response received — demo only."
        : "Enter a document reference number.";


    $("digilockerStatus").className =
      "status-msg " +
      (ok ? "ok" : "fail");

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


    /* Remove face preview completely */

    $("facePreview").removeAttribute("src");

    $("facePreviewContainer").style.display =
      "none";


    /* Clear document queue */

    $("docQueue").innerHTML = "";


    /* Reset summary */

    $("summaryArea").innerHTML = `

      <p class="placeholder">

        Upload documents and run screening to see
        the combined identity verification summary.

      </p>

    `;


    /* Hide results */

    $("resultsCard").style.display = "none";


    /* Disable screening */

    $("scanBtn").disabled = true;


    updateDashboard();

  }
);


/* ============================================================
   INITIAL DASHBOARD
============================================================ */

updateDashboard();


/* ============================================================
   SECURE LOGIN SCREEN
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
   OPEN MAIN APPLICATION
============================================================ */

function openMainApp() {

  loginPage.style.display = "none";

  mainApp.style.display = "block";

  sessionStorage.setItem(
    "autheNovaLoggedIn",
    "true"
  );

}


/* ============================================================
   REMEMBER LOGIN
============================================================ */

if (
  sessionStorage.getItem(
    "autheNovaLoggedIn"
  ) === "true"
) {

  openMainApp();

}


/* ============================================================
   LOGIN BUTTON
============================================================ */

enterSystemBtn.addEventListener(
  "click",
  () => {

    if (
      !loginOfficerId.value.trim() ||
      !loginPassword.value.trim()
    ) {

      loginError.textContent =
        "Please enter both Officer ID and Password / PIN.";

      return;

    }


    loginError.textContent = "";

    openMainApp();

  }
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
    e => {

      if (e.key === "Enter") {

        enterSystemBtn.click();

      }

    }
  );

});


/* ============================================================
   PROFILE MENU
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


/* Open profile menu */

profileBtn.addEventListener(
  "click",
  e => {

    e.stopPropagation();

    profileMenu.classList.toggle("show");

  }
);


/* Close menu outside click */

document.addEventListener(
  "click",
  e => {

    if (
      !profileMenu.contains(e.target) &&
      e.target !== profileBtn
    ) {

      profileMenu.classList.remove("show");

    }

  }
);


/* Profile modal */

myProfileBtn.addEventListener(
  "click",
  () => {

    profileMenu.classList.remove("show");

    profileModal.classList.add("show");

  }
);


/* Close modal */

closeProfile.addEventListener(
  "click",
  () => {

    profileModal.classList.remove("show");

  }
);


/* Close modal by clicking background */

profileModal.addEventListener(
  "click",
  e => {

    if (e.target === profileModal) {

      profileModal.classList.remove("show");

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


    profileMenu.classList.remove("show");

    mainApp.style.display = "none";

    loginPage.style.display = "flex";


    loginOfficerId.value = "";

    loginPassword.value = "";

    loginError.textContent = "";

  }
);
