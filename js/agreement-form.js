(function (jQuery, d, w) {
    'use strict';

    var $agreementFormContainer = $('#agreement-form');

    if ($agreementFormContainer.length) {
        var showClasses = ['fadeInRight', 'animated', 'faster'];
        var hideClasses = ['fadeOutLeft', 'animated', 'faster'];
        var showClassesBW = ['fadeInLeft', 'animated', 'faster'];
        var hideClassesBW = ['fadeOutRight', 'animated', 'faster'];
        var mergedShowClasses = []
            .concat(showClasses, showClassesBW)
            .filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });
        var mergedHideClass = []
            .concat(hideClasses, hideClassesBW)
            .filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });
        var currentStepIndex = 0;
        var $formMainContent = $agreementFormContainer.find(
            '.agreement-form-main-content'
        );
        var $progressBar = $agreementFormContainer.find('.progress-bar');
        var $progressCounter = $agreementFormContainer.find(
            '.progress-counter > small > span.value'
        );
        var $previousButton = $agreementFormContainer.find(
            '.agreement-form-action-buttons > button.btn-left'
        );
        var $nextButton = $agreementFormContainer.find(
            '.agreement-form-action-buttons > button.btn-right'
        );
        var $tenantsList = $agreementFormContainer.find('.tenants-list');
        var $firstTenant = $tenantsList.find('.tenant-item').first();
        var $formSteps = $formMainContent.find('.agreement-form-step-body');
        var $tenancyType = $agreementFormContainer.find('input[type="radio"][name="tenancyType"]');
        var $tenancyEndDateInput = $agreementFormContainer.find('#tenancyEnd');
        var $tenancyStartDateInput = $agreementFormContainer.find('#tenancyStart');
        var $serviceSiteLaundryFreeInput = $agreementFormContainer.find('#serviceSiteLaundryFree');
        var $serviceSiteLaundryValueInput = $agreementFormContainer.find('#serviceSiteLaundryValue');
        var $addParking = $agreementFormContainer.find('#add_parking');
        var $tenantTotalRent = $agreementFormContainer.find('#tenant_total_rent');

        var currentTenancyTypeValue = null;

        var stepsLength = $formSteps.length;

        var $addTenant = $('#add-tenant');

        function activateButton(type) {
            var type = type || 'left';

            if (type === 'left') $previousButton.removeClass('unactive');
            if (type === 'right') $nextButton.removeClass('unactive');
        }

        function unactivateButton(type) {
            var type = type || 'left';

            if (type === 'left') $previousButton.addClass('unactive');
            if (type === 'right') $nextButton.addClass('unactive');
        }

        function disableButton(type) {
            var type = type || 'left';

            if (type === 'left') $previousButton.prop('disabled', true);
            if (type === 'right') $nextButton.prop('disabled', true);
        }

        function enabledButton(type) {
            var type = type || 'left';

            if (type === 'left') $previousButton.prop('disabled', false);
            if (type === 'right') $nextButton.prop('disabled', false);
        }

        function updateProgress(currentIndex, stepsLength, isBackWard) {
            var progress = Math.ceil((currentIndex * 100) / (stepsLength - 1));

            $progressBar.attr('aria-valuenow', progress);
            $progressBar.width(progress + '%');

            var previousProgress = parseInt($progressCounter.text(), 10);

            $({value: previousProgress}).animate(
                {value: progress},
                {
                    duration: 500,
                    easing: 'linear',
                    step: function () {
                        $progressCounter.text(Math.ceil(this.value));
                    },
                    complete: function () {
                        if (parseInt($progressCounter.text(), 10) !== progress) {
                            $progressCounter.text(progress);
                        }
                    },
                }
            );
        }

        function hideStep(index, timeout, isBackWard) {
            var $currentStep = $($formSteps.get(index));

            $currentStep.addClass(isBackWard ? hideClassesBW : hideClasses);

            setTimeout(function () {
                $currentStep.hide().removeClass(mergedShowClasses);
            }, timeout);
        }

        function showStep(index, timeout, isBackWard) {
            var $currentStep = $($formSteps.get(index));

            $currentStep.removeClass(mergedHideClass);

            setTimeout(function () {
                $currentStep.show().addClass(isBackWard ? showClassesBW : showClasses);
            }, timeout);
        }

        function clearInputsIn($el) {
            $el.find(':input').each(function () {
                switch (this.type) {
                    case 'password':
                    case 'text':
                    case 'textarea':
                    case 'file':
                    case 'select-one':
                    case 'select-multiple':
                    case 'date':
                    case 'number':
                    case 'tel':
                    case 'email':
                        $(this).val('');
                        $(this).prop('readonly', false);
                        break;
                    case 'checkbox':
                    case 'radio':
                        this.checked = false;
                        break;
                }
            });
        }

        function updateInputNamesIn($el, index) {
            var pre = "tenants[" + index + "]";

            $el.find(':input').each(function () {
                switch (this.type) {
                    case 'password':
                    case 'text':
                    case 'textarea':
                    case 'file':
                    case 'select-one':
                    case 'select-multiple':
                    case 'date':
                    case 'number':
                    case 'tel':
                    case 'email':
                        $(this).prop('name', pre + "[" + $(this).data('id') + "]");
                    case 'checkbox':
                    case 'radio':
                        // this.checked = false;
                        break;
                }
            })
        }

        function goToNext() {
            if(!validateStep(currentStepIndex)) return;
            if (currentStepIndex < stepsLength - 1) {

                hideStep(currentStepIndex, 400);
                if (currentStepIndex === stepsLength - 2) {
                    // $agreementFormContainer.submit();
                } else {
                    enabledButton('left');
                    activateButton('left');
                }

                currentStepIndex++;
                showStep(currentStepIndex, 400);
                updateProgress(currentStepIndex, stepsLength);

                if (currentStepIndex === stepsLength - 2) {
                    $nextButton.find('span').text('Submit')
                }
            }
        }

        function validateStep(currentStep) {
            var current = $formSteps.get(currentStep);

            var isValid = true;

            $(current).find(':input').each(function () {
                if(!this.checkValidity()) {
                    isValid = false;
                    this.reportValidity();
                    return false;
                }
            });

            return isValid;
        }

        if (stepsLength > 0) {
            enabledButton('right');
            $formSteps.first().show();
        }

        $agreementFormContainer.find('input.datepicker').each(function () {
            var $el = $(this);
            $el.datepicker({
                autoclose: true,
                disableTouchKeyboard: true,
                startDate: new Date(),
                format: 'yyyy/mm/dd'
            });
            $el.on('keypress', function (e) {
                e.preventDefault();
            });
        });

        if($addParking.prop('checked')) {
            var prevValue = parseFloat($tenantTotalRent.data('prev-value'));
            var parkingPrice = parseFloat($(this).data('parking-price'));
            var newValue = prevValue + parkingPrice;
            $tenantTotalRent.text(newValue.toFixed(2));
        }else {
            var prevValue = parseFloat($tenantTotalRent.data('prev-value'));
            $tenantTotalRent.text(prevValue.toFixed(2));
        }

        $addParking.on('change', function () {
            var prevValue = parseFloat($tenantTotalRent.data('prev-value'));
            var parkingPrice = parseFloat($(this).data('parking-price'));
            if($(this).prop('checked')) {
                var newValue = prevValue + parkingPrice;
                $tenantTotalRent.text(newValue.toFixed(2));
            }else {
                $tenantTotalRent.text(prevValue.toFixed(2));
            }
        });

        currentTenancyTypeValue = $tenancyType.val();
        if ($tenancyType.val() === 'oneYear') {
            $tenancyEndDateInput.datepicker('setStartDate', '+1y');
        } else if($tenancyType.val() === 'monthToMonth') {
            $tenancyEndDateInput.datepicker('setStartDate', '+1m');
        }

        if($serviceSiteLaundryFreeInput.prop('checked') === true) {
            $serviceSiteLaundryValueInput.prop('readonly', true);
        }

        $agreementFormContainer.on('submit', function () {
            goToNext();
            if (currentStepIndex < stepsLength - 1) {
                return false;
            }
            $previousButton.prop('disabled', true);
            $nextButton.prop('disabled', true);
        });

        $serviceSiteLaundryFreeInput.on('change', function () {
            $serviceSiteLaundryValueInput.prop('readonly', $(this).prop('checked'));
            $serviceSiteLaundryValueInput.prop('required', $(this).prop('checked'));
        });

        $tenancyType.on('change', function () {
            currentTenancyTypeValue = $(this).val();
            if ($(this).val() === 'oneYear') {
                $tenancyEndDateInput.datepicker('setStartDate', '+1y');
            } else if($(this).val() === 'monthToMonth') {
                $tenancyEndDateInput.datepicker('setStartDate', '+1m');
            }
            if($tenancyStartDateInput.val().trim().length > 0) {
                var startDate = new Date($tenancyStartDateInput.datepicker('getDate'));
                var endDate = startDate;
                if(currentTenancyTypeValue === 'oneYear') {
                    endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
                } else if(currentTenancyTypeValue === "monthToMonth") {
                    endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
                }
                $tenancyEndDateInput.datepicker('update', endDate);
            }
        });

        $tenancyStartDateInput.on('change', function () {
            var startDate = new Date($(this).val());
            var endDate = startDate;

            if(currentTenancyTypeValue === 'oneYear') {
                endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
            } else if(currentTenancyTypeValue === "monthToMonth") {
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
            }

            $tenancyEndDateInput.datepicker('update', endDate);
        })

        if($tenantsList.find('.tenant-item').length > 1) {
            $tenantsList.find('.tenant-item').slice(1).each(function () {
                var $el = $(this);

                $el.find('a.close-button').on('click', function () {
                   $el.remove();
                    $tenantsList.find('.tenant-item').each(function (i) {
                        updateInputNamesIn($(this), i)
                    })
                });
            });
        }

        $addTenant.click(function () {
            var itemsLength = $tenantsList.find('.tenant-item').length;
            var $clone = $firstTenant.clone();
            $clone.appendTo($tenantsList);

            clearInputsIn($clone);
            updateInputNamesIn($clone, itemsLength);

            $clone.find('a.close-button').on('click', function () {
                $clone.remove();
                $tenantsList.find('.tenant-item').each(function (i) {
                    updateInputNamesIn($(this), i)
                })
            });
        });

        // $nextButton.click(function() {
        //     if (currentStepIndex < stepsLength - 1) {
        //
        //         hideStep(currentStepIndex, 400);
        //         if(currentStepIndex === stepsLength - 2) {
        //             $agreementFormContainer.submit();
        //         } else {
        //             enabledButton('left');
        //             activateButton('left');
        //         }
        //
        //         currentStepIndex++;
        //         showStep(currentStepIndex, 400);
        //         updateProgress(currentStepIndex, stepsLength);
        //
        //         if(currentStepIndex === stepsLength - 2) {
        //             $nextButton.find('span').text('Submit')
        //         }
        //     }
        // });

        $previousButton.click(function () {
            if (currentStepIndex > 0) {
                hideStep(currentStepIndex, 400, true);
                currentStepIndex--;
                showStep(currentStepIndex, 400, true);
                updateProgress(currentStepIndex, stepsLength, true);
                if (currentStepIndex === 0) {
                    unactivateButton('left');
                    setTimeout(function () {
                        disableButton('left');
                    }, 500);
                }
                if (currentStepIndex < stepsLength - 2) {
                    $nextButton.find('span').text('Next');
                }
            }
        });
    }
})(jQuery, document, window);
