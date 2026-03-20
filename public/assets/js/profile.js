
  document.addEventListener("DOMContentLoaded", () => {
    const togglePresentationBtn = document.getElementById("toggle-presentation");
    const presentationEditBox = document.getElementById("presentation-edit-box");

    if (togglePresentationBtn && presentationEditBox) {
      togglePresentationBtn.addEventListener("click", () => {
        presentationEditBox.classList.toggle("hidden");
      });
    }

    const photoInput = document.getElementById("photo");
    const profilePreview = document.getElementById("profile-preview");

    if (photoInput && profilePreview) {
      photoInput.addEventListener("change", (event) => {
        const file = event.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
          alert("Veuillez sélectionner une image.");
          photoInput.value = "";
          return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
          profilePreview.src = e.target.result;
        };

        reader.readAsDataURL(file);
      });
    }
  });
