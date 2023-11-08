const CASH_URL = 'http://localhost:3004';
const CUSTOMER_URL = 'http://localhost:3006';
const BOOKKEEPING_URL = 'http://localhost:3007';
const WEBSITE_URL = 'http://localhost:3010';
const FISKALY_URL = 'http://localhost:3020';
const ORGANIZATION_URL = 'http://localhost:3001';
const AUTH_URL = 'http://localhost:3005';
const CORE_URL = 'http://localhost:3002';
// const CORE_URL = 'http://34.242.166.207:3002';
const BACKUP_URL = 'http://localhost:3008';
const JEWELS_AND_WATCHES_URL = 'http://localhost:3009';
const LABEL_IMAGE_URL = 'http://api.labelary.com';
const KASSENSICHV_URL = `https://kassensichv-middleware.fiskaly.com`;
const AMAZON_AWS_URL = `https://prismanote.s3.eu-west-1.amazonaws.com`;
const AMAZON_AWS_URL_TEST = `https://prismanotetest.s3.amazonaws.com`;
const OLD_PLATFORM_URL = `http://localhost:3000`; /* Using it for the Jupa file upload (EDI IMPORT) */
const CRON_URL = 'http://localhost:3013';

// =====================================================================

// const CORE_URL = 'https://core.e-orderportal.com';
// const CASH_URL = 'https://cashregister.backend-retailgear.org';
// const AUTH_URL = 'https://auth.e-orderportal.com';
// const CUSTOMER_URL = 'https://customer.backend-retailgear.org';
// const WEBSITE_URL = 'https://website.backend-retailgear.org';
// const BOOKKEEPING_URL = 'https://bookkeeping.backend-retailgear.org';
// const BACKUP_URL = 'https://backup.e-orderportal.com';
// // const ORGANIZATION_URL = 'https://4adb-150-129-104-148.ngrok-free.app'; //'https://organization.e-orderportal.com';
// const ORGANIZATION_URL = 'https://organization.e-orderportal.com';
const LOG_URL = 'https://log.e-orderportal.com';
// const FISKALY_URL = 'https://fiskaly.backend-retailgear.org';
// const JEWELS_AND_WATCHES_URL = 'https://jewels.backend-retailgear.org';
// const CRON_URL = 'https://cron.e-orderportal.com';
/* IF YOU ARE ADDING ANY URL HERE, then don't forgot add in CSP at below */

const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export const environment = {
  production: false,
  CORE_URL: CORE_URL,
  CRON_URL: CRON_URL,
  CASH_URL: CASH_URL,
  AUTH_URL: AUTH_URL,
  CUSTOMER_URL: CUSTOMER_URL,
  WEBSITE_URL: WEBSITE_URL,
  BOOKKEEPING_URL: BOOKKEEPING_URL,
  BACKUP_URL: BACKUP_URL,
  ORGANIZATION_URL: ORGANIZATION_URL,
  LOG_URL: LOG_URL,
  FISKALY_URL: FISKALY_URL,
  RECAPTCHA_SITE_KEY: RECAPTCHA_SITE_KEY,
  JEWELS_AND_WATCHES_URL: JEWELS_AND_WATCHES_URL,
  webpackUrl: `${ORGANIZATION_URL}/api/v1/webpack`,
  apiBasePath: 'http://localhost',
  apiURL: 'http://localhost:3000',
  oldPlatformUrl: `http://localhost:3000/`, // https://kassa.prismanote.com,
  fiskalyURL: 'https://kassensichv-middleware.fiskaly.com/api/v2',
  indexedDBName: 'indexedDB1',
  csp: `
    default-src 'self';
    img-src https://* 'self' data:;
    font-src 'self' https://fonts.gstatic.com;
    style-src 'self'  https://fonts.googleapis.com https://fonts.googleapis.com 'unsafe-inline';
    script-src 'self' https://s3.eu-central-1.amazonaws.com/directives-multiscreenplatform.com/ ${ORGANIZATION_URL};
    connect-src 'self' ${CORE_URL} ${CRON_URL} ${CASH_URL} ${AUTH_URL} ${CUSTOMER_URL} ${WEBSITE_URL} ${BOOKKEEPING_URL} ${BACKUP_URL} ${ORGANIZATION_URL} ${LOG_URL} ${FISKALY_URL};
    frame-src 'self' ;
    `
  // worker-src blob:http://localhost:4202/;
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
