/* ============================================================
   IntizomAI — admin panel logic
   - login (cookie session)
   - logo preview / drag-drop upload (PostgreSQL storage)
   - remove logo / logout
   ============================================================ */
(function () {
  "use strict";

  var MAX_BYTES = 4 * 1024 * 1024;

  var loginCard = document.getElementById("loginCard");
  var panelCard = document.getElementById("panelCard");
  var loginForm = document.getElementById("loginForm");
  var loginMsg = document.getElementById("loginMsg");
  var passwordEl = document.getElementById("password");
  var logoutBtn = document.getElementById("logoutBtn");
  var dbStatus = document.getElementById("dbStatus");
  var preview = document.getElementById("preview");
  var previewMeta = document.getElementById("previewMeta");
  var dropzone = document.getElementById("dropzone");
  var fileInput = document.getElementById("fileInput");
  var uploadBtn = document.getElementById("uploadBtn");
  var removeBtn = document.getElementById("removeBtn");
  var panelMsg = document.getElementById("panelMsg");
  var brandLogo = document.getElementById("brandLogo");

  var stagedDataUrl = null;   // pending upload (base64 dataURL)
  var stagedFile = null;      // File object for size info
  var currentDbReady = false;

  // ---------- helpers ----------
  function show(el, on) { el.hidden = !on; }
  function setMsg(node, text, kind) {
    node.textContent = text || "";
    node.className = "msg " + (kind || "");
  }
  function bytesToKB(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / 1024 / 1024).toFixed(2) + " MB";
  }
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign(
      { "Content-Type": "application/json" },
      opts.headers || {}
    );
    opts.credentials = "same-origin";
    return fetch(path, opts).then(function (r) {
      return r.json().then(function (j) { return { status: r.status, body: j }; })
        .catch(function () { return { status: r.status, body: {} }; });
    });
  }

  function renderDbStatus() {
    if (currentDbReady) {
      dbStatus.textContent = "PostgreSQL ulanmoqda";
      dbStatus.classList.add("ok");
      dbStatus.classList.remove("warn");
    } else {
      dbStatus.textContent = "PostgreSQL sozlanmagan — DATABASE_URL kerak";
      dbStatus.classList.add("warn");
      dbStatus.classList.remove("ok");
    }
  }

  function refreshBrandLogo() {
    // cache-bust so uploaded logo shows immediately
    brandLogo.src = "/logo?t=" + Date.now();
  }

  // ---------- render current logo ----------
  function loadCurrentLogo() {
    preview.innerHTML =
      '<div class="ph"><span class="spin"></span><span>yuklanmoqda…</span></div>';
    previewMeta.textContent = "—";

    api("/api/logo").then(function (res) {
      preview.innerHTML = "";
      if (res.body && res.body.logo) {
        var img = document.createElement("img");
        img.alt = "logo";
        img.src = res.body.logo;
        preview.appendChild(img);
        var when = res.body.updatedAt
          ? new Date(res.body.updatedAt).toLocaleString("uz-UZ")
          : "—";
        previewMeta.textContent =
          "hozirgi logo · " + (res.body.mime || "") + " · " + when;
      } else {
        preview.innerHTML =
          '<div class="ph"><span style="font-size:1.6rem">📭</span><span>logo hali yuklanmagan</span></div>';
        previewMeta.textContent = "Foydalanuvchilar standart placeholder ko'radi";
      }
    });
  }

  // ---------- session check ----------
  function bootstrap() {
    api("/api/admin/me").then(function (res) {
      currentDbReady = !!(res.body && res.body.dbReady);
      var authed = !!(res.body && res.body.authed);
      if (authed) {
        show(loginCard, false);
        show(panelCard, true);
        renderDbStatus();
        loadCurrentLogo();
      } else {
        show(loginCard, true);
        show(panelCard, false);
      }
    }).catch(function () {
      show(loginCard, true);
      show(panelCard, false);
    });
  }

  // ---------- login ----------
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    setMsg(loginMsg, "tekshirilmoqda…", "info");
    api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password: passwordEl.value }),
    }).then(function (res) {
      if (res.status === 200 && res.body.ok) {
        setMsg(loginMsg, "kirildi ✓", "ok");
        passwordEl.value = "";
        setTimeout(bootstrap, 300);
      } else {
        setMsg(loginMsg, (res.body && res.body.error) || "kirish rad etildi", "err");
      }
    }).catch(function () {
      setMsg(loginMsg, "server bilan ulanib bo'lmadi", "err");
    });
  });

  // ---------- logout ----------
  logoutBtn.addEventListener("click", function () {
    api("/api/admin/logout", { method: "POST" }).then(function () {
      stagedDataUrl = null; stagedFile = null;
      uploadBtn.disabled = true;
      setMsg(panelMsg, "", "");
      bootstrap();
    });
  });

  // ---------- file picking & drag-drop ----------
  function stageFile(file) {
    setMsg(panelMsg, "", "");
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setMsg(panelMsg, "faqat rasm fayllari (PNG, JPG, SVG, WEBP)", "err");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMsg(panelMsg, "fayl 4 MB dan katta bo'lmasin", "err");
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      stagedDataUrl = String(e.target.result || "");
      stagedFile = file;
      // preview the staged image
      preview.innerHTML = "";
      var img = document.createElement("img");
      img.src = stagedDataUrl;
      img.alt = "new logo preview";
      preview.appendChild(img);
      previewMeta.textContent =
        "tanlandi · " + file.type + " · " + bytesToKB(file.size) +
        " · saqlamaguningizcha bazaga yozilmaydi";
      uploadBtn.disabled = false;
    };
    reader.onerror = function () {
      setMsg(panelMsg, "faylni o'qib bo'lmadi", "err");
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) stageFile(fileInput.files[0]);
  });

  ["dragenter", "dragover"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.add("drag");
    });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.remove("drag");
    });
  });
  dropzone.addEventListener("drop", function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) stageFile(f);
  });

  // ---------- upload ----------
  uploadBtn.addEventListener("click", function () {
    if (!stagedDataUrl) return;
    uploadBtn.disabled = true;
    setMsg(panelMsg, "PostgreSQL ga yozilmoqda…", "info");
    api("/api/admin/logo", {
      method: "POST",
      body: JSON.stringify({ dataUrl: stagedDataUrl }),
    }).then(function (res) {
      if (res.status === 200 && res.body.ok) {
        setMsg(panelMsg,
          "logo saqlandi ✓ (" + bytesToKB(res.body.size) + " · " + res.body.mime + ")",
          "ok");
        stagedDataUrl = null; stagedFile = null;
        fileInput.value = "";
        refreshBrandLogo();
        loadCurrentLogo();
      } else {
        setMsg(panelMsg, (res.body && res.body.error) || "xatolik yuz berdi", "err");
        uploadBtn.disabled = !stagedDataUrl;
      }
    }).catch(function () {
      setMsg(panelMsg, "tarmoq xatosi", "err");
      uploadBtn.disabled = !stagedDataUrl;
    });
  });

  // ---------- remove ----------
  removeBtn.addEventListener("click", function () {
    if (!confirm("Logoni bazadan o'chirasizmi? Sayt standart placeholderga qaytadi.")) return;
    setMsg(panelMsg, "o'chirilmoqda…", "info");
    api("/api/admin/logo", { method: "DELETE" }).then(function (res) {
      if (res.status === 200 && res.body.ok) {
        setMsg(panelMsg, "logo o'chirildi ✓", "ok");
        stagedDataUrl = null; stagedFile = null;
        fileInput.value = "";
        uploadBtn.disabled = true;
        refreshBrandLogo();
        loadCurrentLogo();
      } else {
        setMsg(panelMsg, (res.body && res.body.error) || "xatolik", "err");
      }
    });
  });

  bootstrap();
})();
