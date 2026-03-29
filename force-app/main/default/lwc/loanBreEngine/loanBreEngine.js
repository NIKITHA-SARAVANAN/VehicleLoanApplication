import { LightningElement,api } from 'lwc';
import evaluateBRE from '@salesforce/apex/BreEngineController.evaluateBRE';

export default class LoanBreEngine extends LightningElement {
    @api creditData;
    @api salary;
    @api employmentType;
    opportunityId;
    foir;
    age;
    creditScore;
    worstDPD;
    decision;
    _opportunityId;
    @api
    set opportunityId(value) {
        this._opportunityId = value;

        if (value) {
            console.log('Received Opp Id:', value);
            this.runBRE(); 
        }
    }
    get opportunityId() {
        return this._opportunityId;
    }
    runBRE() {
        console.log('BRE Data:', this.creditData);
        this.calculateFOIR();
        this.calculateAge();
        this.extractCreditScore();
        this.extractDPD();
        this.evaluateRules();
    }
    calculateFOIR() {
    const accounts = this.creditData.data.creditReport.accounts;

    let totalEMI = 0;

    accounts.forEach(acc => {
        totalEMI += acc.emiAmount || 0;
    });

    this.foir = parseFloat(((totalEMI / this.salary) * 100).toFixed(2));
    console.log('Total EMI:', totalEMI);
    console.log('FOIR:', this.foir);
}
    calculateAge() {
    const dob = new Date(this.creditData.data.creditReport.customerInfo.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || 
       (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    this.age = age;
    console.log('Age:', this.age);
}
    extractCreditScore() {
        this.creditScore = this.creditData.data.creditScore;
        console.log('Credit Score:', this.creditScore);
    }
    extractDPD() {
        const dpdString = this.creditData?.data?.creditReport?.paymentHistory?.worstDPD;
        let DPD = 0;
        if (dpdString && dpdString !== 'None') {
            DPD = parseInt(dpdString);
        }
        this.worstDPD = DPD;
        console.log('Worst DPD:', this.worstDPD);
    }
    evaluateRules() {
        evaluateBRE({
            age: this.age,
            salary: this.salary,
            foir: this.foir,
            creditScore: this.creditScore,
            dpd: this.worstDPD,
            employmentType: this.employmentType,
            opportunityId: this.opportunityId
        })
        .then(result => {
            this.decision = result;
            console.log('Decision:', result);
        })
        .catch(error => {
            console.error(error);
        });
    }
}