function validate() {
    $('#phoneNumber').removeClass('warning')
    $('#password').removeClass('warning')
    var pass = $('#password').val().trim()
    var phoneNum = $('#phoneNumber').val().trim()
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    var regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (vnf_regex.test(phoneNum)) {
        $('#phoneNumber').removeClass('warning')
        $('.label-anoun').text('')
    }
    else {
        $('#phoneNumber').addClass('warning')
        $('.label-anoun').text('Số điện thoại không đúng định dạng!')
        return false
    }
    if (regex_password.test(pass)) {
        $('#password').removeClass('warning')
        $('.label-anoun').text('')
    }
    else {
        $('#password').addClass('warning')
        $('.label-anoun').text('Mật khẩu phải ít nhất 8 kí tự!')
        return false
    }
    var s
    var confirm = $.ajax({
        url: "/fermeh/login",
        method: "POST",
        data: { phoneNumber: $('#phoneNumber').val(), password: $('#password').val() }
    })
        .done((res) => {
            s = res
            if (res.done == true) {
                alert('Đăng nhập thành công!')
                window.location.href = "http://localhost:3000/fermeh"
            }
            else {
                $('#phoneNumber').addClass('warning')
                $('#password').addClass('warning')
                $('.label-anoun').text(res.error)
                return false
            }
        })
        .fail(() => {
            alert('Đăng nhập thất bại!')
            return false
        })
    return false
}