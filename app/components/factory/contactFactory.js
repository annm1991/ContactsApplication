var app = angular.module('myApp.factory.contactFactory', ['ngResource']);

app.factory('Contact', function ($resource) {
    return $resource("app/data/contacts.json", {
        update: {
            method: 'PUT'
        }
    });
});