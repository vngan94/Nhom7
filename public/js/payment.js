var allLocate = document.querySelectorAll('.user-locate')
var product = document.querySelectorAll('.product')
//xu ly phan dia chi
for (let i = 0; i < allLocate.length; i++) {
    $(allLocate[i]).hide();
}
if ($('#check_case').val() == '3') {
    $('#change_locate_link').show()
}
let k = 0;
for (let i of product) {
    for (let j of i.classList) if (j == 'disabled-item') k++;
}
if (k == product.length) $('#btn_submit_buy').prop('disabled', true)
var eventHandler = function (e) {
    e.preventDefault()
}
//--------------------XU LY PHAN CHON DIA CHI
$('#change_locate_link').click(() => {
    for (let i = 0; i < allLocate.length; i++) {
        $(allLocate[i]).show();
    }
    $('.btn-user-locate-contain').show()
    $('#change_locate_link').hide()
    $('#form_submit_a_locate').show()
})
$('#btn_user_locate_back').click(() => {
    for (let i = 0; i < allLocate.length; i++) {
        $(allLocate[i]).hide();
    }
    $('.btn-user-locate-contain').hide()
    $('#change_locate_link').show()
})
$('#btn_user_locate_submit').click(() => {
    if ($('#check_case').val() == '3') {
        for (let i of allLocate) {
            if (i.children[0].checked == true) {
                document.querySelector('#label_show_locate').innerHTML = `${i.children[1].innerHTML}`
            }
            $(i).hide()
            $('#change_locate_link').show()
        }
    }
})
//--------------------XU LY PHAN CHON DIA CHI
// $('#btn_submit_buy').click(async (e) => {
//     $('#btn_submit_buy').bind("click", eventHandler)
//     $('#btn_submit_buy').bind("submit", eventHandler)

//     //$('#btn_submit_buy').unbind("submit", eventHandler)
// })
function validate() {
    var regexName = /^[a-zA-Z ]{2,30}$/g;
    var regexSDT = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    var regexMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let name = $('#inputName').val()
    let mail = $('#inputMail').val()
    let sdtregex = $('#inputSDT').val()
    let dc = $('#inputDC').val()
    let tinh = $('#selectTinh').val()
    let huyen = $('#selectHuyen').val()
    let xa = $('#selectXa').val()
    name = name.toLowerCase();
    name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    name = name.replace(/đ/g, "d");
    console.log(name)
    //
    if (regexName.test(name)) {
        $('#inputName').removeClass('warning')
        $("#textWarning").text('')
    } else {
        $('#inputName').addClass('warning')
        $("#textWarning").text('Tên không hợp lệ!')
        return false
    }
    //
    if (regexMail.test(mail)) {
        $('#inputMail').removeClass('warning')
        $("#textWarning").text('')
    } else {
        $('#inputMail').addClass('warning')
        $("#textWarning").text('Mail không hợp lệ!')
        return false
    }
    //
    if (regexSDT.test(sdtregex)) {
        $('#inputSDT').removeClass('warning')
        $("#textWarning").text('')
    } else {
        $('#inputSDT').addClass('warning')
        $("#textWarning").text('Số điện thoại không hợp lệ!')
        return false
    }
    //
    if (dc != '') {
        $('#inputDC').removeClass('warning')
        $("#textWarning").text('')
    } else {
        $('#inputDC').addClass('warning')
        $("#textWarning").text('Bạn chưa nhập địa chỉ!')
        return false
    }
    //
    if (tinh != 'tinh') {
        $('#selectTinh').removeClass('warning')
        $("#textWarning").text('')
    } else {
        $('#selectTinh').addClass('warning')
        $("#textWarning").text('Vui lòng chọn tỉnh!')
        return false
    }
    //
    if (huyen != 'huyen') {
        $('#selectHuyen').removeClass('warning')
        $("#textWarning").text('')
    } else {
        $('#selectHuyen').addClass('warning')
        $("#textWarning").text('Vui lòng chọn huyện!')
        return false
    }
    //
    if (xa != 'xa') {
        $('#selectXa').removeClass('warning')
        $("#textWarning").text('')
        $('#form_submit_a_locate').hide()
        $('#label_show_locate').show()
        $('#change_locate_link').show()
        document.querySelector("#label_show_locate").innerHTML = `<label for="locate_choose" class="locate-label" id="label_show_locate">
                                <h6 style="display: inline-block; margin-right: 20px;">${name} ${sdtregex}</h6>
                                ${dc}, ${$('#selectXa').find(":selected").text()}, ${$('#selectHuyen').find(":selected").text()},${$('#selectTinh').find(":selected").text()}</label>`
        $('#form_submit_a_locate').hide()
        $('#label_show_locate').show()
        $('#change_locate_link').show()
        return false
    }
    else {
        $('#selectXa').addClass('warning')
        $("#textWarning").text('Vui lòng chọn xã!')
        return false
    }
}

