function validate() {
    console.log("forgotpass")
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    var phoneNum = $('#phoneNumber').val().trim()

   
    if (vnf_regex.test(phoneNum)) {
        $('#phoneNumber').removeClass('warning')
        $('#warning').text('')
    }
    else {
        $('#phoneNumber').addClass('warning')
        $('#warning').text('Số điện thoại không đúng định dạng!')
        return false
    }
   
    $.ajax({
        
        url: "/fermeh/fogot-password",
        method: "POST",
        // data: { mail: mail }
        data: { phoneNum:phoneNum}
        
    })
        .done((res) => {
            console.log(res)
            if (res.done == true) {
                let phone = phoneNum;
                phone = '+84' + phone.substring(1);
                alert('OTP đã được gửi qua tin nhắn điện thoại của bạn!')
                window.location.href = "http://localhost:3000/fermeh/OTP/" + phone
             
            } else {
                $('#warning').text(res.message)
            }
        })
        .fail(() => {
            alert('ajax fail!')
        })
    return false
}