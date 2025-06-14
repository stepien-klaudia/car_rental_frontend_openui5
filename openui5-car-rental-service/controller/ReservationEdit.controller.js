sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment"
  ], function (Controller, JSONModel, coreLibrary, Dialog, Button, mobileLibrary, Text, MessageBox, BusyIndicator, Fragment) {
    "use strict";
    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;
  
    return Controller.extend("openui5-car-rental-service.controller.ReservationEdit", {

        onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("ReservationEdit").attachPatternMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function (oEvent) {
        var sId = oEvent.getParameter("arguments").id;
        var sClient = oEvent.getParameter("arguments").clientId;
        var oModel = new JSONModel();
        Promise.all([
            fetch("http://localhost:8090/api/clients/active").then((res) => res.json()),
            fetch("http://localhost:8090/api/vehicles/available").then((res) => res.json()),
            fetch("http://localhost:8090/api/employees").then((res) => res.json()),
            fetch("http://localhost:8090/api/clients/" + encodeURIComponent(sClient) + "/reservations/" + encodeURIComponent(sId))
          .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
          }) 
        ])
          .then(([clientsActive, vehiclesAviable, employees, reserv]) => {
            
            oModel.setData({ clients: clientsActive, vehicles: vehiclesAviable, employees:employees, reservation:reserv })
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

    validateRequiredFields: function () {
        const oView = this.getView();
        let bAllValid = true;

        // Pobierz wszystkie Inputy w widoku (rekurencyjnie)
        oView.findElements(true).forEach(function (oControl) {
            if (
            !oControl.isA("sap.m.Select") &&
            (oControl.getRequired && oControl.getRequired() &&
            oControl.getEditable()) // pomiń nieedytowalne pola
            ) {
        const sValue = oControl.getValue();
        if (!sValue) {
            oControl.setValueState("Error");
            oControl.setValueStateText("To pole jest wymagane");
            bAllValid = false;
        } else {
            oControl.setValueState("None");
        }
        }
        else if (
            oControl.isA("sap.m.Select")
        ){
            const sValue = oControl.getSelectedKey();
            if (!sValue) {
            oControl.setValueState("Error");
            oControl.setValueStateText("To pole jest wymagane");
            bAllValid = false;
            } else {
            oControl.setValueState("None");
            }
        }
    });

    return bAllValid;
    },


    onAcceptPress: function (){
        if(!this.validateRequiredFields()){
            MessageBox.error("Wypełnij wszystkie pola obowiązkowe!");
            return;
        }
        this.oAcceptAproveMessage = new Dialog({
            type: DialogType.Message,
            title: "Potwierdzenie",
            content: new Text({text: "Czy na pewno chcesz edytować rezerwację?"}),
            beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "Tak",
                press: function () {
                    const oModel = this.getView().getModel();
                    const sId = oModel.getProperty("/reservation/id");
                    const client = this.byId("clientIdInput2").getValue();
                    const employee = this.byId("employeeIdInput2").getValue();
                    const pickupDate = this.byId("NewReservationPickDate2").getDateValue();
                    const returnDate = this.byId("NewReservationBackDate2").getDateValue();
                    //insert do bazy - ewentualnie powiadomienie o błędzie
                    const oData = {
                        employeeId: employee,
                        pickupDate: pickupDate,
                        returnDate: returnDate
                    };
                    BusyIndicator.show(0);
                    $.ajax({
                        url: "http://localhost:8090/api/clients/"+encodeURIComponent(client) + "/reservations/" + encodeURIComponent(sId), //endpoint
                        type: "PUT",
                        contentType: "application/json",
                        data: JSON.stringify(oData),
                        success: function () {
                            // sap.m.MessageToast.show("Dane zapisane do bazy!");
                            sap.m.MessageBox.success("Dane zostały zaktualizowane", {
                                onClose: function (oAction){
                                     this.getOwnerComponent().getRouter().navTo("Main",{},true);
                                }.bind(this)
                            }); 
                        }.bind(this),
                        error: function (){
                            sap.m.MessageBox.error("Podczas zapisu wystąpił problem, spróbuj ponownie", {onClose: function(oAction){
                                 this.getOwnerComponent().getRouter().navTo("Main",{},true);
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
                    this.oAcceptAproveMessage.close();
                }.bind(this)
            })
            
        }
    )
        this.oAcceptAproveMessage.open();

    },

    onRejectPress: function (){
        this.oRejectAproveMessage = new Dialog({
            type: DialogType.Message,
            title: "Potwierdzenie",
            content: new Text({text: "Czy na pewno chcesz anulować?"}),
            beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "Tak",
                press: function () {
                    this.getOwnerComponent().getRouter().navTo("Main",{},true);
                }.bind(this)
            }),
            endButton: new Button({
                type: ButtonType.Emphasized,
                text: "Nie",
                press: function (){
                    this.oRejectAproveMessage.close();
                }.bind(this)
            })
            
        })
        this.oRejectAproveMessage.open();
    },


onEmployeeValueHelp: function () {
    var oView = this.getView();

    if (!this._pEmployeeDialog) {
        this._pEmployeeDialog = Fragment.load({
            id: oView.getId(),
            name: "openui5-car-rental-service.view.fragment.EmployeeSelectDialog",
            controller: this
        }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
        });
    }

    this._pEmployeeDialog.then(function (oDialog) {
        oDialog.getBinding("items").filter([]);
        oDialog.open();
    });
},

onEmployeeSearch: function (oEvent) {
    const sQuery = oEvent.getParameter("value");
    const oFilter = new sap.ui.model.Filter("lastName", sap.ui.model.FilterOperator.Contains, sQuery);
    oEvent.getSource().getBinding("items").filter([oFilter]);
},

onEmployeeSelect: function (oEvent) {
    const oSelected = oEvent.getParameter("selectedItem");
    if (oSelected) {
        const oEmp = oSelected.getBindingContext().getObject();
        this.byId("employeeIdInput2").setValue(oEmp.id);
    }
},


  
    });
  });

 