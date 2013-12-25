/**
 * Created by david on 10/4/13.
 */
var TipsView = Parse.View.extend({


    el: '#divVote',
    peopleList : '',


    events: {
        // edit event for the people account payment item
        'click .edit-btn': function (e) {
            e.preventDefault();
            var index = $(e.target).closest('tr').index();
            this.displayEdit(index);
        },
        // save the paypal account of the people
        'click .save-btn': function (e) {
            e.preventDefault();
            // save the model
            var index = $(e.target).closest('tr').index();
            // set the value in model
            var accountName = $(e.target).closest('tr').find('input').val();
            this.accounts.models[index-1].set({accountName:accountName});
            var name = this.accounts.models[index-1].get('name');
            this.savePaypalAccount(index);

            // set the value in to the list
            var text_box = $($('#view1').find('tr')[index]).find('.edit-txt');
            if (text_box.attr('readonly') != 'readonly') {
                // text box is ready to save
                text_box.attr('readonly', true);
                text_box.attr('style', '');
            }
            _.each(this.peopleList,function(item){
                if(item.people.peopleName == name) {
                    item.people.peopleEmail = accountName;
                }
            });


            this.renderPeopleDialog();

        },
        // delete paypal account for the people
        'click .delete-btn': function (e) {
            e.preventDefault();
            var index = $(e.target).closest('tr').index();
            $(e.target).closest('tr').remove();
            // call the model to destroy
            this.accounts.models[index-1].destroy();
            // delete on view because the view of every model is not a 'tr' tag of the table. Find and delete manually
            $($(this.el).closest('tr')[index]).remove();
            // render people dialog for add
            this.renderPeopleDialog();
        },
        // edit event for focus into place payment account
        'click #edit-btn': function (e) {
            $('#paypal-place-account').focus();
        },

        // save event for save place payment account
        'click #save-btn': function (e) {
            e.preventDefault();

            this.savePlace();

        },

        // delete event for delete place payment account
        'click #delete-btn': function (e) {
            e.preventDefault();
            this.deletePlaceAccount();
        },
        // active tip config
        'click #active-tips': function () {
            if ($('#active-tips').is(':checked')) {
                // unlock the check box show tips
                $('#show-tips').removeAttr('disabled');

            } else {
                // disable the show tip
                $('#show-tips').removeAttr('checked');
                $('#show-tips').attr('disabled', 'disabled');
            }
        },

        // event save tip config
        'change .save-tip-config': function (e) {
            // get the value from UX
            e.preventDefault();
            var activeStatus = '';
            var showTip = '';
            if ($('#active-tips').is(':checked')) {
                activeStatus = true;
            }
            if ($('#show-tips').is(':checked')) {
                showTip = true;
            }
            // call static function for saving
            Tip.saveTipConfig(placeId, activeStatus, showTip);
        },
        'change #value-cash': function (e) {
            var valueCash = $('#value-cash').val();
            Tip.saveValueCash(placeId, valueCash);
        }

    },

    /*
     *  initialize tipView
     */

    initialize: function () {

        var view = this;
        this.accounts = new TipCollection;
        $(document).on('click', '#download-btn', function (e) {
            e.preventDefault();
            view.InfographicSubmit();
        });
        $(document).on('click', '#print-infographic-btn', function () {
            view.printInfographic();
        });
        this.accounts.on('add', function (newitem) {
            view.addNewRow(newitem);
        });
        this.accounts.on('destroy',function(deleteItem){
            // call the UI delete and delete on parse
            view.deletePaypalAccount(deleteItem)
        })
        // the add people btn in the dialog is not inside the scope. Use jQuery for delegate Event click
        $(document).on('click', '.add-people-btn', function (e) {
            e.preventDefault();
            var objectId = $(this).closest('tr').find('td').eq(0).text();
            var name = $(this).closest('tr').find('td').eq(1).text();
            var accountName = $(this).closest('tr').find('td').eq(2).text();
            var info = {objectId: objectId, name: name, accountName: accountName};

            view.addMoreEmployeePayment(info);
            // change the status to added
            $(this).replaceWith('Added');

        });

    },

    /*
     @render the people list
     */
    render: function (list) {
        for (var i = 0; i < list.length; i++) {
            var payment = new Tip;
            payment.set({ name: list[i].name,
                          accountName: list[i].accountName,
                          objectId: list[i].objectId
            });
            this.accounts.add(payment);
        }
    },

    /**
     *load people payment from parse
     */
    getPeopleList: function () {
        var view = this;
        utils.showLoading();
        Tip.getPeople(placeId).done(function (resp) {
            // add people into people dialog
            view.render(resp.payment_list);
            view.peopleList = resp.people_list;
            view.renderPeopleDialog();
            utils.hideLoading();
        }, function () {
            utils.hideLoading();
        })
    },
    /**
     * handle add row from the model
     * @param newitem : new Model item added.
     */

    addNewRow: function (newitem) {
        var html_string =
            '<tr>' +
                '<td>' + newitem.get('name') + '</td>' +
                '<td><input type="text" class="edit-txt" readonly value="' + newitem.get('accountName') + '"></td>' +
                '<td><a href="#" class="save-btn"><img src="' + wwwUrl + 'www/images/plus.png"></i></a></td>' +
                '<td><a href="#" class="edit-btn"><i class="action edit"></i></a></td>' +     // call edit function
                '<td><a href="#" class="delete-btn"><i class="action delete"></i></a></td>' +   // call delete function
                '</tr>';

        $('#view1').append(html_string);

    },
    /*
     * display edit for people payment account
     */

    displayEdit: function (index) {
        var text_box = $($('#view1').find('tr')[index]).find('.edit-txt');
        // unlock text box for edit
        text_box.attr('readonly', false);
        text_box.attr('style', 'border:1px solid !important');
        text_box.focus();
    },

    /*
     * @save the paypal account of the people
     */

    savePaypalAccount: function (index) {
        utils.showLoading();
       // var account = this.accounts.at(index-1);
        var account = this.accounts.at(index-1);

        account.save().done(function (resp) {
            utils.hideLoading();
            account.id = resp.id;
        }, function () {
            utils.hideLoading();
        });
    },
    /**
     * call delete people payment paypal account from parse
     */
    deletePaypalAccount: function (deleteItem) {
        var view = this;
        utils.showLoading();
        deleteItem.delete().done(function () {
            utils.hideLoading();
        }, function () {
            utils.hideLoading();
        })
    },
    /*
     * Save place payment account. Save payment account of place for payment all people
     */

    savePlace: function () {
        var view = this;
        // get accountName of the people
        var accountName = $('#paypal-place-account').val();
        if (placeId != '') {
            utils.showLoading();
            // call the static function for save place account
            Tip.savePlaceAccount(placeId, accountName).done(function () {
                utils.hideLoading();
            }, function () {
                utils.hideLoading();
            })
        }
    },
    /*
     * delete payment account of place.
     */

    deletePlaceAccount: function () {
        var view = this;

        view.showLoading();
        $.ajax({
            url: deletePlacePaypalAccountUrl,
            type: 'POST',
            dataType: 'json',
            data: {placeId: placeId, accountName: $('#paypal-place-account').val() },
            success: function (resp) {
                $('#paypal-place-account').val('');
                view.hideLoading();
            }
        })
    },

    /*
     * print infograhic (List of review tips)
     */

    printInfographic: function () {
        var title = '<h3 style="text-align: center">Infographic Tip Vote</h3>';
        var html_listVote = '';
        var html_header =
            '<div id="infographic_votelist">' +
                '<table cellpadding="0" cellspacing="0" style="width:100%; border: 1px solid #ff0087;">' +
                '<tr>' +
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">Date</th>' +
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">To</th>' +
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">Amount</th>' +
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">From</th>' +
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">Commments</th>' +
                '</tr>';
        var html_footer = '</table></div>';
        var html_content = '';

        _.each(tipsView.model.models, function (item) {

            var date = dateFormat(new Date(item.createdAt), 'dd/mm/yyyy HH:MM');
            html_content = html_content +
                '<tr>' +
                '<td style="width: 125px; text-align: center;padding: 5px">' + date + '</td>' +
                '<td style="width: 125px; text-align: center;padding: 5px">' + item.get('people').get('peopleName') + '</td>' +
                '<td style="width: 125px; text-align: center;padding: 5px">' + item.get('amount') + '</td>' +
                '<td style="width: 125px; text-align: center;padding: 5px">' + 'Anonymous' + '</td>' +
                '<td style="width: 125px; text-align: center;padding: 5px">' + item.get('comment') + '</td>' +
                '</tr>';
        });

        var html_list = html_header + html_content + html_footer;
        $('#print-infographic').html('');
        $('#print-infographic').append(title);
        $('#print-infographic').append(html_list);

        $('#tips-infographic-dialog').dialog('open');

    },

    /*
     * submit inforgrahic form form info
     */
    InfographicSubmit: function () {
        var html = $('#print-infographic').html();
        $('#html_string').val(html);
        $('#download-pdf-form').submit();
    },

    /**
     * render all people in parse to add more dialog.
     * use to select and add the new employee to the tips payment account
     */

    renderPeopleDialog: function () {
        // remove all item first
        $('#view-people-add').find('tr').remove();
        // render
        var list = this.peopleList;
        var accountList = this.accounts.models;
        //use peopleEmail for identify people is exist in accountList or not.
        var inAccountList = function (name) {
            var str = '';

            _.each(accountList, function (item) {
                if (item.get('name') == name) {
                    str = 'Added';
                }
            });
            return (str!='')?str:'<a href="#" class="add-people-btn"><img src="' + wwwUrl + 'www/images/plus.png"></a>';

        };
        _.each(list, function (item) {

            var html_string = '<tr>' +
                '<td>' + item.people.objectId + '</td>' +
                '<td>' + item.people.peopleName + '</td>' +
                '<td>' + item.people.peopleEmail + '</td>' +
                '<td>' +
                inAccountList(item.people.peopleName) +
                '</td>' +
                '</tr>';
            $('#view-people-add').append(html_string);
        });
    },

    /**
     * handle the select and add more employee payment account from the "Add more dialog"
     * @param : info - the info from the dialog for creating new model item to add to model
     */
    addMoreEmployeePayment: function (info) {
        var newPaymentItem = new Tip;
        newPaymentItem.set({name: info.name, accountName: info.accountName,objectId:info.objectId});
        // add to collection
        this.accounts.add(newPaymentItem);
        // save it
        this.savePaypalAccount(this.accounts.models.length);
    }
});


