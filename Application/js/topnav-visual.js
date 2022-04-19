(function (Topnav, $, undefined) {
    var isStartedAnim = false;

    Topnav.onLoad = function() {
        var element = $("<path />")
            .attr("d", createSvgArc(0, 0, 300, 0, 3.2))
            // .attr("fill", "#ff0")
            .attr("opacity", 0.5);
    }

    function createSvgArc(x, y, r, startAngle, endAngle) {
        if (startAngle > endAngle) {
            var s = startAngle;
            startAngle = endAngle;
            endAngle = s;
        }
        if (endAngle - startAngle > Math.PI * 2) {
            endAngle = Math.PI * 1.99999;
        }

        var largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;

        return [
            "M", x, y,
            "L", x + Math.cos(startAngle) * r, y - Math.sin(startAngle) * r,
            "A", r, r, 0, largeArc, 0, x + Math.cos(endAngle) * r, y - Math.sin(endAngle) * r,
            "L", x, y
        ].join(" ");
    }

    Topnav.startRefreshAnim = function () {
        refresh_button.disabled = true;
        $('#refreshLoad').css('display', "");
    };

    Topnav.endRefreshAnim = function() {
        refresh_button.disabled = false;
        $('#refreshLoad').css('display', "none");
    }
}(window.Topnav = window.Topnav || {}, jQuery));

window.addEventListener('load', Topnav.onLoad);
