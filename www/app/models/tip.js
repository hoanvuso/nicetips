/**
 * Created by david on 10/15/13.
 */

var Tip = Parse.Object.extend('Tip', {

    initialize: function () {

    },



    /*
     * @model function for saving people paypal account
     */

    save : function () {
        var model = this;
        var dfd = new $.Deferred();
        $.ajax({
            url: saveUrl,
            type: 'POST',
            dataType: 'json',
            data: {objectId: model.id, accountName: model.get('accountName'), name: model.get('name'), placeId : placeId},
            success: function (resp) {
                dfd.resolve(resp);
            }
        });
        return dfd.promise();
    },
    /*
     * @model function for deleting people paypal account
     */
    delete : function() {
        var dfd = new $.Deferred();
        var model = this;
        $.ajax({
            url: deleteUrl,
            type: 'POST',
            dataType: 'json',
            data: {objectId: model.id},
            success: function (resp) {
               dfd.resolve(resp);

            }
        });
        return dfd.promise();
    }

}, {

    /*
     * @get people list of this place
     */

    getPeople : function(placeId) {
        var dfd = new $.Deferred();
        $.ajax({
            url: getPeopleAccountUrl,
            type: 'POST',
            dataType: 'json',
            data: {placeId: placeId},
            success: function (resp) {
                dfd.resolve(resp);
            }
        });
        return dfd.promise();
    },
    // static function for saving place payment account for place
    savePlaceAccount: function (placeId, accountName) {
        var dfd = new $.Deferred();
        $.ajax({
            url: savePlacePaypalAccount,
            type: 'POST',
            dataType: 'json',
            data: {placeId: placeId, accountName: accountName },
            success: function (resp) {
                dfd.resolve(resp);
            }
        })
        return dfd.promise();
    },
    // static function for saving place config eg : show tip, active tip
    saveTipConfig : function(placeId, active,show) {
        utils.showLoading();
        $.ajax({
            url: saveTipConfigUrl,
            type: 'POST',
            dataType: 'json',
            data: {placeId: placeId, active_tips : active, show_tips : show },
            success: function (resp) {
                utils.hideLoading();
            }
        })

    },
    saveValueCash : function(placeId,valueCash) {
        utils.showLoading();
        $.ajax({
            url: saveValueCashUrl,
            type: 'POST',
            dataType: 'json',
            data: {placeId: placeId, valueCash : valueCash },
            success: function (resp) {
                utils.hideLoading();
            }
        })
    }


})
