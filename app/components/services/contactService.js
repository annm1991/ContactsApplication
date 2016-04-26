var app = angular.module('myApp.services.contactService', ['toaster',
    'ngAnimate',
    'myApp.factory.contactFactory']);

app.service('ContactService', function ($q, $http, $rootScope, $filter, Contact, toaster) {
    var self = {
        'selectedContact': null,
        'contacts': [],
        'page': 1,
        'hasMore': true,
        'isLoading': false,
        'isSaving': false,
        'search': "",
        'ordering': 'name',
        'isCardView': false,
        'gapi': null,
        '_currentUser': null,
        'loadContacts': function () {
            //if (self.hasMore && !self.isLoading) {
                self.isLoading = true;

                var params = {
                    'page': self.page,
                    'search': self.search,
                    'ordering': self.ordering
                };
                console.log(gapi);
                console.log(self._currentUser);

                $.ajax({
                    type: "GET",
                    url: "https://www.googleapis.com/m8/feeds/contacts/default/full?v=3.0&alt=json&access_token=" + self._currentUser.access_token,
                    //dataType: "jsonp",
                    //data: newContact,
                    success: function (response) {
                        var entries = response.feed.entry;
                        self.contacts = [];
                        angular.forEach(entries, function (contact) {

                            //console.log(JSON.stringify(contact));
                            //var name = contact.gd$name.gd$fullName ? 
                            //console.log(contact);
                            var newContact = {
                                "id": contact.id,
                                "name": contact.gd$name ? contact.gd$name.gd$fullName.$t : contact.gd$email[0].address,
                                "email": contact.gd$email ? contact.gd$email[0].address : "",
                                "birthdate": contact.gContact$birthday ? contact.gContact$birthday.when : "",
                                "phonenumber": contact.gd$phoneNumber ? contact.gd$phoneNumber[0].$t : "",
                                "address": contact.gd$structuredPostalAddress ? contact.gd$structuredPostalAddress[0].gd$formattedAddress.$t : "",
                                "city": contact.gd$structuredPostalAddress ? (contact.gd$structuredPostalAddress[0].gr$city ? contact.gd$structuredPostalAddress[0].gr$city.$t : "") : "",
                                "country": contact.gd$structuredPostalAddress ? (contact.gd$structuredPostalAddress[0].gr$country ? contact.gd$structuredPostalAddress[0].gr$country.$t : "") : "",
                                "photo": contact.link[0].href ? contact.link[0].href : ""

                            };
                            self.contacts.push(newContact);
                            //console.log(newContact);
                        });
                    }
                }).then(function () {
                    self.isLoading = false;
                });

                /*Contact.query(function (data) {
                    //console.log(data);
                    angular.forEach(data, function (contact) {
                        self.contacts.push(new Contact(contact));
                    });

                    if (!data.next) {
                        self.hasMore = false;
                    }
                    self.isLoading = false;
                });*/
            //}
        },
        'getContacts': function (authResult) {
            console.log(authResult);
        },
        'loadMore': function () {
            if (self.hasMore && !self.isLoading) {
                self.page += 1;
                self.loadContacts();
            }
        },
        'doSearch': function () {
            self.hasMore = true;
            self.page = 1;
            self.contacts = [];
            /*self.search = search;*/
            self.loadContacts();
        },
        'doOrder': function () {
            self.hasMore = true;
            self.page = 1;
            self.contacts = [];
            /*self.ordering = order;*/
            self.loadContacts();
        },
        //async operations
        'updateContact': function (contact) {

            var d = $q.defer();
            self.isSaving = true;
            console.log(contact);

            var responseXML = null;
            var xhr = new XMLHttpRequest();
            //var oauthToken = gapi.auth.getToken();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    //console.log(xhr.response);
                    //console.log(xhr.responseBody);
                    responseXML = xhr.response;
                    self.sendUpdate(responseXML, contact, 'PUT'); 
                    d.resolve();
                    self.isSaving = false;
                    toaster.pop('success', 'Updated ' + contact.name);
                    
                }
            }
            xhr.open('GET',
              contact.id.$t.replace("google.com", "googleapis.com").replace("/base/", "/full/").replace("http:", "https:"));
            //xhr.open('GET',
            //  "app/data/contactUpdateTemplate.xml");
            xhr.responseType = "document";
            xhr.setRequestHeader('Authorization',
              'Bearer ' + self._currentUser.access_token);
            xhr.setRequestHeader('GData-Version',
              '3.0');
            xhr.setRequestHeader("Content-type", "application/atom+xml");
            xhr.setRequestHeader("Data-type", "application/atom+xml");
            xhr.setRequestHeader('Accept',
              'text/javascript, text/html, application/xml, application/atom+xml, text/xml, application/json');
            xhr.send();

            return d.promise;

        },
        'createContact': function (contact) {
            var d = $q.defer();
            self.isSaving = true;
            console.log(contact);

            var responseXML = null;
            var xhr = new XMLHttpRequest();
            //var oauthToken = gapi.auth.getToken();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    // console.log(xhr.response);
                    //console.log(xhr.responseBody);
                    responseXML = xhr.response;
                    self.sendUpdate(responseXML, contact, 'POST');
                    d.resolve();
                    self.isSaving = false;
                    toaster.pop('success', 'Created ' + contact.name);
                    //console.log("created");
                }
            }
            xhr.open('GET',
              "app/data/contactCreateTemplate.xml");
            xhr.responseType = "document";
            xhr.setRequestHeader('Authorization',
              'Bearer ' + self._currentUser.access_token);
            xhr.setRequestHeader('GData-Version',
              '3.0');
            xhr.setRequestHeader("Content-type", "application/atom+xml");
            xhr.setRequestHeader("Data-type", "application/atom+xml");
            xhr.setRequestHeader('Accept',
              'text/javascript, text/html, application/xml, application/atom+xml, text/xml, application/json, */*');
            xhr.send();

            return d.promise;
        },
        'sendUpdate': function (contact, newContact, reqType) {
            var d = $q.defer();
            console.log(newContact);
            ////console.log(contact.getElementsByTagName("entry"));
            //console.log(contact.getElementsByTagName("entry")[0].childNodes);
            var children = contact.getElementsByTagName("entry")[0].childNodes;
            if (reqType == 'PUT') {
                var items = {
                    "title": false, "name": false, "email": false, "phonenumber": false, "address": false, "photo": false
                };
                
                for (i = 0; i < children.length; i++) {
                    if (children[i].nodeName == "title")
                        items["title"] = true;
                    else if (children[i].nodeName == "gd:name")
                        items["name"] = true;
                    else if (children[i].nodeName == "gd:email")
                        items["email"] = true;
                    else if (children[i].nodeName == "gd:phoneNumber")
                        items["phonenumber"] = true;
                    else if (children[i].nodeName == "gd:structuredPostalAddress")
                        items["address"] = true;
                    else if (children[i].nodeName == "")
                        items["photo"] = true;
                }

                console.log(items);

                if (items["title"] == false) {
                    var titleNode = contact.createElement("title");
                    titleNode.innerHTML = "New Name";
                    var x = contact.getElementsByTagName("entry")[0];
                    x.appendChild(titleNode);
                }

                if (items["name"] == false) {
                    var nameNode = contact.createElement("gd:name");
                    var givenNameNode = contact.createElement("gd:givenName");
                    givenNameNode.innerHTML = "New";
                    nameNode.appendChild(givenNameNode);
                    var familyNameNode = contact.createElement("gd:familyName");
                    familyNameNode.innerHTML = "Name";
                    nameNode.appendChild(familyNameNode);
                    var fullNameNode = contact.createElement("gd:fullName");
                    fullNameNode.innerHTML = "New Name";
                    nameNode.appendChild(fullNameNode);
                    var x = contact.getElementsByTagName("entry")[0];
                    x.appendChild(nameNode);
                }

                if (items["email"] == false) {
                    var workNode = contact.createElement("gd:email");
                    workNode.setAttribute("rel", "http://schemas.google.com/g/2005#work");
                    workNode.setAttribute("primary", "true");
                    workNode.setAttribute("address", "new@name.com");
                    workNode.setAttribute("displayName", "New Name");

                    var x = contact.getElementsByTagName("entry")[0];
                    x.appendChild(workNode);
                }

                if (items["phonenumber"] == false) {
                    
                    var workNode = contact.createElement("gd:phoneNumber");
                    workNode.setAttribute("rel", "http://schemas.google.com/g/2005#work");
                    workNode.innerHTML = "210-210-2100";
                    workNode.setAttribute("primary", "true");

                    var x = contact.getElementsByTagName("entry")[0];
                    x.appendChild(workNode);
                }

                if (items["photo"] == false) {

                    var linkNode = contact.createElement("link");
                    linkNode.setAttribute("rel", "http://schemas.google.com/contacts/2008/rel#photo");
                    linkNode.setAttribute("href","https://www.google.com/m8/feeds/photos/media/{userEmail}/{contactId}");
                    linkNode.setAttribute("type", "image/*");
                    var x = contact.getElementsByTagName("entry")[0];
                    x.appendChild(linkNode);
                }

                if (items["address"] == false) {
                    var addressNode = contact.createElement("gd:structuredPostalAddress");
                    addressNode.setAttribute("rel", "http://schemas.google.com/g/2005#work");
                    addressNode.setAttribute("primary", "true");
                    var cityNode = contact.createElement("gd:city");
                    cityNode.innerHTML = "New City";
                    addressNode.appendChild(cityNode);
                    var streetNode = contact.createElement("gd:street");
                    streetNode.innerHTML = "New Street";
                    addressNode.appendChild(streetNode);
                    var countryNode = contact.createElement("gd:country");
                    countryNode.innerHTML = "New Country";
                    addressNode.appendChild(countryNode);
                    var formattedAddressNode = contact.createElement("gd:formattedAddress");
                    formattedAddressNode.innerHTML = "New Formatted Address";
                    addressNode.appendChild(formattedAddressNode);
                    //console.log(addressNode);
                    var x = contact.getElementsByTagName("entry")[0];
                    x.appendChild(addressNode);
                    //console.log(addressNode);
                }
                console.log("PUT");
                console.log(contact);
            }

            console.log(contact);
            //console.log(children.getElementsByTagName("gd:name"));
            for (i = 0; i < children.length; i++){
                if (children[i].nodeType == 1) {
                    if (children[i].nodeName == "gd:name") {
                        for (j = 0; j < children[i].childNodes.length; j++) {
                            if (children[i].childNodes[j].nodeName == "gd:fullName") {
                                children[i].childNodes[j].innerHTML = newContact.name;
                            }
                            if (children[i].childNodes[j].nodeName == "gd:givenName") {
                                children[i].childNodes[j].innerHTML = newContact.name.substring(0, newContact.name.indexOf(" "));
                            }
                            if (children[i].childNodes[j].nodeName == "gd:familyName") {
                                children[i].childNodes[j].innerHTML = newContact.name.substring(newContact.name.indexOf(" "));
                            }
                        }
                        //console.log(children[i].childNodes);
                    }
                    if (children[i].nodeName == "title") {
                        children[i].innerHTML = newContact.name;
                    }
                    if (children[i].nodeName == "gd:email") {
                        if(children[i].getAttribute("primary") == "true"){
                            children[i].setAttribute("address", newContact.email);
                        }
                    }
                    if (children[i].nodeName == "link") {
                        if (children[i].getAttribute("type") == "image/*") {
                            children[i].setAttribute("href", newContact.photo);
                        }
                    }
                    if (children[i].nodeName == "gd:phoneNumber") {
                        if (children[i].getAttribute("primary") == "true") {
                            children[i].innerHTML = newContact.phonenumber;
                        }
                    }
                    if (children[i].nodeName == "gd:structuredPostalAddress") {
                        for (j = 0; j < children[i].childNodes.length; j++) {
                            if (children[i].childNodes[j].nodeName == "gd:city") {
                                children[i].childNodes[j].innerHTML = newContact.city;
                            }
                            if (children[i].childNodes[j].nodeName == "gd:street") {
                                children[i].childNodes[j].innerHTML = newContact.address;
                            }
                            if (children[i].childNodes[j].nodeName == "gd:country") {
                                children[i].childNodes[j].innerHTML = newContact.country;
                            }
                            if (children[i].childNodes[j].nodeName == "gd:formattedAddress") {
                                children[i].childNodes[j].innerHTML = newContact.address;
                            }
                        }
                    }
                    /*(if (children[i].nodeName == "gContact:birthday") {
                        children[i].setAttribute("when", $filter('date')(contact.birthdate, "yyyy-MM-dd"));
                    }*/
                }
            }
            console.log("after modification");
            console.log(contact)

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    d.resolve();
                }
            }
            if(newContact.id)
                xhr.open(reqType,
                    newContact.id.$t.replace("google.com", "googleapis.com").replace("/base/", "/full/").replace("http:", "https:"));
            else
                xhr.open(reqType,
                   "https://www.googleapis.com/m8/feeds/contacts/default/full");
            //xhr.responseType = "document";
            xhr.setRequestHeader('Authorization',
              'Bearer ' + self._currentUser.access_token);
            xhr.setRequestHeader('GData-Version',
              '3.0');
            if (contact.getElementsByTagName("entry")[0].getAttribute("gd:etag"))
                xhr.setRequestHeader('If-Match',
                  contact.getElementsByTagName("entry")[0].getAttribute("gd:etag"));
            xhr.setRequestHeader("Content-type", "application/atom+xml");
            xhr.setRequestHeader("Data-type", "application/atom+xml");
            xhr.setRequestHeader('Accept',
              'text/javascript, text/html, application/xml, application/atom+xml, text/xml, application/json, */*');
            xhr.send(contact);

            //d.resolve();
            return d.promise;
        },
        'deleteContact': function (contact) {
            var responseXML = null;
            var d = $q.defer();
            var xhr = new XMLHttpRequest();

            self.isDeleting = 'true';
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    self.isDeleting = 'true'
                    self.loadContacts();
                    d.resolve();
                }
            }
            xhr.open('DELETE',
              (contact.getElementsByTagName("entry")[0].childNodes[1].innerHTML).replace("google.com", "googleapis.com").replace("/base/", "/full/").replace("http:", "https:"));
            xhr.responseType = "document";
            xhr.setRequestHeader('Authorization',
              'Bearer ' + self._currentUser.access_token);
            xhr.setRequestHeader('GData-Version',
              '3.0');
            xhr.setRequestHeader('If-Match',
              contact.getElementsByTagName("entry")[0].getAttribute("gd:etag"));
            xhr.setRequestHeader("Content-type", "application/atom+xml");
            xhr.setRequestHeader("Data-type", "application/atom+xml");
            xhr.setRequestHeader('Accept',
              'text/javascript, text/html, application/xml, application/atom+xml, text/xml, application/json');
            xhr.send();

            return d.promise;
        },
        'removeContact': function (contact) {
            var d = $q.defer();
            //console.log(contact);
            self.isDeleting = true;
            console.log(contact);

            var xhr = new XMLHttpRequest();
            //var oauthToken = gapi.auth.getToken();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    //console.log(xhr.response);
                    //console.log(xhr.responseBody);
                    responseXML = xhr.response;
                    self.deleteContact(responseXML);
                    d.resolve();
                    self.isDeleting = false;
                    toaster.pop('success', 'Deleted ' + contact.name);

                }
            }
            xhr.open('GET',
              contact.id.$t.replace("google.com", "googleapis.com").replace("/base/", "/full/").replace("http:", "https:"));
            xhr.responseType = "document";
            xhr.setRequestHeader('Authorization',
              'Bearer ' + self._currentUser.access_token);
            xhr.setRequestHeader('GData-Version',
              '3.0');
            xhr.setRequestHeader("Content-type", "application/atom+xml");
            xhr.setRequestHeader("Data-type", "application/atom+xml");
            xhr.setRequestHeader('Accept',
              'text/javascript, text/html, application/xml, application/atom+xml, text/xml, application/json, */*');
            xhr.send();
            /*contact.$remove().then(function () {
                self.isDeleting = false;
                self.selectedContact = null;
                var index = self.contacts.indexOf(contact);
                self.contacts.splice(index, 1);
                toaster.pop('success', 'Deleted ' + contact.name);
                d.resolve();
            });*/
            return d.promise;
        },
        'getContact': function (email) {
            for (var i = 0; i < self.contacts.length; i++) {
                var c = self.contacts[i];
                if (c.email == email)
                    return c;
            }
        },
        'watchFilters': function () {
            $rootScope.$watch(function () {
                return self.search;
            }, function (newVal) {
                if (angular.isDefined(newVal)) {
                    self.doSearch();
                }
            });

            $rootScope.$watch(function () {
                return self.ordering;
            }, function (newVal) {
                if (angular.isDefined(newVal)) {
                    self.doOrder();
                }
            });
        },
        'setCurrentUser': function (user) {
            //console.log(user);
            //var d = $q.defer();
            if (user && !user.error) {
                self._currentUser = user;
                //console.log(self._currentUser);
                return self.currentUser();
                //d.resolve();
            }
            else {
                var d = $q.defer();
                d.reject(user.error);
                return d.promise;
            }
        },
        'currentUser': function () {
            var d = $q.defer();
            if (self._currentUser) {
                //console.log(self._currentUser);
                d.resolve(self._currentUser);
            }
            else {
                gapi.client.oauth2.userinfo.get()
                    .execute(function (e) {
                        self._currentUser = e;
                    });
            }
            return d.promise;
        }
    }
    
    if (self._currentUser) {
        self.loadContacts();
        self.watchFilters();
    }
    return self;
});
