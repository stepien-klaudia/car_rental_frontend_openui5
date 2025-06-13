sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
  "sap/ui/core/BusyIndicator",
  "sap/m/MessageBox"
  ], function (Controller, JSONModel, coreLibrary, Dialog, Button, mobileLibrary, Text, BusyIndicator, MessageBox) {
    "use strict";
    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;
  
    return Controller.extend("openui5-car-rental-service.controller.EditEmployee", {
  
      onInit: function () {
        var oModel = new JSONModel();
        fetch("http://localhost:8090/api/employees")
          .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
          }) 
          .then(data => {
            
            oModel.setData({employees: data})
            
          })
          .catch(error => {
            console.error("Błąd:", error)
          });

          this.getView().setModel(oModel);

      },

      onNavPress: function () {
        this.getOwnerComponent().getRouter().navTo("Main",{},true);
      },

      onProfilePress: function (oEvent){
        const oButton = oEvent.getSource();
        var that = this;

        if (!this._oProfileMenu) {
        this._oProfileMenu = new sap.m.Menu({
        items: [
        new sap.m.MenuItem({
        text: "Zmień motyw na ciemny/jasny",
        icon: "sap-icon://action-settings",
        press: function () {
        sap.ui.core.BusyIndicator.show(0);
        var _oTheme = sap.ui.getCore().getConfiguration().getTheme();
        if (_oTheme == "sap_fiori_3_dark"){
            sap.ui.getCore().applyTheme("sap_fiori_3");
        }
        else{
            sap.ui.getCore().applyTheme("sap_fiori_3_dark");
        };
        sap.ui.core.BusyIndicator.hide();
        sap.m.MessageToast.show("Zmieniono motyw");
        }
        }),
        new sap.m.MenuItem({
        text: "Wyloguj",
        icon: "sap-icon://log",
        press: () => {
            that.getOwnerComponent().getRouter().navTo("Logoff", {}, true);
      }
    })
    ]
    });
    }
    this._oProfileMenu.openBy(oButton);
    },

    onClearPress: function (){
      this.byId("EditEmployeeLastNameSearch").setValue(null);
      this.byId("EditEmployeeRoleSearch").setValue(null);
      this.byId("EditEmployeeBranchSearch").setValue(null);

      this.onFilterPress();
    },

    onFilterPress: function (){
      const lastName = this.byId("EditEmployeeLastNameSearch").getValue();
      const role = this.byId("EditEmployeeRoleSearch").getValue();
      const branch = this.byId("EditEmployeeBranchSearch").getValue();

      var aFilters = []

      if(lastName){
        aFilters.push(new sap.ui.model.Filter("lastName", sap.ui.model.FilterOperator.Contains, lastName))
      }
      if(role){
        aFilters.push(new sap.ui.model.Filter("role", sap.ui.model.FilterOperator.Contains, role))
      }
      if(branch){
        aFilters.push(new sap.ui.model.Filter("branch", sap.ui.model.FilterOperator.Contains, branch))
      }
      var oTable = this.byId("EmployeeTable");
      var oBinding = oTable.getBinding("items");

      oBinding.filter([aFilters], "Application")

    },

    onViewPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      const branch_id = oEvent.getSource().getBindingContext().getObject().branch_id;
      this.getOwnerComponent().getRouter().navTo("EmployeeView",{id: id,branch: branch_id});
    },

    onEditPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id; 
      const branch_id = oEvent.getSource().getBindingContext().getObject().branch_id;
      this.getOwnerComponent().getRouter().navTo("EmployeeEdit",{id: id,branch: branch_id});
    },

    onDeletePress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      const branch = oEvent.getSource().getBindingContext().getObject().branch_id;
      this.oDeleteApproveMessage = new Dialog({
        type: DialogType.Message,
        title: "Potwierdzenie",
        content: new Text({text: "Czy na pewno chcesz usunąć pracownika z bazy?"}),
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: "Tak",
          press: function () {
            BusyIndicator.show(0);
            $.ajax({
              url: "http://localhost:8090/api/employees/"+ encodeURIComponent(branch) + "/" + encodeURIComponent(id),
              type: "DELETE",
              success: function () {
                  // sap.m.MessageToast.show("Dane zapisane do bazy!");
                  sap.m.MessageBox.success("Pracownik został usunięty", {
                      onClose: function (oAction){
                          // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                          location.reload();
                      }.bind(this)
                  }); 
              }.bind(this),
              error: function (){
                  sap.m.MessageBox.error("Podczas usuwania wystąpił problem, spróbuj ponownie", {onClose: function(oAction){
                      // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                      location.reload();
                  }.bind(this)});
              }.bind(this),
              complete: function () {
                  BusyIndicator.hide();
              }
          });
        }.bind(this)
      }),
      endButton: new Button({
                type: ButtonType.Emphasized,
                text: "Nie",
                press: function (){
                    this.oDeleteApproveMessage.close();
                }.bind(this)
            })
    })
    this.oDeleteApproveMessage.open();
    }
    })

  });