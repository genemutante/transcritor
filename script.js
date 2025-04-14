<script>
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxVFDUXp4Il62w2f6h6PGXevJFK6gIQzFc-gQj7s3M6v_OAnmuQPxEQrUaSWQJA-1FIQA/exec";

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("audioFile");
  const file = fileInput.files[0];
  const status = document.getElementById("status");

  if (!file) {
    alert("Selecione um arquivo de áudio.");
    return;
  }

  status.textContent = "Enviando arquivo...";

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];

    const form = new FormData();
    form.append("audio", base64);
    form.append("filename", file.name);     // CORRETO: com "f" minúsculo
    form.append("mimeType", file.type);

    try {
      const res = await fetch(WEBAPP_URL, {
        method: "POST",
        body: form
      });

      const result = await res.json();

      if (result.success) {
        status.textContent = "✅ Áudio enviado com sucesso. Aguardando transcrição...";
        pollTranscription(file.name + ".txt");
      } else {
        status.textContent = "❌ Erro: " + result.error;
      }
    } catch (err) {
      console.error("Erro ao conectar com o Apps Script:", err);
      status.textContent = "❌ Erro de conexão com o servidor.";
    }
  };

  reader.readAsDataURL(file);
});

function pollTranscription(txtFilename) {
  const status = document.getElementById("status");
  const transcriptionBox = document.getElementById("transcription");

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${WEBAPP_URL}?filename=${encodeURIComponent(txtFilename)}`);
      const json = await res.json();
      if (json.success) {
        clearInterval(interval);
        transcriptionBox.value = json.content;
        status.textContent = "✅ Transcrição concluída!";
      }
    } catch (e) {
      console.log("Aguardando transcrição...");
    }
  }, 5000);
}
</script>
