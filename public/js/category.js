$(document).ready(() => {
    // var contain = document.createElement('section')
    // $(contain).append('ngoccc')
    var div = document.createElement('div')
    var a = document.createElement('a')
    var men = $('#gender_men')
    var wm = $('#gender_wm')
    var child = $('#gender_child')
    // if (men.attr('checked') == 'checked') {
    //     console.log('checked men')
    // }
    // else {
    //     console.log('not checked men')
    // }
    // if (wm.attr('checked') == 'checked') {
    //     console.log('checked wm')
    // }
    // else {
    //     console.log('not checked wm')
    // }
    // if (child.attr('checked') == 'checked') {
    //     console.log('checked child')
    // }
    // else {
    //     console.log('not checked child')
    // }
    $('#gender_men').change(function (e) {
        if ($('#gender_men').is(':checked') == true) {
            console.log('xx')
        }
        else console.log('men is unchecked')
        e.preventDefault();

    });
    $('#gender_wm').change(function (e) {
        if ($('#gender_wm').is(':checked') == true) console.log(`wm is checked`);
        else console.log('wm is unchecked')
        e.preventDefault();

    });
    $('#gender_child').change(function (e) {
        if ($('#gender_child').is(':checked') == true) console.log(`child is checked`);
        else console.log('child is unchecked')
        e.preventDefault();

    });
    // $(window).scroll(function () {
    //     if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    //         for (let j = 0; j < 3; j++) {
    //             // let contain = document.createElement('section');
    //             for (let i = 0; i < 3; i++) {
    //                 let div = document.createElement('div');
    //                 let a = document.createElement('a');
    //                 let img = document.createElement('img');
    //                 let h4 = document.createElement('h4');
    //                 let h5 = document.createElement('h5');
    //                 let p = document.createElement('p');
    //                 // $(contain).addClass('row mb-4');
    //                 $(a).attr('href', '#')
    //                 $(div).addClass('col mb-4');
    //                 $(a).addClass('text-dark text-decoration-none');
    //                 $(img).addClass('img-fluid mb-3 product-img')
    //                 $(img).attr('src', '/public/img/slider-img/lebron-19-basketball-shoes-pbfCF3-1.jpg')
    //                 $(h4).addClass('text-info')
    //                 h4.innerText = 'Lebron 19'
    //                 $(p).addClass('text-muted')
    //                 h5.innerHTML = '2.699.000<sup>d</sup>'
    //                 p.innerText = 'Men"shoes'
    //                 $(a).append(img); $(a).append(h4); $(a).append(p); $(a).append(h5);
    //                 $(div).append(a)
    //                 // $(contain).append(div)
    //                 $('.main-list').append(div);
    //             }
    //         }
    //     }
    // });




    /*
    <a href="" class="text-dark text-decoration-none">
                            <img src="/public/img/slider-img/lebron-19-basketball-shoes-pbfCF3-1.jpg" alt="shoes-img"
                                class="img-fluid">
                            <h4 class="text-info">Lebron 19</h4>
                            <p class="text-muted">Men'shoes</p>
                            <h5>2.699.000<sup>d</sup></h5>
                        </a> */
})