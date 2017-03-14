var express = require("express");
var app = express();
var router = require("./route/router.js");
var session = require("express-session");

//设置session;
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

//使用ejs模版引擎；
app.set("view engine", "ejs");
//设置静态资源管理；
app.use(express.static("./public"));
app.use("/avatar", express.static("./avatar"));
//首页；
app.get("/", router.showIndex);
//注册页面；
app.get("/regist", router.showRegist);
//接收注册信息；
app.post("/doregist", router.doRegist);
//登录页面；
app.get("/login", router.showLogin);
//登录验证；
app.post("/dologin", router.doLogin);
//上传图像页面；
app.get("/showavatar", router.showSetAvatar);
//上传头像业务；
app.post("/doavatar", router.doAvatar);
//发表说说业务；
app.post("/domessage", router.doMessage);
//获得所有的留言信息；
app.get("/getallmessage", router.getAllmessage);
//获得个人头像；
app.get("/getallavatar", router.getAllavatar);
//获取总的留言条目；
app.get("/getallcounts", router.getAllcounts);
//我的说说；
app.get("/user/:users", router.myShuoShuo);
//成员列表；
app.get("/allmember", router.allMember);
//退出登录；
app.get("/getout", router.getOut);

app.listen(3000);
console.log("Running at http://127.0.0.1:3000");