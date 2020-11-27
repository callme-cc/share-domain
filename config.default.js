module.exports={
cf:{ // cloudflare api配置
    email:'zcmimi@outlook.com',
    key:'*************************************',
    zone_name:'kksk.best'
},
mailer:{ // 邮件发送配置
    mailer:{
        host:"smtp.office365.com",
        port:587,
        auth:{
            user: "zcmimi@outlook.com",
            pass: "*****************"
        }
    },
    from: "zcmimi<zcmimi@outlook.com>"
},
limit:{ // 限制
    per:3 // 每个邮箱最多享有几个二级域名
}
}