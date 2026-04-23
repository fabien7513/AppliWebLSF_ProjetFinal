import { Router } from "express";

const legalrouter = Router();

legalrouter.get("/mentions-legales", (req, res) => {
  res.render("pages/mentions-legales.twig", {
    title: "Mentions légales"
  });
});

legalrouter.get("/confidentialite", (req, res) => {
  res.render("pages/confidentialite.twig", {
    title: "Politique de confidentialité"
  });
});

export default legalrouter;
