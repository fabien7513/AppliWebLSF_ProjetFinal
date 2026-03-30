
document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([43.22, 5.48], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const modal = document.getElementById("interpreter-modal");
  const closeModalBtn = document.getElementById("close-interpreter-modal");

  const modalPhoto = document.getElementById("modal-photo");
  const modalName = document.getElementById("modal-name");
  const modalDescription = document.getElementById("modal-description");
  const modalCity = document.getElementById("modal-city");
  const modalPhone = document.getElementById("modal-phone");
  const modalMail = document.getElementById("modal-mail");
  const modalSiret = document.getElementById("modal-siret");

  function getApproximatePosition(lat, lng) {
    const offsetLat = (Math.random() - 0.5) * 0.02;
    const offsetLng = (Math.random() - 0.5) * 0.02;
    return [lat + offsetLat, lng + offsetLng];
  }

  function openInterpreterModal(interpreter) {
    console.log("Ouverture modal - Interprète :", interpreter);
    modalPhoto.src = interpreter.photo || "/static/assets/images/avatar.png";
    modalName.textContent = `${interpreter.firstName || ""} ${interpreter.lastName || ""}`.trim();
    modalDescription.textContent = interpreter.description || "Aucune présentation disponible.";
    modalCity.textContent = interpreter.address?.city || "Ville non renseignée";
    modalPhone.textContent = interpreter.phone || "Non renseigné";
    modalMail.textContent = interpreter.mail || "Non renseigné";
    modalSiret.textContent = interpreter.siretNumber || "Non renseigné";

    modal.classList.remove("hidden");
    console.log("Classe 'hidden' supprimée");
  }

  function closeInterpreterModal() {
    modal.classList.add("hidden");
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", closeInterpreterModal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeInterpreterModal();
      }
    });
  }

  if (Array.isArray(interpreters)) {
    const markers = [];

    interpreters.forEach((interpreter) => {
      if (
        interpreter.address &&
        interpreter.address.latitude &&
        interpreter.address.longitude
      ) {
        const [safeLat, safeLng] = getApproximatePosition(
          interpreter.address.latitude,
          interpreter.address.longitude
        );

        const marker = L.marker([safeLat, safeLng]).addTo(map);

        marker.on("click", () => {
          console.log("Pin cliqué ! Interprète :", interpreter.firstName, interpreter.lastName);
          console.log("Modal élément :", modal);
          openInterpreterModal(interpreter);
        });

        markers.push(marker);
      }
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds(), { padding: [30, 30] });
    }
  }
});

// Modale bouton "Trouvez un interprète"
const openModalBtn = document.querySelector('#open-modal');
const closeModalBtn = document.querySelector('#close-modal');
const modal = document.querySelector('#search-modal');
const startTime = document.querySelector("#startTime");
const endTime = document.querySelector("#endTime");
const duration = document.querySelector("#duration");

openModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

function calculateDuration() {
  if (startTime.value && endTime.value) {
    const start = new Date (`1970-01-01T${startTime.value}:00`);
    const end = new Date (`1970-01-01T${endTime.value}:00`);

    const diff = (end - start) / 60000;

    if (diff > 0) {
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      duration.value = `${hours}h ${minutes}min`;
    } else {
      duration.value = "Heure invalide";
    }
  }
}

startTime.addEventListener("input", calculateDuration);
endTime.addEventListener("input", calculateDuration);

// Dropdown
const userBtn = document.querySelector("#user-btn");
const dropdown = document.querySelector("#user-dropdown");

if (userBtn) {
  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    dropdown.classList.add("hidden");
  });
}
