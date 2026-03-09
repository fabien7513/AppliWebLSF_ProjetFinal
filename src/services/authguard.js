import { PrismaClient } from "../../generated/prisma/client.js";
import { adapter } from "../../prisma/adapter.js";
const prisma = new PrismaClient({ adapter })

export async function authguard (req, res, next) {
    try {
        if (req.session.user){
            const user = await prisma.user.findUnique({
                select:{
                    id_user:true,
                    lastName:true,
                    firstName:true,
                    mail:true,
                    description:true,
                    photo:true,
                    password:true,
                    phone:true,
                    siretNumber:true,
                    profilStatus:true,
                    planning_public:true
                },
                where:{
                    id_user: req.session.user
                }
            })
            if (user) {
                req.user = user
                return next()
            }
            else
                throw new Error ("L'utilisateur a été surpprimé de la base de données")
        }
        else{
            throw new Error("Aucun utilisateur enregistré en session");
            
        }
        
    } catch (error) {
        console.log(error);
        res.redirect("/login")
        
    }
}