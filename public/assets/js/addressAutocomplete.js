document.addEventListener("DOMContentLoaded", () => {
  const addressInputs = document.querySelectorAll("[data-address-autocomplete]");

  addressInputs.forEach((input) => {
    setupAddressAutocomplete(input);
  });
});

function setupAddressAutocomplete(input) {
  const wrapper = document.createElement("div");
  wrapper.className = "address-autocomplete";

  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const list = document.createElement("div");
  list.className = "address-autocomplete-list hidden";
  wrapper.appendChild(list);

  let debounceTimer;
  let activeIndex = -1;
  let currentSuggestions = [];
  let currentAbortController = null;

  input.setAttribute("autocomplete", "off");

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    activeIndex = -1;

    const query = input.value.trim();

    if (query.length < 3) {
      currentSuggestions = [];
      hideSuggestions(list);
      return;
    }

    debounceTimer = setTimeout(async () => {
      if (currentAbortController) {
        currentAbortController.abort();
      }

      currentAbortController = new AbortController();

      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`,
          { signal: currentAbortController.signal }
        );

        if (!response.ok) {
          hideSuggestions(list);
          return;
        }

        const data = await response.json();
        currentSuggestions = Array.isArray(data.features) ? data.features : [];
        renderSuggestions({ input, list, suggestions: currentSuggestions, onSelect: () => {
          activeIndex = -1;
        } });
      } catch (error) {
        if (error.name !== "AbortError") {
          hideSuggestions(list);
        }
      }
    }, 250);
  });

  input.addEventListener("keydown", (event) => {
    if (list.classList.contains("hidden") || currentSuggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, currentSuggestions.length - 1);
      updateActiveSuggestion(list, activeIndex);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActiveSuggestion(list, activeIndex);
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(input, currentSuggestions[activeIndex], list);
      activeIndex = -1;
    }

    if (event.key === "Escape") {
      hideSuggestions(list);
      activeIndex = -1;
    }
  });

  input.addEventListener("blur", () => {
    window.setTimeout(() => {
      hideSuggestions(list);
    }, 150);
  });
}

function renderSuggestions({ input, list, suggestions, onSelect }) {
  list.innerHTML = "";

  if (suggestions.length === 0) {
    hideSuggestions(list);
    return;
  }

  suggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "address-autocomplete-item";
    button.textContent = suggestion.properties.label;

    button.addEventListener("click", () => {
      selectSuggestion(input, suggestion, list);
      onSelect();
    });

    list.appendChild(button);
  });

  list.classList.remove("hidden");
}

function selectSuggestion(input, suggestion, list) {
  input.value = suggestion.properties.label;
  hideSuggestions(list);
}

function updateActiveSuggestion(list, activeIndex) {
  const items = list.querySelectorAll(".address-autocomplete-item");

  items.forEach((item, index) => {
    item.classList.toggle("active", index === activeIndex);
  });

  if (items[activeIndex]) {
    items[activeIndex].scrollIntoView({
      block: "nearest"
    });
  }
}

function hideSuggestions(list) {
  list.classList.add("hidden");
  list.innerHTML = "";
}
