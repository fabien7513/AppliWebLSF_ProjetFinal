import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";

const prisma = new PrismaClient({ adapter });

// Fonction pour géocoder une adresse
async function geocodeAddress(street, city, postalCode) {
  try {
    const addressString = `${street || ""} ${postalCode || ""} ${city || ""}`.trim();
    
    // Ajouter un délai pour respecter les limites de Nominatim
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressString)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'AppliWebLSF/1.0 (Node.js)'
        }
      }
    );

    // Vérifier le statut HTTP
    if (!response.ok) {
      console.log(`Erreur géocodage HTTP ${response.status}`);
      return { latitude: null, longitude: null };
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.log("Erreur lors du géocodage:", error.message);
  }

  return { latitude: null, longitude: null };
}

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
        // Récupérer les coordonnées géographiques
        const { latitude, longitude } = await geocodeAddress(address, city, postalCode);
        console.log(latitude);
        
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
              city: city || "",
              latitude: latitude,
              longitude: longitude
            }
          });
        } else {
          await tx.address.create({
            data: {
              street: address || "",
              postalCode: postalCode || "",
              city: city || "",
              latitude: latitude,
              longitude: longitude,
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