/*
 * Vote handler
 */

window.VoteView = Parse.View.extend({
    el: 'divVote',
    events: {},
    initialize: function () {
        _.bindAll(this, 'render', 'paginate');
    },
    render: function () {
        this.paginate();
    },
    paginate: function (page) {
        $('#tbl-vote tr:gt(0)').remove();
        $('.pagination').html('');

        if (page == null || page <= 0) {
            page = 1;
        }

        var limit = 9;
        var offset = limit * (page - 1);

        //find the vote
        var Vote = Parse.Object.extend("Vote");
        var query = new Parse.Query(Vote);
        query.equalTo('placeId',placeId);
        query.greaterThan('amount',0);
        query.descending('createdAt');
        //pagination
        query.count({
            success: function (count) {
                var totalPage = Math.ceil(count / limit);

                // The count request succeeded. Show the count
                for (i = 1; i <= totalPage; i++) {
                    $('.pagination').append('<a href="#page/' + i + '">' + ' ' + i + ' ' + '</span>');
                }
            },
            error: function (error) {
                // The request failed
            }
        });

        query.limit(limit);
        query.skip(offset);
        query.descending("createdAt");
        query.find({
            success: function (results) {
                _.defer(function () {
                    $('.loading').hide();
                });
                // remove the current collection tip items
                if (tipsView.model.length > 0) {
                    tipsView.model.reset();
                }

                _.each(results, function (vote) {
                    // add tipVote to tip collection for print the infographic


                    var peopleObj = vote.get('people');
                    if (peopleObj != 'undefined') {
                        var people = Parse.Object.extend("People");
                        var peopleQuery = new Parse.Query(people);


                        peopleQuery.get(peopleObj.id, {
                            success: function (returnPeople) {

                                // The object was retrieved succesfully.
                                vote.set('people', returnPeople);
                                tipsView.model.add(vote);
                                var date = dateFormat(new Date(vote.createdAt), 'dd/mm/yyyy HH:MM');

                                //find user
                                var userObj = vote.get('user');

                                if (userObj != null) {
                                    var user = Parse.Object.extend('User');
                                    var userQuery = new Parse.Query(user);
                                    userQuery.get(userObj.id, {
                                        success: function (returnUser) {
                                            vote.creatorName = returnUser.get('username');
                                            vote.peopleName = returnPeople.get('peopleName');
                                            var html = '<tr>\n\
                                                        <td>' + date + '</td>\n\
                                                        <td>' + returnPeople.get('peopleName') + '</td>\n\
                                                        <td>' + vote.get('currency') + vote.get('amount') + '</td>\n\
                                                        <td>' + returnUser.get('username') + '</td>\n\
                                                        <td>' + vote.get('comment') + '</td>\n\
                                                    </tr>';
                                            $('#tbl-vote').append(html);
                                        }
                                    });
                                } else {
                                    //
                                    var html = '<tr>\n\
                                                <td>' + date + '</td>\n\
                                                <td>' + returnPeople.get('peopleName') + '</td>\n\
                                                <td>' + vote.get('currency') + vote.get('amount') + '</td>\n\
                                                <td>' + 'Anonymous' + '</td>\n\
                                                <td>' + vote.get('comment') + '</td>\n\
                                            </tr>';
                                    $('#tbl-vote').append(html);
                                }


                            },
                            error: function (object, error) {
                                // The object was not retrieved successfully.

                            }
                        });
                    }
                });
            },
            error: function (error) {
                //alert("Error: " + error.code + " " + error.message);
            }
        });
    }
});


var AppRouter = Parse.Router.extend({
    routes: {
        "": "index",
        'page/:page': 'index'
    },
    initialize: function () {
        this.voteView = new VoteView();
    },
    //index action
    index: function (page) {
        if (page == null) {
            this.voteView.render();
        } else {
            this.voteView.paginate(page);
        }
    }

});

app = new AppRouter();
Parse.history.start();