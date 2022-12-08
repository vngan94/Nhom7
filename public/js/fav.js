$(document).ready(() => {
    var addCart = document.querySelectorAll('.add_to_cart_btn')
    var delFav = document.querySelectorAll('.delete_btn')


    for (let i of addCart) {
        i.onclick = (e) => {
            e.preventDefault()
            $.ajax({
                url: "/fermeh/fav/add-to-cart",
                method: "POST",
                data: { masp: i.parentElement.children[1].value, size: i.parentElement.children[2].value }
            })
                .done((res) => {
                    if (res.done == true) { alert('Thêm sản phẩm thành công!!') }
                })
                .fail(() => {
                    alert('fail!')
                })
        }
    }

    for (let i of delFav) {
        i.onclick = (e) => {
            e.preventDefault()
            $.ajax({
                url: "/fermeh/fav/del-product",
                method: "POST",
                data: { masp: i.parentElement.children[1].value, size: i.parentElement.children[2].value }
            })
                .done((res) => {
                    if (res.done == true) { alert('Xóa sản phẩm thành công!!') }
                    location.reload()
                })
                .fail(() => {
                    alert('fail!')
                })
        }
    }
})