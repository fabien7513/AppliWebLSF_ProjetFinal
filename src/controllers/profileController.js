import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";

const prisma = new PrismaClient({ adapter });

export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id_user: req.session.user.id_user
      },
      include: {
        address: true
      }
    });

    if (!user) {
      return res.redirect("/login");
    }

    res.render("pages/profile.twig", {
      title: "Mon Profil",
      user,
      success: req.query.success ?? null,
      error: null
    });
  } catch (error) {
    console.log(error);
    res.render("pages/profile.twig", {
      title: "Mon Profil",
      user: null,
      success: null,
      error: "Erreur lors du chargement du profil"
    });
  }
}

export async function postProfile(req, res) {
  try {
    const {
      lastName,
      firstName,
      address,
      postalCode,
      city,
      phone,
      mail,
      description
    } = req.body;

    const currentUser = await prisma.user.findUnique({
      where: {
        id_user: req.session.user.id_user
      },
      include: {
        address: true
      }
    });

    if (!currentUser) {
      return res.redirect("/login");
    }

    let photoPath = currentUser.photo;

    if (req.file) {
      photoPath = "/static/uploads/" + req.file.filename;
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id_user: req.session.user.id_user
        },
        data: {
          lastName,
          firstName,
          phone,
          mail,
          description,
          photo: photoPath
        }
      });

      const hasAddressData =
        address?.trim() || postalCode?.trim() || city?.trim();

      if (hasAddressData) {
        const existingAddress = await tx.address.findUnique({
          where: {
            id_user: req.session.user.id_user
          }
        });

        if (existingAddress) {
          await tx.address.update({
            where: {
              id_user: req.session.user.id_user
            },
            data: {
              street: address || "",
              postalCode: postalCode || "",
              city: city || ""
            }
          });
        } else {
          await tx.address.create({
            data: {
              street: address || "",
              postalCode: postalCode || "",
              city: city || "",
              id_user: req.session.user.id_user
            }
          });
        }
      }
    });

    res.redirect("/profile?success=Profil enregistré avec succès");
  } catch (error) {
    console.log(error);

    const user = await prisma.user.findUnique({
      where: {
        id_user: req.session.user.id_user
      },
      include: {
        address: true
      }
    });

    res.render("pages/profile.twig", {
      title: "Mon Profil",
      user,
      success: null,
      error: "Erreur lors de la mise à jour du profil"
    });
  }
}