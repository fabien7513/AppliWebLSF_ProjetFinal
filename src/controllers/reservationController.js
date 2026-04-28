import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";

const prisma = new PrismaClient({ adapter });

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris"
  }).format(date);
}

function formatMonthLabel(date) {
  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
      timeZone: "Europe/Paris"
    }).format(date)
  );
}

function formatStatus(status) {
  const labels = {
    PENDING: "En attente",
    ACCEPTED: "Acceptée",
    REFUSED: "Refusée",
    CANCELLED: "Annulée"
  };

  return labels[status] || status;
}

function mapReservation(event) {
  return {
    id: event.id_demande,
    title: event.interventionType || "Demande d'interprétation",
    location: event.location || "Lieu non renseigne",
    comment: event.message,
    startDateTime: event.startDateTime,
    status: event.status,
    statusLabel: formatStatus(event.status),
    counterpartLabel: "Client",
    counterpartName: `${event.clientFirstName || ""} ${event.clientLastName || ""}`.trim() || "Non renseigné",
    counterpartEmail: event.clientEmail || "",
    counterpartPhone: event.clientPhone || "",
    startLabel: formatDateTime(event.startDateTime),
    endLabel: formatDateTime(event.endDateTime)
  };
}

function groupReservationsByMonth(reservations) {
  const groups = [];
  let currentKey = null;

  for (const reservation of reservations) {
    const monthLabel = formatMonthLabel(reservation.startDateTime);

    if (monthLabel !== currentKey) {
      currentKey = monthLabel;
      groups.push({
        label: monthLabel,
        reservations: []
      });
    }

    groups[groups.length - 1].reservations.push(reservation);
  }

  return groups;
}

export async function getReservation(req, res) {
  try {
    const userId = req.session.user?.id_user;

    if (!userId) {
      return res.redirect("/login");
    }

    const now = new Date();
    const events = await prisma.event.findMany({
      where: {
        interpreterId: userId
      },
      orderBy: {
        startDateTime: "asc"
      }
    });

    const upcomingReservations = events
      .filter((event) => event.endDateTime >= now)
      .map(mapReservation);

    const pastReservations = events
      .filter((event) => event.endDateTime < now)
      .map(mapReservation)
      .reverse();

    const pastReservationGroups = groupReservationsByMonth(pastReservations);

    res.render("pages/reservations.twig", {
      title: "mesReservations",
      upcomingReservations,
      pastReservationGroups
    });
  } catch (error) {
    console.log(error);
    res.render("pages/reservations.twig", {
      title: "mesReservations",
      upcomingReservations: [],
      pastReservationGroups: [],
      error: "Impossible de charger vos reservations pour le moment."
    });
  }
}
