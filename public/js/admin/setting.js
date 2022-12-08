$('#btn_submit').click((e) => {
    e.preventDefault()
    var regex_password = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    oldpass = $('#mkcu').val()
    newpass = $('#mkmoi').val()
    console.log(oldpass, newpass)
    if (!regex_password.test(oldpass)) {
        $('#warningtext').text('Sai mật khẩu!!')
        $('#mkcu').addClass('warning')
        $('#mkmoi').addClass('warning')
        return
    }
    else {
        $('#warningtext').text('')
        $('#mkcu').removeClass('warning')
        $('#mkmoi').removeClass('warning')
    }
    if (!regex_password.test(newpass)) {
        $('#warningtext').text('Sai mật khẩu!!')
        $('#mkcu').addClass('warning')
        $('#mkmoi').addClass('warning')
        return
    }
    else {
        $('#warningtext').text('')
        $('#mkcu').removeClass('warning')
        $('#mkmoi').removeClass('warning')
    }
    $.ajax({
        url: "http://localhost:3000/fermeh/admin/setting/changepass",
        method: "POST",
        data: { mkcu: $('#mkcu').val().trim(), mkmoi: $('#mkmoi').val().trim(), tentk: $('#tentk').val().trim() }
    })
        .done((res) => {
            if (res.done == true) {
                alert('Đổi mật khẩu thành công!!')
                location.reload()
            }
            else {
                $('#warningtext').text('Mật khẩu không chính xác!!')
                $('#mkcu').removeClass('warning')
                $('#mkmoi').removeClass('warning')
            }
        })
        .fail(() => {
            alert('fail')
        })
})