import { LightningElement,api } from 'lwc';

export default class LoanBreEngine extends LightningElement {
    @api creditData;
    @api salary;
    @api employmentType;
    foir;
    age;
    creditScore;
    worstDPD;
    connectedCallback() {
        console.log('BRE Data:', this.creditData);
        this.calculateFOIR();
        this.calculateAge();
        this.extractCreditScore();
        this.extractDPD();
    }
    calculateFOIR() {
    const accounts = this.creditData.data.creditReport.accounts;

    let totalEMI = 0;

    accounts.forEach(acc => {
        totalEMI += acc.emiAmount || 0;
    });

    this.foir = (totalEMI / this.salary) * 100;
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
}