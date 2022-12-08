function accept() {
  
 
      // var mahd = $('#mahd').val()
      var mahd= document.getElementById("mahd").innerHTML;
      console.log("mahd", mahd)
      $.ajax({
          url: "/fermeh/admin/accept-order",
          method: "POST",
          data: { mahd: mahd }
      })
          .done((res) => {
              if (res.done == true) {
                  
                  alert('Duyệt đơn hàng thành công')
                  
                  window.location.assign('http://localhost:3000/fermeh/admin/orders')
              }
          })
          .fail(() => {
              alert('ajax fail!!')
          })
  }


function select_status(selectObject) {
    var value = selectObject.value;  
    console.log(value, "value");
    $.ajax({
        url: "/fermeh/admin/filter_status",
        method: "POST",
        data: { value: value }
        
    }).done((res) => {
      console.log("madonhang," , res.data.MADH)
        $('#table_of_items tbody tr').empty()
        for (let i of res.data) {
            $('#table_of_items').append(`
            <tr >
            <td style="text-align: center">#${i.MADH}</td> 
            
             
          
               <td  style="text-align: center">${i.TENKH}</td>
            
            <td  style="text-align: center" title="${i.TONGTIEN}">${i.TONGTIEN.toLocaleString('vi', {style : 'currency' , currency: 'VND' })}</td>
            <td  style="text-align: center">${i.NGAYLAP.toLocaleString()}</td>
            
            <td  style="text-align: center">${i.MANV}</td>
            <td  style="text-align: center">${i.PHUONGTHUC}</td>
            <td  style="text-align: center">${i.TINHTRANG}</td>
            <td>
             <div class="d-flex align-items-center gap-3 fs-6">
               <form action="/fermeh/admin/detail-orders" method="get">
                 <input type="text" name="infor_detail_bill" id="infor_detail_bill" style="display: none;" value="${i.MADH}">
                 <button style="border:none;background: none;">
                   <a href="" class="text-primary"   data-bs-original-title="Chi tiết" aria-label="Views" style="pointer-events: none;">
                     <i class="bi bi-eye-fill"></i>
                   </a>
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
        
  }
