sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
  "sap/ui/core/BusyIndicator",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/core/Fragment"
  ], function (Controller, JSONModel, coreLibrary, Dialog, Button, mobileLibrary, Text, BusyIndicator, MessageBox, Filter, Fragment) {
    "use strict";
    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;
  
    return Controller.extend("openui5-car-rental-service.controller.ReservationList", {
  
      onInit: function () {
        
        var oModel = new JSONModel();
        BusyIndicator.show(0);
        Promise.all([
            fetch("http://localhost:8090/api/clients/activeReservations")
            .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
            }),
            fetch("http://localhost:8090/api/clients/active")
            .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
            }),  
        ])
        
          .then(([res, client]) => {
            
            oModel.setData({activeReservations: res, clients: client, selectedItem:""})
          })
          .catch(error => {
            console.error("Błąd:", error)
          })
          .finally(BusyIndicator.hide());

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
      this.byId("ClientSearch").setValue(null);

      this.onFilterPress();
    },

    onFilterPress: function (){

      var aFilters = []
      const client = this.byId("ClientSearch").getValue();

      if(client){
        aFilters.push(new sap.ui.model.Filter("clientId", sap.ui.model.FilterOperator.EQ, client))
      }
      var oTable = this.byId("ReservationTable");
      var oBinding = oTable.getBinding("items");

      oBinding.filter(aFilters, "Application")
    },

    onViewPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      const client = oEvent.getSource().getBindingContext().getObject().clientId;
      this.getOwnerComponent().getRouter().navTo("ReservationView", { id: id, clientId : client });
    },

    onEditPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      const client = oEvent.getSource().getBindingContext().getObject().clientId;
      this.getOwnerComponent().getRouter().navTo("ReservationEdit", { id: id, clientId : client });
    },

    onBlockPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getProperty("id");
      this.oBlockApproveMessage = new Dialog({
        type: DialogType.Message,
        title: "Potwierdzenie",
        content: new Text({text: "Czy na pewno chcesz zablokować pojazd?"}),
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: "Tak",
          press: function () {
            const blockDate = new Date();
            blockDate.setDate(blockDate.getDate() + 7)
            const oData = {
              status : "IN_SERVICE",
              lockedUntil: blockDate
            }
            BusyIndicator.show(0);
            $.ajax({
              url: "http://localhost:8090/api/vehicles/" + encodeURIComponent(id) +"/lock",
              type: "PATCH",
              contentType: "application/json",
              data: JSON.stringify(oData),
              success: function () {
                  // sap.m.MessageToast.show("Dane zapisane do bazy!");
                  sap.m.MessageBox.success("Dane zostały zaktualizowane", {
                      onClose: function (oAction){
                          // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                          location.reload();
                      }.bind(this)
                  }); 
              }.bind(this),
              error: function (){
                  sap.m.MessageBox.error("Podczas zapisu wystąpił problem, spróbuj ponownie", {onClose: function(oAction){
                      // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                      location.reload();
                  }.bind(this)});
              }.bind(this),
              complete: function () {
                  this.oBlockApproveMessage.close();
                  BusyIndicator.hide();
              }
          });
        }.bind(this)
      }),
      endButton: new Button({
                type: ButtonType.Emphasized,
                text: "Nie",
                press: function (){
                    this.oBlockApproveMessage.close();
                }.bind(this)
            })
    })
    this.oBlockApproveMessage.open();
    },

    onDeletePress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().clientId;
      const res = oEvent.getSource().getBindingContext().getObject().id;
      this.oDeleteApproveMessage = new Dialog({
        type: DialogType.Message,
        title: "Potwierdzenie",
        content: new Text({text: "Czy na pewno chcesz anulować rezerwację?"}),
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: "Tak",
          press: function () {
            BusyIndicator.show(0);
            $.ajax({
              url: "http://localhost:8090/api/clients/" + encodeURIComponent(id) + "/reservations/" + encodeURIComponent(res) + "/cancel",
              type: "PUT",
              success: function () {
                  // sap.m.MessageToast.show("Dane zapisane do bazy!");
                  sap.m.MessageBox.success("Pojazd został usunięty", {
                      onClose: function (oAction){
                          // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                          location.reload();
                      }.bind(this)
                  }); 
              }.bind(this),
              error: function (){
                  sap.m.MessageBox.error("Podczas anulowania wystąpił problem, spróbuj ponownie", {onClose: function(oAction){
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
    },
    onClientHelpRequest: function () {
    const oView = this.getView();

    if (!this._pClientDialog) {
        this._pClientDialog = Fragment.load({
            id: oView.getId(),
            name: "openui5-car-rental-service.view.fragment.ClientSelectDialog", // <- zmień na swój path do fragment.xml
            controller: this
        }).then(function (oDialog) {
            oView.addDependent(oDialog);
            oDialog.open();
            return oDialog;
        });
    } else {
        this._pClientDialog.then(function (oDialog) {
            oDialog.open();
        });
    }
},

onClientSearch: function (oEvent) {
    const sQuery = oEvent.getParameter("value");
    const oFilter = new sap.ui.model.Filter("lastName", sap.ui.model.FilterOperator.Contains, sQuery);
    oEvent.getSource().getBinding("items").filter([oFilter]);
},

onClientSelect: function (oEvent) {
    const oSelectedItem = oEvent.getParameter("selectedItem");
    if (oSelectedItem) {
        const oClient = oSelectedItem.getBindingContext().getObject();
        this.byId("ClientSearch").setValue(oClient.id);
        }
},

onDialogCancel: function () {
    // nic nie robimy – użytkownik anulował wybór
},
    })
  });