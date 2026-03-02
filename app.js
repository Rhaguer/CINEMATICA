/* ============================================================
   🎵 CIMÁTICA 2025 – APP UNIVERSITARIO
   Sonido real + osciloscopio + espectro + registro (sin edad ni fecha)
   ============================================================ */

let audioCtx = null;
let oscillator = null;
let analyser = null;
let gainNode = null;
let running = false;
let animationId = null;

let oscCanvas = null;
let oscCtx = null;
let fftCanvas = null;
let fftCtx = null;

let chartObj = null;

/* ============================
   🌀 SPLASH + CARGA INICIAL
   ============================ */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const audio = document.getElementById("transitionSound");

  // sonido solo en la carga
  if (audio) {
    audio.volume = 1;
    audio.currentTime = 0;
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        const activar = () => {
          audio.play();
          document.removeEventListener("click", activar);
          document.removeEventListener("touchstart", activar);
        };
        document.addEventListener("click", activar, { once: true });
        document.addEventListener("touchstart", activar, { once: true });
      });
    }
  }

  // ocultar splash
  setTimeout(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (splash) {
      splash.style.transition = "opacity 1s ease";
      splash.style.opacity = "0";
      setTimeout(() => (splash.style.display = "none"), 1000);
    }
  }, 3000);

  initUI();
  crearParticulas();
  cargarDatosPrevios();
});

/* ============================
   🧩 PREPARAR REFERENCIAS
   ============================ */
function initUI() {
  // canvases
  oscCanvas = document.getElementById("ecg");
  if (oscCanvas) {
    oscCtx = oscCanvas.getContext("2d");
    oscCanvas.width = oscCanvas.clientWidth || 360;
    oscCanvas.height = 160;
  }

  fftCanvas = document.getElementById("fft");
  if (fftCanvas) {
    fftCtx = fftCanvas.getContext("2d");
    fftCanvas.width = fftCanvas.clientWidth || 360;
    fftCanvas.height = 160;
  }

  // controles
  const toggle = document.getElementById("toggle");
  const freqSlider = document.getElementById("freq");
  const waveSelect = document.getElementById("wave");
  const btnBorrar = document.getElementById("btnBorrar");
  const btnGrafico = document.getElementById("btnGrafico");
  const waveFilter = document.getElementById("waveFilter");

  if (toggle) toggle.onclick = toggleAudio;

  if (freqSlider) {
    freqSlider.oninput = handleFreqChange;
    const freqVal = document.getElementById("freqVal");
    if (freqVal) freqVal.textContent = `${freqSlider.value} Hz`;
  }

  if (waveSelect) waveSelect.onchange = handleWaveChange;

  if (btnBorrar) btnBorrar.onclick = borrarDatos;
  if (btnGrafico) btnGrafico.onclick = generarGrafico;
  if (waveFilter) waveFilter.onchange = generarGrafico;
}

/* ============================
   🔊 ENCENDER / APAGAR AUDIO
   ============================ */
async function toggleAudio() {
  const toggle = document.getElementById("toggle");
  const freqSlider = document.getElementById("freq");
  const waveSelect = document.getElementById("wave");

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (!running) {
    if (audioCtx.state === "suspended") await audioCtx.resume();

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    analyser = audioCtx.createAnalyser();

    oscillator.type = waveSelect ? waveSelect.value : "sine";
    oscillator.frequency.setValueAtTime(
      freqSlider ? freqSlider.value : 100,
      audioCtx.currentTime
    );
    gainNode.gain.value = 0.2;

    oscillator.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    analyser.fftSize = 2048;

    oscillator.start();
    running = true;
    if (toggle) toggle.textContent = "⏸️ Detener";

    if (waveSelect) actualizarColor(waveSelect.value);

    drawVisuals();

    // guarda este experimento
    saveData();
  } else {
    if (oscillator) oscillator.stop();
    running = false;
    if (toggle) toggle.textContent = "🔊 Reproducir";
    if (oscCanvas) oscCanvas.classList.remove("energizado");
    cancelAnimationFrame(animationId);
  }
}

/* ============================
   🎚️ FRECUENCIA EN TIEMPO REAL
   ============================ */
function handleFreqChange(e) {
  const val = e.target.value;
  const freqVal = document.getElementById("freqVal");
  if (freqVal) freqVal.textContent = `${val} Hz`;
  if (oscillator && running) {
    oscillator.frequency.setValueAtTime(val, audioCtx.currentTime);
  }
}

/* ============================
   🟣 CAMBIO DE FORMA DE ONDA
   ============================ */
function handleWaveChange(e) {
  const onda = e.target.value;
  if (oscillator && running) oscillator.type = onda;
  actualizarColor(onda);
}

/* ============================
   🎨 COLOR SEGÚN ONDA
   ============================ */
function actualizarColor(onda) {
  const colores = {
    sine: "#00e0ff",
    square: "#00ff88",
    triangle: "#b05bff",
    sawtooth: "#ff8c00",
  };
  const color = colores[onda] || "#00e0ff";

  const freqVal = document.getElementById("freqVal");
  if (freqVal) {
    freqVal.style.color = color;
    freqVal.style.textShadow = `0 0 8px ${color}`;
  }
  if (oscCanvas) {
    oscCanvas.style.setProperty("--glow-color", color);
    oscCanvas.classList.add("energizado");
  }
}

