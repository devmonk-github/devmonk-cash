import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from '../shared/service/api.service';
import { GlobalService } from '../shared/service/global.service';
import { ToastService } from '../shared/components/toast';
import { AppInitService } from '../shared/service/app-init.service';

@Component({
    selector: 'app-login-cashregister',
    templateUrl: './login-cash-register.component.html',
    styleUrls: ['./login-cash-register.component.scss'],
})
export class LoginCashRegisterComponent implements OnInit {

    iBusinessId: any = localStorage.getItem("currentBusiness");
    iLocationId: any = localStorage.getItem("currentLocation");

    businessWorkStations: Array<any> = [];
    selectedBusiness: any;
    selectedWorkStation: any;

    private sCurrentLocationId = localStorage.getItem('currentLocation') ?? ''
    $currentLocation: Subject<any> = new Subject<any>()

    rememberMe = false;
    user = {
        email: '',
        password: '',
        rememberMe: false
    };
    showMessages = {
        error: true,
        success: true
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
            }
        }
    };
    submitted = false;
    organizationDetails: any;
    translate: any = [];
    userDetail: any;
    aEmployees: Array<any> = [];

    constructor(private apiService: ApiService, private routes: Router,
        private toastService: ToastService, private globalService: GlobalService,
        private translationService: TranslateService, private appInitService: AppInitService) { }

    ngOnInit() {
        this.getOrganizationDetailsByOrgin();

        this.getUserDetails()
        const translate = ['SUCCESSFULLY_LOGIN', 'EMAIL_OR_PASSWORD_INCORRECT']
        this.translationService.get(translate).subscribe((res) => {
            this.translate = res;
        })
        let orgDetails: any = localStorage.getItem('org');
        this.organizationDetails = JSON.parse(orgDetails);
        if (localStorage.getItem('authorization')) {
            // this.routes.navigate([localStorage.getItem('recentUrl')]);
            this.routes.navigate(['/business/home']);
        }

    }

    login(formData: any) {
        if (formData.submitted && formData.form && formData.form.status == "VALID") {
            let data = {
                "sEmail": formData.form.value.email.toLowerCase(),
                "sPassword": formData.form.value.password,
                "iOrganizationId": this.organizationDetails._id
            }
            this.apiService.postNew('auth', '/api/v1/login/simple', data)
                .subscribe((result: any) => {
                    if (result && result.data && result.data.authorization) {
                        this.toastService.show({ type: "success", text: this.translate['SUCCESSFULLY_LOGIN'] });
                        localStorage.setItem('authorization', result.data.authorization);
                        localStorage.setItem('alternateToken', result.data.authorization);
                        localStorage.setItem("failedAttempts", "0");
                        localStorage.setItem("locked", "false");
                        this.apiService.setAPIHeaders();
                        delete result.data.authorization;
                        const iBusinessId = result?.data?.aBusiness?.length && result?.data?.aBusiness[0]._id ? result?.data?.aBusiness[0]._id : '';
                        if (iBusinessId) {
                            localStorage.setItem('currentBusiness', iBusinessId);
                            this.getBusiness(iBusinessId).subscribe((oBiz) => {
                                localStorage.setItem('dudaEmail', oBiz.data.sDudaEmail);
                            });
                            this.apiService.setBusinessDetails({ _id: iBusinessId });
                        }

                        this.fetchUserAccessRole(iBusinessId) // To do check of accessibility at front-end side
                        this.fetchBusinessSetting(iBusinessId); // Fetching business setting to check weather opening modal or not

                        let userName = `${result?.data?.sFirstName || ''} ${result?.data?.sLastName || ''}`;
                        userName = userName === '' ? result?.data?.sEmail : userName;
                        localStorage.setItem('currentUser', JSON.stringify({ userId: result.data._id, userName: userName, aRights: result.data.aRights, bHomeWorker: result.data.bHomeWorker }));

                        localStorage.setItem('type', result.data.eUserType);
                        this.apiService.setUserDetails(result.data);
                        this.setLocation();
                        // this.fetchWorkstations()
                        this.routes.navigate(['/home']);

                        // this.chatService.setUserInChat({
                        //   firstName: result.data.sFirstName !== '' ? result.data.sFirstName : '',
                        //   lastName: result.data.sLastName !== '' ? ' ' + result.data.sLastName : '',
                        //   _id: result.data._id,
                        //   email: result.data.sEmail
                        // });
                    }

                })
        } else {
            return
        }
    }

    getOrganizationDetailsByOrgin() {
        this.apiService.getNew('organization', '/api/v1/public/get-organization').subscribe((result: any) => {
            if (result && result.data) {
                this.organizationDetails = result.data;
                localStorage.setItem('org', JSON.stringify(result.data));
                this.apiService.setAPIHeaders();
            }
        },
            (error: any) => {
                console.log(error);
            })
    }

    getBusiness(iBusinessId: string): Observable<any> {
        return this.apiService.getNew('core', `/api/v1/business/${iBusinessId}`)
    }

    /* fetching user access-role list */
    fetchUserAccessRole(iBusinessId: string) {
        this.apiService.getNew('auth', `/api/v1/access-role/user/list/${iBusinessId}`).subscribe((response: any) => {
            localStorage.setItem('aRights', JSON.stringify(response.data));
            this.appInitService.changeRights(response.data);
        }, (error) => {
            console.error('Error: ', error);
        })
    }

    /* Fetching the business settings to access across the application */
    fetchBusinessSetting(iBusinessId: string) {
        this.apiService.getNew('core', `/api/v1/business/setting/${iBusinessId}`).subscribe((result: any) => {
            if (result?.data?._id) this.globalService.oBusinessSetting = result.data;
        }, (error) => {
            if (error?.message == 'business setting not found') {
                const oBody = {
                    iBusinessId: iBusinessId,
                    aModule: this.globalService.aModule || [],
                    oSetting: {
                        "canEmployeeModalOpen": true,
                        "nEmployeeLockTime": 1
                    }
                }
                this.apiService.postNew('core', '/api/v1/business/setting/', oBody).subscribe((result: any) => {
                    if (result?.data?._id) this.globalService.oBusinessSetting = result.data;
                }, (error) => {
                    console.log("error", error);
                })
            } else {
                this.toastService.show({ type: 'warning', text: 'Something went wrong' });
                this.routes.navigate(['./login']);
            }
        })
    }


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
        this.sCurrentLocationId = localStorage.getItem('currentLocation') ?? ''
        return new Promise((resolve, reject) => {
            const iBusinessId = localStorage.getItem('currentBusiness');
            this.apiService
                .postNew('core', `/api/v1/business/${iBusinessId}/list-location`, {})
                // .getNew('core', `/api/v1/business/user-business-and-location/list`, {})
                .subscribe((result: any) => {
                    if (result.message == 'success') {
                        resolve(result)
                    }
                    reject()
                }),
                (error: any) => {
                    console.error(error);
                    reject(error)
                };
        })

    }

    async setLocation(sLocationId: string = "") {
        return new Promise<void>(async (resolve, reject) => {

            this.sCurrentLocationId = sLocationId ?? (localStorage.getItem('currentLocation') ?? '')
            try {
                const location: any = await this.getLocations()
                let oNewLocation: any
                let bIsCurrentBIsWebshop = false
                for (let i = 0; i < location?.data?.aLocation.length; i++) {
                    const l = location?.data?.aLocation[i];
                    if (l.bIsWebshop) oNewLocation = l
                    if (l._id.toString() === this.sCurrentLocationId) {
                        if (l.bIsWebshop) {
                            bIsCurrentBIsWebshop = true
                            this.$currentLocation.next({ selectedLocation: l, sName: location?.data?.sName });
                            localStorage.setItem('currentLocation', l._id.toString())
                            break
                        }
                    }
                }
                if (!bIsCurrentBIsWebshop) {
                    localStorage.setItem('currentLocation', oNewLocation._id.toString())
                    this.$currentLocation.next({ selectedLocation: oNewLocation, sName: location?.data?.sName })
                }
                resolve()
            } catch (error) {
                reject()
            }
        })
    }


    // function for fetch workstations list
    fetchWorkstations() {
        this.businessWorkStations = [];
        if (!this.selectedBusiness["selectedLocation"]) {
            this.selectedBusiness["selectedLocation"] = this.userDetail.aBusiness[0]?.aLocation[0];
            localStorage.setItem("currentLocation", this.selectedBusiness["selectedLocation"]._id);
            this.iLocationId = this.selectedBusiness["selectedLocation"]._id
        }

        const headers = {
            'Authorization': localStorage.getItem('alternateToken') ? localStorage.getItem('alternateToken') : localStorage.getItem('authorization'),
            'organization-id': this.organizationDetails.sName,
            'Content-Type': 'application/json', observe: 'response'
        };
        this.apiService.getNew('cashregistry', `/api/v1/workstations/list/${this.iBusinessId}/${this.iLocationId}`, headers).subscribe(
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
                        if (!bChanged) this.selectWorkstation(this.businessWorkStations[0])
                    } else {
                        // this.selectedWorkStation = this.businessWorkStations[0] || { sName: 'NO_WORKSTATION' };
                        this.selectWorkstation(this.businessWorkStations[0])
                    }

                } else {
                    //if no workstation found then we create a new one - DEFAULT
                    let data = {
                        iBusinessId: this.iBusinessId,
                        iLocationId: this.iLocationId,
                        sName: 'DEFAULT'
                    }
                    this.apiService.postNew('cashregistry', '/api/v1/workstations/create', data).subscribe(
                        (result: any) => {
                            if (result?.data) this.selectWorkstation(result.data);
                        });

                }
            }, (error) => {
                console.log('fetchWorkstations 375: ', error);
            });
    }

    // Function for select workstation
    selectWorkstation(workstation: any) {
        localStorage.setItem("currentWorkstation", workstation._id);
        this.selectedWorkStation = workstation;
    }

}
