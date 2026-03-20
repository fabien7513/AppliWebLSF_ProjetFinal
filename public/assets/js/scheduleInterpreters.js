document.addEventListener('DOMContentLoaded', function () {

  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {

    initialView: 'timeGridWeek',
    locale: 'fr',
    selectable: true,
    editable: true,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    events: [
      {
        title: 'Rendez-vous Marseille',
        start: '2026-03-11T09:00:00',
        end: '2026-03-11T11:00:00'
      }
    ],

    select: function(info) {

      const title = prompt("Nom de l'événement :");

      if (title) {
        calendar.addEvent({
          title: title,
          start: info.start,
          end: info.end,
          allDay: info.allDay
        });
      }

      calendar.unselect();

    },

    eventClick: function(info) {

      if (confirm("Supprimer cet événement ?")) {
        info.event.remove();
      }

    }

  });

  calendar.render();

});
