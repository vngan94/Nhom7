var rewritePass = document.querySelector("#eyeRewritePass")
var newPass = document.querySelector("#eyeNewPass")
var settingItem = document.querySelectorAll(".setting-item")
var editLocate = document.querySelectorAll('.btn-edit-locate')
var deleteLocate = document.querySelectorAll('.btn-delete-locate')
var setdefaultLocate = document.querySelectorAll('.btn-setdefault-locate')
rewritePass.onclick = () => {
    if (document.querySelector("#rewritePass").type === 'password') {
        document.querySelector("#rewritePass").type = 'text'
    }
    else {
        document.querySelector("#rewritePass").type = 'password'
    }
}
newPass.onclick = () => {
    if (document.querySelector("#newPass").type === 'password') {
        document.querySelector("#newPass").type = 'text'
    }
    else {
        document.querySelector("#newPass").type = 'password'
    }
}
function chkDisplay() {
    for (let i of settingItem) {
        if (i.children[3].style.display === 'block') {
            i.children[0].classList.remove('width-100')
            i.children[1].style.display = 'block'
            i.children[2].style.display = 'block'
            i.children[3].style.display = 'none'
            i.style.backgroundColor = '#fff'
        }
    }
}
for (let i of settingItem) {
    i.children[2].onclick = () => {
        chkDisplay();
        i.children[0].classList.add('width-100')
        i.children[1].style.display = 'none'
        i.children[2].style.display = 'none'
        i.children[3].style.display = 'block'
        i.style.backgroundColor = '#ccc'
    }
    i.children[3].children[3].onclick = () => {
        i.children[0].classList.remove('width-100')
        i.children[1].style.display = 'block'
        i.children[2].style.display = 'block'
        i.children[3].style.display = 'none'
        i.style.backgroundColor = '#fff'
    }
}

