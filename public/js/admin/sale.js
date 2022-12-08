

// $('#input_percent_sale').mousemove(function () {
//     $('#label_input_percent_sale').text($('#input_percent_sale').val()+'%')
// });

function addsalevalidate() {
    var regex_name = /^[a-zA-Z0-9 ]{6,}$/g;
    var name = $('#salename').val().trim()
    name = name.toLowerCase();
    name = name.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    name = name.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    name = name.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    name = name.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    name = name.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    name = name.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    name = name.replace(/đ/g, "d");
    var startdate = $('#salestartdate').val()
    var enddate = $('#saleenddate').val()
    var note = $('#salenote').val()
    if (!regex_name.test(name)) {
        $('#salename').addClass('warning')
        $('#text_warning').text("Tên không hợp lệ!")
        return false
    } else {
        $('#salename').removeClass('warning')
        $('#text_warning').text("")
    }
    if (new Date() > new Date(enddate)) {
        $('#saleenddate').addClass('warning')
        $('#text_warning').text("Ngày kết thúc không được bé hơn ngày hiện tại!")
        return false
    }
    else {
        $('#saleenddate').removeClass('warning')
        $('#textwarning').text("")
    }
    if (new Date(startdate) > new Date(enddate)) {
        $('#salestartdate').addClass('warning')
        $('#saleenddate').addClass('warning')
        $('#text_warning').text("Ngày bắt đầu không được lớn hơn ngày kết thúc!")
        return false
    }
    else {
        $('#salestartdate').removeClass('warning')
        $('#saleenddate').removeClass('warning')
        $('#textwarning').text("")
    }
    return true
}