// $('#btn_confirm_user_locate').click(() => {
//     alert('click dia chi ne!')
// })








$('#form_submit_a_locate').show()
$('.btn-user-locate-contain').hide()
try {
    document.querySelector('#locate_choose_0').checked = true
    document.querySelector("#selectHuyen").disabled = true
    document.querySelector("#selectXa").disabled = true
}
catch (e) { }
$('#selectTinh').change(() => {
    $('#selectHuyen').empty()
    $('#selectHuyen').append(`<option value="huyen">Quận/Huyện</option>`)
    $('#selectXa').empty()
    $('#selectXa').append(`<option value="xa">Phường/Xã</option>`)
    $('#selectXa').prop('disabled', true)
    let va = document.querySelector('#selectTinh').value
    if (va != 'tinh') {
        $('#selectHuyen').prop('disabled', false)
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-huyen",
            method: "POST",
            data: { matinh: va.trim() }
        })
            .fail(() => { console.log('request huyện fail') })
            .done((res) => {
                for (let obj of res.huyen) {
                    $('#selectHuyen').append(`<option value="${obj.MAQH}">${obj.TEN}</option>`)
                }
            })

    }
    else {
        $('#selectHuyen').prop('disabled', true)
        $('#selectXa').prop('disabled', true)
    }
})

$('#selectHuyen').change(() => {
    $('#selectXa').empty()
    $('#selectXa').append(`<option value="xa">Phường/Xã</option>`)
    let va = document.querySelector('#selectHuyen').value
    if (va != 'huyen') {
        document.querySelector("#selectXa").disabled = false
        $.ajax({
            url: "http://localhost:3000/fermeh/ajax/request-locate-xa",
            method: "POST",
            data: { mahuyen: va.trim() }
        })
            .fail(() => { console.log('request xã fail') })
            .done((res) => {
                for (let obj of res.xa) {
                    $('#selectXa').append(`<option value="${obj.MAXA}">${obj.TEN}</option>`)
                }
            })
    }
    else {
        document.querySelector("#selectXa").disabled = true
    }
})
//
//
//

$('#btn_confirm_user_locate').click((e) => {
    //e.preventDefault()
})
function validateDC() {
    let k;
    if (document.querySelector("#method_delivery_offline").checked == true) {
        k = 'cash'
    }
    else {
        k = 'momo'
    }
    if ($('#label_show_locate').text().trim() == '') {
        $("#textWarning").text('Vui lòng nhập thông tin địa chỉ!')
        $("#label_warning_submit").text('Vui lòng nhập thông tin địa chỉ!')
        return false
    }
    else {
        var diachi
        var email
        var sdt
        var ten
        if ($('#check_case').val() == '3') {
            diachi = $('#label_show_locate').text().trim()
            ten = ''
            email = ''
            sdt = ''
        } else {
            diachi = $('#label_show_locate').text().trim()
            ten = $("#inputName").val()
            email = $("#inputMail").val()
            sdt = $("#inputSDT").val()
        }
        let arr = []
        $("#textWarning").text('')
        $("#label_warning_submit").text('')
        for (let i of document.querySelectorAll('.detail_product')) {
            let cnt = 0
            for (let j of i.classList) {
                if (j == 'disabled-item') cnt++
            }
            if (cnt == 0) {
                let obj = {}
                obj['SOLUONG'] = parseInt(i.children[0].children[1].children[0].children[0].children[0].children[2].children[1].children[0].innerText)
                obj['MASP'] = parseInt(i.id.split('_')[1])
                obj['SIZE'] = parseInt(i.id.split('_')[2])
                arr.push(obj)
            }
        }
        // for (let i of arr) {
        //     document.cookie = `product_${i.MASP}_${i.SIZE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        // }
        $.ajax({
            url: "http://localhost:3000/fermeh/payment",
            method: "POST",
            data: {
                method: k, diachi: diachi, ten: ten,
                email: email, sdt: sdt, sp: arr, tongtien: parseInt(document.querySelector('#price_before').title)
            }
        })
            .fail(() => {
                console.log('ajax payment fail')
            })
            .done((res) => {
                if (res.done == true) {
                    //alert('Thanh toán thành công!!')
                    console.log(arr)
                    for (let i of arr) {
                        document.cookie = `product_${i.MASP}_${i.SIZE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                    }
                    window.location.assign('http://localhost:3000/fermeh/pay-success')
                } else {
                    alert('Thanh toán thất bại!')
                    window.location.assign('http://localhost:3000/fermeh/cart')
                }
            })
    }
    return false
}
