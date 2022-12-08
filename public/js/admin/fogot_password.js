/**
 * Created by duongdx on 4/30/18.
//  */
// var http = require('http');
// var https = require('https');
// const ACCESS_TOKEN = "qrHMGLbV9mXaS5ud5DEODrpc1rMsk11P";

// const sendSMS = function (phones, content, type, sender) {
//     var url = 'api.speedsms.vn';
//     var params = JSON.stringify({
//         to: phones,
//         content: content,
//         sms_type: type,
//         sender: sender
//     });

//     var buf = Buffer.from(ACCESS_TOKEN + ':x');
//     var auth = "Basic " + buf.toString('base64');
//     const options = {
//         hostname: url,
//         port: 443,
//         path: '/index.php/sms/send',
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': auth
//         }
//     };

//     const req = https.request(options, function (res) {
//         res.setEncoding('utf8');
//         var body = '';
//         res.on('data', function (d) {
//             body += d;
//         });
//         res.on('end', function () {
//             var json = JSON.parse(body);
//             if (json.status == 'success') {
//                 console.log("send sms success")
//             }
//             else {
//                 console.log("send sms failed " + body);
//             }
//         });
//     });

//     req.on('error', function (e) {
//         console.log("send sms failed: " + e);
//     });

//     req.write(params);
//     req.end();
// }

// //send test sms
// sendSMS(['your phone number'], "test ná»™i dung sms", 2, '');

$('#btnSubmitEmail').click((e) => {
    var mail = $('#inputEmailid').val().trim()
    e.preventDefault()
    let regex_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (regex_email.test(mail)) {
        $('#warning_text').text("")
        $('#inputEmailid').removeClass('warning')
    } else {
        $('#warning_text').text("Email không hợp lệ!!")
        $('#inputEmailid').addClass('warning')
    }
    $.ajax({
        url: "/fermeh/admin/email/send-new-pass",
        method: "POST",
        data: { email: mail }
    })
        .done((res) => {
            if (res.done === true) {
                alert('Đổi mật khẩu thành công! Check email của bạn để nhận mật khẩu mới!')
                window.location.assign('http://localhost:3000/fermeh/admin/login')
            } else {
                $('#warning_text').text(`${res.message}`)
                $('#inputEmailid').addClass('warning')
            }
        })
        .fail(() => {

        })
})