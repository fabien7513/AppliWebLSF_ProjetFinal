import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
import { hashPasswordExtension } from "../../prisma/extensions/hastPasswordExtension.js";
const prisma = new PrismaClient({ adapter }).$extends(hashPasswordExtension);
import bcrypt from "bcrypt";

//...........................................INSCRIPTION......................................................
export function getRegister(req, res) {
    res.render("pages/register.twig", {
        title: "Inscription"
    })
}

export async function postRegister(req, res) {
    try {
        const { id_user, lastName, firstName, mail, description, photo, password, phone, siretNumber, profilStatus, planning_public } = req.body;
        await prisma.user.create({
            data: {
                id_user,
                lastName,
                firstName,
                mail,
                description,
                photo,
                password,
                phone,
                siretNumber,
                profilStatus,
                planning_public
            }
        })
        res.redirect("/login")
    }
    catch (error) {
        let errors = {};
        
        // Gestion des erreurs Prisma avec MariaDB adapter
        if (error.code === "P2002") {
            const originalMessage = error.meta?.driverAdapterError?.cause?.originalMessage || "";
            
            if (originalMessage.includes("User_mail_key")) {
                errors.email = "Cet email est déjà utilisé";
            }
            if (originalMessage.includes("User_siretNumber_key")) {
                errors.siretNumber = "Ce numéro SIRET est déjà enregistré";
            }
            if (originalMessage.includes("User_id_user_key")) {
                errors.id_user = "Cet identifiant est déjà utilisé";
            }
            
            if (Object.keys(errors).length === 0) {
                errors.general = "Une ou plusieurs valeurs existent déjà";
            }
        } else {
            errors.general = "Erreur lors de l'inscription";
        }
        
        res.render("pages/register.twig", {
            title: "Inscription",
            errors: errors
        })
    }
}

//...........................................CONNEXION......................................................
export async function getLogin(req, res) {
    res.render("pages/login.twig", {
        title: "Connexion"
    })
}

export async function postLogin(req, res) {
    const { siretNumber, password, confirm_password } = req.body
    try {
        const user = await prisma.user.findFirst({
            where: {
                siretNumber: req.body.siretNumber
            }
        })
        if (user) {
            if (await bcrypt.compare(req.body.password, user.password)) {
                // trouve utilisateur et affiche dans le bouton "Nom et Prenom"
                req.session.user = {
                    id_user: user.id_user,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
                res.redirect("/")
            }
            else {
                throw { password: "Mauvais mot de passe" }
            }
        }
        else {
            throw { siretNumber: "Cet utilisateur n'est pas enregistré" }
        }
    } catch (error) {
        console.log(error);
        res.render("pages/login.twig",
            {
                title: "Connexion",
                error
            })

    }

}


// //...........................................DECONNEXION......................................................
export async function logout(req, res) {
    req.session.destroy()
    res.redirect('/')
}