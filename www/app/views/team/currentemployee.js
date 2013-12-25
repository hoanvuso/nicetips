/**
 * Created by david on 10/4/13.
 */
var CurrentEmployeeView = Parse.View.extend({

        el: '#edit-team',

        events: {
            'click #save-people': 'savePeople',
            'change #people-picture': 'loadThumbPicture',
            'click #my-ava': 'loadThumbAvatar',
            'click #print-badge': 'printBadge'
        },
        _errors: {},

        initialize: function () {
            this.model = new Employee;
            this.model.id = '';

            var view = this;
            $(document).ready(function () {
                $('#department-ui').tagHandler();
            })

            $(document).on('click', '.thumbnails li', function () {
                view.changeAvatar();
            });

            $(document).on('click', '#download-btn', function () {
                view.badgeSubmit();
            });

            $(document).on('click', '#list-opt', function () {
                view.showListPeopleAllDepartments();
            });

            $(document).on('click', '#department-opt', function () {
                view.showListPerDepartment();
            })

        },

        /*
         * @save people function from view.
         */

        savePeople: function () {

            // collect the info in input box
            this.collectForm();
            var model = this.model;

            // check the inputbox is valid or not
            if (this.checkValid()) {
                var notUpdateImage = false;
                utils.showLoading();
                // call the model for saving. check the image is not the default image
                var fileUpload = $('#people-picture')[0];
                var canvas = $('<canvas>');
                var ctx = canvas[0].getContext('2d');
                var image = new Image();
                var base64_image;

                if (fileUpload.files.length == 0) {
                    if ($('#people-thumb').attr('src') == defaultPeopleImage) {

                        image.onload = function () {
                            canvas.attr('width', '95');
                            canvas.attr('height', '95');

                            ctx.drawImage(image, 0, 0);
                            base64_image = canvas[0].toDataURL();
                            var pos = base64_image.search(',');
                            base64_image = base64_image.substring(pos + 1);

                            model.set({peoplePictureBase64: base64_image});
                            model.set({placeId: placeId});
                            attributes = model.attributes;
                            if (model.id != '')
                            // assign people id for update
                                attributes.objectId = model.id;

                            // saving people
                            model.save().done(function (resp) {
                                    // call the listView  to update people list
                                    listEmployeeView.updateItem(resp);
                                    utils.hideLoading();
                                }, function () {
                                    utils.hideLoading();
                                }
                            );

                        }
                        image.src = defaultPeopleImage;
                    } else {
                        notUpdateImage = true;
                    }

                } else {
                    // have file in the upload input
                    // set source to image.
                    image.onload = function () {
                        //set default value for canvas
                        canvas.attr('width', 250);
                        canvas.attr('height', 250);
                        if(image.width < 250) {
                            canvas.attr('width', image.width);
                        }
                        if(image.height < 250) {
                            canvas.attr('height', image.height);
                        }

                        ctx.drawImage(image, 0, 0);
                        base64_image = canvas[0].toDataURL();
                        var pos = base64_image.search(',');
                        base64_image = base64_image.substring(pos + 1);

                        model.set({peoplePictureBase64: base64_image});
                        model.set({placeId: placeId});
                        attributes = model.attributes;
                        if (model.id != '')
                        // assign people id for update
                            attributes.objectId = model.id;

                        // saving people
                        model.save().done(function (resp) {
                                // call the listView  to update people list
                                listEmployeeView.updateItem(resp);
                                utils.hideLoading();
                            }, function () {
                                utils.hideLoading();
                            }
                        );
                    }

                    image.src = $('#people-thumb').attr('src');

                }

                // set some attributes of the picture of people here.
                if (notUpdateImage) {
                    //base64_image = '';
                    this.model.set({peoplePictureBase64: ''});
                    this.model.set({placeId: placeId});

                    attributes = this.model.attributes;
                    if (this.model.id != '')
                    // assign people id for update
                        attributes.objectId = this.model.id;

                    // saving people
                    this.model.save().done(function (resp) {
                            // call the listView  to update people list
                            listEmployeeView.updateItem(resp);
                            utils.hideLoading();
                        }, function () {
                            utils.hideLoading();
                        }
                    );
                }
                // after saving create new a model for the view
                this.hideErrorMessages();
                this.resetInput();
                this.model = new Employee;
                this.model.id = '';

            } else {
                this.showErrorMessages()
            }
        },

        /*view
         @reset input
         */
        resetInput: function () {
            $('#surname').val('');
            $('#lastname').val('');
            $('#email').val('');
            $('#department').val('');
            $('#department-ui').find('.tagItem').remove();
            $('#people-thumb').attr('src', defaultPeopleImage);
            $('#people-thumb-base64').val('');
            $('#picture_real').attr('src', '');
            // replace file input with the new one
            var newFileInput = $('<input>');
            newFileInput.attr('type', 'file');
            newFileInput.attr('class', 'no-uniform');
            newFileInput.attr('name', 'file');
            newFileInput.attr('id', 'people-picture');
            $('#people-picture').replaceWith(newFileInput);
            // reset avatar thumb
            $('#avatar-thumb').attr('src', defaultAvatarThumb);
            // clear input content
            var input = $('#ava');
            input.replaceWith(input.val('').clone(true));
        },

        loadThumbPicture: function () {

            this.hideErrorMessages();
            var input = $('#people-picture')[0];
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#people-thumb').attr('src', e.target.result);

                    // set real picture for valid the image height, width
                    if ($('#picture_real').attr('src') != '') {

                        $('#picture_real').css('width', '');
                        $('#picture_real').css('height', '');
                    }
                    $('#picture_real').attr('src', e.target.result);

                    $('#people-thumb-base64').val(e.target.result);

                    // add error after user click Upload

                    if (input.files.length > 0) {
                        var width = parseInt($('#picture_real').css('width').substr(0, $('#picture_real').css('width').search('p')));
                        var height = parseInt($('#picture_real').css('height').substr(0, $('#picture_real').css('height').search('p')));
                        if (width * height > 160000) {
                            $('#image-error p').text('Image is too large. Please select smaller one');
                        }
                        var image_type = true;
                        switch (input.files[0].type) {
                            case 'image/png':
                            case 'image/jpeg':
                            case 'image/jpg':
                            {
                                break;
                            }
                            default :
                            {
                                $('#image-error p').text('Image type is invalid');
                            }
                        }
                    }


                };

                reader.readAsDataURL(input.files[0]);
            }
        },

        /*
         * load a list avatar for user select for people
         */

        loadThumbAvatar: function () {
            // get file list depended on number
            var avatarItems = '';
            for (var i = 1; i <= 35; i++) {
                if (i < 10) {
                    avatarItems = avatarItems + '<option data-img-src="' + wwwUrl + '/images/avatar/' + 'ava_' + '0' + i.toString() + '@2x.png' + '" value="' + '0' + i.toString() + '">';

                } else {
                    avatarItems = avatarItems + '<option data-img-src="' + wwwUrl + '/images/avatar/' + 'ava_' + i.toString() + '@2x.png' + '" value="' + i.toString() + '">';
                }
            }
            $('#avatar-list').html('');
            $('#avatar-list').append(avatarItems);
            $('#avatar-list').imagepicker();
            $('#avatar-list-dialog').dialog('open');

        },

        /*
         * @change the the current avatar to new avatar
         */
        changeAvatar: function () {
            var val = $('#avatar-list option:selected').val();

            $('#avatar-thumb').attr('src', wwwUrl + '/images/avatar/' + 'ava_' + val + '@2x.png');
            // set default thumb avatar
            $('#avatar-thumb-val').val(val);
            $('#avatar-list-dialog').dialog('close');
        },

        /*
         * @show the error messages after input errors
         */

        showErrorMessages: function () {

            var errors = this._errors;
            $.each(errors, function (error) {
                switch (error) {
                    case 'lastname' :
                    {
                        $('#lastname-error p').text('This field is blank');
                        break;
                    }
                    case 'email_not_valid' :
                    {
                        $('#email-error p').text('Email is not valid');
                        break;
                    }
                    case 'department':
                    {
                        $('#department-error p').text('This field is blank');
                        break;
                    }

                    case 'image_size' :
                    {
                        $('#image-error p').text('Image is too large. Please select other one');
                        break;
                    }

                    case 'image_type' :
                    {
                        $('#image-error p').text('Image type is invalid');
                        break;
                    }
                    case 'image_blank':
                    {
                        $('#image-error p').text('People picture is blank');
                        break;
                    }
                }
            })

        },
        /*
         * @hide the error messages after save successfully
         */

        hideErrorMessages: function () {
            $('#surname-error p').text('');
            $('#lastname-error p').text('');
            $('#email-error p').text('');
            $('#department-error p').text('');
            $('#image-error p').text('');
        },


        /*
         @check the input value
         @return true or false
         */
        checkValid: function () {
            this._errors = {};

            // valid lastname
            if ($('#lastname').val().trim() == '') {
                this._errors.lastname = true;
            }

            // valid email
            var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
            var email = $('#email');
            if (email.val() != '') {
                if (!pattern.test(email.val()))
                    this._errors.email_not_valid = true;
            }

            // check the dimension of the picture
            var input;
            input = $('#people-picture')[0];
            var view = this;
            if (input.files.length > 0) {
                var height = parseInt($('#picture_real').css('height').substr(0, $('#picture_real').css('height').search('p')));
                var width = parseInt($('#picture_real').css('width').substr(0, $('#picture_real').css('width').search('p')));
                if (width * height > 160000) {
                    view._errors.image_size = true;
                }

                view._errors.image_type = true;
                switch (input.files[0].type) {
                    case 'image/png':
                    case 'image/jpeg':
                    case 'image/jpg':
                        delete view._errors.image_type;

                }
            }


            return Object.keys(this._errors).length == 0;

        },

        /*
         collect info from form to model
         */
        collectForm: function () {
            this.model.set({
                peopleName: $('#lastname').val().trim(),
                email: $('#email').val(),
                avatar: $('#avatar-thumb-val').val(),
                department: $('#department-ui').tagHandler('getTags')
            });
        },

        /*
         @show print review the Badge
         */
        printBadge: function () {
            $('#badge-dialog').dialog('open');
            // default
            this.showListPeopleAllDepartments();

        },

        /*
         @show the list of all people of department to the ui
         */
        showListPeopleAllDepartments: function () {
            var html_placeName = '<div id="badge_placename"><h2>' + placeName + '</h2></div>';
            var html_qrCode = '<div id="badge_qrcode" style="float:left;margin-left:300px;height: 200px"><img src=' + placeQrCode + '></div>';
            var html_listpeople = '';
            var html_header =
                '<div id="badge_peoplelist">' +
                    '<table cellpadding="0" cellspacing="0" style="width:100%; border: 1px solid #ff0087;">' +
                    '<tr>' +
                    '<th style="color:#FF0087; font-weight:normal;width: 150px;padding:5px;text-align: center">Name</th>' +
                    '<th style="color:#FF0087; font-weight:normal;width: 170px;padding:5px;text-align: center">Avatar</th>' +
                    '<th style="color:#FF0087; font-weight:normal;width: 170px;padding:5px;text-align: center">Email</th>' +
                    '<th style="color:#FF0087; font-weight:normal;width: 170px;padding:5px;text-align: center">Department</th>' +
                    '</tr>';
            var html_footer = '</table></div>';
            var html_content = '';

            _.each(listEmployeeView.model.models, function (item) {

                html_content = html_content +
                    '<tr>' +
                    '<td style="width: 150px; text-align: center">' + item.get('peopleName') + '</td>' +
                    '<td style="width: 170px; text-align: center"><img style="width: 80px;height: 80px" ' +
                    '   src="' + ((item.get('peoplePictureImage') != '') ? item.get('peoplePictureImage') : defaultPeopleImage) + '"></td>' +
                    '<td style="width: 170px; text-align: center">' + item.get('email') + '</td>' +
                    '<td style="width: 170px; text-align: center">' + item.get('department').join(', ') + '</td>' +
                    '</tr>';
            });

            html_listpeople = html_header + html_content + html_footer;
            $('#print-people-list').html('');
            $('#print-people-list').append(html_placeName);
            $('#print-people-list').append(html_qrCode);
            $('#print-people-list').append(html_listpeople);
        },

        /*
         @show the list of people of each department group by
         */
        showListPerDepartment: function () {
            var html_placeName = '<div id="badge_placename"><h2>' + placeName + '</h2></div>';
            var html_qrCode = '<div id="badge_qrcode" style="float:left;margin-left:300px;height: 200px">' +
                '<img src=' + placeQrCode + '></div>';
            var html_listpeople = '';
            var departmentArray = new Array();

            //build a array contain all  departments of the people
            _.each(listEmployeeView.model.models, function (item) {
                _.each(item.get('department'), function (department) {
                    if ($.inArray(department, departmentArray) == -1) {
                        departmentArray.push(department);
                    }
                })
            });

            $('#print-people-list').html('');
            $('#print-people-list').append(html_placeName);
            $('#print-people-list').append(html_qrCode);

            // create people list for each department
            _.each(departmentArray, function (departmentName) {
                html_listpeople = '';
                var html_header =
                    '<div id="badge_peoplelist" style="float: left">' +

                        '<h4 style="float: left; padding:10px;">Department name : ' + departmentName + '</h4>' +
                        '</br>' +
                        '<div id="badge_peoplelist">' +
                        '<table cellpadding="0" cellspacing="0" style="width:100%; border: 1px solid #ff0087;">' +
                        '<tr>' +
                        '<th style="color:#FF0087; font-weight:normal;width: 210px;padding:5px;text-align: center">Name</th>' +
                        '<th style="color:#FF0087; font-weight:normal;width: 230px;padding:5px;text-align: center">Avatar</th>' +
                        '<th style="color:#FF0087; font-weight:normal;width: 230px;padding:5px;text-align: center">Email</th>' +
                        '</tr>';
                var html_footer = '</table></div>';
                var html_content = '';

                _.each(listEmployeeView.model.models, function (item) {
                    if ($.inArray(departmentName, item.get('department')) > -1) {
                        html_content = html_content +
                            '<tr>' +
                            '<td style="width: 210px; text-align: center">' + item.get('peopleName') + '</td>' +
                            '<td style="width: 230px; text-align: center"><img style="width: 80px;height: 80px" ' +
                            '   src="' + ((item.get('peoplePictureImage') != '') ? item.get('peoplePictureImage') : defaultPeopleImage) + '"></td>' +
                            '<td style="width: 230px; text-align: center">' + item.get('email') + '</td>' +
                            '</tr>';
                    }
                });
                html_listpeople = html_header + html_content + html_footer;
                $('#print-people-list').append(html_listpeople);

            });

        },

        /*
         @submit the badge form to convert to pdf download
         */
        badgeSubmit: function () {
            var html = $('#print-people-list').html();
            $('#html_string').val(html);
            $('#download-pdf-form').submit();

        },

        /*
         display the information in current view for edit
         */
        displayEdit: function (editModel) {

            $('#lastname').val(editModel.get('peopleName'));
            $('#email').val(editModel.get('email'));
            // reload the people picture thumb
            $('#people-thumb').attr('src', (editModel.get('peoplePictureImage') != '') ? editModel.get('peoplePictureImage') : defaultPeopleImage);
            // reload avatar thumb
            $('#avatar-thumb').attr('src', wwwUrl + '/images/avatar/' + 'ava_' + editModel.get('peopleAvatar') + '@2x.png');
            var department = editModel.get('department');
            $('#department-ui').tagHandler({assignedTags: department });
        }
    })
    ;
