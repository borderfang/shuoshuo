
      //登录验证
      $( function() {
        // // //验证用户名;
        // $("#username").blur( function() {
        //   $("#pname").html("");
        //   var reg = /^([A-Za-z]|[\u4E00-\u9FA5])+$/;
        //   regUsername = reg.test($(this).val());
        //   if( !regUsername ){
        //      $("#pname").html("*用户名必须为字母或者汉字");
        //   }
        // })
        // //验证密码；
        // $("#password").blur( function() {
        //   $("#pword").html("");
        //   var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/;
        //   regPassword = reg.test($(this).val());
        //   if( !regPassword ){
        //     $("#pword").html("*密码必须是6至11位字母、数字或者下划线");
        //   } 
        // })
        //提交登录；
        $("#subbtn").click( function() {
          $.post("/dologin", {
            "username": $("#username").val(),
            "password": $("#password").val()
          }, function(data) {
            if(data == "-1"){
              //用户尚未注册；
              $("#danger-block").slideDown( function() {
                $(this).html('您还没有注册，请先完成注册<a href="/regist">去注册</a>');
                setTimeout( fn1, 3000);
              })
            }else if(data == "-2"){
              //服务器错误；
              $("#danger-block").slideDown( function() {
                $(this).html('服务器错误');
                setTimeout( fn1, 3000);
              })

            }else if(data == "-4"){
              //密码错误；
               $("#danger-block").slideDown( function() {
                $(this).html('您输入的密码有误，请重新输入');
                setTimeout( fn1, 3000);
              })

            }else{
              //登录成功；
              alert("恭喜您，登录成功。即将跳转到首页")
              window.location.href = "/";
            }
          })
        })
        
        // 提醒；
        function fn1() {
           $("#danger-block").slideUp();
        }


      })
