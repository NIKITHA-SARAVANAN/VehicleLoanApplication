public with sharing class KYCVerificationController {
    public KYCVerificationController() {
    }
    @AuraEnabled
    public static Map<String, Object> verifyKYC( String aadhaar, String pan, String firstName, String lastName, String dob) {
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
                return new Map<String, Object>{
                    'status' => 'AADHAAR_NOT_FOUND'
                };
            } 
            else if (statusCode == 403) {
                return new Map<String, Object>{
                    'status' => 'AADHAAR_INACTIVE'
                };
            } 
            else if (statusCode != 200) {
                return new Map<String, Object>{
                     'status' => 'AADHAAR_ERROR'
                };
            }
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());            
            Map<String, Object> data = (Map<String, Object>) result.get('data');
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
                return new Map<String, Object>{ 'status' => 'PAN_NOT_FOUND' };
            } 
            else if (panStatus == 403) {
                return new Map<String, Object>{
                    'status' => 'PAN_INACTIVE'
                };
            } 
            else if (panStatus == 422) {
                return new Map<String, Object>{ 'status' => 'MISMATCH' };
            }
            else if (panStatus != 200) {
                return new Map<String, Object>{
                    'status' => 'PAN_ERROR'
                };
            }
           

            Map<String, Object> panResult = (Map<String, Object>) JSON.deserializeUntyped(panRes.getBody());
            Map<String, Object> panData = (Map<String, Object>) panResult.get('data');
            
            return new Map<String, Object>{
             'status' => 'SUCCESS',
             'data' => panResult   
            };

        } catch (Exception e) {
            System.debug('KYC Verification Error: ' + e.getMessage());
            return new Map<String, Object>{
                'status' => 'SYSTEM_ERROR'
            };
        }
    }
}