import { LightningElement,wire } from 'lwc';
import getVehicles from '@salesforce/apex/VehicleLoanController.getVehicles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import verifyKYC from '@salesforce/apex/KYCVerificationController.verifyKYC';
import createOpportunity from '@salesforce/apex/OpportunityController.createOpportunity';
import createOrUpdateCustomer from '@salesforce/apex/LeadAccountController.createOrUpdateCustomer';
export default class VehicleLoanApplication extends LightningElement {
    vehicles;
    productName;
    make;
    engine;
    price;
    loanAmount;
    tenure;
    masterId;
    firstName
    lastName;
    salutation;
    dob;
    aadhaar;
    pan;
    employmentType;
    gst;
    salary;
    Phone;
    email;
    companyAddress;
    address = {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
    };
    employmentType = '';
    isSelfEmployed = false;
    showForm = false;
    showPopup = false;
    showCustomerForm = false;
    showKYCForm = false;
    showFinalForm = false;
    showBRE = false;
    interestRate = 10;
    emi;
    downPayment;
    totalInterest;
    totalAmount;
    emiTable = [];
    showEMITable = false;
    creditData;
    opportunityId;
    accountId;
    columns = [
        { label: 'Month', fieldName: 'month', type: 'number' ,initialWidth: 80},
        { label: 'Principal', fieldName: 'principal', type: 'number',initialWidth: 120  },
        { label: 'Interest', fieldName: 'interest', type: 'number' ,initialWidth: 120},
        { label: 'Balance', fieldName: 'balance', type: 'number' ,initialWidth: 140}
    ];
     salutationsList = [
        { label: 'Mr.', value: 'Mr.' },
        { label: 'Ms.', value: 'Ms.' },
        { label: 'Mrs.', value: 'Mrs.' },
    ];
    employmentOptions = [
        { label: 'Salaried', value: 'Salaried' },
        { label: 'Self Employed', value: 'Self Employed' }
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
    handleLoanSlider(event) {
    this.loanAmount = event.target.value;
    this.calculateEMI();
}
    handleTenureSlider(event) {
    this.tenure = event.target.value;
    this.calculateEMI();
    }
    calculateEMI() {
        if (!this.loanAmount || !this.tenure) {
    return;
}
        const P = parseFloat(this.loanAmount);
        const annualRate = this.interestRate;
        const R = annualRate / 12 / 100;
        const N = parseInt(this.tenure);
        const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        this.emi = emi.toFixed(2);
        this.totalAmount = (emi * N).toFixed(2);
        this.totalInterest = (this.totalAmount - P).toFixed(2);
 
        let balance = P;
        this.emiTable = [];
 
        for (let i = 1; i <= N; i++) {
            const interest = balance * R;
            const principal = emi - interest;
            balance = balance - principal;
 
            this.emiTable.push({
                month: i,
                principal: principal.toFixed(2),
                interest: interest.toFixed(2),
                balance: balance > 0 ? balance.toFixed(2) : 0
            });
        }
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
        this.calculateEMI();
        this.showEMITable = true;
        const event = new ShowToastEvent({
            title: 'Congratulations',
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
        this.dob = event.target.value;
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
        this.Phone = value;
        if (!/^[0-9]{10}$/.test(value)) {
            event.target.setCustomValidity('Enter a valid 10-digit mobile number');
        } else {
            event.target.setCustomValidity('');
        }

        event.target.reportValidity();
    }
    handleEmailChange(event) {
        this.email = event.target.value;
    }
    handleAddressChange(event) {
    this.address = {
        street: event.detail.street,
        city: event.detail.city,
        state: event.detail.province, // province = state
        country: event.detail.country,
        postalCode: event.detail.postalCode
    };

    console.log('Address:', JSON.stringify(this.address));
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
    handleName(){
        this.firstName = this.template.querySelector('lightning-input-name').firstName;
        this.lastName = this.template.querySelector('lightning-input-name').lastName;
        this.salutation = this.template.querySelector('lightning-input-name').salutation;
    }
    handleSubmit() {
        console.log('Submit clicked');
        console.log(this.aadhaar, this.pan, this.firstName, this.lastName, this.dob);
    verifyKYC({
        aadhaar: this.aadhaar,
        pan: this.pan,
        firstName: this.firstName,
        lastName: this.lastName,
        dob: this.dob
    })
    .then(result => {

        if(result.status === 'AADHAAR_INACTIVE'){
            this.showToast('Error', 'Aadhaar is inactive', 'error', 'sticky');
        }
        else if(result.status === 'AADHAAR_NOT_FOUND'){
            this.showToast('Error', 'No record exists for the provided Aadhaar number', 'error', 'sticky');
        }
        else if(result.status === 'PAN_NOT_FOUND'){
            this.showToast('Error', 'No record exists for the provided PAN number', 'error', 'sticky');
        }
        else if(result.status === 'PAN_INACTIVE'){
            this.showToast('Error', 'PAN is inactive', 'error', 'sticky');
        }
        else if(result.status === 'MISMATCH'){
            this.showToast('Error', 'The provided name and date of birth do not match the records associated with the given PAN and Aadhaar. Please verify your details and try again.', 'error', 'sticky');
        }
        else if(result.status === 'SYSTEM_ERROR'){   
        this.showToast('Error', 'System error occurred. Please try again.', 'error', 'sticky');
        }
        else if(result.status === 'SUCCESS'){
            this.showToast('Success', 'Team will contact you shortly', 'success');
            this.creditData = result.data;
             createOrUpdateCustomer({
                salutation: this.salutation,
                firstName: this.firstName,
                lastName: this.lastName,
                phone: this.Phone,
                email: this.email,
                aadhaar: this.aadhaar,
                pan: this.pan,
                employmentType: this.employmentType,
                salary: parseFloat(this.salary),
                street: this.address.street,
                city: this.address.city,
                state: this.address.state,
                country: this.address.country,
                postalCode: this.address.postalCode
            })
            .then(accountId => {
                this.accountId = accountId;
                console.log('Account Id:', accountId);

                this.showFinalForm = true; // move to next step
            }) 
            .catch(error => {
                this.showToast('Error', error.body?.message, 'error');
            });

            console.log('Credit Data:', this.creditData);
            this.showFinalForm = true;
        }

    })
   .catch(error => {
    this.showToast(
        'Error',
        error.body?.message || error.message,
        'error',
        'sticky'
    );
});
}
    showToast(title, message, variant, mode = 'dismissable') {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
                mode
            })
        );
    }
    handleDownPayment(event) {
        this.downPayment = event.target.value;
    }
    handleFinalSubmit() {
        createOpportunity({
            accountId: this.accountId,
            vehicleName: this.productName,
            price: parseFloat(this.price),
            downPayment: parseFloat(this.downPayment),
            tenure: this.tenure,
            interestRate: parseFloat(this.interestRate),
            emi: parseFloat(this.emi)
        })
         .then(result => {
        // Show a toast after BRE check (regardless of success or just confirmation)
        // this.showFinalForm = false;
         console.log('FULL RESULT:', result);
          if(result && result.recordId) {  // assuming Apex returns Opportunity record
            this.opportunityId = result.recordId;
            console.log('Opp Id:', this.opportunityId);

            // Show BRE child component
            this.showBRE = true;

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Under BRE Check',
                    message: 'The application is being processed under BRE check.',
                    variant: 'info',
                    mode: 'dismissable'
                })
            );
        } else {
            // Handle case where Apex does not return Id
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: result.message || 'Opportunity could not be created.',
                    variant: 'error',
                    mode: 'dismissable'
                })
            );
        }
    })
    .catch(error => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: error.body ? error.body.message : error.message,
                variant: 'error',
                mode: 'dismissable'
            })
        );
    });
    }
    
}