$('#btnEditLocateBack').click(() => {
    $('#edit_locate_form_contain').removeClass('display-block')
    $('body').removeClass('prevent-scrolling')
})
$('.btn-edit-locate').click(() => {
    document.querySelector('#formEditLocate').action = "http://localhost:3000/fermeh/user/setting/update-locate"
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/request-locate-tinh",
        method: "POST"
    })
        .fail(() => {
            console.log('ajax tỉnh fail')
        })
        .done((res) => {
            for (let obj of res.tinh) {
                $('#selectEditLocateTinh').append(`<option value="${obj.MATP}">${obj.TEN}</option>`)
            }
        })
    $('#edit_locate_form_contain').addClass('display-block')
    $('body').addClass('prevent-scrolling')
    $('#selectEditLocateHuyen').prop('disabled', true)
    $('#selectEditLocateXa').prop('disabled', true)
})
//------------------------sua,xoa dia chi------------------------------
// hien form sua dia chi
// hien form sua dia chi
// hien form sua dia chi
for (let i of editLocate) {
    if (i.parentElement.parentElement.parentElement.children[3].value == 'true') {
        i.parentElement.children[1].disabled = true
        i.parentElement.parentElement.children[1].children[0].disabled = true
        i.parentElement.parentElement.parentElement.children[0].children[0].children[2].classList.add('display-block')
    }
    i.onclick = () => {
        resetEditLocateForm()
        let name = i.parentElement.parentElement.parentElement.children[0].children[0].children[1].innerText
        let phone = i.parentElement.parentElement.parentElement.children[0].children[1].children[1].innerText
        let locate = i.parentElement.parentElement.parentElement.children[0].children[2].children[1].innerText
        let kind = i.parentElement.parentElement.parentElement.children[2]
        let tinh = i.parentElement.parentElement.parentElement.children[6].value
        let huyen = i.parentElement.parentElement.parentElement.children[5].value
        let xa = i.parentElement.parentElement.parentElement.children[4].value
        let defaultLocate = i.parentElement.parentElement.parentElement.children[3]
        document.querySelector('#inputEditLocateName').value = name
        document.querySelector('#inputEditLocatePhone').value = phone
        document.querySelector('#inputEditLocateDetail').value = locate
        document.querySelector("#inputIDDCEditLocate").value = i.parentElement.parentElement.parentElement.children[7].value
        if (kind.value == 'home') {
            $('#radioEditLocateHome').prop('checked', true);
        }
        else {
            $('#radioEditLocateOffice').prop('checked', true);
        }
        if (defaultLocate.value == 'true') {
            $('#checkboxEditLocate').prop('checked', true);
            $('#checkboxEditLocate').prop('disabled', true);
        }
        $('#btnAddLocateSubmit').hide()
        $('#btnEditLocateSubmit').show()
        // $('#btnAddLocateSubmit').prop('id', '#btnEditLocateSubmit')
        $('#selectEditLocateHuyen').prop('disabled', false)
        $('#selectEditLocateTinh').empty()
        $('#selectEditLocateTinh').append(`<option value="tinh">Tỉnh/Thành phố</option>`)
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-tinh",
            method: "POST"
        })
            .fail(() => {
                console.log('ajax tỉnh fail')
            })
            .done((res) => {
                for (let obj of res.tinh) {
                    if (obj.MATP == tinh) {
                        $('#selectEditLocateTinh').append(`<option value="${obj.MATP}" selected>${obj.TEN}</option>`)
                    } else {
                        $('#selectEditLocateTinh').append(`<option value="${obj.MATP}">${obj.TEN}</option>`)
                    }
                }
            })
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-huyen",
            method: "POST",
            data: { matinh: tinh }
        })
            .fail(() => { console.log('request huyện fail') })
            .done((res) => {
                for (let obj of res.huyen) {
                    if (obj.MAQH == huyen) {
                        $('#selectEditLocateHuyen').append(`<option value="${obj.MAQH}" selected>${obj.TEN}</option>`)
                    } else {
                        $('#selectEditLocateHuyen').append(`<option value="${obj.MAQH}">${obj.TEN}</option>`)
                    }
                }
            })
        $('#selectEditLocateXa').prop('disabled', false)
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-xa",
            method: "POST",
            data: { mahuyen: huyen }
        })
            .fail(() => { console.log('request xã fail') })
            .done((res) => {
                for (let obj of res.xa) {
                    if (obj.MAXA == xa) {
                        $('#selectEditLocateXa').append(`<option value="${obj.MAXA}" selected>${obj.TEN}</option>`)
                    } else {
                        $('#selectEditLocateXa').append(`<option value="${obj.MAXA}">${obj.TEN}</option>`)
                    }
                }
            })
        console.log(parseInt(tinh), parseInt(huyen), parseInt(xa))
        let artinh = Array.from(document.querySelector('#selectEditLocateTinh').children)
        console.log(artinh)
        let arhuyen = Array.from(document.querySelector('#selectEditLocateHuyen').children)
        let arxa = Array.from(document.querySelector('#selectEditLocateXa').children)
        console.log(arhuyen)
        console.log(arxa)
        for (let jk of artinh) {
            console.log(parseInt(jk.value))
            if (parseInt(jk.value) === parseInt(tinh)) {
                jk.selected = true
                break
            }
        }
        for (let jk of arhuyen) {
            console.log(parseInt(jk.value))
            if (parseInt(jk.value) === parseInt(huyen)) {

                jk.selected = true
                break
            }
        }
        for (let jk of arxa) {
            console.log(parseInt(jk.value))
            if (parseInt(jk.value) === parseInt(xa)) {

                jk.selected = true
                break
            }
        }

    }
}
// hien form sua dia chi
// hien form sua dia chi
for (let i of deleteLocate) {
    i.onclick = () => {
        let id = parseInt(i.parentElement.parentElement.parentElement.children[7].value)
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-delete-locate",
            method: "POST",
            data: { iddc: id }
        })
            .fail(() => { console.log('request ajax delete element fail') })
            .done(() => { })
        location.reload()
    }
}
//------------------------sua,xoa dia chi------------------------------
$('#selectEditLocateTinh').change(() => {
    $('#selectEditLocateHuyen').empty()
    $('#selectEditLocateHuyen').append(`<option value="huyen">Quận/Huyện</option>`)
    $('#selectEditLocateXa').empty()
    $('#selectEditLocateXa').append(`<option value="xa">Phường/Xã</option>`)
    $('#selectEditLocateXa').prop('disabled', true)
    let va = document.querySelector('#selectEditLocateTinh').value
    if (va != 'tinh') {
        $('#selectEditLocateHuyen').prop('disabled', false)
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-huyen",
            method: "POST",
            data: { matinh: va.trim() }
        })
            .fail(() => { console.log('request huyện fail') })
            .done((res) => {
                for (let obj of res.huyen) {
                    $('#selectEditLocateHuyen').append(`<option value="${obj.MAQH}">${obj.TEN}</option>`)
                }
            })

    }
    else {
        $('#selectEditLocateHuyen').prop('disabled', true)
        $('#selectEditLocateXa').prop('disabled', true)
    }
})

