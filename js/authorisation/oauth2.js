var oauth2 = {

        access_token_url: "https://github.com/login/oauth/access_token",
        authorization_url: "https://github.com/login/oauth/authorize",
        client_id: "91ddd618eba025e4104e",
        redirect_url: "https://scaria.dev/github-tree-graph/success/",
        scope: "repo:read",

        key: "oauth2_token",

        /**
         * Starts the authorization process.
         */
        start: function() {
            window.close();
            var url = this.authorization_url + "?client_id=" + this.client_id + "&redirect_uri=" + this.redirect_url + "&scope=" + this.scope;
            window.open(url, "oauth2_popup", "width=800,height=600");
        },

        /**
         * Finishes the oauth2 process by exchanging the given authorization code for an
         * authorization token. The authroiztion token is saved to the browsers local storage.
         * If the redirect page does not return an authorization code or an error occures when 
         * exchanging the authorization code for an authorization token then the oauth2 process dies
         * and the authorization tab is closed.
         * 
         * @param url The url of the redirect page specified in the authorization request.
         */
        finish: function(url) {
            console.log("Recieved Url is ");
            console.log(url);

            function removeTab() {
                // chrome.tabs.getCurrent(function(tab) {
                //     chrome.tabs.remove(tab.id);
                // });
            };

            if(url.match(/\?error=(.+)/)) {
                removeTab();
            } else {
                var code = url.match(/\?code=([\w\/\-]+)/);

                var that = this;
                var data = new FormData();
                data.append('client_id', this.client_id);
                data.append('client_secret', this.client_secret);
                data.append('code', code);

                // Send request for authorization token.
                var xhr = new XMLHttpRequest();
                xhr.addEventListener('readystatechange', function(event) {
                    if(xhr.readyState == 4) {
                        if(xhr.status == 200) {
                            if(xhr.responseText.match(/error=/)) {
                                removeTab();
                            } else {
                                var token = xhr.responseText.match(/access_token=([^&]*)/)[1];
                                window.localStorage.setItem(that.key, token);
                                removeTab();
                            }
                        } else {
                            removeTab();
                        }
                    }
                });
                xhr.open('POST', this.access_token_url, true);
                xhr.send(data);
            }
        },

        /**
         * Retreives the authorization token from local storage.
         *
         * @return Authorization token if it exists, null if not.
         */
        getToken: function() {
            return window.localStorage.getItem(this.key);
        },

        /**
         * Clears the authorization token from the local storage.
         */
        clearToken: function() {
            delete window.localStorage.removeItem(this.key);
        }
    };
