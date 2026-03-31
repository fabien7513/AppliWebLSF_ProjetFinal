import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";

const prisma = new PrismaClient({ adapter });

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

    if (!interpreter) {
      return res.redirect("/interpreters");
    }

    res.render("pages/request.twig", {
      title: "Faire une demande",
      interpreter,
      search: {
        meetingAddress: req.query.meetingAddress || "",
        date: req.query.date || "",
        startTime: req.query.startTime || "",
        endTime: req.query.endTime || ""
      },
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

    if (!interpreter) {
      return res.redirect("/interpreters");
    }

    const { meetingAddress, date, startTime, endTime, message } = req.body;

    // Pour l'instant, on n'enregistre pas encore en base
    // On affiche juste un message de succès

    res.render("pages/request.twig", {
      title: "Faire une demande",
      interpreter,
      search: {
        meetingAddress,
        date,
        startTime,
        endTime
      },
      success: "Votre demande a bien été envoyée.",
      error: null
    });
  } catch (error) {
    console.log(error);
    res.render("pages/request.twig", {
      title: "Faire une demande",
      interpreter: null,
      search: null,
      success: null,
      error: "Erreur lors de l'envoi de la demande."
    });
  }
}
