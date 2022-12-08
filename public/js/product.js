$(document).ready(() => {
    var inputSize = document.querySelectorAll('.input_size')
    var li_size = document.querySelectorAll('.list-size li')
    var radio_button = document.querySelectorAll('.radio-button')
    var addFav = document.querySelector("#add-to-love")
    var sizeFav = document.querySelector("#size_to_fav")
    for (let i of inputSize) {
        $.ajax({
            url: "/fermeh/detail/product/count-number-procduct",
            method: "POST",
            data: { size: parseInt(i.innerText.trim()), id: document.URL.split('/')[document.URL.split('/').length - 1] }
        })
            .done((res) => {
                if (res.data === 0) {
                    i.parentElement.classList.add('disabled_element')
                }
            })
            .fail(() => {
                alert('ajax fail!')
            })
    }

    for (let i of li_size) {
        i.onclick = () => {
            document.querySelector('.warning-text').innerText = ''
            for (let j of li_size) {
                j.classList.remove('style-border');
            }
            i.classList.toggle('style-border');
        }
    }

    document.querySelector('#add-to-cart').onclick = (e) => {
        let cnt = 0;
        for (let i of radio_button) {
            if (i.checked) {
                var masp = document.URL.split('/')[document.URL.split('/').length - 1]
                cnt++;
                e.preventDefault()
                // console.log(document.cookie)
                console.log(i.value)
                $.ajax({
                    url: `/fermeh/add-to-cart/${masp}`,
                    method: "POST",
                    data: { id: masp, size_choose: i.value, num: $('#select_size').val() }
                })
                    .done((res) => {
                        if (res.done == true) {
                            alert('Thêm sản phẩm thành công!!')
                        }
                    })
                    .fail(() => {
                        alert('fail!!')
                    })
            }
        }
        if (cnt == 0) {
            e.preventDefault()
            document.querySelector('.warning-text').innerText = 'Vui lòng chọn size!'
        }
    }

    addFav.onclick = (e) => {
        let cnt = 0;
        for (let i of radio_button) {
            if (i.checked) {
                cnt++;
                var masp = document.URL.split('/')[document.URL.split('/').length - 1]
                cnt++;
                e.preventDefault()
                // console.log(document.cookie)
                console.log(i.value)
                $.ajax({
                    url: `/fermeh/add-to-fav/${masp}`,
                    method: "POST",
                    data: { id: masp, size_choose: i.value }
                })
                    .done((res) => {
                        if (res.done == true) {
                            alert('Thêm vào yêu thích thành công!!')
                        }
                    })
                    .fail(() => {
                        alert('fail!!')
                    });
            }
        }
        if (cnt == 0) {
            e.preventDefault()
            document.querySelector('.warning-text').innerText = 'Vui lòng chọn size!'
        }
    }
    for (let i of inputSize) {
        i.onclick = () => {
            // console.log(i.parentElement.children[1])
            // console.log(document.URL.split('/'))
            $.ajax({
                url: "/fermeh/detail/product/count-number-procduct",
                method: "POST",
                data: { size: parseInt(i.innerText.trim()), id: document.URL.split('/')[document.URL.split('/').length - 1] }
            })
                .done((res) => {
                    $('#num_of_product').text(`Còn lại ${res.data} sản phẩm trong kho`)
                    if (res.data == 0) $('#add-to-cart').prop("disabled", true);
                    else $('#add-to-cart').prop("disabled", false);
                    $('#select_size').empty()
                    if (res.data < 10) {
                        for (let idx = 1; idx <= res.data; idx++) {
                            $('#select_size').append(`<option value="${idx}">${idx}</option>`)
                        }
                    } else {
                        for (let idx = 1; idx <= 10; idx++) {
                            $('#select_size').append(`<option value="${idx}">${idx}</option>`)
                        }
                    }
                })
                .fail(() => {
                    alert('ajax fail!')
                })
        }
    }
})
