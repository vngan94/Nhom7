var detail_customer = document.querySelectorAll('.btn_detail_customer')
var view_detail = document.querySelectorAll('.view_detail_customer')
for (let i = 0; i < detail_customer.length; i++) {
    detail_customer[i].onclick = async (e) => {
        e.preventDefault()
        await $.ajax({
            url: "http://localhost:3000/fermeh/admin/customer/detail",
            method: "POST",
            data: { sdt: view_detail[i].value }
        })
            .done((res) => {
                $('#tbody_form_show_locate').empty()
                $('#view_makh').val(res.customer[0].MAKH)
                $('#view_tenkh').val(res.customer[0].TENKH)
                $('#view_sdt').val(res.customer[0].SDT)
                $('#view_email').val(res.customer[0].EMAIL)
                if (res.locate.length > 0) {
                    for (let i of res.locate) {
                        $('#tbody_form_show_locate').append(`
                        <tr>
                            <td>${i.IDDC}</td>
                            <td>${i.DIACHI}, ${i.XA}, ${i.HUYEN}, ${i.TINH}</td>
                            <td>${i.SDT}</td>
                            <td>${i.LOAI}</td>
                            <td>${i.TEN}</td>
                        </tr>
                        `)
                    }
                }
                $('#view_list_customer').show()

                console.log(res)
            })
            .fail(() => {
                console.log('fail')
            })
    }
}
$('#btn_close_view').click((e) => {
    e.preventDefault()
    $('#view_list_customer').hide()
})