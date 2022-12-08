if ($('#selectyear').val() == new Date().getFullYear()) {
    $('#selectmonth').empty()
    for (let i = 1; i <= new Date().getMonth() + 1; i++) {
        $('#selectmonth').append(`<option value="${i}">Tháng ${i}</option>`)
    }
} else if ($('#selectyear').val() != '0') {
    $('#selectmonth').empty()
    for (let i = 1; i <= 12; i++) {
        $('#selectmonth').append(`<option value="${i}">Tháng ${i}</option>`)
    }
}

$('#report_type').change(() => {
    $('#containselectmonth').hide()
    $('#containselectyear').hide()
    $('#containbutton').hide()
    console.log($('#report_type').val())
    if ($('#report_type').val() == '30daylasted') {
        location.reload()
    }
    if ($('#report_type').val() == 'dayreport') {
        $('#containselectmonth').show()
        $('#containselectyear').show()
        $('#containbutton').show()
    }
    if ($('#report_type').val() == 'monthreport') {
        $('#containselectyear').show()
        $('#containbutton').show()
    }
    if ($('#report_type').val() == 'yearreport') {
        $('#showtext').text('Doanh thu theo năm')
        $.ajax({
            url: "http://localhost:3000/fermeh/admin/sale-report/year",
            method: "POST",
            data: {}
        })
            .done((res) => {
                console.log(res.data)
                $('#headertable').empty()
                $('#bodytable').empty()
                $('#headertable').append(`
                    <tr>
                      <th>Năm</th>
                      <th>Số đơn hàng</th>
                      <th>Số sản phẩm bán được</th>
                      <th>Tổng doanh thu năm</th>
                     </tr>
                 `)
                if (res.data.length > 0) {
                    for (let i = 2022; i <= new Date().getFullYear(); i++) {
                        let cnt = 0;
                        for (let j of res.data) {
                            if (parseInt(j.NAM) == i) {
                                cnt++;
                                $('#bodytable').append(`\
                                    <tr>
                                        <th>${j.NAM}</th>
                                        <th>${j.SOHD}</th>
                                        <th>${j.SOSP}</th>
                                        <th>${j.TONGTIEN}</th>
                                    </tr>
                                `)
                            }
                        }
                        if (cnt == 0) {
                            $('#bodytable').append(`\
                            <tr>
                                <td>${i}</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            `)
                        }

                    }
                    $('#bodytable').append(`\
                            <tr>
                                <th>Tổng</th>
                                <th>${res.sum.hd}</th>
                                <th>${res.sum.sp}</th>
                                <th>${res.sum.tien}</th>
                            </tr>
                    `)
                }
            })
            .fail(() => {
                alert('fail ajax')
            })
    }
})
//khi năm thay đổi,điều chỉnh tháng
$('#selectyear').change(() => {
    if ($('#selectyear').val() == new Date().getFullYear()) {
        $('#selectmonth').empty()
        for (let i = 1; i <= new Date().getMonth() + 1; i++) {
            $('#selectmonth').append(`<option value="${i}">Tháng ${i}</option>`)
        }
    } else if ($('#selectyear').val() != '0') {
        $('#selectmonth').empty()
        for (let i = 1; i <= 12; i++) {
            $('#selectmonth').append(`<option value="${i}">Tháng ${i}</option>`)
        }
    }
})

$('#submit_button').click((e) => {
    e.preventDefault()
    if ($('#report_type').val() == 'dayreport') {
        $.ajax({
            url: "http://localhost:3000/fermeh/admin/sale-report/day",
            method: "POST",
            data: { year: $("#selectyear").val(), month: $("#selectmonth").val() }
        })
            .done((res) => {
                $('#showtext').text(`Doanh thu theo ngày của tháng ${$("#selectmonth").val()} năm ${$("#selectyear").val()}`)
                $('#headertable').empty()
                $('#bodytable').empty()
                $('#headertable').append(`
                    <tr>
                      <th>Ngày</th>
                      <th>Số đơn hàng</th>
                      <th>Số sản phẩm bán được</th>
                      <th>Tổng doanh thu ngày</th>
                     </tr>
                 `)
                if (res.data.length > 0) {
                    let y = parseInt($("#selectyear").val())
                    let m = parseInt($("#selectmonth").val())
                    for (let i = 1; i <= new Date(y, m, 0).getDate(); i++) {
                        let cnt = 0;
                        for (let j of res.data) {
                            if (parseInt(new Date(`${j.NGAYLAP}`).getDate()) == i) {
                                cnt++;
                                $('#bodytable').append(`\
                                    <tr>
                                        <th>${i}</th>
                                        <th>${j.SOHD}</th>
                                        <th>${j.SOSP}</th>
                                        <th>${j.TONGTIEN}</th>
                                    </tr>
                                `)
                            }
                        }
                        if (cnt == 0) {
                            $('#bodytable').append(`\
                            <tr>
                                <td>${i}</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            `)
                        }

                    }
                    $('#bodytable').append(`\
                            <tr>
                                <th>Tổng</th>
                                <th>${res.sum.hd}</th>
                                <th>${res.sum.sp}</th>
                                <th>${res.sum.tien}</th>
                            </tr>
                    `)
                }

            })
            .fail(() => {
                alert('fail ajax')
            })
    }
    if ($('#report_type').val() == 'monthreport') {
        $.ajax({
            url: "http://localhost:3000/fermeh/admin/sale-report/month",
            method: "POST",
            data: { year: $("#selectyear").val() }
        })
            .done((res) => {
                $('#showtext').text(`Doanh thu theo tháng của năm ${$("#selectyear").val()}`)
                $('#headertable').empty()
                $('#bodytable').empty()
                $('#headertable').append(`
                    <tr>
                      <th>Tháng</th>
                      <th>Số đơn hàng</th>
                      <th>Số sản phẩm bán được</th>
                      <th>Tổng doanh thu tháng</th>
                     </tr>
                 `)
                if (res.data.length > 0) {
                    for (let i = 1; i <= 12; i++) {
                        let cnt = 0;
                        for (let j of res.data) {
                            if (parseInt(j.THANG) == i) {
                                cnt++;
                                $('#bodytable').append(`\
                                    <tr>
                                        <th>${j.THANG}</th>
                                        <th>${j.SOHD}</th>
                                        <th>${j.SOSP}</th>
                                        <th>${j.TONGTIEN}</th>
                                    </tr>
                                `)
                            }
                        }
                        if (cnt == 0) {
                            $('#bodytable').append(`\
                            <tr>
                                <td>${i}</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            `)
                        }

                    }
                    $('#bodytable').append(`\
                            <tr>
                                <th>Tổng</th>
                                <th>${res.sum.hd}</th>
                                <th>${res.sum.sp}</th>
                                <th>${res.sum.tien}</th>
                            </tr>
                    `)
                }
            })
            .fail(() => {
                alert('fail ajax')
            })
    }
})