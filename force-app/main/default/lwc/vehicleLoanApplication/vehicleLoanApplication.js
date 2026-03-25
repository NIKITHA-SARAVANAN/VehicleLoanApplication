import { LightningElement,wire } from 'lwc';
import getVehicles from '@salesforce/apex/VehicleLoanController.getVehicles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class VehicleLoanApplication extends LightningElement {
    vehicles;
    productName;
    make;
    engine;
    price;
    loanAmount;
    tenure;
    masterId;

    aadhaar;
    pan;
    employmentType;
    gst;
    salary;
    companyAddress;
    employmentType = '';
    isSelfEmployed = false;
    showForm = false;
    showPopup = false;
    showCustomerForm = false;
    showKYCForm = false;
     salutationsList = [
        { label: 'Mr.', value: 'Mr.' },
        { label: 'Ms.', value: 'Ms.' },
        { label: 'Mrs.', value: 'Mrs.' },
    ];
    employmentOptions = [
        { label: 'Salaried', value: 'salaried' },
        { label: 'Self Employed', value: 'self_employed' }
    ];
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
    handleDownPayment(event) {
    this.downPayment = event.target.value;
}
     handleLoan(event) {
        this.loanAmount = event.target.value;
         if (this.loanAmount > this.price) {
        event.target.setCustomValidity('Loan amount cannot be greater than price');
        }   
        else {
        event.target.setCustomValidity('');
        }
        event.target.reportValidity();
    }

    handleTenure(event) {
        this.tenure = event.target.value;
    }
    handleNext() {
        const inputs = this.template.querySelectorAll('lightning-input');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity(); 
                isValid = false;
            }
        });
        if (!isValid) {
            return;
        }
        const event = new ShowToastEvent({
            title: 'Congratulations 🎉',
            message: 'You are eligible for Preapproval',
            variant: 'success',   
            mode: 'dismissable'   
        });

        this.dispatchEvent(event);
        this.showForm = false;
        this.showCustomerForm = true;
    }
    handleDOBChange(event) {
        const selectedDate = new Date(event.target.value);
        const today = new Date();

        if (selectedDate > today) {
            event.target.setCustomValidity('Date of Birth cannot be in the future');
        } else {
            event.target.setCustomValidity('');
        }

        event.target.reportValidity();
    }
    get salutationOptions() {
        return this.salutationsList;
    }
    handleMobileChange(event) {
        const value = event.target.value;

        if (!/^[0-9]{10}$/.test(value)) {
            event.target.setCustomValidity('Enter a valid 10-digit mobile number');
        } else {
            event.target.setCustomValidity('');
        }

        event.target.reportValidity();
    }
    handleAadhaarChange(event) {
        this.aadhaar = event.target.value;
    }
    handlePanChange(event) {
        this.pan = event.target.value.toUpperCase();
        event.target.value = this.pan;
    }
    handleEmploymentChange(event) {
        this.employmentType = event.detail.value;
        this.isSelfEmployed = this.employmentType === 'self_employed';
    }
    handleSalaryChange(event) {
        this.salary = event.target.value;
    }
    handleGstChange(event) {
        this.gst = event.target.value;
    }
    handleCompanyAddressChange(event) {
        this.companyAddress = event.target.value;
    }
    handleNextButton() {
    this.showCustomerForm = false;
    this.showKYCForm = true;
}
    
    
}