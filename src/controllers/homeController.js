import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";

const prisma = new PrismaClient({ adapter });

export async function getHome(req, res) {
  try {
    const interpreters = await prisma.user.findMany({
      where: {
        role: "INTERPRETER"
      },
      include: {
        address: true
      }
    });

    res.render("pages/home.twig", {
      title: "Accueil",
      interpreters
    });
  } catch (error) {
    console.log(error);
    res.render("pages/home.twig", {
      title: "Accueil",
      interpreters: []
    });
  }
}