$('#selectEditLocateHuyen').change(() => {
    $('#selectEditLocateXa').empty()
    $('#selectEditLocateXa').append(`<option value="xa">Phường/Xã</option>`)
    let va = document.querySelector('#selectEditLocateHuyen').value
    if (va != 'huyen') {
        $('#selectEditLocateXa').prop('disabled', false)
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-xa",
            method: "POST",
            data: { mahuyen: va.trim() }
        })
            .fail(() => { console.log('request xã fail') })
            .done((res) => {
                for (let obj of res.xa) {
                    $('#selectEditLocateXa').append(`<option value="${obj.MAXA}">${obj.TEN}</option>`)
                }
            })
    }
    else {
        $('#selectEditLocateXa').prop('disabled', true)
    }
})
function resetEditLocateForm() {
    document.querySelector('#inputEditLocateName').value = ""
    document.querySelector('#inputEditLocateName').classList.remove('input-border-warning')
    document.querySelector('#inputEditLocatePhone').value = ""
    document.querySelector('#inputEditLocatePhone').classList.remove('input-border-warning')
    document.querySelector('#inputEditLocateDetail').value = ""
    document.querySelector('#inputEditLocateDetail').classList.remove('input-border-warning')
    $('#selectEditLocateTinh').empty()
    $('#selectEditLocateTinh').append(`<option selected value="tinh">Tỉnh/Thành phố</option>`)
    $('#selectEditLocateHuyen').empty()
    $('#selectEditLocateHuyen').append(`<option selected value="huyen">Quận/Huyện</option>`)
    $('#selectEditLocateXa').empty()
    $('#selectEditLocateXa').append(`<option selected value="xa">Phường/Xã</option>`)
    $('#checkboxEditLocate').removeAttr('checked');
    $('#radioEditLocateHome').prop('checked', false);
    $('#radioEditLocateOffice').prop('checked', false);
    $('#checkboxEditLocate').prop('checked', false);
    $('#checkboxEditLocate').prop('disabled', false);
    $('#spanWarningLocateForm').text('')
    $('#inputEditLocateName').removeClass('input-border-warning')
    $('#selectEditLocateTinh').removeClass('input-border-warning')
    $('#selectEditLocateHuyen').removeClass('input-border-warning')
    $('#selectEditLocateXa').removeClass('input-border-warning')
    // $('.spanDefaultLocateLabel').removeClass('display-block')

}
//
//
for (let i of setdefaultLocate) {
    i.onclick = (e) => {
        e.preventDefault()
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/set-default-locate-btn",
            method: "POST",
            data: { IDDC: i.parentElement.parentElement.parentElement.children[7].value }
        })
            .fail(() => {
                console.log("setdefault Locate btn failed!!!")
            })
            .done((res) => {
                location.reload()
            })
    }
}
//
//
$('#btnEditAddLocate').click(() => {
    document.querySelector('#formEditLocate').action = "http://localhost:3000/fermeh/user/setting/new-locate"
    resetEditLocateForm()
    $('#btnEditLocateSubmit').hide()
    $('#btnAddLocateSubmit').show()
    // $('#btnEditLocateSubmit').prop('id', '#btnAddLocateSubmit')
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/request-locate-tinh",
        method: "POST"
    })
        .fail(() => {
            console.log('ajax tỉnh fail')
        })
        .done((res) => {
            for (let obj of res.tinh) {
                $('#selectEditLocateTinh').append(`<option value="${obj.MATP}">${obj.TEN}</option>`)
            }
        })
    let tmp = document.querySelector('.user-location').children[1].innerText.trim()
    if (tmp === '') {
        $('#checkboxEditLocate').prop('checked', true)
        $('#checkboxEditLocate').prop('disabled', true)
    }
    else {
        $('#checkboxEditLocate').prop('checked', false)
        $('#checkboxEditLocate').prop('disabled', false)
    }
    $('#edit_locate_form_contain').addClass('display-block')
    $('body').addClass('prevent-scrolling')
    $('#selectEditLocateHuyen').prop('disabled', true)
    $('#selectEditLocateXa').prop('disabled', true)
})
// submit them dia chi moi validate

