var formidable = require("formidable");
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var path = require("path");
var fs = require("fs");
module.exports = {
	//首页
	showIndex: function(req, res, next) {
		// if( req.session.login == "1" ){
		// 	db.find("member", {"username": req.session.username}, {}, function(err, result) {
		// 		res.render("index", {
		// 			"login": true,
		// 			"username": req.session.username,
		// 			"active": "index",
		// 			"avatar": result[0].avatar
		// 		});
		// 	next();	
		// 	})
			
		// }else{
		// 	res.render("index", {
		// 			"login": false,
		// 			"username": "",
		// 			"active": "index",
		// 			"avatar": "default.jpg"
		// 		});
		// 	next();
		// }
			if( req.session.login == "1" ){
				var login = true;
				var username = req.session.username;
			}else{
				var login = false;		
				var username = "";
			}
			db.find("member", {"username": username}, {}, function(err, result) {
				if( result.length == 0 ){
					var avatar = "default.jpg";
				}else{
					var avatar = result[0].avatar;					
				}
					res.render("index", {
						"login": login,
						"username": username,
						"active": "index",
						"avatar": avatar					
					});
					next();
				})							
		
	},
	//注册
	showRegist: function(req, res, next) {
		res.render("regist", {
			"login": req.session.login == "1" ? true : false,
			"username": req.session.login == "1" ? req.session.username : "",
			"active": "regist"		
		});
		next();
	},
	//提交注册用户到数据库；
	doRegist: function(req, res, next) {
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fileds, files) {
			if(err){
				console.log(err);
				return;
			}
			var username = fileds.username;
			var password = fileds.password;
			password = md5(md5(password) + "房");
			db.find("member", {"username": username}, {}, function(err, result) {
				if(err){
					console.log(err);
					res.send("-2"); //服务器错误；
				}
				if( result.length != 0 ){
					res.send("-1"); //数据库中已经有了该对象；
				}else{
					db.inserOne("member", {"username": username, "password": password, "avatar": "default.jpg"}, function(err, result){
						if(err){
							console.log(err);
							res.send("-3") //插入数据库失败；
						}
						req.session.login = "1";
						req.session.username = username;
						req.session.avatar = result.ops[0].avatar;
						res.send("1"); //插入数据成功
					}) 
				}
			})


		})
	},
	//登录
	showLogin: function(req, res, next) {
		res.render("login", {
			"login": req.session.login == "1" ? true : false,
			"username": req.session.login == "1" ? req.session.username : "",
			"active": "login"
		});
		next();
	},
	//登录验证；
	doLogin: function(req, res, next) {
		var form = formidable.IncomingForm();
		form.parse(req, function(err, fileds, files) {
			if(err){
				console.log(err);
				return;
			}
			var username = fileds.username;
			var password = fileds.password;
			password = md5(md5(password) + "房");
			db.find("member", {"username": username}, {}, function(err, result) {
				if(err){
					console.log(err);
					res.send("-2"); //服务器错误
					return;
				}
				if( result.length == 0 ){
					res.send("-1"); //该用户名尚未注册；
				}else if( password != result[0].password ){
					res.send("-4"); //密码输入不正确；
				}else{
					req.session.login = "1";
					req.session.username = username;
					res.send("1"); //登录成功；
				}
			})
		})
	},
	//上传头像页面；
	showSetAvatar: function(req, res, next) {
		if( req.session.login == "1" ){
				res.render("setavatar", {
					"login": true,
					"username": req.session.username,
					"active": "showSetAvatar"
				});
			next();				
		}else{
			res.send("非法操作，请先登录");
			next();
		}

	},
	//上传头像业务；
	doAvatar: function(req, res, next) {
		var form = new formidable.IncomingForm();
		form.uploadDir = path.normalize(__dirname + "/../avatar/");
		form.parse(req, function(err, fileds, files) {
			if(err){
				console.log(err);
			}
			 var oldpath = files.personalimage.path;
			 var newpath = path.normalize(__dirname + "/../avatar/") + req.session.username + ".jpg";
			fs.rename(oldpath, newpath, function(err) {
				if(err){
					res.send("上传失败");
					return;
				}
				req.session.avatar = req.session.username + ".jpg";
				db.updateMany("member", {"username": req.session.username}, {
					$set: { "avatar": req.session.avatar }
				}, function(err, result) {
					res.redirect("/");
					next();
				})
	
			})

		})
	},
	//发表说说业务；
	doMessage: function(req, res, next) {
		if( req.session.login != "1" ){
			res.send("非法操作，请先登录");
		}
		var username = req.session.username;
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fileds, files) {
			var message = fileds.messages;
			db.inserOne("membermsg", {"username": username, "datetime": new Date(), "message": message}, function(err, result) {
				if(err){
					console.log(err);
					res.send("-3"); //服务器错误
					return;
				}
				res.send("1"); //发表留言成功
				next();
			})
		})
	},
	//获得所有的留言信息；
	getAllmessage: function(req, res, next) {
		var page = req.query.page;
		db.find("membermsg", {}, {"pageamount": 6, "page": page, "sort": {"datetime": -1}}, function(err, result) {
			if(err){
				console.log(err);
				return;
			}
			//res.send({"r": result});
			res.send(result);
		})
	},
	//获得个人头像；
	getAllavatar: function(req, res, next) {
		var username = req.query.username;
		db.find("member", {"username": username}, {}, function(err, result) {
			if(err){
				console.log(err);
				return;
			}
			if(result.length == 0){
				res.send("请返回");
				return;
			}
			var obj = {
				"_id": result[0]._id,
				"username": result[0].username,
				"avatar": result[0].avatar
			}
			res.json(obj);
		})
	},
	//获取总的留言条数；
	getAllcounts: function(req, res, next) {
		db.getAllCounts("membermsg", function(err, count) {
			if(err){
				console.log(err);
				return;
			}
			res.send(count.toString());
		})
	},
	//我的说说页面；
	myShuoShuo: function(req, res, next) {
		var users = req.params["users"];
		db.find("membermsg", {"username": users}, {}, function(err, result1) {
			db.find("member", {"username": users}, {}, function(err, result2) {
				res.render("users", {
					"login": req.session.login == "1" ? true : false,
					"username": req.session.login == "1" ?  users: "",
					"active": "myshuoshuo",
					"shuoshuolists": result1,
					"perimg": result2
				});
				next();
			})
			
		})
		
	},
	//成员列表；
	allMember: function(req, res, next) {
		db.find("member", {}, {}, function(err, result) {
			res.render("allmember", {
				"login": req.session.login == "1" ? true : false,
				"username": req.session.login == "1" ?  req.session.username: "",
				"active": "allmember",
				"memberlists": result
			})
		})
	},
	//
	getOut: function(req, res, next) {
		req.session.login = "-1";
		req.session.username = "";
		res.redirect("/");
	}

}