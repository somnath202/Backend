import mailgen from 'mailgen'
import nodemailer from "nodemailer"

const sendEmail = async (options)=>{
    const mailGenerator = new mailgen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"http://taskmanager.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHTML = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PROT,
        auth:{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS,
        }
    })

    const mail = {
        from:"mailtaskmanager@example.com",
        to:options.email,
        text:emailTextual,
        html:emailHTML
    }

    try{
        await transporter.sendEmail(mail)
    }catch(error){
        console.error("Error occurs :",error)
    }
}

const emailVerificationMailgenContent = (username , verificationURL)=>{
    return {
        body:{
            name : username,
            intro : "welcome to our App we are excited to have you on board",
            action:{
                instructions:"To verify your email plese click on bellow button",
                button:{
                    color:"#1abb80",
                    text:"Verify your Email",
                    link:verificationURL
                }
            },
            outro:"Need help or any question , just reply to this email , we'd love to help you"
        }

    }
}



const forgotPasswordMailgenContent = (username , passwordResetURL)=>{
    return {
        body:{
            name : username,
            intro : "we got the request to reset password of of your account",
            action:{
                instructions:"To reset your password plese click on the bellow button",
                button:{
                    color:"#1a58bb",
                    text:"Reset Password",
                    link:passwordResetURL,
                }
            },
            outro:"Need help or any question , just reply to this email , we'd love to help you"
        }

    }
}

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail,
}