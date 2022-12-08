function validate() {
  
    // var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    // var phoneNum = $('#phoneNumber').val().trim()
    var OTP_regex = /^[0-9]{6}$/;
    var  OTP = $('#OTP').val().trim()
    var  phoneNumber = $('#phoneNumber').val().trim()
    console.log("OTP", OTP)
    // if (regexMail.test(mail)) {
    //     $('#emailUser').removeClass('warning')
    //     $('#warning').text('')
    // }
    // else {
    //     $('#emailUser').addClass('warning')
    //     $('#warning').text('Địa chỉ email không hợp lệ!')
    //     return false
    // }
    if (OTP_regex.test(OTP)) {
        $('#OTP').removeClass('warning')
        $('#warning').text('')
    }
    else {
        $('#OTP').addClass('warning')
        $('#warning').text('Mã OTP gồm 6 chữ số!')
        return false
    }
    
    $.ajax({
        url: "/fermeh/OTP",
        method: "POST",
        data: { OTP:OTP, phoneNumber: phoneNumber}
        
        
    })
        .done((res) => {
            if (res.done == true) {
               
                window.location.href = "http://localhost:3000/fermeh/create-new-password/" + phoneNumber
            } else {
                $('#warning').text(res.message)
            }
        })
        .fail(() => {
            alert('ajax fail!')
        })
    return false
}