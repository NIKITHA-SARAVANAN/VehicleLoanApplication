public with sharing class KYCVerificationController {
    public KYCVerificationController() {

    }
    @AuraEnabled
    public static String verifyKYC( String aadhaar, String pan, String firstName, String lastName, String dob) {

        try {

            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint('callout:Expernal_API_NC/services/apexrest/mock/aadhar/verify?aadharNumber=' + aadhaar);
            req.setMethod('GET');
            req.setHeader('Content-Type', 'application/json');

            HttpResponse res = http.send(req);
            System.debug('Response Body: ' + res.getBody());
            Integer statusCode = res.getStatusCode();
            

            if (statusCode == 404) {
                System.debug('Full Response: ' + res.getBody());
                return 'AADHAAR_NOT_FOUND';
            } 
            else if (statusCode == 403) {
                return 'AADHAAR_INACTIVE';
            } 
            else if (statusCode != 200) {
                return 'AADHAAR_ERROR';
            }
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            
            Map<String, Object> data = (Map<String, Object>) result.get('data');

            String aFirstName = ((String) data.get('firstName')).trim().toLowerCase();
            String aLastName  = ((String) data.get('lastName')).trim().toLowerCase();
            String aDob       = ((String) data.get('dob')).trim();

            HttpRequest panReq = new HttpRequest();
            panReq.setEndpoint('callout:Expernal_API_NC/services/apexrest/mock/pan/verify');
            panReq.setMethod('POST');
            panReq.setHeader('Content-Type', 'application/json');
            Map<String, String> body = new Map<String, String>{
                'panNumber' => pan,
                'firstName' => firstName,
                'lastName'  => lastName,
                'dob'       => dob
            };
            System.debug('PAN Request Body: ' + JSON.serialize(body));

            panReq.setBody(JSON.serialize(body));

            HttpResponse panRes = http.send(panReq);
            Integer panStatus = panRes.getstatusCode();
            system.debug(panRes.getBody());
            if (panStatus == 404) {
                return 'PAN_NOT_FOUND';
            } 
            else if (panStatus == 403) {
                return 'PAN_INACTIVE';
            } 
            else if (panStatus != 200) {
                return 'PAN_ERROR';
            }
            Map<String, Object> panResult = (Map<String, Object>) JSON.deserializeUntyped(panRes.getBody());
            Map<String, Object> panData = (Map<String, Object>) panResult.get('data');
            String pFirstName = ((String) panData.get('firstName')).trim().toLowerCase();
            String pLastName  = ((String) panData.get('lastName')).trim().toLowerCase();
            String pDob       = ((String) panData.get('dob')).trim();
            // if (firstName != aFirstName || lastName != aLastName || dob != aDob) {
            //     return 'MISMATCH';
            // }
            if(panStatus==422){
                return 'MISMATCH';
            }
            return 'SUCCESS';

        } catch (Exception e) {
            System.debug('KYC Verification Error: ' + e.getMessage());
            return 'SYSTEM_ERROR';
        }
    }
}