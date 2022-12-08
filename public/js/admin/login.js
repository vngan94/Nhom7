function validate() {
    $('#inputUsername').removeClass('warning')
    $('#inputChoosePassword').removeClass('warning')
    var username = $('#inputUsername').val()
    var password = $('#inputChoosePassword').val()
    username = username.toLowerCase();
    var regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    var regex_name = /^[a-zA-Z0-9]{6,}$/;
    if (regex_name.test(username)) {
        $('#warning-text').text('')
        $('#inputUsername').removeClass('warning')
    }
    else {
        $('#warning-text').text('Tên tài khoản phải ít nhất 6 kí tự')
        $('#inputUsername').addClass('warning')
        return false
    }
    if (regex_password.test(password)) {
        $('#warning-text').text('')
        $('#inputChoosePassword').removeClass('warning')
    }
    else {
        $('#warning-text').text('Mật khẩu phải ít nhất 8 kí tự!')
        $('#inputChoosePassword').addClass('warning')
        return false
    }
    $.ajax({
        url: "/fermeh/admin/login",
        method: "POST",
        data: { username: $('#inputUsername').val().trim(), password: $('#inputChoosePassword').val().trim() }
    })
        .done((res) => {
            if (res.done == true) {
                alert('Đăng nhập thành công!')
                window.location.href = "http://localhost:3000/fermeh/admin-site"
            }
            else {
                $('#warning-text').text(res.error)
                $('#inputUsername').addClass('warning')
                $('#inputChoosePassword').addClass('warning')
            }
        })
        .fail(() => {
            alert('Đăng nhập thất bại!')
        })
    return false
}