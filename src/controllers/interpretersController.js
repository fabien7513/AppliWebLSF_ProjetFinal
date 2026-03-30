import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
const prisma = new PrismaClient({ adapter });

async function geocodeLocation(location) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "AppliWebLSF/1.0 (Node.js)"
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.log("Erreur de geocodage:", error.message);
  }

  return null;
}

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function hasCoordinates(address) {
  return typeof address?.latitude === "number" && typeof address?.longitude === "number";
}



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


export async function searchInterpreters(req, res) {
  try {
    const { city, date, startTime, endTime } = req.query;

    if (!city || !date || !startTime || !endTime) {
      return res.render("pages/interpreters.twig", {
        title: "Résultats de recherche",
        interpreters: [],
        error: "Merci de remplir le lieu, la date et les horaires."
      });
    }

    const requestedStart = new Date(`${date}T${startTime}:00`);
    const requestedEnd = new Date(`${date}T${endTime}:00`);
    const requestedLocation = await geocodeLocation(city);

    if (
      Number.isNaN(requestedStart.getTime()) ||
      Number.isNaN(requestedEnd.getTime()) ||
      requestedStart >= requestedEnd
    ) {
      return res.render("pages/interpreters.twig", {
        title: "Resultats de recherche",
        interpreters: [],
        error: "Le creneau demande est invalide."
      });
    }

    const interpreters = await prisma.user.findMany({
      where: {
        NOT: {
          availabilities: {
            some: {
              startDateTime: {
                lt: requestedEnd
              },
              endDateTime: {
                gt: requestedStart
              }
            }
          }
        }
      },
      include: {
        address: true,
        availabilities: true
      }
    });

    const sortedInterpreters = interpreters
      .map((interpreter) => {
        const distanceKm =
          requestedLocation && hasCoordinates(interpreter.address)
            ? getDistanceInKm(
                requestedLocation.latitude,
                requestedLocation.longitude,
                interpreter.address.latitude,
                interpreter.address.longitude
              )
            : null;

        return {
          ...interpreter,
          distanceKm
        };
      })
      .sort((a, b) => {
        const distanceA = typeof a.distanceKm === "number" ? a.distanceKm : Number.POSITIVE_INFINITY;
        const distanceB = typeof b.distanceKm === "number" ? b.distanceKm : Number.POSITIVE_INFINITY;

        if (distanceA !== distanceB) {
          return distanceA - distanceB;
        }

        return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr", {
          sensitivity: "base"
        });
      });

    res.render("pages/interpreters.twig", {
      title: "Resultats de recherche",
      interpreters: sortedInterpreters,
      search: {
        city,
        date,
        startTime,
        endTime
      },
      error: sortedInterpreters.length === 0 ? "Aucun interprete disponible pour cette recherche." : null
    });

  } catch (error) {
    console.log(error);
    res.render("pages/interpreters.twig", {
      title: "Resultats de recherche",
      interpreters: [],
      error: "Erreur lors de la recherche."
    });
  }
}
