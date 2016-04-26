var app = angular.module('myApp', [
    'ngResource',
    'infinite-scroll',
    'angularSpinner',
    'jcs-autoValidate',
    'angular-ladda',
    'mgcrea.ngStrap',
    'ui.router',
    'myApp.controllers.listController',
    'myApp.controllers.detailController',
    'myApp.controllers.createController',
    'myApp.controllers.loginController'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: "/login",
            views: {
                'app': {
                    templateUrl: 'app/components/views/login.html',
                    controller: 'LoginController'
                }
            }
        })
        .state('contactList', {
            url: "/",
            views: {
                'app': {
                    templateUrl: 'app/components/views/contactList.html',
                    controller: 'ContactListController'
                },
                'search': {
                    templateUrl: 'app/components/views/searchForm.html',
                    controller: 'ContactListController'
                }
            }
        })
        .state('viewCards', {
            url: "/cards",
            views: {
                'app': {
                    templateUrl: 'app/components/views/contactCards.html',
                    controller: 'ContactListController'
                },
                'search': {
                    templateUrl: 'app/components/views/searchForm.html',
                    controller: 'ContactListController'
                }
            }
        })
        .state('editContact', {
            url: "/edit/:id",
            views: {
                'app': {
                    templateUrl: 'app/components/views/contactDetail.html',
                    controller: 'ContactDetailController'
                }
            }
        })
        .state('createContact', {
            url: "/create",
            views: {
                'app': {
                    templateUrl: 'app/components/views/contactDetail.html',
                    controller: 'ContactCreateController'
                }
            }
        });
    $urlRouterProvider.otherwise('/login');
});