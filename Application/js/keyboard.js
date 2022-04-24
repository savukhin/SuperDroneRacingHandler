(function ( Keyboard, $, undefined ) {
    let isShift = false;

    Keyboard.load = function() {
        $(document).on('keyup keydown', function(e) {
            isShift = e.shiftKey
        } );
    }

    Keyboard.checkShift = function() {
        return isShift;
    }

}(window.Keyboard = window.Keyboard || {}, jQuery ));

window.addEventListener('load', Keyboard.load)