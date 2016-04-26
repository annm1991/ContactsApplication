var app = angular.module('myApp.controllers.loginController', [
    'myApp.services.contactService',
    'myApp.directives.googleSignIn']);

app.controller('LoginController', function ($scope, $rootScope, $state, ContactService) {
    $scope.contactServ = ContactService;
    $scope.signedIn = function (oauth) {
        $scope.contactServ.setCurrentUser(oauth)
            .then(function (user) {
                $scope.user = user;
                //console.log(user);
                //console.log($scope.user.access_token);
                //if (gapi) {
                    //console.log(gapi);
                    $scope.contactServ.loadContacts();
                    $state.go("contactList");
                //}
            });
    }
});