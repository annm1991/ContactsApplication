var app = angular.module('myApp.controllers.detailController', [
    'myApp.services.contactService']);

app.controller('ContactDetailController', function ($scope, $stateParams, $state, ContactService) {
    $scope.contactServ = ContactService;
    $scope.operation = "Edit Contact";

    $scope.contactServ.selectedContact = $scope.contactServ.getContact($stateParams.id);

    $scope.save = function () {
        $scope.contactServ.updateContact($scope.contactServ.selectedContact)
            .then(function () {
                if ($scope.contactServ.isCardView) {
                    $state.go("viewCards");
                }
                else {
                    $state.go("contactList");
                }
            });
    };

    $scope.remove = function () {
        $scope.contactServ.removeContact($scope.contactServ.selectedContact)
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