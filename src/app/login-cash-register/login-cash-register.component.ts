import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from '../shared/service/api.service';
import { GlobalService } from '../shared/service/global.service';
import { ToastService } from '../shared/components/toast';
import { AppInitService } from '../shared/service/app-init.service';
import { environment } from '../../environments/environment';
import { TranslationsService } from '../shared/service/translation.service';

@Component({
    selector: 'app-login-cashregister',
    templateUrl: './login-cash-register.component.html',
    styleUrls: ['./login-cash-register.component.scss'],
})
export class LoginCashRegisterComponent implements OnInit {
    iBusinessId: any = localStorage.getItem('currentBusiness');
    iLocationId: any = localStorage.getItem('currentLocation');

    businessWorkStations: Array<any> = [];
    selectedBusiness: any = {};
    selectedWorkStation: any;

    bIsLoading: boolean = false;

    private sCurrentLocationId = localStorage.getItem('currentLocation') ?? '';
    $currentLocation: Subject<any> = new Subject<any>();

    rememberMe = false;
    bIsShowPassword = false;
    user = {
        email: '',
        password: '',
        iOrganizationid: '',
        recaptchaToken: '',
        rememberMe: false,
    };
    showMessages = {
        error: true,
        success: true,
    };
    messages: any = [];
    errors: any = [];
    loginForm = {
        validation: {
            password: {
                required: true,
                minLength: 4,
                maxLength: 50,
            },
            email: {
                required: true,
            },
        },
    };
    submitted = false;
    organizationDetails: any;
    translate: any = [];
    userDetail: any;
    aEmployees: Array<any> = [];

    aOrganizationList: any = [];
    sSitekey: any = environment?.RECAPTCHA_SITE_KEY;

    constructor(
        private apiService: ApiService,
        private routes: Router,
        private toastService: ToastService,
        private globalService: GlobalService,
        private translationService: TranslateService,
        private appInitService: AppInitService,
        private customTranslationService: TranslationsService
    ) { }

    ngOnInit() {
        this.apiService.setToastService(this.toastService);
        localStorage.clear();
        this.apiService.resetDefaultHeaders();
        this.listOrganization();
        // this.getOrganizationDetailsByOrgin();

        this.getUserDetails();
        const translate = ['SUCCESSFULLY_LOGIN', 'EMAIL_OR_PASSWORD_INCORRECT'];
        this.translationService.get(translate).subscribe((res) => {
            this.translate = res;
        });
        let orgDetails: any = localStorage.getItem('org');
        this.organizationDetails = JSON.parse(orgDetails);
        if (localStorage.getItem('authorization')) {
            // this.routes.navigate([localStorage.getItem('recentUrl')]);
            this.routes.navigate(['/']);
        }
    }

    resolved(captchaToken: any) {
        this.user.recaptchaToken = captchaToken;
    }

