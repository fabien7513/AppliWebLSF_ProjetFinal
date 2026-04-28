import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";

const prisma = new PrismaClient({ adapter });

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

function formatStatus(status) {
  const labels = {
    PENDING: "En attente",
    ACCEPTED: "Acceptée",
    REFUSED: "Refusée",
    CANCELLED: "Annulée"
  };

  return labels[status] || status;
}

function mapInterpreterRequest(event) {
  return {
    id: event.id_demande,
    title: event.interventionType || "Demande d'interprétation",
    location: event.location,
    message: event.message,
    status: event.status,
    statusLabel: formatStatus(event.status),
    clientName: `${event.clientFirstName || ""} ${event.clientLastName || ""}`.trim() || "Client inconnu",
    clientMail: event.clientEmail || "",
    clientPhone: event.clientPhone || "",
    startLabel: formatDateTime(event.startDateTime),
    endLabel: formatDateTime(event.endDateTime)
  };
}

export async function getInterpreterRequests(req, res) {
  try {
    if (!req.session.user?.id_user) {
      return res.redirect("/login");
    }

    if (req.user?.role !== "INTERPRETER") {
      return res.redirect("/reservations");
    }

    const interpreterId = req.session.user.id_user;

    const [pendingRequests, handledRequests] = await Promise.all([
      prisma.event.findMany({
        where: {
          interpreterId,
          status: "PENDING"
        },
        orderBy: {
          startDateTime: "asc"
        }
      }),
      prisma.event.findMany({
        where: {
          interpreterId,
          status: {
            not: "PENDING"
          }
        },
        orderBy: {
          startDateTime: "desc"
        }
      })
    ]);

    res.render("pages/interpreterRequests.twig", {
      title: "Demandes reçues",
      pendingRequests: pendingRequests.map(mapInterpreterRequest),
      handledRequests: handledRequests.map(mapInterpreterRequest),
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.log(error);
    res.render("pages/interpreterRequests.twig", {
      title: "Demandes reçues",
      pendingRequests: [],
      handledRequests: [],
      success: null,
      error: "Impossible de charger les demandes pour le moment."
    });
  }
}

export async function acceptInterpreterRequest(req, res) {
  try {
    if (!req.session.user?.id_user) {
      return res.redirect("/login");
    }

    if (req.user?.role !== "INTERPRETER") {
      return res.redirect("/reservations");
    }

    const interpreterId = req.session.user.id_user;
    const requestId = Number(req.params.id);

    const event = await prisma.event.findUnique({
      where: {
        id_demande: requestId
      }
    });

    if (!event || event.interpreterId !== interpreterId) {
      return res.redirect("/interpreter/requests?error=Demande introuvable.");
    }

    if (event.status !== "PENDING") {
      return res.redirect("/interpreter/requests?error=Cette demande a déjà été traitée.");
    }

    const [availabilityConflict, acceptedEventConflict] = await Promise.all([
      prisma.availability.findFirst({
        where: {
          userId: interpreterId,
          startDateTime: {
            lt: event.endDateTime
          },
          endDateTime: {
            gt: event.startDateTime
          }
        }
      }),
      prisma.event.findFirst({
        where: {
          interpreterId,
          status: "ACCEPTED",
          id_demande: {
            not: requestId
          },
          startDateTime: {
            lt: event.endDateTime
          },
          endDateTime: {
            gt: event.startDateTime
          }
        }
      })
    ]);

    if (availabilityConflict || acceptedEventConflict) {
      return res.redirect("/interpreter/requests?error=Conflit détecté sur ce créneau.");
    }

    await prisma.event.update({
      where: {
        id_demande: requestId
      },
      data: {
        status: "ACCEPTED"
      }
    });

    res.redirect("/interpreter/requests?success=La demande a été acceptée.");
  } catch (error) {
    console.log(error);
    res.redirect("/interpreter/requests?error=Erreur lors de l'acceptation.");
  }
}

export async function refuseInterpreterRequest(req, res) {
  try {
    if (!req.session.user?.id_user) {
      return res.redirect("/login");
    }

    if (req.user?.role !== "INTERPRETER") {
      return res.redirect("/reservations");
    }

    const interpreterId = req.session.user.id_user;
    const requestId = Number(req.params.id);

    const event = await prisma.event.findUnique({
      where: {
        id_demande: requestId
      }
    });

    if (!event || event.interpreterId !== interpreterId) {
      return res.redirect("/interpreter/requests?error=Demande introuvable.");
    }

    if (event.status !== "PENDING") {
      return res.redirect("/interpreter/requests?error=Cette demande a déjà été traitée.");
    }

    await prisma.event.update({
      where: {
        id_demande: requestId
      },
      data: {
        status: "REFUSED"
      }
    });

    res.redirect("/interpreter/requests?success=La demande a été refusée.");
  } catch (error) {
    console.log(error);
    res.redirect("/interpreter/requests?error=Erreur lors du refus.");
  }
}
