function validate() {
    
    var pass = $('#password').val().trim()
    var confirmPass = $('#confirmpassword').val().trim()
    var phoneNumber = $('#phoneNumber').val().trim()
    var regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    
    if (regex_password.test(pass)) {
        console.log("test")
        $('#password').removeClass('warning')
        $('#warning').text('')
    }
    else {
        $('#password').addClass('warning')
        $('#warning').text('Mật khẩu phải có ít nhất 8 kí tự và bao gồm số và các kí tự!')
        return false
    }
    
    if(pass!=confirmPass) {
        $('#confirmpassword').addClass('warning')
        $('#warning').text('Xác nhận mật không khớp')
        return false
    }
    else {
        $('#confirmpassword').removeClass('warning')
        $('#warning').text('')
       
    }
        $.ajax({
        url: "/fermeh/create-new-password", 
        method: "POST",
         data: { password: pass, phoneNumber: phoneNumber}
    })
        .done((res) => {
            if (res.done == true) {
                 alert('Tạo mật khẩu mới thành công!')
                
                window.location.href = "http://localhost:3000/fermeh/login" 
            } else {
                $('#warning').text(res.message)
            }
        })
        .fail(() => {
            alert('ajax fail!')
        })
    return false

}