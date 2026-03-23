document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  if (!calendarEl) {
    console.error('Elément #calendar non trouvé');
    return;
  }

  const editableFlag = typeof editable !== 'undefined' && editable === true;

  const events = Array.isArray(availabilities)
    ? availabilities.map((a) => ({
        id: a.id_availability,
        title: a.interventionType || 'Disponibilité',
        start: a.startDateTime,
        end: a.endDateTime,
        extendedProps: {
          comment: a.comment || '',
          interpreterId: a.userId || null
        }
      }))
    : [];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    locale: 'fr',
    selectable: editableFlag,
    editable: editableFlag,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events,
    select: function (info) {
      if (!editableFlag) return;

      const interventionType = prompt('Type d\'intervention (ex: Réunion, Santé)');
      if (!interventionType) {
        calendar.unselect();
        return;
      }

      const comment = prompt('Commentaire (optionnel)');

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
          comment: comment || null
        })
      })
        .then((res) => {
          if (res.ok) {
            // Ajouter au calendrier côté client
            calendar.addEvent({
              title: interventionType,
              start: info.start,
              end: info.end,
              extendedProps: {
                comment: comment || '',
                interpreterId: interpreter.id_user
              }
            });
            alert('Disponibilité enregistrée !');
          } else {
            alert('Erreur lors de l\'enregistrement');
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
      if (!editableFlag) {
        info.revert();
        return;
      }

      const availabilityId = info.event.id;
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
          }
        })
        .catch((err) => {
          console.error('Erreur:', err);
          info.revert();
          alert('Erreur lors du déplacement');
        });
    },
    eventClick: function (info) {
      if (!editableFlag) {
        alert(`Commentaire : ${info.event.extendedProps.comment || 'Aucun'}`);
        return;
      }

      if (confirm('Supprimer cet événement ?')) {
        const availabilityId = info.event.id;

        fetch(`/scheduleinterpreters/${availabilityId}`, {
          method: 'DELETE'
        })
          .then((res) => {
            if (res.ok) {
              info.event.remove();
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
    }
  });

  calendar.render();
});
