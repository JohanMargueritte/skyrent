(function ($, d, w) {
    'use strict';

     $(d).on('click', '.map-menu-inner > .map-box-img, .map-menu-inner > .map-box-desc', function (e) {
         e.preventDefault();
         e.stopPropagation();

         var $self = $(this);
         var href = $self.data('href');

         if(href) {
             w.location.href = href;
         }
     });

     var $currentLocationTrigger = $('#current-location-trigger');

     if($currentLocationTrigger.length) {
         $currentLocationTrigger.on('click', function () {
            if("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var geocoder = new google.maps.Geocoder;

                    geocoder.geocode({ location: { lat: position.coords.latitude, lng: position.coords.longitude } }, function (results, status) {
                        if(status === 'OK') {
                            var element = {};
                            var adressComponents = results[0].address_components;

                            adressComponents.forEach(function (component) {
                                if(component.types.includes("street_number")) {
                                    element.street_number = component.long_name;
                                } else if(component.types.includes("route")) {
                                    element.route = component.long_name;
                                } else if(component.types.includes("sublocality")) {
                                    element.sublocality = component.long_name;
                                } else if(component.types.includes("locality")) {
                                    element.locality = component.long_name;
                                } else if(component.types.includes("administrative_area_level_1")) {
                                    element.administrative_area_level_1 = component.long_name;
                                } else if(component.types.includes("country")) {
                                    element.country = component.long_name;
                                } else if(component.types.includes("postal_code")) {
                                    element.postal_code = component.long_name;
                                } else if(component.types.includes("neighborhood")) {
                                    element.neighborhood = component.long_name;
                                }
                            });

                            element.location = results[0].formatted_address;

                            $('input[name="Psf[location]"]').val(element.location);
                            $('input[name="Psf[location_hidden]"]').val(element.location);
                            $('input[name="Psf[stno]"]').val(element.street_number);
                            $('input[name="Psf[route]"]').val(element.route);
                            $('input[name="Psf[nehd]"]').val(element.neighborhood);
                            $('input[name="Psf[sublocty]"]').val(element.sublocality);
                            $('input[name="Psf[locty]"]').val(element.locality);
                            $('input[name="Psf[reg]"]').val(element.administrative_area_level_1);
                            $('input[name="Psf[pcode]"]').val(element.postal_code);
                            $('input[name="Psf[is_banner]"]').val(element.postal_code);
                        } else {
                            alert('Erreur inattendue. Nous ne pouvons pas obtenir votre position.');
                        }
                    });
                }, function () {
                    alert("Il n'y a pas de prise en charge de la localisation sur cet appareil ou celle-ci est désactivée. Veuillez vérifier vos paramètres.");
                });
            }else {
                alert("Il n'y a pas de prise en charge de la localisation sur cet appareil ou celle-ci est désactivée. Veuillez vérifier vos paramètres.");
            }
         });
     }
})(jQuery, document, window);