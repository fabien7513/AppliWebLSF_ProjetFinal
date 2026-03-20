import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
const prisma = new PrismaClient({ adapter });



export async function getListInterpreters(req, res) {
  try {
    const interpreters = await prisma.user.findMany({
      include: {
        address: true
      }
    });

    res.render("pages/interpreters.twig", {
      title: "Liste des interprètes",
      interpreters
    });
  } catch (error) {
    console.log(error);
    res.render("pages/interpreters.twig", {
      title: "Liste des interprètes",
      interpreters: [],
      error: "Erreur chargement interprètes"
    });
  }
}