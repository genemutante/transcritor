const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxhI78wMjCh7kcUPPg_PhtWpt-vU-gSXCYqacQEP2WmaSMheo4HKa9fybLMl7R_ejz0oQ/exec";
const DRIVE_FOLDER_URL = "https://drive.google.com/uc?export=download&id=";
const FILE_POLLING_DELAY = 5000;

const uploadForm = document.getElementById("uploadForm");
const status = document.getElementById("status");
const transcriptionBox = document.getElementById("transcription");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("audioFile");
  const file = fileInput.files[0];
  if (!file) return alert("Selecione um arquivo de áudio");

  status.textContent = "Enviando arquivo...";

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Audio = reader.result.split(',')[1];

    const form = new FormData();
    form.append("audio", base64Audio);
    form.append("filename", file.name);
    form.append("mimeType", file.type);

    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      body: form
    });

    const result = await res.json();
    if (result.success) {
      status.textContent = "Áudio enviado. Aguardando transcrição...";
      pollTranscription(file.name + ".txt");
    } else {
      status.textContent = "Erro: " + result.error;
    }
  };
  reader.readAsDataURL(file);
});

async function pollTranscription(txtFilename) {
  const url = `${WEBAPP_URL}?filename=${encodeURIComponent(txtFilename)}`;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        clearInterval(interval);
        transcriptionBox.value = data.content;
        status.textContent = "Transcrição pronta!";
      }
    } catch (e) {
      status.textContent = "Erro ao buscar transcrição.";
    }
  }, FILE_POLLING_DELAY);
}

