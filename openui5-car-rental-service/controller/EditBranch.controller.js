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
  
    return Controller.extend("openui5-car-rental-service.controller.EditBranch", {
  
      onInit: function () {
        var oModel = new JSONModel();
        fetch("http://localhost:8090/api/branches")
          .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
          }) 
          .then(data => {
            
            oModel.setData({branches: data})
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
        })
    ]
    });
    }
    this._oProfileMenu.openBy(oButton);
    },

    onClearPress: function (){
      this.byId("EditBranchNameSearch").setValue(null);
      this.byId("EditBranchCitySearch").setValue(null);
      this.byId("EditBranchRegionSearch").setValue(null);

      this.onFilterPress()
    },

    onFilterPress: function (){
      var aFilters = []
      const name = this.byId("EditBranchNameSearch").getValue();
      const city = this.byId("EditBranchCitySearch").getValue();
      const region = this.byId("EditBranchRegionSearch").getSelectedKey();

      if(name){
        aFilters.push(new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, name))
      }
      if(city){
        aFilters.push(new sap.ui.model.Filter("city", sap.ui.model.FilterOperator.Contains, city))
      }
      if(region){
        aFilters.push(new sap.ui.model.Filter("region", sap.ui.model.FilterOperator.EQ, region))
      }
      
      var oTable = this.byId("BranchesTable");
      var oBinding = oTable.getBinding("items");

      oBinding.filter([aFilters], "Application")
    },

    onViewPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      this.getOwnerComponent().getRouter().navTo("BranchView", { id });
    },

    onEditPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      this.getOwnerComponent().getRouter().navTo("BranchEdit", { id });
    },

    onDeletePress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      this.oDeleteApproveMessage = new Dialog({
        type: DialogType.Message,
        title: "Potwierdzenie",
        content: new Text({text: "Czy na pewno chcesz usunąć punkt?"}),
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: "Tak",
          press: function () {
            BusyIndicator.show(0);
            $.ajax({
              url: "http://localhost:8090/api/branches/"+ encodeURIComponent(id),
              type: "DELETE",
              success: function () {
                  // sap.m.MessageToast.show("Dane zapisane do bazy!");
                  sap.m.MessageBox.success("Punkt został usunięty", {
                      onClose: function (oAction){
                          // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                          location.reload();
                      }.bind(this)
                  }); 
              }.bind(this),
              error: function (){
                  sap.m.MessageBox.error("Punkt jest powiązany z pracownikami lub pojazdami, nie można go usunąć. Należy najpierw zmienić dane lub usunąć inne obiekty.", {onClose: function(oAction){
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