$('#btnAddLocateSubmit').click((e) => {
    console.log('add btn click')
    e.preventDefault()
    let name = $('#inputEditLocateName').val()
    let phone = $('#inputEditLocatePhone').val()
    let locate = $('#inputEditLocateDetail').val()
    let tinh = $('#selectEditLocateTinh').val()
    let huyen = $('#selectEditLocateHuyen').val()
    let xa = $('#selectEditLocateXa').val()
    let chkbox = $('#checkboxEditLocate').prop('checked')
    let radioHome = $('#radioEditLocateHome').prop('checked')
    let radioOffice = $('#radioEditLocateOffice').prop('checked')
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/validate-new-form-locate",
        method: "POST",
        data: { name: name, phone: phone, locate: locate, tinh: tinh, huyen: huyen, xa: xa, chkbox: chkbox, radioHome: radioHome, radioOffice: radioOffice, add: true, edit: false }
    })
        .fail(() => {
            console.log("request ajax validate fail")
        })
        .done((res) => {
            console.log('ajax done!')
            console.log(res)
            if (res.name == false) {
                $('#spanWarningLocateForm').text('Họ và tên không hợp lệ!')
                $('#inputEditLocateName').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#inputEditLocateName').removeClass('input-border-warning')
            }
            if (res.phone == false) {
                $('#spanWarningLocateForm').text('Số điện thoại không hợp lệ!')
                $('#inputEditLocatePhone').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#inputEditLocatePhone').removeClass('input-border-warning')
            }
            if (res.locate == false) {
                $('#spanWarningLocateForm').text('Địa chỉ không hợp lệ!')
                $('#inputEditLocateDetail').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#inputEditLocateDetail').removeClass('input-border-warning')
            }
            if (res.tinh == false) {
                $('#spanWarningLocateForm').text('Vui lòng chọn tỉnh!')
                $('#selectEditLocateTinh').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#selectEditLocateTinh').removeClass('input-border-warning')
            }
            if (res.huyen == false) {
                $('#spanWarningLocateForm').text('Vui lòng chọn huyện!')
                $('#selectEditLocateHuyen').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#selectEditLocateHuyen').removeClass('input-border-warning')
            }
            if (res.xa == false) {
                $('#spanWarningLocateForm').text('Vui lòng chọn xã!')
                $('#selectEditLocateXa').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#selectEditLocateXa').removeClass('input-border-warning')
            }
            if (res.radio == false) {
                $('#spanWarningLocateForm').text('Vui lòng chọn loại địa chỉ!')
                $('#radioEditLocateHome').addClass('input-border-warning')
                $('#radioEditLocateOffice').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#radioEditLocateHome').removeClass('input-border-warning')
                $('#radioEditLocateOffice').removeClass('input-border-warning')
                $('#edit_locate_form_contain').removeClass('display-block')
                $('body').removeClass('prevent-scrolling')
                location.reload()
            }
        })
})

