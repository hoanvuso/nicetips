/**
 * This view for load user in list and handle the list, edit, delete feature of
 * people on Parse
 */

var ListEmployeeView = Parse.View.extend({

    el: '#view1',
    editIndex : '',   // index of edited item on list mark it for update item
    events : {

        // delete event for delete button of list people
        'click .delete-btn' : function(e) {
            e.preventDefault()
            var index = $(e.target).closest('tr').index();

            // call delete on Parse
            utils.showLoading();
            this.model.at(index - 1).delete().done(function(resp){
                utils.hideLoading();
            }, function(){
                utils.hideLoading();
            });
            // call delete model on client collection
            this.model.remove(this.model.at(index - 1));
        },

        // edit event for edit button of list people
        'click .edit-btn' : function(e) {
            e.preventDefault();
            this.editIndex = $(e.target).closest('tr').index();
            var editModel = this.model.at(this.editIndex - 1);
            currentEmployeeView.hideErrorMessages();

            // set current model of the currentEmployeeView is editModel
            currentEmployeeView.model = editModel;
            currentEmployeeView.displayEdit(editModel);

        }
    },

    initialize: function () {
        var view = this;

        // trigger the collection when add a new item to it. Auto add new row on the view
        this.model.on('add', function (newitem) {
            view.addNewRow(newitem)
        });
        // trigger the collection when delete a row on view. Auto delete row on the view.
        this.model.on('remove', this.deleteRow);
    },
    /*
     * @render the list of people.
     */
    render: function (list) {
        window.list = list;
        var view = this;
        // we clear all the models on the list
        this.model.remove(this.model.models);
        var requests = new Array();
        // apply new people list on it.
        for (var i = 0; i < list.length; i++) {
            var emp = new Employee;
            // create new model for adding to collection
            emp.set({  peopleName: list[i].people.peopleName,
                       email: list[i].people.peopleEmail,
                       objectId: list[i].people.objectId,
                       peoplePictureImage : (typeof list[i].people.peoplePicture!='undefined')?list[i].people.peoplePicture.url:'',
                       department: window.utils.departmentToArray(list[i].departments),
                       qrcode:list[i].people.qrcode,
                       df_peopleRoleId : list[i].peopleRoleId,
                       peopleAvatar: list[i].people.peopleAvatar
            });
            view.model.add(emp);
        }
    },


    /*
     @add new row to the list view. Trigger when the model add new or update
     */

    addNewRow: function (newitem) {
        var newrow_string =
            '<tr>' +
                '<td>' + newitem.get('peopleName') + '</td>' +
                '<td><img style="width: 50px; height: 50px" src="' +
                    ((newitem.get('peoplePictureImage')!='')?newitem.get('peoplePictureImage'):defaultPeopleImage) + '" />' +
                '</td>' +
                '<td>' + newitem.get('email') + '</td>' +
                '<td><ul class="department">' +
                    this.getDepartmentArray(newitem)
                +
                '</ul></td>' +
                '<td><a target="_blank" href="' + peopleViewUrl + '?peopleRoleId=' +
                    newitem.get('df_peopleRoleId') + '" class="print-btn"><img src="'+ newitem.get('qrcode') +'"></a>' +
                '</td>' +
                '<td><a href="" class="edit-btn"><i class="action edit"></i></a></td>' +     // call edit function
                '<td><a href="#" class="delete-btn"><i class="action delete"></i></a></td>' +   // call delete function
                '</tr>';

        $(this.el).append(newrow_string);
    },
    /*
     * make a department string li tags for department
     */

    getDepartmentArray : function(newitem) {
        var str = '';
        var department = newitem.get('department');

        for (var i = 0; i < department.length; i++) {
            str = str + '<li>' + department[i] + '</li>';
        }
        return str;
    },

    /*
     * update list item after save.
     * {item} item need to be updated
     */
    updateItem : function(item) {
            // item is update
        if(this.editIndex!='') {
            // update change to collection
            this.model.at(this.editIndex-1).set({peoleName:item.people.peopleName});
            this.model.at(this.editIndex-1).set({peoplePictureImage:(typeof (item.people.peoplePicture) !=='undefined')? item.people.peoplePicture.url : ''});
            this.model.at(this.editIndex-1).set({peopleAvatar:item.people.peopleAvatar});
            this.model.at(this.editIndex-1).set({email:item.people.peopleEmail});
            this.model.at(this.editIndex-1).set({department:window.utils.departmentToArray(item.departments)});

            var editItem = this.model.at(this.editIndex-1);

            // update change to view
            $('#view1').find('tr').eq(this.editIndex).find('td').eq(0).text(editItem.get('peopleName'));
            $('#view1').find('tr').eq(this.editIndex).find('td').eq(1).find('img').attr('src',
                        (editItem.get('peoplePictureImage')!='')?editItem.get('peoplePictureImage'):defaultPeopleImage);
            $('#view1').find('tr').eq(this.editIndex).find('td').eq(2).text(editItem.get('email'));
            $('#view1').find('tr').eq(this.editIndex).find('td').eq(3).find('li').remove();
            $('#view1').find('tr').eq(this.editIndex).find('td').eq(3).find('ul').append(this.getDepartmentArray(editItem));

            this.editIndex = '';
        } else {
            // item is new
            var emp = new Employee;
            // create new model for adding to collection
            emp.set({
                peopleName: item.people.peopleName,
                email: item.people.peopleEmail,
                objectId: item.people.objectId,
                peoplePictureImage : ((typeof item.people.peoplePicture!='undefined')? item.people.peoplePicture.url : ''),
                department: window.utils.departmentToArray(item.departments),
                qrcode:item.people.qrcode,
                df_peopleRoleId : item.df_peopleRole,
                peopleAvatar:item.people.peopleAvatar
            });
            this.model.add(emp);
        }
    },
    /*
     @remove the list item from list
     */
    deleteRow: function (model, collection, options) {
        //console.log(model);
        var index = options.index;
        $('#view1').find('tr').eq(index+1).remove();     /// ???
    },

    /*
     @get remote data from server and display on view.
     */
    getPeopleList: function () {
        var view = this;
        // check the place is exist
        if (placeId != '') {
            utils.showLoading();
            Employee.getPeople(placeId).done(function(resp){
                view.render(resp);
                utils.hideLoading();
            }, function(){
               utils.hideLoading();
            })
        }
    },
    /*
     @clear this el list except the header
     */

    clearList: function () {
        for (var i = 1; i < $(this.el).find('tr'); i++) {
            $(this.el).find('tr')[i].remove();
        }
    }

});
