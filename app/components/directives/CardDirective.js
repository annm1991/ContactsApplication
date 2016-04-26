var app = angular.module('myApp.directives.cardDirective', []);

app.directive('dirCard', function () {
    return {
        //the directive can be used as attr, elem, class
        'restrict': 'AEC',
        'templateUrl': 'app/components/templates/card.html',
        'scope': {
            'contact': '=',
            'deleteContact': '&'
        }
    }
});

app.directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});