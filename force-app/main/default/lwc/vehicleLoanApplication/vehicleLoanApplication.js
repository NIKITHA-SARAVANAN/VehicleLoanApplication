import { LightningElement,wire } from 'lwc';
import getVehicles from '@salesforce/apex/VehicleLoanController.getVehicles';
import saveRecord from '@salesforce/apex/VehicleLoanController.saveRecord';
export default class VehicleLoanApplication extends LightningElement {
    vehicles;
    productName;
    make;
    engine;
    price;
    loanAmount;
    tenure;
    masterId;
    showForm = false;
    @wire(getVehicles)
    wiredVehicles({ data, error }) {
        if (data) {
            this.vehicles = data;
        }
    }
     handleSelect(event) {
        this.masterId = event.target.dataset.id;
        this.productName = event.target.dataset.name;
        this.make = event.target.dataset.make;
        this.engine = parseFloat(event.target.dataset.engine.replace('cc', ''));
        this.price = parseFloat(event.target.dataset.price);

        this.showForm = true;
    }
     handleLoan(event) {
        this.loanAmount = parseFloat(event.target.value);
    }

    handleTenure(event) {
        this.tenure = parseInt(event.target.value);
    }
     handleSubmit() {
        saveRecord({
            name: this.productName,
            make: this.make,
            engine: this.engine,
            price: this.price,
            loanAmount: this.loanAmount,
            tenure: this.tenure,
            masterId: this.masterId
        })
        .then(() => {
            alert('Record Created Successfully');
        })
        .catch(error => {
            console.error(error);
        });
    }

}