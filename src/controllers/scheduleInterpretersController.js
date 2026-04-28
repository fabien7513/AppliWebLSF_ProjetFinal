import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
const prisma = new PrismaClient({ adapter });

export async function getScheduleInterpreters(req, res) {
  try {
    const selectedUserId = Number(req.query.userId) || req.session.user?.id_user;

    if (!selectedUserId) {
      return res.redirect("/interpreters");
    }

    const interpreter = await prisma.user.findUnique({
      where: { id_user: selectedUserId },
      include: {
        availabilities: {
          orderBy: {
            startDateTime: "asc"
          }
        },
        interpreterEvents: {
          where: {
            status: "ACCEPTED"
          },
          orderBy: {
            startDateTime: "asc"
          }
        }
      }
    });

    if (!interpreter || interpreter.role !== "INTERPRETER") {
      return res.redirect("/interpreters");
    }

    const isOwner = req.session.user?.id_user === interpreter.id_user;


    res.render("pages/scheduleInterpreters.twig", {
      title: "Planning interprète",
      interpreter,
      availabilities: interpreter.availabilities,
      bookings: interpreter.interpreterEvents,
      editable: isOwner
    });

  } catch (error) {
    console.error(error);
    res.redirect("/interpreters");
  }
}

export async function postScheduleInterpreters(req, res) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Non autorisé" });
    }

    if (req.session.user.role !== "INTERPRETER") {
      return res.status(403).json({ error: "Accès réservé aux interprètes" });
    }

    const { startDateTime, endDateTime, interventionType, comment, location } = req.body;
    const userId = req.session.user.id_user;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ error: "Dates manquantes" });
    }

    const availability = await prisma.availability.create({
      data: {
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        interventionType: interventionType || null,
        comment: comment || null,
        location: location || null,
        userId
      }
    });

    // Si c'est un appel fetch JSON, retourner JSON
    if (req.headers['content-type']?.includes('application/json')) {
      return res.json({ success: true, availability });
    }

    // Sinon rediriger (ancien comportement)
    res.redirect(`/scheduleinterpreters?userId=${userId}`);
  } catch (error) {
    console.error(error);
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.status(500).send("Erreur serveur");
  }
}

export async function deleteScheduleInterpreters(req, res) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Non autorisé" });
    }

    if (req.session.user.role !== "INTERPRETER") {
      return res.status(403).json({ error: "Accès réservé aux interprètes" });
    }

    const { id } = req.params;
    const userId = req.session.user.id_user;

    // Vérifier que l'availability appartient bien à l'utilisateur
    const availability = await prisma.availability.findUnique({
      where: { id_availability: parseInt(id) }
    });

    if (!availability || availability.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    await prisma.availability.delete({
      where: { id_availability: parseInt(id) }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function putScheduleInterpreters(req, res) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Non autorisé" });
    }

    if (req.session.user.role !== "INTERPRETER") {
      return res.status(403).json({ error: "Accès réservé aux interprètes" });
    }

    const { id } = req.params;
    const { startDateTime, endDateTime } = req.body;
    const userId = req.session.user.id_user;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ error: "Dates manquantes" });
    }

    // Vérifier que l'availability appartient bien à l'utilisateur
    const availability = await prisma.availability.findUnique({
      where: { id_availability: parseInt(id) }
    });

    if (!availability || availability.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const updated = await prisma.availability.update({
      where: { id_availability: parseInt(id) },
      data: {
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime)
      }
    });

    res.json({ success: true, availability: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
