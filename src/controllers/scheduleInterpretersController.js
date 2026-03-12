import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
const prisma = new PrismaClient({ adapter });


export function getScheduleInterpreters(req, res) {
  res.render("pages/scheduleInterpreters.twig", {
    title: "planningInterprète"
  });
}