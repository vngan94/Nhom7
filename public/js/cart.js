var list_delete_btn = document.querySelectorAll(".delete_btn")
let size_choice = document.querySelectorAll(".size-choice")
let quantity_choice = document.querySelectorAll(".quantity-choice")
let size_detail = document.querySelectorAll(".size-detail")
let quantity_detail = document.querySelectorAll(".quantity-detail")
var contain_product = document.querySelectorAll('.contain_product_item')
var chkbox_choose = document.querySelectorAll('.chkbox_choose_product')
//
document.querySelector('#buy_btn').disabled = true
//
for (let i of chkbox_choose) {
    let price = i.parentElement.parentElement.children[2].children[0].children[1].children[0].title
    $(i).change(() => {
        if (i.checked == true) {
            document.querySelector('#buy_btn').disabled = false
            $('#price_before').attr('title', parseInt($('#price_before').attr('title')) + (parseInt(price)))
            $('#price_before').text((parseInt($('#price_before').attr('title')).toLocaleString('vi', { style: 'currency', currency: 'VND' })))
            $('#price_delivery').text((parseInt(30000).toLocaleString('vi', { style: 'currency', currency: 'VND' })))
            $('#price_total').attr('title', parseInt($('#price_before').attr('title')) + 30000)
            $('#price_total').text((parseInt($('#price_total').attr('title')).toLocaleString('vi', { style: 'currency', currency: 'VND' })))
        } else {
            $('#price_before').attr('title', parseInt($('#price_before').attr('title')) - (parseInt(price)))
            $('#price_before').text((parseInt($('#price_before').attr('title')).toLocaleString('vi', { style: 'currency', currency: 'VND' })))
            if (parseInt($('#price_before').attr('title')) === 0) {
                document.querySelector('#buy_btn').disabled = true
                $('#price_delivery').text((parseInt(0).toLocaleString('vi', { style: 'currency', currency: 'VND' })))
                $('#price_total').attr('title', 0)
                $('#price_total').text((parseInt(0).toLocaleString('vi', { style: 'currency', currency: 'VND' })))
            } else {
                $('#price_total').attr('title', parseInt($('#price_before').attr('title')) + 30000)
                $('#price_total').text((parseInt($('#price_total').attr('title')).toLocaleString('vi', { style: 'currency', currency: 'VND' })))
            }
        }
    })
}
for (let i of contain_product) {
    var listSize = i.children[1].children[2].children[0].children[0].children[0].children[2].children[1].children[0].children
    $.ajax({
        url: "/fermeh/detail/product/count-number-procduct",
        method: "POST",
        data: { size: parseInt(i.id.split('_')[2]), id: parseInt(i.id.split('_')[1]) }
    })
        .done((res) => {
            let sl = i.children[1].children[2].children[0].children[0].children[0].children[2].children[2]
            let sl_detail = i.children[1].children[2].children[0].children[0].children[0].children[2].children[3].children[0]
            let size = i.children[1].children[2].children[0].children[0].children[0].children[2].children[0]
            console.log(res.data)
            console.log(i.children[0].title)
            if (res.data === 0) {
                i.children[1].children[0].children[0].disabled = true
                sl.classList.add('disabled_element')
            }
            else if (res.data < parseInt(sl.children[0].innerText)) {
                i.children[1].children[0].children[0].disabled = true
            }
            else {
                i.children[1].children[0].children[0].disabled = false
                //console.log(i.id)
                $(sl_detail).empty()
                if (res.data < 10) {
                    for (let id = 1; id <= res.data; id++) {
                        $(sl_detail).append(`<li>${id}</li>`)
                    }
                }
                else {
                    for (let id = 1; id <= 10; id++) {
                        $(sl_detail).append(`<li>${id}</li>`)
                    }
                }
                sl.classList.remove('disabled_element')
            }
        })
        .fail(() => {
            alert('ajax fail!')
        })

    //-----------------------------------------------------Kiểm tra xem mỗi size còn lại bn sản phẩm
    for (let k of listSize) {
        $.ajax({
            url: "/fermeh/detail/product/count-number-procduct",
            method: "POST",
            data: { size: k.innerText.trim(), id: parseInt(i.id.split('_')[1]) }
        })
            .done((res) => {
                if (res.data === 0) {
                    $(k).addClass('disabled_element')
                }
                else {
                    $(k).removeClass('disabled_element')
                }
            })
            .fail(() => {
                alert('ajax fail!')
            })
    }
}
for (let i = 0; i < size_choice.length; i++) {
    size_choice[i].onclick = () => {
        console.log('size changeeee')
        for (let j = 0; j < quantity_choice.length; j++) {
            if ($(quantity_detail[j]).is(":visible")) {
                quantity_detail[j].classList.remove("display-class")
            }
        }
        for (let k = 0; k < size_choice.length; k++) {
            if (k != i && $(size_detail[k]).is(":visible")) {
                size_detail[k].classList.remove("display-class")
            }
        }
        size_detail[i].classList.toggle("display-class")
        for (let a of size_detail[i].children[0].children) {
            a.onclick = () => {
                // console.log('id sp', a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id)
                let arr = a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id.split('_')
                a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id
                    = 'product_' + arr[1] + '_' + a.textContent.trim()
                let old_size = parseInt(arr[2])
                let m_id = a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id
                let arraf = m_id.split('_')
                let n_size = parseInt(arraf[2])
                let masp = parseInt(arraf[1])
                a.parentElement.parentElement.parentElement.children[0].children[0].innerHTML = `<span style="margin-right: 3px;">${a.textContent.trim()}</span>`
                a.parentElement.parentElement.classList.remove('display-class')
                var chk = false
                for (let i of document.cookie.split(';')) {
                    if (i.split('=')[0].trim() == 'sdt') {
                        if (i.split('=')[1].trim() == '' || typeof (i.split('=')[1]) == 'undefined') {
                            chk = false
                        } else {
                            chk = true
                        }
                    }
                }
                console.log(chk)
                if (chk == true) {
                    $.ajax({
                        url: "http://localhost:3000/fermeh/ajax/update-size-product",
                        method: "POST",
                        data: { MASP: arraf[1], SIZE: parseInt(arraf[2]), SOLUONG: parseInt(quantity_choice[i].children[0].textContent.trim()), OLDSIZE: parseInt(old_size) }
                    })
                        .fail(() => { })
                        .done((res) => {
                            if (res.error === 0) {
                                document.cookie = `product_${arraf[1].trim()}_${old_size}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                                document.cookie = `product_${arraf[1].trim()}_${arraf[2].trim()}` + "=" + parseInt(quantity_choice[i].children[0].textContent.trim()) + ';path=/';
                                console.log('success')
                                $.ajax({
                                    url: "/fermeh/detail/product/count-number-procduct",
                                    method: "POST",
                                    data: { size: n_size, id: masp }
                                })
                                    .done((res) => {
                                        let sl_choice = a.parentElement.parentElement.parentElement.children[2]
                                        let sl_detail = a.parentElement.parentElement.parentElement.children[3].children[0]
                                        let input = sl_choice.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0]
                                        console.log('res data bang', res.data)
                                        console.log(parseInt(sl_choice.children[0].innerText))
                                        // console.log(i.children[0].title)
                                        if (res.data === 0) {
                                            input.disabled = true
                                            sl_choice.classList.add('disabled_element')
                                        } else if (res.data < parseInt(sl_choice.children[0].innerText)) {
                                            input.disabled = true
                                        }
                                        else {
                                            input.disabled = false
                                            console.log('xxx')
                                            sl_choice.classList.remove('disabled_element')
                                            $(sl_detail).empty()
                                            if (res.data < 10) {
                                                for (let id = 1; id <= res.data; id++) {
                                                    $(sl_detail).append(`<li>${id}</li>`)
                                                }
                                            }
                                            else {
                                                for (let id = 1; id <= 10; id++) {
                                                    $(sl_detail).append(`<li>${id}</li>`)
                                                }
                                            }
                                            sl_choice.classList.remove('disabled_element')
                                        }
                                    })
                                    .fail(() => {
                                        alert('ajax fail!')
                                    })
                            }
                            else if (res.error === 1) {
                                alert('Không được chọn hai sản phẩm cùng size trong giỏ hàng!')
                                location.reload()
                            }
                        })
                } else {
                    document.cookie = `product_${arraf[1].trim()}_${old_size}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    document.cookie = `product_${arraf[1].trim()}_${arraf[2].trim()}` + "=" + parseInt(quantity_choice[i].children[0].textContent.trim()) + ';path=/';
                    console.log('success')
                    $.ajax({
                        url: "/fermeh/detail/product/count-number-procduct",
                        method: "POST",
                        data: { size: n_size, id: masp }
                    })
                        .done((res) => {
                            let sl_choice = a.parentElement.parentElement.parentElement.children[2]
                            let sl_detail = a.parentElement.parentElement.parentElement.children[3].children[0]
                            let input = sl_choice.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].children[0]
                            console.log('res data bang', res.data)
                            console.log(parseInt(sl_choice.children[0].innerText))
                            // console.log(i.children[0].title)
                            if (res.data === 0) {
                                input.disabled = true
                                sl_choice.classList.add('disabled_element')
                            } else if (res.data < parseInt(sl_choice.children[0].innerText)) {
                                input.disabled = true
                            }
                            else {
                                input.disabled = false
                                console.log('xxx')
                                sl_choice.classList.remove('disabled_element')
                                $(sl_detail).empty()
                                if (res.data < 10) {
                                    for (let id = 1; id <= res.data; id++) {
                                        $(sl_detail).append(`<li>${id}</li>`)
                                    }
                                }
                                else {
                                    for (let id = 1; id <= 10; id++) {
                                        $(sl_detail).append(`<li>${id}</li>`)
                                    }
                                }
                                sl_choice.classList.remove('disabled_element')
                            }
                        })
                        .fail(() => {
                            alert('ajax fail!')
                        })
                }

            }
        }
    }
}
for (let i = 0; i < quantity_choice.length; i++) {
    quantity_choice[i].onclick = () => {
        for (let j = 0; j < quantity_choice.length; j++) {
            if (j != i && $(quantity_detail[j]).is(":visible")) {
                quantity_detail[j].classList.remove("display-class")
            }
        }
        for (let k = 0; k < size_choice.length; k++) {
            if ($(size_detail[k]).is(":visible")) {
                size_detail[k].classList.remove("display-class")
            }
        }
        quantity_detail[i].classList.toggle("display-class")
        for (let a of quantity_detail[i].children[0].children) {
            a.onclick = () => {
                // console.log('id sp', a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id)
                let arr = a.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id.split('_')
                let OLDSOLUONG = parseInt(a.parentElement.parentElement.parentElement.children[2].children[0].textContent)
                a.parentElement.parentElement.parentElement.children[2].children[0].innerHTML = `<span style="margin-right: 3px;">${a.textContent.trim()}</span>`
                a.parentElement.parentElement.classList.remove('display-class')
                $.ajax({
                    url: "http://localhost:3000/fermeh/ajax/update-quantity-product",
                    method: "POST",
                    data: { MASP: arr[1], SIZE: parseInt(arr[2].trim()), SOLUONG: parseInt(a.textContent.trim()) }
                })
                    .fail(() => { })
                    .done((res) => {
                        if (res.error === 0) {
                            document.cookie = `product_${arr[1].trim()}_${arr[2].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                            document.cookie = `product_${arr[1].trim()}_${arr[2].trim()}= ${parseInt(a.textContent.trim())};path=/`;
                            quantity_choice[i].parentElement.parentElement.parentElement.parentElement.children[1].children[0].innerText = ((res.GIA * parseInt(a.textContent.trim())).toLocaleString('vi', {
                                style: 'currency', currency
                                    : 'VND'
                            }))
                            $(`#price_${arr[1]}_${arr[2]}`).attr('title', parseInt($(`#price_${arr[1]}_${arr[2]}`).attr('title')) + (parseInt(a.textContent.trim()) - OLDSOLUONG) * res.GIA)
                            console.log('success')
                        }
                    })
            }
        }
    }
}
for (let i of list_delete_btn) {
    i.addEventListener("click", (e) => {
        e.preventDefault()
        document.cookie = `product_${i.value}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.querySelector(`#product_${i.value}`).style.display = "none"
        let money = parseInt(document.querySelector(`#price_${i.value}`).title)
        let bf = document.querySelector("#price_before")
        let tt = document.querySelector("#price_total")
        let value_bf = (parseInt(bf.title) - money)
        let value_tt = (parseInt(tt.title) - money)
        bf.innerText = value_bf.toLocaleString('vi', {
            style: 'currency',
            currency: 'VND'
        })
        tt.innerText = value_tt.toLocaleString('vi', {
            style: 'currency',
            currency: 'VND'
        })
        bf.title = value_bf
        tt.title = value_tt
        if (parseInt(value_bf) === 0) {
            $('.non-product').show()
        }
        let masp, size;
        masp = i.parentElement.children[2].value
        size = i.parentElement.children[3].value
        $.ajax({
            url: "/fermeh/cart/del-product",
            method: "POST",
            data: { masp: masp, size: size }
        })
            .done((res) => {
                if (res.done == true) {
                    alert("Xóa sản phẩm thành công!!")
                    location.reload()
                } else {
                    alert("Xóa sản phẩm thất bại!!")
                }
            })
            .fail(() => {

            })
    })
}
