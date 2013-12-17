/**
 * Created by david on 10/4/13.
 */
var Employee = Parse.Object.extend('People', {
        defaults: {
            confirmed: false,
            paymentAccount: '',
            peopleName: '',
            department: '',
            placeId: '',
            qrcode: '',
            df_peopleRoleId: '',
            peoplePictureImage: '',      // this is a image url for display image in view
            peoplePictureBase64: '',     // this is a peoplePicture data in base 64 code
            namePicture: '',
            downloadPDFUrl: ''
        },

        initialize: function () {

        },
        /*
         @save pass params to server as proxy for saving data, upload picture
         */
        save: function () {
            var model = this;
            var dfd = new $.Deferred();
            $.ajax({
                url: saveUrl,
                type: 'POST',
                dataType: 'json',
                data: model.attributes,
                success: function (resp) {
                    // invoke list to update
                    dfd.resolve(resp);
                }
            });
            return dfd.promise();
        },
        /*
         delete people from parse
         */

        delete: function () {
            var model = this;
            var dfd = new $.Deferred();
            $.ajax({
                url: deteteUrl,
                type: 'POST',
                dataType: 'json',
                data: {objectId: model.id},
                success: function (resp) {
                    // invoke list to update
                    dfd.resolve(resp);
                }
            });
            return dfd.promise();
        }
    },
    {
        /*
         * static function for get people for placeId
         */
        getPeople: function (placeId) {
            var dfd = new $.Deferred();
            $.ajax({
                url: getPeopleUrl,
                type: 'POST',
                dataType: 'json',
                data: {placeId: placeId},
                success: function (response) {
                    if (response != null) {
                        // render the list
                        dfd.resolve(response.result);
                    }
                }
            });
            return dfd.promise();
        }
    }

);