    async login(formData: any) {
        if (
            formData.submitted &&
            formData.form &&
            formData.form.status == 'VALID'
            ) {
            this.bIsLoading = true;
            let data = {
                sEmail: formData.form.value.email.toLowerCase(),
                sPassword: formData.form.value.password,
                iOrganizationId: formData.form.value.iOrganizationid,
                sRecaptchaToken:
                    '03AFcWeA4XLl2pkTB7pWGmvSkYXF3hYB4y-flVEotraDFIKH37uaVfHgMI5EJJiu2w5AHD_PHoPFJSUj4RQOaSY6vJ8pXX2VJPbesQuS5AHrUfMeh6SPssYmf-PPLdhrqYoOcWT1L5Zc6-hSN9gxo9tpfKcsRArGrsDegNNQOfdZBVty-spJ9UVFSP7nhS4VfumyDnlcBAN54G_cC2TJckhJBosmfkIk-aiXQw-dp9hStt2Mv2Vh4CmrR8Jt0wr_nNU5K2vN2vj15HOEXYpzGGiD7qhOK2kwxxNr2S4d5TaqPrcshVORvw2h8GiYJtTSRR0gMQiwh98NaLYq0Ye-bHN_9yYFpFHzhjKjKnhW9Fb4A9OmGzBk3o1i2b2oZs2-GLn1RE3J0H0j0l3DW39NZNgUEyfNr0-siZAzsZCRGs6OGY3segZT7vk7Tm9SoZiGpGOs3PTuCXgkNjOnTzn72hxKklQJuRqC6SOPVIZA3hJomhJn1BYcVrvHnKMeP-tsYha6PmBP2RMc94',
            };
            await this.getOrganizationDetailsByID(
                formData.form.value.iOrganizationid
            );
            const result: any = await this.apiService
                .postNew('auth', '/api/v1/login/simple', data)
                .toPromise();
            if (result?.data?.authorization) {
                this.toastService.show({
                    type: 'success',
                    text: this.translate['SUCCESSFULLY_LOGIN'],
                });
                localStorage.setItem('authorization', result.data.authorization);
                localStorage.setItem('alternateToken', result.data.authorization);
                localStorage.setItem('failedAttempts', '0');
                localStorage.setItem('locked', 'false');
                this.apiService.setAPIHeaders();
                delete result.data.authorization;
                const iBusinessId =
                    result?.data?.aBusiness?.length && result?.data?.aBusiness[0]._id
                        ? result?.data?.aBusiness[0]._id
                        : '';
                if (iBusinessId) {
                    localStorage.setItem('currentBusiness', iBusinessId);
                    this.iBusinessId = iBusinessId;
                    const oBusiness = await this.getBusiness(iBusinessId).toPromise();
                    localStorage.setItem('dudaEmail', oBusiness.data.sDudaEmail);
                    this.apiService.setBusinessDetails({ _id: iBusinessId });
                    //   this.fetchUserAccessRole(iBusinessId); // To do check of accessibility at front-end side
                    // this.fetchBusinessSetting(iBusinessId); // Fetching business setting to check weather opening modal or not
                    const response: any = await this.apiService
                        .getNew('auth', `/api/v1/access-role/user/list/${iBusinessId}`)
                        .toPromise();
                    localStorage.setItem('aRights', JSON.stringify(response.data));
                    this.appInitService.changeRights(response.data);
                }

                let userName = `${result?.data?.sFirstName || ''} ${result?.data?.sLastName || ''
                    }`;
                userName = userName === '' ? result?.data?.sEmail : userName;
                localStorage.setItem(
                    'currentUser',
                    JSON.stringify({
                        userId: result.data._id,
                        userName: userName,
                        aRights: result.data.aRights,
                        bHomeWorker: result.data.bHomeWorker,
                    })
                );
                localStorage.setItem('type', result.data.eUserType);
                this.apiService.setUserDetails(result.data);
                await this.setLocation();
                this.routes.navigate(['/home']);
                if (localStorage?.org) {
                    const org = JSON.parse(localStorage.org);
                    this.customTranslationService.fetchTranslation(org)
                }
                this.bIsLoading = false;
            }
        }
    }

    async getOrganizationDetailsByID(iOrganizationId: String) {
        const result: any = await this.apiService
            .getNew('organization', `/api/v1/organizations/${iOrganizationId}`).toPromise();
        if (result?.data) {
            this.organizationDetails = result.data;
            localStorage.setItem('org', JSON.stringify(this.organizationDetails));
            this.apiService.setAPIHeaders();
        }
    }

    getOrganizationDetailsByOrgin() {
        this.apiService
            .getNew('organization', '/api/v1/public/get-organization')
            .subscribe(
                (result: any) => {
                    if (result && result.data) {
                        this.organizationDetails = result.data;
                        localStorage.setItem('org', JSON.stringify(result.data));
                        this.apiService.setAPIHeaders();
                    }
                },
                (error: any) => {
                    console.log(error);
                }
            );
    }

    getBusiness(iBusinessId: string): Observable<any> {
        return this.apiService.getNew('core', `/api/v1/business/${iBusinessId}`);
    }

    /* fetching user access-role list */
    fetchUserAccessRole(iBusinessId: string) { }

    /* Fetching the business settings to access across the application */
    // fetchBusinessSetting(iBusinessId: string) {
    //     console.log('c')
    //     this.apiService.getNew('core', `/api/v1/business/setting/${iBusinessId}`).subscribe((result: any) => {
    //         if (result?.data?._id) this.globalService.oBusinessSetting = result.data;
    //     }, (error) => {
    //         if (error?.message == 'business setting not found') {
    //             const oBody = {
    //                 iBusinessId: iBusinessId,
    //                 aModule: this.globalService.aModule || [],
    //                 oSetting: {
    //                     "canEmployeeModalOpen": true,
    //                     "nEmployeeLockTime": 1
    //                 }
    //             }
    //             this.apiService.postNew('core', '/api/v1/business/setting/', oBody).subscribe((result: any) => {
    //                 if (result?.data?._id) this.globalService.oBusinessSetting = result.data;
    //             }, (error) => {
    //                 console.log("error", error);
    //             })
    //         } else {
    //             this.toastService.show({ type: 'warning', text: 'Something went wrong' });
    //             this.routes.navigate(['./login']);
    //         }
    //     })
    // }

    getUserDetails() {
        this.apiService.userDetails.subscribe((userDetails: any) => {
            if (userDetails?._id) {
                this.userDetail = userDetails;
                this.aEmployees.forEach((employee: any) => {
                    employee.active = userDetails._id == employee._id;
                    return employee;
                });
            }
        });
    }