/* ============================
   📺 DIBUJO: OSCILOSCOPIO + FFT
   ============================ */
function drawVisuals() {
  if (!analyser) return;
  animationId = requestAnimationFrame(drawVisuals);

  // --- TIME DOMAIN ---
  if (oscCtx && oscCanvas) {
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const w = oscCanvas.width || 360;
    const h = oscCanvas.height || 160;

    oscCtx.fillStyle = "#020617";
    oscCtx.fillRect(0, 0, w, h);

    // rejilla
    oscCtx.strokeStyle = "rgba(0,255,255,0.05)";
    oscCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      oscCtx.beginPath();
      oscCtx.moveTo(x, 0);
      oscCtx.lineTo(x, h);
      oscCtx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      oscCtx.beginPath();
      oscCtx.moveTo(0, y);
      oscCtx.lineTo(w, y);
      oscCtx.stroke();
    }

    // señal real
    const color = oscCanvas.style.getPropertyValue("--glow-color") || "#00e0ff";
    oscCtx.beginPath();
    oscCtx.lineWidth = 2;
    oscCtx.strokeStyle = color;

    const sliceWidth = (w * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) oscCtx.moveTo(x, y);
      else oscCtx.lineTo(x, y);
      x += sliceWidth;
    }
    oscCtx.shadowColor = color;
    oscCtx.shadowBlur = 12;
    oscCtx.stroke();
    oscCtx.shadowBlur = 0;
  }

  // --- FREQUENCY DOMAIN (FFT) ---
  if (fftCtx && fftCanvas) {
    const bufferLength = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(freqData);

    const w = fftCanvas.width || 360;
    const h = fftCanvas.height || 160;

    fftCtx.fillStyle = "#020617";
    fftCtx.fillRect(0, 0, w, h);

    const barWidth = (w / bufferLength) * 2.5;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (freqData[i] / 255) * h;
      fftCtx.fillStyle = "rgba(0,224,255,0.9)";
      fftCtx.fillRect(x, h - barHeight, barWidth, barHeight);
      x += barWidth + 1;
      if (x > w) break;
    }
  }
}

/* ============================
   💾 GUARDAR REGISTRO (SOLO FREQ + ONDA)
   ============================ */
function saveData() {
  const freq = document.getElementById("freq")?.value || "100";
  const wave = document.getElementById("wave")?.value || "sine";

  const nuevo = { freq, wave };
  const prev = JSON.parse(localStorage.getItem("cimaticaData") || "[]");
  prev.push(nuevo);
  localStorage.setItem("cimaticaData", JSON.stringify(prev));

  const tbody = document.querySelector("#dataTable tbody");
  if (tbody) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${freq}</td><td>${wave}</td>`;
    tbody.appendChild(tr);
  }
}

/* ============================
   📥 CARGAR REGISTRO
   ============================ */
function cargarDatosPrevios() {
  const data = JSON.parse(localStorage.getItem("cimaticaData") || "[]");
  const tbody = document.querySelector("#dataTable tbody");
  if (!tbody) return;
  data.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.freq}</td><td>${d.wave}</td>`;
    tbody.appendChild(tr);
  });
}

/* ============================
   🧹 BORRAR REGISTRO
   ============================ */
function borrarDatos() {
  if (!confirm("¿Seguro que deseas borrar todos los datos guardados?")) return;
  localStorage.removeItem("cimaticaData");
  const tbody = document.querySelector("#dataTable tbody");
  if (tbody) tbody.innerHTML = "";
  if (chartObj) chartObj.destroy();
  alert("✅ Datos eliminados.");
}

/* ============================
   📈 GRÁFICA CON CHART.JS
   ============================ */
function generarGrafico() {
  const data = JSON.parse(localStorage.getItem("cimaticaData") || "[]");
  if (!data.length) return alert("No hay datos registrados aún.");

  const filtroEl = document.getElementById("waveFilter");
  const filtro = filtroEl ? filtroEl.value : "todas";
  const filtrados = filtro === "todas"
    ? data
    : data.filter(d => d.wave === filtro);

  const canvas = document.getElementById("chartCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (chartObj) chartObj.destroy();

  // Usamos índices como eje X porque ya no hay fecha
  const labels = filtrados.map((_, i) => `Muestra ${i + 1}`);

  const colores = {
    sine: "#00b4d8",
    square: "#ffb703",
    triangle: "#8ecae6",
    sawtooth: "#9d4edd",
  };

  chartObj = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: Object.keys(colores).map(tipo => ({
        label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        data: filtrados
          .filter(d => d.wave === tipo)
          .map(d => parseInt(d.freq)),
        borderColor: colores[tipo],
        backgroundColor: colores[tipo] + "55",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 2,
      })),
    },
    options: {
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#fff" }, grid: { color: "#222" } },
        y: { ticks: { color: "#fff" }, grid: { color: "#222" } },
      },
    },
  });
}

/* ============================
   ✨ PARTÍCULAS
   ============================ */
function crearParticulas() {
  const cantidad = 15;
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement("div");
    p.classList.add("particle");
    const size = Math.random() * 6 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.top = `${Math.random() * 100}vh`;
    p.style.animationDuration = `${5 + Math.random() * 10}s`;
    document.body.appendChild(p);
  }
}
  