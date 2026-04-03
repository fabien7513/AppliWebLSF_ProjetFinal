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

function mapAvailability(availability) {
  return {
    id: availability.id_availability,
    title: availability.interventionType || "Creneau reserve",
    location: availability.location || "Lieu non renseigne",
    comment: availability.comment,
    startLabel: formatDateTime(availability.startDateTime),
    endLabel: formatDateTime(availability.endDateTime)
  };
}

function groupReservationsByMonth(availabilities) {
  const groups = [];
  let currentKey = null;

  for (const availability of availabilities) {
    const monthLabel = formatMonthLabel(availability.startDateTime);

    if (monthLabel !== currentKey) {
      currentKey = monthLabel;
      groups.push({
        label: monthLabel,
        reservations: []
      });
    }

    groups[groups.length - 1].reservations.push(mapAvailability(availability));
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
    const availabilities = await prisma.availability.findMany({
      where: {
        userId
      },
      orderBy: {
        startDateTime: "asc"
      }
    });

    const upcomingReservations = availabilities
      .filter((availability) => availability.endDateTime >= now)
      .map(mapAvailability);

    const pastReservations = availabilities
      .filter((availability) => availability.endDateTime < now)
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
