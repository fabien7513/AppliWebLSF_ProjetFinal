import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
import { hashPasswordExtension } from "../../prisma/extensions/hastPasswordExtension.js";
const prisma = new PrismaClient({ adapter }).$extends(hashPasswordExtension);
import bcrypt from "bcrypt";

//...........................................INSCRIPTION......................................................
export function getRegister(req, res) {
    res.render("pages/register.twig", {
        title: "Inscription",
        errors: {},
        formData: {}
    })
}

export async function postRegister(req, res) {
    try {
        const {
            lastName,
            firstName,
            mail,
            confirm_mail,
            password,
            confirm_password,
            siretNumber
        } = req.body;
        const errors = {};

        if (!lastName?.trim()) {
            errors.lastName = "Le nom est requis";
        }

        if (!firstName?.trim()) {
            errors.firstName = "Le prénom est requis";
        }

        if (!mail?.trim()) {
            errors.email = "L'email est requis";
        }

        if (mail !== confirm_mail) {
            errors.confirmEmail = "Les emails ne correspondent pas";
        }

        if (!password) {
            errors.password = "Le mot de passe est requis";
        }

        if (password !== confirm_password) {
            errors.confirmPassword = "Les mots de passe ne correspondent pas";
        }

        if (!siretNumber?.trim()) {
            errors.siretNumber = "Le numéro SIRET est requis pour un interprète";
        }

        if (Object.keys(errors).length > 0) {
            return res.render("pages/register.twig", {
                title: "Inscription",
                errors,
                formData: {
                    lastName,
                    firstName,
                    mail,
                    confirm_mail,
                    siretNumber
                }
            });
        }

        await prisma.user.create({
            data: {
                lastName: lastName.trim(),
                firstName: firstName.trim(),
                mail: mail.trim().toLowerCase(),
                password,
                siretNumber: siretNumber.trim(),
                role: "INTERPRETER",
                profilStatus: "INTERPRETER",
                photo:"/static/uploads/1776175297887.png"
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
            errors: errors,
            formData: {
                lastName: req.body.lastName,
                firstName: req.body.firstName,
                mail: req.body.mail,
                confirm_mail: req.body.confirm_mail,
                siretNumber: req.body.siretNumber
            }
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
    try {
        const user = await prisma.user.findFirst({
            where: {
                mail: req.body.email?.trim().toLowerCase()
            }
        })
        if (user) {
            if (await bcrypt.compare(req.body.password, user.password)) {
                // trouve utilisateur et affiche dans le bouton "Nom et Prenom"
                req.session.user = {
                    id_user: user.id_user,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
                res.redirect("/")
            }
            else {
                throw { password: "Mauvais mot de passe" }
            }
        }
        else {
            throw { email: "Cet utilisateur n'est pas enregistré" }
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
