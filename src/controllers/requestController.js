import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";

const prisma = new PrismaClient({ adapter });

function getRequestFormData(source = {}) {
  return {
    clientFirstName: source.clientFirstName || "",
    clientLastName: source.clientLastName || "",
    clientEmail: source.clientEmail || "",
    clientPhone: source.clientPhone || "",
    meetingAddress: source.meetingAddress || "",
    date: source.date || "",
    startTime: source.startTime || "",
    endTime: source.endTime || "",
    interventionType: source.interventionType || "",
    message: source.message || ""
  };
}

export async function getRequestPage(req, res) {
  try {
    const interpreter = await prisma.user.findUnique({
      where: {
        id_user: Number(req.params.id)
      },
      include: {
        address: true
      }
    });

    if (!interpreter || interpreter.role !== "INTERPRETER") {
      return res.redirect("/interpreters");
    }

    res.render("pages/request.twig", {
      title: "Faire une demande",
      interpreter,
      search: getRequestFormData(req.query),
      success: null,
      error: null
    });
  } catch (error) {
    console.log(error);
    res.redirect("/interpreters");
  }
}

export async function postRequestPage(req, res) {
  try {
    const interpreter = await prisma.user.findUnique({
      where: {
        id_user: Number(req.params.id)
      },
      include: {
        address: true
      }
    });

    if (!interpreter || interpreter.role !== "INTERPRETER") {
      return res.redirect("/interpreters");
    }

    const search = getRequestFormData(req.body);
    const {
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone,
      meetingAddress,
      date,
      startTime,
      endTime,
      interventionType,
      message
    } = search;

    if (!clientFirstName || !clientLastName || !clientEmail || !meetingAddress || !date || !startTime || !endTime) {
      return res.render("pages/request.twig", {
        title: "Faire une demande",
        interpreter,
        search,
        success: null,
        error: "Merci de renseigner vos coordonnées, le lieu, la date et les horaires."
      });
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (
      Number.isNaN(startDateTime.getTime()) ||
      Number.isNaN(endDateTime.getTime()) ||
      startDateTime >= endDateTime
    ) {
      return res.render("pages/request.twig", {
        title: "Faire une demande",
        interpreter,
        search,
        success: null,
        error: "Le créneau demandé est invalide."
      });
    }

    const [availabilityConflict, acceptedEventConflict] = await Promise.all([
      prisma.availability.findFirst({
        where: {
          userId: interpreter.id_user,
          startDateTime: {
            lt: endDateTime
          },
          endDateTime: {
            gt: startDateTime
          }
        }
      }),
      prisma.event.findFirst({
        where: {
          interpreterId: interpreter.id_user,
          status: "ACCEPTED",
          startDateTime: {
            lt: endDateTime
          },
          endDateTime: {
            gt: startDateTime
          }
        }
      })
    ]);

    if (availabilityConflict || acceptedEventConflict) {
      return res.render("pages/request.twig", {
        title: "Faire une demande",
        interpreter,
        search,
        success: null,
        error: "Cet interprète n'est plus disponible sur ce créneau."
      });
    }

    await prisma.event.create({
      data: {
        clientFirstName: clientFirstName.trim(),
        clientLastName: clientLastName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        clientPhone: clientPhone?.trim() || null,
        location: meetingAddress.trim(),
        startDateTime,
        endDateTime,
        interventionType: interventionType?.trim() || "Interprétation LSF",
        message: message?.trim() || null,
        interpreterId: interpreter.id_user
      }
    });

    res.render("pages/request.twig", {
      title: "Faire une demande",
      interpreter,
      search,
      success: "Votre demande a bien été envoyée.",
      error: null
    });
  } catch (error) {
    console.log(error);
    res.render("pages/request.twig", {
      title: "Faire une demande",
      interpreter: null,
      search: getRequestFormData(req.body),
      success: null,
      error: "Erreur lors de l'envoi de la demande."
    });
  }
}
