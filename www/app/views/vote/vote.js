/**
 * Created by david on 10/22/13.
 */
window.VoteView = Parse.View.extend({
    el: '#divVote',
    events: {
       // 'click #print-vote-infographic-btn' : 'printInfographic'
    },

    printInfographic: function () {

        var title = '<h3 style="text-align: center">Infographic Tip Vote</h3>';
        var html_listVote = '';
        var html_header =
            '<div id="infographic_votelist">' +
                '<table cellpadding="0" cellspacing="0" style="width:100%; border: 1px solid #ff0087;">' +
                '<tr>' +
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">Date</th>' +
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">To</th>' +
                /*'<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">Amount</th>' +*/
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">From</th>' +
                '<th style="color:#FF0087; font-weight:normal;width: 125px;padding:5px;text-align: center">Commments</th>' +
                '</tr>';
        var html_footer = '</table></div>';
        var html_content = '';

        _.each(this.model.models, function (item) {

            console.log(item.get('creator').get('username'));
            var date = dateFormat(new Date(item.createdAt), 'dd/mm/yyyy HH:MM');
            html_content = html_content +
                '<tr>' +
                '<td style="width: 125px; text-align: center;padding: 5px">' + date + '</td>' +
                '<td style="width: 125px; text-align: center;padding: 5px">' + item.get('people').get('peopleName') + '</td>' +
                /*'<td style="width: 125px; text-align: center;padding: 5px">' + item.get('amount') + '</td>' +*/
                '<td style="width: 125px; text-align: center;padding: 5px">' + 'Anonymous' + '</td>' +
                '<td style="width: 125px; text-align: center;padding: 5px">' + item.get('comment') + '</td>' +
                '</tr>';
        });

        var html_list = html_header + html_content + html_footer;
        $('#print-infographic').html('');
        $('#print-infographic').append(title);
        $('#print-infographic').append(html_list);

        $('#vote-infographic-dialog').dialog('open');

    },

    initialize: function() {
        var view = this;
        this.model = new TipCollection();
        $(document).on('click','#print-vote-infographic-btn',function(){
            view.printInfographic();
        });
        $(document).on('click', '#download-btn', function (e) {
            e.preventDefault();
            view.InfographicSubmit();
        });
        _.bindAll(this, 'render', 'paginate');
    },

    /**
     * submit the inforgraphic form to download
     * @constructor
     */
    InfographicSubmit: function () {
        var html = $('#print-infographic').html();
        $('#html_string').val(html);
        $('#download-pdf-form').submit();
    },

    render: function() {
       this.paginate();
    },
    paginate: function(page) {
        $('#tbl-vote tr:gt(0)').remove();
        $('.pagination').html('');

        if(page == null || page <= 0){
            page = 1;
        }

        var limit = 9;
        var offset = limit * (page-1);

        //find the vote
        var Vote = Parse.Object.extend("Vote");
        var query = new Parse.Query(Vote);
        query.equalTo('placeId',placeId);
        query.equalTo('amount',null);
        query.descending('createdAt');
        //pagination
        query.count({
            success: function(count) {
                //console.log(count);
                var totalPage = Math.ceil(count / limit);

                // The count request succeeded. Show the count
                for (i = 1; i <= totalPage; i++) {
                    $('.pagination').append('<a href="#page/'+i+'">' + ' ' + i + ' ' +'</span>');
                }
            },
            error: function(error) {
                // The request failed
            }
        });

        query.limit(limit);
        query.skip(offset);
        query.descending("createdAt");
        query.find({
            success: function(results) {

                _.defer(function() {
                    $('.loading').hide();
                });

               // remove the current collection tip items
                if (app.voteView.model.length > 0) {
                    app.voteView.model.reset();
                }

                _.each(results, function(vote) {


                    var peopleObj = vote.get('people');
                    if (peopleObj != 'undefined') {

                        var people = Parse.Object.extend("People");
                        var peopleQuery = new Parse.Query(people);

                        app.voteView.model.add(vote);
                        peopleQuery.get(peopleObj.id, {
                            success: function(returnPeople) {
                                // The object was retrieved succesfully.
                                vote.set('people', returnPeople);
                                var date = dateFormat(new Date(vote.createdAt), 'dd/mm/yyyy HH:MM');

                                //find user
                                var userObj = vote.get('user');

                                if (userObj != null) {
                                    var user = Parse.Object.extend('User');
                                    var userQuery = new Parse.Query(user);
                                    userQuery.get(userObj.id, {
                                        success: function(returnUser) {
                                            //
                                            var html = '<tr>\n\
                                                        <td>' + date + '</td>\n\
                                                        <td>' + returnPeople.get('peopleName') + '</td>\n\
                                                        <td>' + (returnUser.get('username')!='undefined')?returnUser.get('username'):'Anonymous' + '</td>\n\
                                                        <td>' + vote.get('comment') + '</td>\n\
                                                    </tr>';
                                            $('#tbl-vote').append(html);
                                        }
                                    });
                                } else {
                                    var html = '<tr>\n\
                                                <td>' + date + '</td>\n\
                                                <td>' + returnPeople.get('peopleName') + '</td>\n\
                                                <td>' + 'Anonymous' + '</td>\n\
                                                <td>' + vote.get('comment') + '</td>\n\
                                            </tr>';
                                    $('#tbl-vote').append(html);
                                }


                            },
                            error: function(object, error) {
                                // The object was not retrieved successfully.
                                // console.log(error);
                            }
                        });
                    }
                });
            },
            error: function(error) {
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
    initialize: function() {
        this.voteView = new VoteView();
    },
    //index action
    index: function(page) {
        if(page == null){
            this.voteView.render();
        }else{
            this.voteView.paginate(page);
        }
    }
});

app = new AppRouter();
Parse.history.start();