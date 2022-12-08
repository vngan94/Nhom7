$('#btn_change_price').click((e) => {
    var id = $('#productid').val()
    var gia = $('#productprice').val()
    var ghichu = $('#productnote').val()
    if (id != '') {
        e.preventDefault()
        $.ajax({
            url: "http://localhost:3000/fermeh/admin/change-product-price/change",
            method: "POST",
            data: { masp: id, gia: gia, ghichu: ghichu }
        })
            .done((res) => {
                alert('Thay đổi giá thành công!')
                location.reload()
            })
            .fail(() => {
                alert('ajax fail!')
            })
    }
})