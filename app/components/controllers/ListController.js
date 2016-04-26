var app = angular.module('myApp.controllers.listController', [
    'myApp.services.contactService',
    'myApp.filters.defaultValueFilter',
    'myApp.directives.cardDirective']);

app.controller('ContactListController', function ($scope, $state, $modal, ContactService) {
    /*$scope.search = "";
    $scope.order = "name";*/
    $scope.contactServ = ContactService;
    /*ContactService.getContacts().then(function (data) {
        $scope.contacts = data;
    });*/
    //console.log($state.current.name);
    //console.log($rootScope.gapi);
    /*if ($rootScope.gapi) {
        $scope.contactServ.loadContacts();
    }*/
    if ($state.current.name == "viewCards") {
        $scope.contactServ.isCardView = true;
    }
    else {
        $scope.contactServ.isCardView = false;
    }

    $scope.loadMoreContacts = function () {
        console.log('LoadMore');
        $scope.contactServ.loadMore();
    };

    /*$scope.$watch('search', function (newVal, oldVal) {
        console.log(newVal);
        if (angular.isDefined(newVal)) {
            $scope.contactServ.doSearch(newVal);
        }
    });

    $scope.$watch('order', function (newVal, oldVal) {
        if(angular.isDefined(newVal)) {
            $scope.contactServ.doOrder(newVal);
        }
    });*/

    $scope.showCreateModal = function () {
        $scope.contactServ.selectedContact = {};
        $scope.createModal = $modal({
            scope: $scope,
            templateUrl: 'app/templates/modal.create.tpl.html',
            show: true
        });
    };

    $scope.createContact = function () {
        console.log("Create contact");
        $scope.contactServ.createContact($scope.contactServ.selectedContact)
        .then(function () {
            $scope.createModal.hide();
        });
    };

    $scope.parentDeleteContact = function (contact) {
        $scope.contactServ.removeContact(contact);
    }
});