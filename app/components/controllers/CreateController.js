var app = angular.module('myApp.controllers.createController', ['myApp.services.contactService']);

app.controller('ContactCreateController', function ($scope, $state, ContactService) {
    $scope.contactServ = ContactService;
    $scope.operation = "Create Contact";
    $scope.contactServ.selectedContact = {};
    $scope.save = function () {
        $scope.contactServ.createContact($scope.contactServ.selectedContact)
            .then(function () {
                if ($scope.contactServ.isCardView) {
                    $state.go("viewCards");
                }
                else {
                    $state.go("contactList");
                }
            });
    };
});