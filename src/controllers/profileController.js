import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
const prisma = new PrismaClient({ adapter });


export function getProfile(req, res) {
  res.render("pages/profile.twig", {
    title: "profileInterpreter"
  });
}