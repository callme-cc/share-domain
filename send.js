"use strict"
const nodemailer=require('nodemailer');
var config,transporter;
// 发送邮件
async function send(to,subject,html){    
    var info=await transporter.sendMail({from:config.from,to,subject,html});
    return info;
};
async function sendToken(email,token){
    return await send(email,'Your token (from kksk.best)',
        `Your token: <strong><b>${token}</b></strong>`,);
}
// (async function test(){
//     config=require("./config").mailer;
//     transporter=nodemailer.createTransport(config.mailer);
//     console.log(await sendToken('zcmimiksp@gmail.com','fdasfasg'));
// })();
module.exports=(conf)=>{
    config=conf;
    transporter=nodemailer.createTransport(config.mailer);
    return {sendToken}
};