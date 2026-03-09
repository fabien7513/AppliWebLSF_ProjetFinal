import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
const prisma = new PrismaClient({ adapter });

export function getHome(req, res) {
  res.render("pages/home.twig", {
    title: "Home"
  });
}