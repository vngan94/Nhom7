$('#btn_close_view').click((e) => {
    e.preventDefault()
    $('#contain_detail_product').empty()
    $('#view_list_product').hide()
})

var view = document.querySelectorAll('.link_view_product')
for (let i of view) {
    i.onclick = () => {
        $.ajax({
            url: "http://localhost:3000/fermeh/admin/product-category/detail",
            method: "POST",
            data: { masp: i.parentElement.parentElement.parentElement.children[0].innerText.split("#")[1] }
        })
            .done((res) => {
                if (res.sp.length > 0) {
                    for (let i of res.sp) {
                        $('#contain_detail_product').append(`
                        <tr>
                            <td>${i.MASP}</td>
                            <td>${i.SIZE}</td>
                            <td>${i.SL}</td>
                      </tr>
                        `)
                    }
                }
            })
            .fail(() => {
                alert('fail')
            })
        $('#view_list_product').show()
    }
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
                     
                     <td><span title="${i.GIA}">${i.GIA.toLocaleString('vi', { style: 'currency', currency: 'VND' })}</span></td>
                     <td>${i.SOLUONG}</td>
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
