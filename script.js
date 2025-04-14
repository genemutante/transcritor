const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzFqXnNMR6Ce38dwAD2_kwkACR7vZB30nXlKuPE9wUbKqpnRmUnou9olxlPyMFU4V17Bw/exec";
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
  const folderId = "1KauFKBNej9b1Zw08U1PgyKqNpa-5SBWw";
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+name='${txtFilename}'&key=SUA_API_KEY`;
  
  const interval = setInterval(async () => {
    const res = await fetch(url);
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      clearInterval(interval);
      const fileId = data.files[0].id;
      const content = await fetch(`${DRIVE_FOLDER_URL}${fileId}`).then(r => r.text());
      transcriptionBox.value = content;
      status.textContent = "Transcrição pronta!";
    }
  }, FILE_POLLING_DELAY);
}