$('#btnEditLocateSubmit').click(async (e) => {
    console.log('edit btn click')
    e.preventDefault()
    let name = $('#inputEditLocateName').val()
    let phone = $('#inputEditLocatePhone').val()
    let locate = $('#inputEditLocateDetail').val()
    let tinh = $('#selectEditLocateTinh').val()
    let huyen = $('#selectEditLocateHuyen').val()
    let xa = $('#selectEditLocateXa').val()
    let chkbox = $('#checkboxEditLocate').prop('checked')
    let radioHome = $('#radioEditLocateHome').prop('checked')
    let radioOffice = $('#radioEditLocateOffice').prop('checked')
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/validate-new-form-locate",
        method: "POST",
        data: {
            name: name, phone: phone, locate: locate, tinh: tinh, huyen: huyen, xa: xa,
            chkbox: chkbox, radioHome: radioHome, radioOffice: radioOffice, add: false, edit: true,
            IDDC: document.querySelector("#inputIDDCEditLocate").value
        }
    })
        .fail(() => {
            console.log("request ajax validate fail")
        })
        .done((res) => {
            console.log('ajax done!')
            console.log(res)
            if (res.name == false) {
                $('#spanWarningLocateForm').text('Họ và tên không hợp lệ!')
                $('#inputEditLocateName').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#inputEditLocateName').removeClass('input-border-warning')
            }
            if (res.phone == false) {
                $('#spanWarningLocateForm').text('Số điện thoại không hợp lệ!')
                $('#inputEditLocatePhone').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#inputEditLocatePhone').removeClass('input-border-warning')
            }
            if (res.locate == false) {
                $('#spanWarningLocateForm').text('Địa chỉ không hợp lệ!')
                $('#inputEditLocateDetail').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#inputEditLocateDetail').removeClass('input-border-warning')
            }
            if (res.tinh == false) {
                $('#spanWarningLocateForm').text('Vui lòng chọn tỉnh!')
                $('#selectEditLocateTinh').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#selectEditLocateTinh').removeClass('input-border-warning')
            }
            if (res.huyen == false) {
                $('#spanWarningLocateForm').text('Vui lòng chọn huyện!')
                $('#selectEditLocateHuyen').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#selectEditLocateHuyen').removeClass('input-border-warning')
            }
            if (res.xa == false) {
                $('#spanWarningLocateForm').text('Vui lòng chọn xã!')
                $('#selectEditLocateXa').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#selectEditLocateXa').removeClass('input-border-warning')
            }
            if (res.radio == false) {
                $('#spanWarningLocateForm').text('Vui lòng chọn loại địa chỉ!')
                $('#radioEditLocateHome').addClass('input-border-warning')
                $('#radioEditLocateOffice').addClass('input-border-warning')
                return
            }
            else {
                $('#spanWarningLocateForm').text('')
                $('#radioEditLocateHome').removeClass('input-border-warning')
                $('#radioEditLocateOffice').removeClass('input-border-warning')
                $('#edit_locate_form_contain').removeClass('display-block')
                $('body').removeClass('prevent-scrolling')
                location.reload()
            }
        })
})
$('#btnChangeUsername').click((e) => {
    e.preventDefault()
    let newName = document.querySelector("#newName").value
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/setting/change-username",
        method: "POST",
        data: { name: newName }
    })
        .fail(() => { })
        .done((res) => {
            if (res.error === false) {
                $('#label_warning_change_username').text("Tên phải có ít nhất 4 kí tự gồm chữ hoặc số")
                $('#newName').addClass('input-border-warning')
            }
            else {
                $('#newName').removeClass('input-border-warning')
                $('#label_warning_change_username').text("")
                location.reload()
            }
        })
})
$('#btnChangePhoneNumber').click((e) => {
    e.preventDefault()
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/setting/change-phonenumber",
        method: "POST",
        data: { phone: document.querySelector("#newPhone").value }
    })
        .fail(() => { })
        .done((res) => {
            if (res.error === false) {
                $('#label_warning_change_phone').text("Số điện thoại không đúng hoặc đã tồn tại!")
                $('#newPhone').addClass('input-border-warning')
            }
            else {
                $('#newPhone').removeClass('input-border-warning')
                $('#label_warning_change_phone').text("")
                location.reload()
            }
        })
})
$('#btnChangeEmail').click((e) => {
    e.preventDefault()
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/setting/change-email",
        method: "POST",
        data: { email: document.querySelector("#newEmail").value }
    })
        .fail(() => { })
        .done((res) => {
            if (res.error === false) {
                $('#label_warning_change_email').text("Email không hợp lệ hoặc đã tồn tại!")
                $('#newEmail').addClass('input-border-warning')
            }
            else {
                $('#newEmail').removeClass('input-border-warning')
                $('#label_warning_change_email').text("")
                location.reload()
                // $('#email_after_update').text(res.mail)
            }
        })
})
$('#btnChangePassword').click((e) => {
    e.preventDefault()
    console.log('click change pass')
    $.ajax({
        url: "http://localhost:3000/fermeh/ajax/setting/change-password",
        method: "POST",
        data: { currentpass: document.querySelector("#rewritePass").value, newpass: document.querySelector("#newPass").value }
    })
        .fail(() => { })
        .done((res) => {
            if (res.error === false) {
                $('#label_warning_change_password').text("Mật khẩu không đúng!!")
                $('#newPass').addClass('input-border-warning')
                $('#currentPass').addClass('input-border-warning')
            }
            else {
                $('#newPass').removeClass('input-border-warning')
                $('#currentPass').removeClass('input-border-warning')
                $('#label_warning_change_password').text("")
                location.reload()
            }
        })
})