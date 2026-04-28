document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const eventModal = document.getElementById('event-modal');
  const closeEventModalBtn = document.getElementById('close-event-modal');
  const detailsTitle = document.getElementById('event-details-title');
  const detailsStart = document.getElementById('event-details-start');
  const detailsEnd = document.getElementById('event-details-end');
  const detailsLocation = document.getElementById('event-details-location');
  const detailsComment = document.getElementById('event-details-comment');
  const detailsParticipant = document.getElementById('event-details-participant');
  const editStartInput = document.getElementById('event-edit-start');
  const editEndInput = document.getElementById('event-edit-end');
  const eventModalEdit = document.getElementById('event-modal-edit');
  const eventModalActions = document.getElementById('event-modal-actions');
  const saveSelectedEventBtn = document.getElementById('save-selected-event');
  const deleteSelectedEventBtn = document.getElementById('delete-selected-event');

  if (!calendarEl) {
    console.error('Elément #calendar non trouvé');
    return;
  }

  const editableFlag = typeof editable !== 'undefined' && editable === true;
  let selectedEvent = null;
  const compactBreakpoint = 760;

  const availabilityEvents = Array.isArray(availabilities)
    ? availabilities.map((a) => ({
      id: `availability-${a.id_availability}`,
      title: editableFlag ? (a.interventionType || "Créneau") : "Occupé",
      start: a.startDateTime,
      end: a.endDateTime,
      editable: editableFlag,
      extendedProps: editableFlag
        ? {
          sourceType: 'availability',
          recordId: a.id_availability,
          comment: a.comment || "",
          location: a.location || "",
          displayLocation: a.location || "Non renseigné",
          displayComment: a.comment || "Aucun",
          participant: "Non communiqué",
          interpreterId: a.userId || null
        }
        : {
          sourceType: 'availability',
          recordId: a.id_availability,
          displayLocation: "Non communiqué",
          displayComment: "Non communiqué",
          participant: "Non communiqué"
        }
    }))
    : [];

  const bookingEvents = Array.isArray(bookings)
    ? bookings.map((booking) => ({
      id: `booking-${booking.id_demande}`,
      title: editableFlag ? (booking.interventionType || "Réservation confirmée") : "Occupé",
      start: booking.startDateTime,
      end: booking.endDateTime,
      editable: false,
      backgroundColor: '#db6f5c',
      borderColor: '#db6f5c',
      extendedProps: {
        sourceType: 'booking',
        recordId: booking.id_demande,
        comment: booking.message || "",
        location: booking.location || "",
        displayLocation: editableFlag
          ? (booking.location || "Non renseigné")
          : "Non communiqué",
        displayComment: editableFlag
          ? (booking.message || "Aucun")
          : "Non communiqué",
        participant: editableFlag
          ? `${booking.clientFirstName || ""} ${booking.clientLastName || ""}`.trim() || "Non renseigné"
          : "Non communiqué"
      }
    }))
    : [];

  const events = [...availabilityEvents, ...bookingEvents];

  function isEditableAvailability(event) {
    return editableFlag && event?.extendedProps?.sourceType === 'availability';
  }

  function formatDate(date) {
    if (!date) {
      return "Non renseigné";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function formatDateTimeLocal(date) {
    if (!date) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function showEventDetails(event) {
    if (!eventModal) {
      return;
    }

    selectedEvent = event;

    const editableAvailability = isEditableAvailability(event);

    detailsTitle.textContent = event.title || "Créneau";
    detailsStart.textContent = formatDate(event.start);
    detailsEnd.textContent = formatDate(event.end);
    detailsLocation.textContent = event.extendedProps.displayLocation || "Non communiqué";
    detailsComment.textContent = event.extendedProps.displayComment || "Non communiqué";
    detailsParticipant.textContent = event.extendedProps.participant || "Non communiqué";

    if (editableAvailability && editStartInput && editEndInput) {
      editStartInput.value = formatDateTimeLocal(event.start);
      editEndInput.value = formatDateTimeLocal(event.end);
    }

    if (eventModalEdit) {
      eventModalEdit.classList.toggle('hidden', !editableAvailability);
    }

    if (eventModalActions) {
      eventModalActions.classList.toggle('hidden', !editableAvailability);
    }

    eventModal.classList.remove('hidden');
  }

  function closeEventModal() {
    selectedEvent = null;

    if (!eventModal) {
      return;
    }

    eventModal.classList.add('hidden');
  }

  function deleteEvent(event) {
    const availabilityId = event.extendedProps.recordId;

    fetch(`/scheduleinterpreters/${availabilityId}`, {
      method: 'DELETE'
    })
      .then((res) => {
        if (res.ok) {
          event.remove();
          closeEventModal();
          alert('Événement supprimé !');
        } else {
          alert('Erreur lors de la suppression');
        }
      })
      .catch((err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de la suppression');
      });
  }

  function saveEventTimes() {
    if (!selectedEvent || !isEditableAvailability(selectedEvent) || !editStartInput || !editEndInput) {
      return;
    }

    if (!editStartInput.value || !editEndInput.value) {
      alert('Merci de renseigner les deux horaires.');
      return;
    }

    const newStart = new Date(editStartInput.value);
    const newEnd = new Date(editEndInput.value);

    if (Number.isNaN(newStart.getTime()) || Number.isNaN(newEnd.getTime()) || newStart >= newEnd) {
      alert('Le créneau saisi est invalide.');
      return;
    }

    fetch(`/scheduleinterpreters/${selectedEvent.extendedProps.recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDateTime: newStart.toISOString(),
        endDateTime: newEnd.toISOString()
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erreur lors de la mise a jour');
        }

        return res.json();
      })
      .then(() => {
        selectedEvent.setStart(newStart);
        selectedEvent.setEnd(newEnd);
        showEventDetails(selectedEvent);
        alert('Horaires modifies avec succes !');
      })
      .catch((err) => {
        console.error('Erreur:', err);
        alert("Erreur lors de la mise a jour des horaires");
      });
  }

  if (deleteSelectedEventBtn) {
    deleteSelectedEventBtn.addEventListener('click', () => {
      if (!selectedEvent) {
        return;
      }

      if (confirm('Supprimer ce créneau ?')) {
        deleteEvent(selectedEvent);
      }
    });
  }

  if (saveSelectedEventBtn) {
    saveSelectedEventBtn.addEventListener('click', saveEventTimes);
  }

  if (closeEventModalBtn) {
    closeEventModalBtn.addEventListener('click', closeEventModal);
  }

  if (eventModal) {
    eventModal.addEventListener('click', (event) => {
      if (event.target === eventModal) {
        closeEventModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && eventModal && !eventModal.classList.contains('hidden')) {
      closeEventModal();
    }
  });

  function isCompactScreen() {
    return window.innerWidth <= compactBreakpoint;
  }

  function getResponsiveHeaderToolbar() {
    if (isCompactScreen()) {
      return {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridDay'
      };
    }

    return {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    };
  }

  function syncCalendarResponsiveLayout(calendar) {
    const compact = isCompactScreen();
    const expectedView = compact ? 'timeGridDay' : 'timeGridWeek';

    calendar.setOption('headerToolbar', getResponsiveHeaderToolbar());
    calendar.setOption('dayHeaderFormat', compact
      ? { weekday: 'short', day: '2-digit', month: '2-digit' }
      : { weekday: 'short', day: 'numeric' });
    calendar.setOption('titleFormat', compact
      ? { month: 'short', day: 'numeric' }
      : { year: 'numeric', month: 'long' });
    calendar.setOption('buttonText', compact
      ? { today: 'Auj.', month: 'Mois', week: 'Semaine', day: 'Jour' }
      : { today: 'Aujourd’hui', month: 'Mois', week: 'Semaine', day: 'Jour' });

    if (calendar.view.type !== expectedView) {
      calendar.changeView(expectedView);
    }
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: isCompactScreen() ? 'timeGridDay' : 'timeGridWeek',
    locale: 'fr',
    selectable: editableFlag,
    editable: editableFlag,
    headerToolbar: getResponsiveHeaderToolbar(),
    events,
    select: function (info) {
      if (!editableFlag) return;

      const interventionType = prompt('Type d\'intervention (ex: Réunion, Santé)');
      if (!interventionType) {
        calendar.unselect();
        return;
      }

      const comment = prompt('Commentaire (optionnel)');
      const location = prompt('Lieu (optionnel)');

      // Envoyer au serveur
      const startDateTime = info.start.toISOString();
      const endDateTime = info.end.toISOString();

      fetch('/scheduleinterpreters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDateTime,
          endDateTime,
          interventionType,
          comment: comment || null,
          location: location || null
        })
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }

          throw new Error("Erreur lors de l'enregistrement");
        })
        .then((data) => {
          if (data?.availability) {
            // Ajouter au calendrier côté client
            const createdEvent = calendar.addEvent({
              id: `availability-${data.availability.id_availability}`,
              title: interventionType,
              start: info.start,
              end: info.end,
              editable: true,
              extendedProps: {
                sourceType: 'availability',
                recordId: data.availability.id_availability,
                comment: comment || '',
                location: location || '',
                displayLocation: location || 'Non renseigné',
                displayComment: comment || 'Aucun',
                participant: 'Non communiqué',
                interpreterId: interpreter.id_user
              }
            });
            showEventDetails(createdEvent);
            alert('Disponibilité enregistrée !');
          }
        })
        .catch((err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de l\'enregistrement');
        })
        .finally(() => {
          calendar.unselect();
        });
    },
    eventDrop: function (info) {
      if (!editableFlag || info.event.extendedProps.sourceType !== 'availability') {
        info.revert();
        alert("Ce créneau est occupé.");
        return;
      }

      const availabilityId = info.event.extendedProps.recordId;
      const startDateTime = info.event.start.toISOString();
      const endDateTime = info.event.end.toISOString();

      fetch(`/scheduleinterpreters/${availabilityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDateTime,
          endDateTime
        })
      })
        .then((res) => {
          if (!res.ok) {
            info.revert();
            alert('Erreur lors du déplacement');
            return;
          }

          showEventDetails(info.event);
        })
        .catch((err) => {
          console.error('Erreur:', err);
          info.revert();
          alert('Erreur lors du déplacement');
        });
    },
    eventClick: function (info) {
      if (!editableFlag) {
        showEventDetails(info.event);
        return;
      }

      showEventDetails(info.event);
    }
  });

  calendar.render();
  syncCalendarResponsiveLayout(calendar);

  window.addEventListener('resize', () => {
    syncCalendarResponsiveLayout(calendar);
  });
});
