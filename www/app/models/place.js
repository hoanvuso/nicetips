/**
 * Created by david on 10/7/13.
 */
/**
 * Created by david on 10/4/13.
 */
var Place = Parse.Object.extend('Place', {

    initialize: function () {},
    /*
     @ call server for save place
     */
    save: function () {
        var model = this;
        var dfd = $.Deferred();
        $.ajax({
            url: saveUrl,
            type: 'POST',
            dataType: 'json',
            data: model.attributes,
            success: function (resp) {
                dfd.resolve(resp);
            }
        });
        return dfd.promise();
    },

    /*
     * model call the server to place
     */

    delete: function (placeId) {
        var model = this;
        var dfd = new $.Deferred();
        $.ajax({
            url: deletePlaceUrl,
            type: 'POST',
            dataType: 'json',
            data: {placeId: placeId},
            success: function () {
                dfd.resolve();
            }
        });
        return dfd.promise();

    }

});

