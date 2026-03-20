	const departmentSelect = document.querySelector("#department");
		const citySelect = document.querySelector("#city");

		async function loadCities(department) {
			const response = await fetch (`https://geo.api.gouv.fr/departements/${department}/communes?fields=nom&format=json`);
			const cities = await response.json();

			citySelect.innerHTML = "";

			cities.forEach(city => {
				const option = document.createElement("option");
				option.value = city.nom;
				option.textContent = city.nom;
				citySelect.appendChild(option);
			});
		}

		departmentSelect.addEventListener("change", () => {
			loadCities(departmentSelect.value);
		});

		/* charger les villes du 13 au démarrage */
		loadCities("13");

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