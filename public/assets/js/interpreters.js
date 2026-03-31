// Gestion du modal
const modal = document.getElementById("interpreter-modal");
const closeModalBtn = document.getElementById("close-interpreter-modal");
const interpreterCards = document.querySelectorAll(".interpreter-card");

const modalPhoto = document.getElementById("modal-photo");
const modalName = document.getElementById("modal-name");
const modalDescription = document.getElementById("modal-description");
const modalCity = document.getElementById("modal-city");
const modalPhone = document.getElementById("modal-phone");
const modalMail = document.getElementById("modal-mail");
const modalSiret = document.getElementById("modal-siret");

function openInterpreterModal(interpreter) {
	modalPhoto.src = interpreter.photo || "/static/assets/images/avatar.png";
	modalName.textContent = `${interpreter.firstName || ""} ${interpreter.lastName || ""}`.trim();
	modalDescription.textContent = interpreter.description || "Aucune description disponible.";
	modalCity.textContent = interpreter.address?.city || "Ville non renseignée";
	modalPhone.textContent = interpreter.phone || "Non renseigné";
	modalMail.textContent = interpreter.mail || "Non renseigné";
	modalSiret.textContent = interpreter.siretNumber || "Non renseigné";

	modal.classList.remove("hidden");
}

function closeInterpreterModal() {
	modal.classList.add("hidden");
}

// Événement pour fermer le modal
if (closeModalBtn && modal) {
	closeModalBtn.addEventListener("click", closeInterpreterModal);

	modal.addEventListener("click", (event) => {
		if (event.target === modal) {
			closeInterpreterModal();
		}
	});
}

// Événement pour ouvrir le modal au clic sur une carte
interpreterCards.forEach(card => {
	card.addEventListener("click", () => {
		const interpreterData = JSON.parse(card.getAttribute("data-interpreter"));
		openInterpreterModal(interpreterData);
	});
});

// Gestion du menu utilisateur (pour les pages avec le même header)
const userBtn = document.querySelector("#user-btn");
const dropdown = document.querySelector("#user-dropdown");

if (userBtn && dropdown) {
	userBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		dropdown.classList.toggle("hidden");
	});

	document.addEventListener("click", () => {
		dropdown.classList.add("hidden");
	});
}
