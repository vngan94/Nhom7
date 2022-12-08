var eventHandler = function (e) {
    e.preventDefault()
}

function validate() {
    var regex_size = /(([1-9]{2})\b)/g;
    var regex_name = /^[a-zA-Z0-9 ]{6,30}$/g;
    let regex_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var name = $('#productname').val()
    name = name.toLowerCase();
    name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    name = name.replace(/đ/g, "d");
    var minsize = parseInt($('#productminsize').val())
    var maxsize = parseInt($('#productmaxsize').val())
    var date = $('#productdate').val()
    var gia = $('#productprice').val()
    var loai = $('#productloai').val()
    var ctloai = $('#productctloai').val()
    var hangsx = $('#producthangsx').val()
    var danhmuc = $('#productdanhmuc').val()
    if (!regex_name.test(name)) { $('#productname').addClass('warning-border'); $('#warning_text').text("Tên sản phẩm không hợp lệ!"); return false }
    else {
        $('#productname').removeClass('warning-border');
        $('#warning_text').text("")
    }
    if (minsize >= maxsize) {
        $('#productminsize').addClass('warning-border')
        $('#productmaxsize').addClass('warning-border')
        $('#warning_text').text("Size nhỏ nhất không được lớn hơn hoặc bằng size lớn nhất!"); return false
    } else {
        $('#productminsize').removeClass('warning-border');
        $('#productmaxsize').removeClass('warning-border');
        $('#warning_text').text("")
    }
    console.log(date)
    if (date == '') {
        return
    } else {
        if (new Date(date) >= new Date()) {
            $('#productdate').addClass('warning-border'); $('#warning_text').text("Ngãy ra mắt không được lớn hơn ngày hiện tại!"); return false
        } else {
            $('#productdate').removeClass('warning-border')
            $('#warning_text').text("")
        }
    }

    if (parseInt(gia) <= 0 || gia == '') {
        $('#productprice').addClass('warning-border'); $('#warning_text').text("Giá bán sai!"); return false
    } else {
        $('#productprice').removeClass('warning-border');
        $('#warning_text').text("")
    }
    return true
}
// $('#btn_submit_form').click(function (e) {
//     console.log('submit form ne')
//     var regex_size = /(([1-9]{2})\b)/g;
//     var regex_name = /^[a-zA-Z0-9 ]{6,30}$/g;
//     let regex_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     $('#btn_submit_form').bind("submit", eventHandler)
//     $('#btn_submit_form').bind("click", eventHandler)
//     var name = $('#productname').val()
//     name = name.toLowerCase();
//     name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
//     name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
//     name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
//     name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
//     name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
//     name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
//     name = name.replace(/đ/g, "d");
//     var minsize = parseInt($('#productminsize').val())
//     var maxsize = parseInt($('#productmaxsize').val())
//     var date = $('#productdate').val()
//     var gia = $('#productprice').val()
//     var loai = $('#productloai').val()
//     var ctloai = $('#productctloai').val()
//     var hangsx = $('#producthangsx').val()
//     var danhmuc = $('#productdanhmuc').val()
//     if (!regex_name.test(name)) { $('#productname').addClass('warning-border'); $('#warning_text').text("Tên sản phẩm không hợp lệ!"); return }
//     else {
//         $('#productname').removeClass('warning-border');
//         $('#warning_text').text("")
//     }
//     if (minsize >= maxsize) {
//         $('#productminsize').addClass('warning-border')
//         $('#productmaxsize').addClass('warning-border')
//         $('#warning_text').text("Size nhỏ nhất không được lớn hơn hoặc bằng size lớn nhất!"); return
//     } else {
//         $('#productminsize').removeClass('warning-border');
//         $('#productmaxsize').removeClass('warning-border');
//         $('#warning_text').text("")
//     }
//     console.log(date)
//     if (date == '') {
//         return
//     } else {
//         if (new Date(date) >= new Date()) {
//             $('#productdate').addClass('warning-border'); $('#warning_text').text("Ngãy ra mắt không được lớn hơn ngày hiện tại!"); return
//         } else {
//             $('#productdate').removeClass('warning-border')
//             $('#warning_text').text("")
//         }
//     }

//     if (parseInt(gia) <= 0 || gia == '') {
//         $('#productprice').addClass('warning-border'); $('#warning_text').text("Giá bán sai!"); return
//     } else {
//         $('#productprice').removeClass('warning-border');
//         $('#warning_text').text("")
//     }
//     $('#btn_submit_form').unbind("submit", eventHandler)
//     $('#btn_submit_form').unbind("click", eventHandler)
// });
