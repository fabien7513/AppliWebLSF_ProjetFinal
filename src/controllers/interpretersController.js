import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
const prisma = new PrismaClient({ adapter });



export function getListInterpreters(req, res) {
  res.render("pages/interpreters.twig", {
    title: "ListInterpreters"
  });
}