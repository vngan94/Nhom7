function cancel() {
        var rel = confirm('Xác nhận hủy đơn hàng?')
        if (rel) {
            var mahd= document.getElementById("mahd").innerHTML;
            
            console.log("mahd", mahd)
            $.ajax({
                url: "/fermeh/user/order/cancel-order",
                method: "POST",
                data: { mahd: mahd }
            })
                .done((res) => {
                    if (res.done == true) {
                        
                        alert('Hủy đơn hàng thành công!!')
                        
                        location.reload()
                    }
                })
                .fail(() => {
                    alert('ajax fail!!')
                })
        }
    }

