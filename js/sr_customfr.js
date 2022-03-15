var PathUrl = '';
var authWindow;
var isAdmin = false;
var $modal;
var serTimeArr;
var d_names = new Array("lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche");
(function ($) {
    $.common = {
        settings: [],
        PathUrl: null,
        ajaxlock: false,
        init: function (s) {

            $.common.settings = s;
            PathUrl = s.baseUrl;

            if (s.admin) {
                isAdmin = s.admin;
            }

            /** function use for confirm bootbox **/
            $(document).on('click', '.delete-record', function () {
                var frmthis = this;
                bootbox.confirm({
                    message: "Êtes-vous sûr de vouloir supprimer cet élément ?",
                    buttons: {
                        confirm: {
                            label: 'Oui',
                            className: 'btn-primary'
                        },
                        cancel: {
                            label: 'Non',
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result) {
                            $.ajax({
                                method: 'GET',
                                dataType: 'json',
                                url: PathUrl + $(frmthis).attr('data-url'),
                                success: function (response)
                                {
                                    var url = window.location.href;
                                    window.location.reload();
                                }
                            });
                        }
                    }
                });
                return false;
            });
            var $modal = $('#ajaxModel');
            /** function use for open url in modal **/
            $(document).on('click', 'a.popuplink', function (e) {
                var url = $(this).attr('href');

                var datawidth = '688';
                if ($(this).attr('data-width')) {
                    datawidth = $(this).attr('data-width');
                }
                $modal.load(url, '', function (e, d) {
                    if (d != 'error')
                        $modal.modal({width: datawidth});

                });
                return false;
            });


            /** function use for show hide password field **/
            $(document).on('click', '.showHidePassword', function () {
                var passwordId = $(this).parents('div:first').find('input').attr('id');
                if ($('#' + passwordId).attr('type').toLowerCase() === 'password') {
                    $("#" + passwordId).attr("type", "text");
                } else {
                    $("#" + passwordId).attr("type", "password");
                }
            });

            /** function use for show hide password field **/
            $(document).on('click', '.showHidePasswordFront', function () {
                var classx = $(this).attr('class');
                if (classx.indexOf("eyeShow") > -1) {
                    $(this).removeClass('active');
                    $(this).parent().find('.eyeHide').addClass('active');
                } else if (classx.indexOf("eyeHide") > -1) {
                    $(this).removeClass('active');
                    $(this).parent().find('.eyeShow').addClass('active');
                }
                var passwordId = $(this).parents().eq(1).find('input').attr('id');
                if ($('#' + passwordId).attr('type').toLowerCase() === 'password') {

                    $("#" + passwordId).attr("type", "text");
                } else {
                    $("#" + passwordId).attr("type", "password");
                }
            });

            /** function use for toggle password div in user update scenario **/
            $(document).on('change', '.userPasswordToggle', function () {
                if ($(this).prop('checked')) {
                    $('#userPasswordShowHide').addClass('show');
                    $('#userPasswordShowHide').removeClass('hide');
                } else {
                    $('#userPasswordShowHide').removeClass('show');
                    $('#userPasswordShowHide').addClass('hide');
                }
            });

            /** function use for perform delete action in grid view**/
            $(document).on('click', '.deleteRecord', function (e) {
                e.preventDefault();

                var keys = $('#grid').yiiGridView('getSelectedRows');

                var url = $(this).attr("data-url");

                if (keys == '') {
                    alert('Veuillez sélectionner des lignes pour effectuer cette action spécifique.');
                } else {
                    var res = confirm('Êtes-vous sûr ? Vous souhaitez supprimer le ou les enregistrements sélectionnés ?');
                    if (res) {
                        $.ajax({
                            type: 'POST',
                            url: url,
                            data: {pk: keys},
                            success: function () {
                                $.pjax.reload({container: '#grid'});
                            }
                        });
                    }
                }
            });

            /** function use for perform ajax action in grid view **/
            $(document).on('click', 'a.ajaxAction', function (e) {
                e.preventDefault();
                var actionUrl = $(this).attr('action-url');
                var confirmMsg = $(this).attr('confirm-msg');
                var gridContainer = $(this).attr('grid-container');

                if (confirm(confirmMsg)) {
                    $.ajax({
                        url: actionUrl,
                        type: 'post'
                    }).done(function (data) {
                        $('#' + gridContainer).yiiGridView('applyFilter');
                    });
                }
            });
            /** Function use for form submit by ajax**/
            $(document).on('submit', 'form.ajax-form', function (e) {
                var frm = this;
                var containerdiv = $(this).parent('div');
                var pdata = new FormData($(this)[0]);
                $.ajax({
                    type: 'POST',
                    url: $(frm).attr("action"),
                    data: pdata,
                    enctype: 'multipart/form-data',
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (data) {

                        if (data === 1) {
                            window.location.reload();
                        } else {
                            try {
                                var x = data;
                                if (typeof x.status !== "undefined") {
                                    if (x.status == '100') {
                                        var html = '<tr>';
                                        html += '<td>' + x.data.level + '</td>';
                                        html += '<td>' + x.data.type + '</td>';
                                        if (x.data.dimension_unit == 1) {
                                            html += '<td>' + x.data.dimension + ' Sq.Ft</td>';
                                        } else {
                                            html += '<td>' + x.data.dimension + ' Sq.M</td>';
                                        }

                                        html += '</tr>';
                                        $('#roomList tbody').append(html);
                                        $modal.modal('toggle');

                                    }
                                    if (x.status == '101') {
                                        console.log($('#' + $('.room-radio:checked').val()).html());
                                        var html = '<tr>';
                                        html += '<td>' + $('#propertyroom-level').val() + '</td>';
                                        html += '<td>' + $('#propertyroom-type').val() + '</td>';
                                        if (x.data.dimension_unit == 1) {
                                            html += '<td>' + x.data.dimension + ' Sq.Ft <a class="close-icon delete-record" data-url="property/delete-room/' + x.id + '">×</a></td>';
                                        } else {
                                            html += '<td>' + x.data.dimension + ' Sq.M <a class="close-icon delete-record" data-url="property/delete-room/' + x.id + '">×</a></td>';
                                        }
                                        html += '</tr>';
                                        $('#roomList tbody').append(html);
                                        $modal.modal('toggle');

                                    }
                                } else {
                                    containerdiv.html(data);
                                }
                            } catch (e) {
                                //console.log(e);
                                containerdiv.html(data);
                            }
                        }
                    },
                    beforeSend: function () {
                        var loading_text = $(frm).find('button[type="submit"]').attr('data-loading');
                        if (typeof loading_text !== typeof undefined && loading_text !== false) {
                            $(frm).find('button[type="submit"]').html(loading_text);
                        } else {
                            $(frm).find('button[type="submit"]').html('Sauvegarde ... ');
                        }
                        $(frm).find('button[type="submit"]').attr('disabled', 'disabled');
                    }
                });
                return false;
            });

            /** Function use for show browse image name **/
            $(document).on('change', '.updateFileName', function () {
                var file = $(this)[0].files[0].name;
                name_length = file.length;
                if (name_length > 20) {
                    file = file.substring(0, 7) + "..." + file.substr(name_length - 7);
                }
                $(this).parent().parent().find('span.fileName').html(file);
            });

            /**Function use for update booking date and submit the booking form**/
            $(document).on('change', '.bookingPageDateSlider', function () {
                var selectedDate = $(this).val();
                $("#servicebooking-schedule-0-task_date").kvDatepicker("setDate", selectedDate);
                $('#servicebooking-form_type').val(1);
                $('#bookingForm').submit();
            });

            /**Function use for update new booking date when no result found and submit the booking form**/
            $(document).on('click', '.bookingPageNewDate', function () {
                var newSelectedDate = $(this).data('value');
                var isSalon = $(this).data('is-salon');
                if (isSalon == 1) {
                    $("#servicebooking-task_date").kvDatepicker("setDate", newSelectedDate);
                } else {
                    $("#servicebooking-schedule-0-task_date").kvDatepicker("setDate", newSelectedDate);
                }
                $('#servicebooking-form_type').val(1);
                $('#bookingForm').submit();
            });

            /**Function use for submit booking confirm form**/
            $(document).on('click', '.bookingConfirmButton', function () {
                $(this).attr('disabled', 'disabled');
                $('#servicebooking-form_type').val(0);
                $('#bookingForm').submit();
            });

            /**Function use for get service provider of selected service **/
            $(document).on('change', '.bookingPageServiceDropdown', function () {
                $('#servicebooking-form_type').val(1);
                $('#bookingSearchResult').html('');
                var service = $(this);
                var serviceColId = service.attr('id');
                var selectedSerVal = $(this).val();
                var selectedSerName = $(this).prop('name');

                $('.bookingPageServiceDropdown').each(function (key, obj) {
                    if (selectedSerName === $(obj).prop('name')) {
                        return;
                    }
                    if ($(obj).val() !== '' && $(obj).val() === selectedSerVal) {
                        service.val('');
                        alert('Vous avez déjà choisi ce service.');
                    }
                });

                var salon_id = $(this).data('salon_id');
                var is_salon = $(this).data('is-salon');
                var service_id = service.val();
                var service_counter = serviceColId.split("-")[2];
                var staffDropDown = $('#servicebooking-schedule-' + service_counter + '-staff_id');
                var member_id = staffDropDown.val();

                if (is_salon == 1) {
                    var selected_date = $('#servicebooking-task_date').val();
                } else {
                    var selected_date = $('#servicebooking-schedule-0-task_date').val();
                }

                //if (service_id !== '' && staffDropDown.length !== 0) {

                $.ajax({
                    type: 'POST',
                    url: PathUrl + 'site/get-staff',
                    data: ({member_id: member_id, salon_id: salon_id, service_id: service_id, selected_date: selected_date, is_salon: is_salon}),
                    beforeSend: function () {
                        service.attr('disabled', 'disabled');
                    },
                    success: function (data) {
                        service.removeAttr('disabled');

                        if (data === 1) {
                            window.location.reload();
                        } else {
                            try {
                                var x = JSON.parse(data);
                                if (typeof x.status !== "undefined") {
                                    if (x.status === 0) {
                                        alert('Il n'y a pas de fournisseur pour ce service, veuillez sélectionner un autre service.');
                                        service.val('');
                                    }
                                    staffDropDown.html(x.options);
                                    var exists = 0 !== $('#servicebooking-schedule-' + service_counter + '-staff_id option[value="' + member_id + '"]').length;
                                    if (exists) {
                                        staffDropDown.val(member_id);
                                    }

                                    if (is_salon == 1) {
                                        $('#servicebooking-schedule-' + service_counter + '-price').val(x.price);
                                        $('#servicebooking-schedule-' + service_counter + '-original_price').val(x.original_price);
                                        $('#servicebooking-schedule-' + service_counter + '-total_time').val(x.time);
                                    }
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                });
                //}
                return false;
            });

            /**Get service of selected member**/
            $(document).on('change', '.bookingPageMemberDropdown', function () {
                $('#servicebooking-form_type').val(1);
                $('#bookingSearchResult').html('');
                var member = $(this);
                var memberColId = member.attr('id');
                var salon_id = member.data('salon_id');
                var is_salon = $(this).data('is-salon');
                var member_id = member.val();
                var member_counter = memberColId.split("-")[2];
                var serviceDropDown = $('#servicebooking-schedule-' + member_counter + '-service_id');
                var service_id = serviceDropDown.val();
                //if (member_id !== '' && serviceDropDown.length !== 0) {

                if (is_salon == 1) {
                    var selected_date = $('#servicebooking-task_date').val();
                } else {
                    var selected_date = $('#servicebooking-schedule-0-task_date').val();
                }

                $.ajax({
                    type: 'POST',
                    url: PathUrl + 'site/get-staff-service',
                    data: ({member_id: member_id, salon_id: salon_id, service_id: service_id, selected_date: selected_date, is_salon: is_salon}),
                    beforeSend: function () {
                        member.attr('disabled', 'disabled');
                    },
                    success: function (data) {
                        member.removeAttr('disabled');

                        if (data === 1) {
                            window.location.reload();
                        } else {
                            try {
                                var x = JSON.parse(data);
                                if (typeof x.status !== "undefined") {
                                    if (x.status === 0) {
                                        alert('Il n'y a pas de service pour ce fournisseur, veuillez sélectionner un autre fournisseur de services.');
                                        member.val('');
                                    }
                                    serviceDropDown.html(x.options);
                                    var exists = 0 != $('#servicebooking-schedule-' + member_counter + '-service_id option[value="' + service_id + '"]').length;
                                    if (exists) {
                                        serviceDropDown.val(service_id);
                                    }

                                    if (is_salon == 1) {
                                        $('#servicebooking-schedule-' + member_counter + '-price').val(x.price);
                                        $('#servicebooking-schedule-' + member_counter + '-original_price').val(x.original_price);
                                        $('#servicebooking-schedule-' + member_counter + '-total_time').val(x.time);
                                    }
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                });
                //}
                return false;
            });

            $(document).on('click', '.bookingCancel', function () {
                var booking_id = $(this).data('booking_id');
                if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
                    $.ajax({
                        type: 'POST',
                        url: PathUrl + 'customer/booking-cancel',
                        data: ({booking_id: booking_id}),
                        beforeSend: function () {
                        },
                        success: function (data) {
                        }
                    });
                }
                return false;
            });

            $(document).on('focus', '.list-cell__service_id .form-control', function () {
                $(this).closest('td').closest('.list-cell__service_id').addClass('active');
                $('th.list-cell__service_id').addClass('active');
            }).on('blur', '.list-cell__service_id .form-control', function () {
                $(this).closest('.list-cell__service_id').removeClass('active');
                $('th.list-cell__service_id').removeClass('active');
            });

            $(document).on('focus', '.list-cell__staff_id .form-control', function () {
                $(this).closest('td').closest('.list-cell__staff_id').addClass('active');
                $('th.list-cell__staff_id').addClass('active');
            }).on('blur', '.list-cell__staff_id .form-control', function () {
                $(this).closest('.list-cell__staff_id').removeClass('active');
                $('th.list-cell__staff_id').removeClass('active');
            });

            $(document).on('focus', '.list-cell__task_date .form-control', function () {
                $(this).closest('td').closest('.list-cell__task_date').addClass('active');
                $('th.list-cell__task_date').addClass('active');
            }).on('blur', '.list-cell__task_date .form-control', function () {
                $(this).closest('.list-cell__task_date').removeClass('active');
                $('th.list-cell__task_date').removeClass('active');
            });

            $(document).on('click', '.memberService', function () {
                var isService = $(this).data('is_service');
                if (isService == 1) {
                    alert('Il n'y a pas de fournisseur pour ce service, veuillez sélectionner un autre service.');
                } else {
                    alert('Il n'y a pas de service pour ce fournisseur, veuillez sélectionner un autre fournisseur de services.');
                }

                return false;
            });

        },
        showLoading: function () {
            $('body').modalmanager('loading');
        },
        WINPOPUP: function (e, url) {
            e.preventDefault();
            var output = 'Please Wait..';
            var width = 575,
                    height = 400,
                    left = ($(window).width() - width) / 2,
                    top = ($(window).height() - height) / 2,
                    opts = 'scrollbars=1,resizable=1,status=1' + ',width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
            authWindow = window.open('about:blank', '', opts);
            authWindow.document.write(output);
            if (url) {
                //if(url.indexOf("http:")<0)
                //url = PathUrl+"/"+url;

                authWindow.location.replace(url);

            }
            return;
        }
    }
})(jQuery);

$(document).ajaxComplete(function (e, res, settings) {

    if (res.status == 401) {
        $('#ajax-modal').modal('hide');
        alert(res.statusText);
    }

    if (res.status == 402) {
        alert(res.statusText);
        window.top.location.reload(true);
    }

    if (res.status == 403) {
        alert(res.statusText);
        window.location = PathUrl;
    }

    if (res.status == 404) {
        alert('Une erreur est survenue avec votre requête. \n ' + res.responseText);
        window.location = PathUrl;
    }
});

$('#refreshCaptcha').on('click', function (e) {
    e.preventDefault();
    $('#rb-captcha-image').yiiCaptcha('refresh');
});


// this function is used for remove customer favourute salon fron favourite list
$('.removeAction').on('click', function (e) {
    var id = $(this).data('id'); //salon id
    var msg = $(this).data('message'); //message
    if (id != '') {
        var link = $(this).data('link'); // url
        var parentDiv = $(this).parent('div').parent('div'); // remove div after delete

        if (confirm(msg)) {
            $.ajax({
                url: link,
                type: 'post',
                data: {
                    id: id,
                },
                success: function (data) {
                    parentDiv.remove();
                }
            });
        }
    }
});

// this function is used for remove image from salon gallery
$('.delete-gallery-image').on('click', function (e) {
    var id = $(this).data('id'); //salon id
    if (id != '') {
        var link = $(this).data('link'); // url
        var parentDiv = $(this).parent('div').parent('div'); // remove div after delete

        if (confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
            $.ajax({
                url: link,
                type: 'post',
                data: {
                    id: id
                },
                success: function (data) {
                    parentDiv.remove();
                }
            });
        }
    }
});


// This accordian is use for FAQ (help) page..
$(document).ready(function () {
    $("#accordion").on('click', '.panel-title', function () {
        var theTarget = $(this).closest('.panel-heading');
        $('#accordion .panel-heading').removeClass('highlight');
        theTarget.toggleClass('highlight');
    });

    $("form.popupForm :input").each(function () {
        $(this).prev().addClass('active');
        $(this).next('label').addClass('active');
    });
});

//Event and classes readmore and read less js
$(document).ready(function () {
    // Configure/customize these variables.
    var showChar = 300;  // How many characters are shown by default
    var ellipsestext = "...";
    var moretext = "Afficher la suite";
    var lesstext = "Afficher moins";


    $('.more').each(function () {
        var content = $(this).html();

        if ($(this).hasClass('staff-description')) {
            showChar = 100;
        }
        if ($(this).hasClass('salon-review-detail-categorys')) {
            showChar = 60;
        }
        if (content.length > showChar) {

            var c = content.substr(0, showChar);
            var h = content.substr(showChar, content.length - showChar);

            var html = c + '<span class="moreellipses">' + ellipsestext + '&nbsp;</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="morelink read">' + moretext + '</a></span>';

            $(this).html(html);
        }

    });

    $(".morelink").click(function () {
        if ($(this).hasClass("less")) {
            $(this).removeClass("less");
            $(this).html(moretext);
            $(".salon-review-detail-content").css('margin-bottom', '-40px');
        } else {
            $(this).addClass("less");
            $(this).html(lesstext);
            $(".salon-review-detail-content").css('margin-bottom', '0');
        }
        $(this).parent().prev().toggle();
        $(this).prev().toggle();
        return false;
    });

    $('a[href^="#bd_featured_salons"]').on('click', function (event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 60
            }, 1000);
        }
    });

});
//focus on svg (color change)
/*$('.custom-svg').on('focus', function () {
 $(this).prev().addClass('active');
 }).on('blur', function () {
 $(this).prev().removeClass('active');
 });*/
// $('.custom-svg').on('focus', function () {
//     $(this).prev().addClass('active');
//     $(this).parent().parent().addClass('select-active');
// }).on('blur', function () {
//     $(this).prev().removeClass('active');
//     $(this).parent().parent().removeClass('select-active');
// });

//** convert javascript date format to y-m-d format
function formatDate(date) {
    var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

/** Convert javascript date format to H:M ampm**/
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function updateServicePrice() {
    var frm = '#bookingForm';
    var pdata = new FormData($(frm)[0]);
    $.ajax({
        type: 'POST',
        url: PathUrl + 'site/get-service-price',
        data: pdata,
        enctype: 'multipart/form-data',
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            $(frm).find('button[type="submit"]').removeAttr('disabled');
            console.log(data);
            try {
                var obj = jQuery.parseJSON(data);
                $.each(obj, function (key, value) {
                    $('#servicebooking-schedule-' + key + '-price').val(value);
                });
            } catch (e) {
                alert('asdsdasd');
                console.log(e);
            }
        },
        beforeSend: function () {
            var loading_text = $(frm).find('button[type="submit"]').attr('data-loading');
            $(frm).find('button[type="submit"]').attr('disabled', 'disabled');
        }
    });
    return false;
}


$('#homepage-slider').owlCarousel({
    loop: true,
    items: 1,
    autoplay: true
})
$('#testimonials-slider').owlCarousel({
    loop: true,
    items: 1,
    autoplay: true,
    nav:false,
    center:true
})
$('#homepage-slider-new').owlCarousel({
    loop: true,
    items: 1,
    autoplay: true,
    nav:true,
    center:true,
    dots:false
})
$('#how-it-works').owlCarousel({
    loop: true,
    items: 1,
    autoplay: true
})
$(".popuplink").click(function () {
    $("#ajaxModel").modal({
        backdrop: 'static',
        keyboard: false
    });
});

$('.dropdown-submenu .multi-level-dropdown').on("click", function (e) {
    $(this).next('ul').toggle();
    e.stopPropagation();
    e.preventDefault();
});


var Example = (function () {
    "use strict";

    var elem,
            hideHandler,
            that = {};

    that.init = function (options) {
        elem = $(options.selector);
    };

    that.show = function (text,status) {
        console.log(text);
        console.log(status);
        clearTimeout(hideHandler);
        
        if(status==true){
           elem.addClass('alert alert-success');
        }else{
            elem.addClass('alert alert-danger')
        }
        
        elem.find("span").html(text);
        elem.fadeIn();

        hideHandler = setTimeout(function () {
            that.hide();
        }, 4000);
    };

    that.hide = function () {
        elem.fadeOut();
    };

    return that;
}());

$(function () {
    Example.init({
        "selector": ".bb-alert"
    });
});

$('#thumbs-carousel').owlCarousel({
    thumbs: true,
    loop: true,
    items: 1,
    thumbsPrerendered: true,
    nav: true
});

//Property Menu Toggle
$(".map-menu-btn").click(function () {
    // $('.lp-map-menu').toggleClass('menu-closed');
    $(".map-menu-btn i").toggleClass('fa-angle-right');
});


//Property List View Carousel
$('.list-carousel').owlCarousel({
    items: 1,
    loop: true,
    nav: true
});

//How It Works Slider
$('.howitworks-slide').owlCarousel({
   // loop:true,
    nav:true,
    dots: false,
    responsive:{
        0:{
            items:1
        },
        768:{
            items:2
        },
        993:{
            items:3
        }
    }
});



//How it works Video
$('.video-play-button').on('click', function(){
  $(this).siblings('.video-overlay').addClass('open');
});

//Default active on home
$('#menu-for-renter').parent().addClass("active");


/*Smooth scrolling*/
$("#menu-for-renter").click(function() {
    $(".how-it-works-tabs-btns .nav-pills").children().removeClass("active");
    $(this).parent().addClass("active");
     $('html, body').animate({
         scrollTop: $("#sr-for-renter").offset().top-160
     }, 1000);
  return false;
 });

$("#menu-for-owner").click(function() {
    $(".how-it-works-tabs-btns .nav-pills").children().removeClass("active");
    $(this).parent().addClass("active");
     $('html, body').animate({
         scrollTop:$("#sr-for-owner").offset().top-160
     }, 1000);
  return false;
 });

$("#menu-for-agents").click(function() {
    $(".how-it-works-tabs-btns .nav-pills").children().removeClass("active");
    $(this).parent().addClass("active");
     $('html, body').animate({
         scrollTop:$("#sr-for-agents").offset().top-160
     }, 1000);
  return false;
 });



//Textarea onFocus Hide text
$('.field-property-description textarea').focus(function () {
    $(".textarea-char-label").css("display", "none");
});

$('.field-property-description textarea').blur(function () {
    $(".textarea-char-label").css("display", "block");
});
$(document).ready(function () {
    /**
     * This tiny script just helps us demonstrate
     * what the various example callbacks are doing
     */

    $('.toggle_property_view').click(function (e) {
        e.preventDefault();
        var view = $(this).attr('data-custom');
        var url = window.location.href;
        if (view == 'property-list-view') {
            //insertParam('property_view', 'list', url);
        } else {
            //insertParam('property_view', 'map', url);
        }
    });

    $(document).on('click', '.list_next,.list_prev', function (e) {
        e.preventDefault();
        var url = $(this).parent('a').attr('href');
        if (url) {
            console.log(url);
            insertParam('property_view', 'list', url);
        } else {
            //alert('Quelque chose ne va pas !');
            return false;
        }
    });

    $(document).on('click', '.map_next,.map_prev', function (e) {
        e.preventDefault();
        var url = $(this).parent('a').attr('href');
        if (url) {
            console.log(url);
            insertParam('property_view', 'map', url);
        } else {
            //alert('Quelque chose ne va pas !');
            return false;
        }
    });

    function insertParam2(key, value, url)
    {
        key = encodeURIComponent(key);
        value = encodeURIComponent(value);

        var s = url;
        var kvp = key + "=" + value;

        var r = new RegExp("(&|\\?)" + key + "=[^\&]*");

        s = s.replace(r, "$1" + kvp);

        if (!RegExp.$1) {
            s += (s.length > 0 ? '&' : '?') + kvp;
        }

        console.log(s);

        //again, do what you will here
        //document.location.search = s;
    }

    function insertParam(key, value, url)
    {
        key = encodeURIComponent(key);
        value = encodeURIComponent(value);
        var kvp = url.split('&');

        var i = kvp.length;
        var x;
        while (i--)
        {
            x = kvp[i].split('=');

            if (x[0] == key)
            {
                x[1] = value;
                kvp[i] = x.join('=');
                break;
            }
        }

        if (i < 0) {
            kvp[kvp.length] = [key, value].join('=');
        }

        //this will reload the page, it's likely better to store this until finished
        console.log(kvp.join('&'));
        window.location = kvp.join('&');
    }


    // $(document).on('change', '#psf-sort_price', function (e) {
    //     $("#property-filter-form").submit();
    // });
        
        var $myGroup = $('#myGroup');
    $myGroup.on('show.bs.collapse','.collapse', function() {
        $myGroup.find('.collapse.in').collapse('hide');
        
    });
});