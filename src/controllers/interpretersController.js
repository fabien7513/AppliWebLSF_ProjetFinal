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
      where: {
        role: "INTERPRETER"
      },
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
    const { meetingAddress, date, startTime, endTime } = req.query;

    if (!meetingAddress || !date || !startTime || !endTime) {
      return res.render("pages/interpreters.twig", {
        title: "Résultats de recherche",
        interpreters: [],
        error: "Merci de remplir l'adresse du rendez-vous, la date et les horaires."
      });
    }

    const requestedStart = new Date(`${date}T${startTime}:00`);
    const requestedEnd = new Date(`${date}T${endTime}:00`);
    const requestedLocation = await geocodeLocation(meetingAddress);

    if (
      Number.isNaN(requestedStart.getTime()) ||
      Number.isNaN(requestedEnd.getTime()) ||
      requestedStart >= requestedEnd
    ) {
      return res.render("pages/interpreters.twig", {
        title: "Résultats de recherche",
        interpreters: [],
        error: "Le créneau demandé est invalide."
      });
    }

    const interpreters = await prisma.user.findMany({
      where: {
        role: "INTERPRETER",
        NOT: [
          {
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
          },
          {
            interpreterEvents: {
              some: {
                status: "ACCEPTED",
                startDateTime: {
                  lt: requestedEnd
                },
                endDateTime: {
                  gt: requestedStart
                }
              }
            }
          }
        ]
      },
      include: {
        address: true
      }
    });

    const sortedInterpreters = interpreters
      .filter((interpreter) => hasCoordinates(interpreter.address) && requestedLocation)
      .map((interpreter) => {
        const distanceKm = getDistanceInKm(
          requestedLocation.latitude,
          requestedLocation.longitude,
          interpreter.address.latitude,
          interpreter.address.longitude
        );

        return {
          ...interpreter,
          distanceKm
        };
      })
      .filter((interpreter) => interpreter.distanceKm <= 150)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.render("pages/interpreters.twig", {
      title: "Résultats de recherche",
      interpreters: sortedInterpreters,
      search: {
        meetingAddress,
        date,
        startTime,
        endTime
      },
      error: sortedInterpreters.length === 0
        ? "Aucun interprète disponible pour cette recherche."
        : null
    });

  } catch (error) {
    console.log(error);
    res.render("pages/interpreters.twig", {
      title: "Résultats de recherche",
      interpreters: [],
      error: "Erreur lors de la recherche."
    });
  }
}
