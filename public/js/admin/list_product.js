var linkView = document.querySelectorAll('.link_view_product')
var linkEdit = document.querySelectorAll('.link_edit_product')
var linkDel = document.querySelectorAll('.link_delete_product')
for (let i of linkView) {
    i.onclick = () => {
        document.querySelector('#view_img').src = i.parentElement.parentElement.parentElement.children[1].children[0].children[0].children[0].src
        $('#view_masp').val(i.parentElement.parentElement.parentElement.children[0].innerText)
        $('#view_tensp').val(i.parentElement.parentElement.parentElement.children[1].children[0].children[1].innerText)
        $('#view_loai').val(i.parentElement.parentElement.parentElement.children[2].innerText)
        $('#view_ctloai').val(i.parentElement.parentElement.parentElement.children[4].innerText)
        $('#view_danhmuc').val(i.parentElement.parentElement.parentElement.children[5].innerText)
        $('#view_hangsx').val(i.parentElement.parentElement.parentElement.children[3].innerText)
        $('#view_size').val(i.parentElement.parentElement.parentElement.children[6].innerText)
        $('#view_gia').val(i.parentElement.parentElement.parentElement.children[7].innerText)
        $('#view_ngayramat').val(i.parentElement.parentElement.parentElement.children[8].innerText)
        $('#view_list_product').show()
        $('body').addClass('prevent-scrolling')
    }
}
//----------------------------XOA SAN PHAM
$('#btn_cancel_delete').click((e) => {
    e.preventDefault()
    $('#view_list_product').hide()
    $('#form_view_list_product').show()
    $('#check_delete_product').hide()
    $('body').removeClass('prevent-scrolling')
})
$('#btn_submit_delete').click((e) => {
    e.preventDefault()
    $.ajax({
        url: "http://localhost:3000/fermeh/admin/list-product/del-product",
        method: "POST",
        data: { masp: $('#infor_for_delete').val() }
    })
        .done(() => {
            location.reload()
        })
        .fail(() => {
            console.log("delete product fail!!!")
        })
    location.reload()
})
for (let i of linkDel) {
    i.onclick = () => {
        $('#view_list_product').show()
        $('#form_view_list_product').hide()
        $('#check_delete_product').show()
        $('body').addClass('prevent-scrolling')
        $('#infor_for_delete').val(i.parentElement.parentElement.parentElement.children[0].innerText.split("#")[1])
    }
}
for (let i of linkEdit) {
    i.onclick = () => {
        $('#edit_infor_masp').val(i.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].innerText.split('#')[1])
    }
}
document.querySelector('#btn_close_view').onclick = (e) => {
    e.preventDefault()
    $('#view_list_product').hide()
    $('body').removeClass('prevent-scrolling')
}
$('#select_type_filter').change(() => {
    $.ajax({
        url: "/fermeh/admin/list-product/filter",
        method: "POST",
        data: { data: $('#select_type_filter').val(), type: document.querySelector('#select_type_filter').selectedOptions[0].classList[0] }
    })
        .done((res) => {
            $('#contain_all_product').empty()
            for (let i of res.data) {
                $('#contain_all_product').append(`
                     <tr>
                     <td>
                       <span>#${i.MASP}</span>
                     </td>
                     <td class="productlist">
                       <a class="d-flex align-items-center gap-2" href="#">
                         <div class="product-box">
                             <img src="/public/img/product/${i.IDHA}" alt="">
                         </div>
                         <div>
                             <h6 class="mb-0 product-title">${i.TENSP}</h6>
                         </div>
                        </a>
                     </td>
                     <td><span>${i.LOAI}</span></td>
                     <td><span>${i.TENHANG}</span></td>
                     <td><span>${i.CTLOAI}</span></td>
                     <td><span>${i.DANHMUC}</span></td>
                     <td><span>${i.MINSIZE}-${i.MAXSIZE}</span></td>
                     <td><span title="${i.GIA}">${i.GIA.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</span></td>
                     <td><span>${new Date(i.NGAYRAMAT).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></td>
                     <td>
                       <div class="d-flex align-items-center gap-3 fs-6">
                         <a href="javascript:;" class="text-primary link_view_product" data-bs-toggle="tooltip" data-bs-original-title="Chi tiết" ><i class="bi bi-eye-fill"></i></a>
                         <form action="http://localhost:3000/fermeh/admin/list-product/edit-product" method="post">
                           <button style="border: none;background: none;" type="submit">
                             <input type="text" style="display: none;" value="${i.MASP}" name="edit_infor_masp" id="edit_infor_masp">
                             <a href="javascript:;" class="text-warning link_edit_product" data-bs-toggle="tooltip" data-bs-original-title="Chỉnh sửa" ><i class="bi bi-pencil-fill"></i></a>
                           </button>
                         </form>
                         <a href="javascript:;" class="text-danger link_delete_product" data-bs-toggle="tooltip" data-bs-original-title="Xóa" ><i class="bi bi-trash-fill"></i></a>
                         <form action="http://localhost:3000/fermeh/admin/change-product-price" method="get">
                           <button style="border: none;background: none;" type="submit">
                             <input type="text" style="display: none;" value="${i.MASP}" name="price_masp" id="price_masp">
                             <a href="javascript:;" class="text-warning link_edit_product" data-bs-toggle="tooltip" data-bs-original-title="Thay đổi giá" ><i class="bi bi-currency-exchange"></i></i></a>
                           </button>
                         </form>
                       </div>
                     </td>
                    </tr>
                `)
            }
        })
        .fail(() => {
            alert('fail ajax!')
        })

})

