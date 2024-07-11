const nodemailer = require('nodemailer')
const htmlToText = require('html-to-text')

module.exports = class Email {
    constructor(user) {
        this.to = user.email,
            this.from = `Pranay Dak <${process.env.EMAIL_FROM}>`
    }

    newTransporter() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(subject, text) {
        const html = text
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html)
        }

        await this.newTransporter().sendMail(mailOptions)
    }

    async sendWelcome(text) {
        await this.send('Welcome to our family!', text)
    }
} 