    async getLocations() {
        this.sCurrentLocationId = localStorage.getItem('currentLocation') ?? '';
        return new Promise((resolve, reject) => {
            const iBusinessId = localStorage.getItem('currentBusiness');
            this.apiService
                .postNew('core', `/api/v1/business/${iBusinessId}/list-location`, {})
                // .getNew('core', `/api/v1/business/user-business-and-location/list`, {})
                .subscribe((result: any) => {
                    if (result.message == 'success') {
                        resolve(result);
                    }
                    reject();
                }),
                (error: any) => {
                    console.error(error);
                    reject(error);
                };
        });
    }

    async setLocation(sLocationId: string = '') {
        try {
        return new Promise<void>(async (resolve, reject) => {
            this.sCurrentLocationId =
                sLocationId ?? localStorage.getItem('currentLocation') ?? '';
                const location: any = await this.getLocations();
                let oNewLocation: any = location?.data?.aLocation[0];
                let bIsCurrentBIsWebshop = false;
                for (let i = 0; i < location?.data?.aLocation.length; i++) {
                    const l = location?.data?.aLocation[i];
                    if (l.bIsWebshop) oNewLocation = l;
                    if (l._id.toString() === this.sCurrentLocationId) {
                        if (l.bIsWebshop) {
                            bIsCurrentBIsWebshop = true;
                            this.$currentLocation.next({
                                selectedLocation: l,
                                sName: location?.data?.sName,
                            });
                            localStorage.setItem('currentLocation', l._id.toString());
                            break;
                        }
                    }
                }
                if (!bIsCurrentBIsWebshop) {
                    localStorage.setItem('currentLocation', oNewLocation._id.toString());
                    this.$currentLocation.next({
                        selectedLocation: oNewLocation,
                        sName: location?.data?.sName,
                    });
                    await this.fetchWorkstations();
                }
                this.iLocationId = this.sCurrentLocationId;
                resolve();
            });
        } catch (error) {
            console.log('error 310', error);
        }
    }

    // function for fetch workstations list
    fetchWorkstations() {
        return new Promise<void>(async (resolve, reject) => {
            this.businessWorkStations = [];
            // if (!this.selectedBusiness["selectedLocation"]) {
            //     this.selectedBusiness["selectedLocation"] = this.userDetail.aBusiness[0]?.aLocation[0];
            //     localStorage.setItem("currentLocation", this.selectedBusiness["selectedLocation"]._id);
            //     this.iLocationId = this.selectedBusiness["selectedLocation"]._id
            // }

            const iBusinessId = localStorage.getItem('currentBusiness');
            const iLocationId = localStorage.getItem('currentLocation');

            // const headers = {
            //     Authorization: localStorage.getItem('alternateToken')
            //         ? localStorage.getItem('alternateToken')
            //         : localStorage.getItem('authorization'),
            //     'organization-id': this.organizationDetails.sName,
            //     'Content-Type': 'application/json',
            //     observe: 'response',
            // };
            this.apiService
                .getNew(
                    'cashregistry',
                    `/api/v1/workstations/list/${iBusinessId}/${iLocationId}`,
                    )
                .subscribe(
                    (result: any) => {
                        if (result?.data?.length) {
                            this.businessWorkStations = result.data;
                            let workstationId = localStorage.getItem('currentWorkstation');
                            let bChanged = false;
                            if (workstationId && this.businessWorkStations.length > 0) {
                                result.data.filter((workstation: any) => {
                                    if (workstation._id == workstationId) {
                                        bChanged = true;
                                        this.selectWorkstation(workstation);
                                    }
                                });
                                if (!bChanged)
                                    this.selectWorkstation(this.businessWorkStations[0]);
                            } else {
                                // this.selectedWorkStation = this.businessWorkStations[0] || { sName: 'NO_WORKSTATION' };
                                this.selectWorkstation(this.businessWorkStations[0]);
                            }
                            resolve();
                        } else {
                            //if no workstation found then we create a new one - DEFAULT
                            let data = {
                                iBusinessId: this.iBusinessId,
                                iLocationId: this.iLocationId,
                                sName: 'DEFAULT',
                            };
                            this.apiService
                                .postNew('cashregistry', '/api/v1/workstations/create', data)
                                .subscribe((result: any) => {
                                    if (result?.data) this.selectWorkstation(result.data);
                                    resolve();
                                });
                        }
                    },
                    (error) => {
                        console.log('fetchWorkstations 375: ', error);
                    }
                );
        });
    }

    // Function for select workstation
    selectWorkstation(workstation: any) {
        localStorage.setItem('currentWorkstation', workstation._id);
        this.selectedWorkStation = workstation;
    }

    // organizations/list
    async listOrganization() {
        this.apiService
            .postNew('organization', `/api/v1/organizations/list`, {})
            .subscribe((aOrgList: any) => {
                if (aOrgList?.data?.result?.length)
                    this.aOrganizationList = aOrgList?.data?.result;
            });
    }
}