$('#select_status_filter').change(() => {
    if ($('#contain_all_product').val() == 'Tình trạng') return
    $.ajax({
        url: "/fermeh/admin/list-product/filter/status",
        method: "POST",
        data: { data: $('#select_status_filter').val() }
    })
        .done((res) => {
            if (res.done == false) return
            $('#contain_all_product').empty()
            for (let i of res.data) {
                $('#contain_all_product').append(`
                     <tr>
                     <td>
                       <span>#${i.MASP}</span>
                     </td>
                     <td class="productlist">
                       <a class="d-flex align-items-center gap-2" href="#">
                         <div class="product-box">
                             <img src="/public/img/product/${i.IDHA}" alt="">
                         </div>
                         <div>
                             <h6 class="mb-0 product-title">${i.TENSP}</h6>
                         </div>
                        </a>
                     </td>
                     <td><span>${i.LOAI}</span></td>
                     <td><span>${i.TENHANG}</span></td>
                     <td><span>${i.CTLOAI}</span></td>
                     <td><span>${i.DANHMUC}</span></td>
                     <td><span>${i.MINSIZE}-${i.MAXSIZE}</span></td>
                     <td><span title="${i.GIA}">${i.GIA.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</span></td>
                     <td><span>${new Date(i.NGAYRAMAT).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></td>
                     <td>
                       <div class="d-flex align-items-center gap-3 fs-6">
                         <a href="javascript:;" class="text-primary link_view_product" data-bs-toggle="tooltip" data-bs-original-title="Chi tiết" ><i class="bi bi-eye-fill"></i></a>
                         <form action="http://localhost:3000/fermeh/admin/list-product/edit-product" method="post">
                           <button style="border: none;background: none;" type="submit">
                             <input type="text" style="display: none;" value="${i.MASP}" name="edit_infor_masp" id="edit_infor_masp">
                             <a href="javascript:;" class="text-warning link_edit_product" data-bs-toggle="tooltip" data-bs-original-title="Chỉnh sửa" ><i class="bi bi-pencil-fill"></i></a>
                           </button>
                         </form>
                         <a href="javascript:;" class="text-danger link_delete_product" data-bs-toggle="tooltip" data-bs-original-title="Xóa" ><i class="bi bi-trash-fill"></i></a>
                         <form action="http://localhost:3000/fermeh/admin/change-product-price" method="get">
                           <button style="border: none;background: none;" type="submit">
                             <input type="text" style="display: none;" value="${i.MASP}" name="price_masp" id="price_masp">
                             <a href="javascript:;" class="text-warning link_edit_product" data-bs-toggle="tooltip" data-bs-original-title="Thay đổi giá" ><i class="bi bi-currency-exchange"></i></i></a>
                           </button>
                         </form>
                       </div>
                     </td>
                    </tr>
                `)
            }
        })
        .fail(() => {
            alert('ajax fail!')
        })
})