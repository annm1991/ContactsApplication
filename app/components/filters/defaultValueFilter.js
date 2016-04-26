var app = angular.module('myApp.filters.defaultValueFilter', []);

app.filter('defaultValue', function () {
    return function (input, params) {
        //console.log(input);
        //console.log(params);
        if (!input) {
            return params;
        }
        return input;
    };
});