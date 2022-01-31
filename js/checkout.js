(function (jQuery, d, w) {
    'use strict';
    $(document).ready(function() {
        let checkoutContainer = $('#checkout-container');

        if(checkoutContainer.length) {
            //Initialize Stripe
            const strKey = checkoutContainer.data('key');
            const stripe = Stripe(strKey);
            const elements = stripe.elements();

            // Stripe vars
            const style = {
                base: {
                    color: "#32325d",
                    fontFamily: 'Arial, sans-serif',
                    fontSmoothing: "antialiased",
                    fontSize: "16px",
                    "::placeholder": {
                        color: "#32325d"
                    }
                },
                invalid: {
                    fontFamily: 'Arial, sans-serif',
                    color: "#fa755a",
                    iconColor: "#fa755a"
                }
            };

            let card = elements.create("card", { style: style });
            // Stripe injects an iframe into the DOM
            card.mount("#card-element");

            // Add an event listener for the submit button so we can send the payment confirmation to stripe
            let form = document.getElementById("payment-form");
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                // Need to get the client secret from the form
                const clientSecret = $("#pi-id").val();
                payWithCard(stripe, card, clientSecret);
            });

            // Add an event listener for the payment-method-select dropdown so we can disable stripe elements if a card is already selected
            let pmSelect = $("#payment-method-select");
            pmSelect.change(function() {
                if(pmSelect.val()) {
                    card.update({ disabled: true });
                } else {
                    card.update({ disabled: false });
                }
            });

            // Calls stripe.confirmCardPayment
            // If the card requires authentication Stripe shows a pop-up modal to
            // prompt the user to enter authentication details without leaving your page.
            const payWithCard = function(stripe, card, clientSecret) {
                loading(true);
                // Use the id of an existing payment method if selected. Otherwise, submit the card element
                let paymentMethod = {
                    payment_method: {
                        card: card,
                    },
                    setup_future_usage: 'off_session'
                };

                if(pmSelect) {
                    let selected = pmSelect.val();

                    if(selected) {
                        paymentMethod = {
                            payment_method: selected
                        };
                    }
                }

                stripe
                .confirmCardPayment(clientSecret, paymentMethod)
                .then(function(result) {
                    if (result.error) {
                        // Show error to your customer
                        showError(result.error.message);
                    } else {
                        // The payment succeeded!
                        // Need to redirect the user to a success page
                        const redirect_url = $('#submit').data('redirect');
                        window.location.href = redirect_url;
                    }
                });
            };

            /* ------- UI helpers ------- */
            // Show the customer the error from Stripe if their card fails to charge
            const showError = function(errorMsgText) {
                loading(false);
                const errorMsg = document.querySelector("#card-error");
                errorMsg.textContent = errorMsgText;
                setTimeout(function() {
                    errorMsg.textContent = "";
                }, 4000);
            };

            // Show a spinner on payment submission
            const loading = function(isLoading) {
                if (isLoading) {
                    // Disable the button and show a spinner
                    $("#submit").attr("disabled", true);
                    $("#spinner").removeClass("hidden");
                    $("#button-text").addClass("hidden");
                } else {
                    $("#submit").attr("disabled", false);
                    $("#spinner").addClass("hidden");
                    $("#button-text").removeClass("hidden");
                }
            };
        }
    });
}
)(jQuery, document, window);
