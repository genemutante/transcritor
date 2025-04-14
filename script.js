<script>
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxVFDUXp4Il62w2f6h6PGXevJFK6gIQzFc-gQj7s3M6v_OAnmuQPxEQrUaSWQJA-1FIQA/exec";

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("audioFile");
  const file = fileInput.files[0];
  if (!file) return alert("Selecione um áudio.");

  document.getElementById("status").textContent = "Enviando arquivo...";

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    const form = new FormData();
    form.append("audio", base64);
    form.append("filename", file.name);       // 🔥 Aqui é onde o nome é enviado!
    form.append("mimeType", file.type);

    try {
      const res = await fetch(WEBAPP_URL, {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      if (json.success) {
        document.getElementById("status").textContent = "Áudio enviado com sucesso!";
      } else {
        document.getElementById("status").textContent = "Erro: " + json.error;
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      document.getElementById("status").textContent = "Erro na comunicação com o servidor.";
    }
  };

  reader.readAsDataURL(file);
});
</script>


